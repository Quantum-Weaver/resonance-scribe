<script lang="ts">
	// THE BOARD — the work's chapters as cards across its eras.
	//
	// DATA IS TRUTH, and the board never keeps a second copy of it. A card sits
	// in the column of the era an APPEARANCE ROW names, and a chapter placed in
	// two eras shows in both columns, because that is what the base says. The
	// marks on a card are appearance rows too, and so are the threads. There is
	// no board model anywhere: `$lib/board.ts` is arithmetic over the rows the
	// store already holds.
	//
	// A MOVE IS NEVER AN EDIT. Reordering sends `reorderParts(workId, ids)` —
	// ids and nothing else, computed by `reorderWithin`, which has nowhere to
	// put a body even if somebody wanted to. Moving a chapter to an era deletes
	// the placement rows it had and creates one; there is no
	// `update_appearance` in this body by S1's design, and no title, body or
	// ordinal crosses either call.
	//
	// EVERY DRAG HAS A KEYBOARD TWIN. Native HTML5 drag-and-drop, no library —
	// and every gesture it can perform has a button or a `<select>` beside it
	// that does the same thing from the keyboard. A door only a mouse can open
	// is not a door.
	import { onMount } from 'svelte';
	import { chaptersOf, scenesOf } from '$lib/base';
	import {
		arcsOfPart,
		centerOf,
		charactersOfPart,
		erasOfPart,
		nudge,
		partsInEra,
		polylinePoints,
		reorderWithin,
		shapeRank,
		threadThrough,
		unplacedParts,
		type Carded
	} from '$lib/board';
	import { QUANTUM_COLORS } from '$lib/cosmic';
	import { sortData } from '$lib/panti';
	import { studioStore } from '$lib/stores/studio.svelte';
	import { workStore } from '$lib/stores/work.svelte';
	import { ARC_SHAPES, type ArcShape, type Era, type Part } from '$lib/types/types';

	// Four shapes, four distinct colours, from the family's own palette. The
	// RULE lives in `board.ts` (`shapeRank`); the colours live here, because
	// that file imports types and nothing else.
	const THREAD_COLOURS = [
		QUANTUM_COLORS['fire.base'], // rising
		QUANTUM_COLORS['hearth.gold'], // turning
		QUANTUM_COLORS['sanctuary.emerald'], // resolving
		QUANTUM_COLORS['cosmic.blue'] // other
	];
	const threadColour = (shape: ArcShape) => THREAD_COLOURS[shapeRank(shape)];

	const UNPLACED = 'not yet placed in an era';

	let openPanel = $state<string | null>(null);
	let dragging = $state<{ kind: 'card' | 'column'; id: string } | null>(null);
	let newEra = $state('');
	let editingEra = $state<string | null>(null);
	let eraDraft = $state('');
	let confirmEra = $state<string | null>(null);
	let newArcName = $state('');
	let newArcShape = $state<ArcShape>('rising');
	let editingArc = $state<string | null>(null);
	let arcNameDraft = $state('');
	let arcShapeDraft = $state<ArcShape>('rising');
	let confirmArc = $state<string | null>(null);

	const work = $derived(workStore.work);
	const parts = $derived(studioStore.parts);
	const appearances = $derived(studioStore.appearances);

	// THE-PANTI FOR EVERY LIST. Parts and eras carry their own order in the
	// base (`ord`, written by `reorder_parts` and `reorder_eras` and nothing
	// else), so they are sorted by it; the cast and the arcs have no ordinal
	// and are sorted by name. `sortData` copies — the store's arrays are never
	// rewritten underneath it.
	const eras = $derived(sortData(studioStore.eras, 'ord', 'asc'));
	const characters = $derived(sortData(studioStore.characters, 'name', 'asc'));
	const arcs = $derived(sortData(studioStore.arcs, 'name', 'asc'));
	const chapters = $derived(sortData(chaptersOf(parts), 'ord', 'asc'));

	const chapterIds = $derived(chapters.map((c) => c.id));
	const eraIds = $derived(eras.map((e) => e.id));

	interface Card extends Carded {
		key: string;
		part: Part;
		eraId: string | null;
		scenes: Part[];
	}

	interface Column {
		key: string;
		era: Era | null;
		cards: Card[];
	}

	const card = (part: Part, eraId: string | null): Card => ({
		key: `${eraId ?? 'none'}:${part.id}`,
		part,
		partId: part.id,
		eraId,
		scenes: sortData(scenesOf(parts, part.id), 'ord', 'asc')
	});

	const columns = $derived.by<Column[]>(() => {
		const loose = new Set(unplacedParts(appearances, chapterIds));
		const cols: Column[] = [
			{
				key: 'none',
				era: null,
				cards: chapters.filter((c) => loose.has(c.id)).map((c) => card(c, null))
			}
		];
		for (const era of eras) {
			const here = new Set(partsInEra(appearances, era.id));
			cols.push({
				key: era.id,
				era,
				cards: chapters.filter((c) => here.has(c.id)).map((c) => card(c, era.id))
			});
		}
		return cols;
	});

	/** Every card, column by column and card by card — the order the reader's
	 *  eye takes, and the order a thread is drawn in. */
	const allCards = $derived(columns.flatMap((c) => c.cards));

	const characterOf = (id: string) => characters.find((c) => c.id === id) ?? null;

	// ── the threads ────────────────────────────────────────────────────────

	interface Thread {
		id: string;
		name: string;
		shape: ArcShape;
		colour: string;
		points: string;
		through: number;
	}

	let plane = $state<HTMLElement | null>(null);
	let threads = $state<Thread[]>([]);
	const cardEls = new Map<string, HTMLElement>();
	let watcher: ResizeObserver | null = null;
	let watched: HTMLElement | null = null;

	/** A card hands this its element so the threads can be drawn through it.
	 *  An action rather than `bind:this`, because the key travels with it. */
	function measured(node: HTMLElement, key: string) {
		let held = key;
		cardEls.set(held, node);
		return {
			update(next: string) {
				cardEls.delete(held);
				held = next;
				cardEls.set(held, node);
			},
			destroy() {
				cardEls.delete(held);
			}
		};
	}

	/**
	 * Where each thread runs, in the plane's own coordinates. Recomputed after
	 * any change to the board and on every resize — never on a timer, and never
	 * with a transition on it: a thread that is moving is a thread being read
	 * wrong, and `prefers-reduced-motion` is honoured by there being nothing
	 * animated here at all (see the stylesheet's own note).
	 */
	function measure() {
		if (!plane) {
			threads = [];
			return;
		}
		const origin = plane.getBoundingClientRect();
		const next: Thread[] = [];
		for (const arc of arcs) {
			const on = threadThrough(appearances, arc.id, allCards);
			const points = on
				.map((c) => cardEls.get(c.key))
				.filter((el): el is HTMLElement => el !== undefined)
				.map((el) => centerOf(el.getBoundingClientRect(), origin));
			next.push({
				id: arc.id,
				name: arc.name,
				shape: arc.shape,
				colour: threadColour(arc.shape),
				// A polyline needs two points to be a line. One card is a real
				// answer and the legend says so in words rather than drawing a
				// dot nobody asked for.
				points: points.length >= 2 ? polylinePoints(points) : '',
				through: on.length
			});
		}
		threads = next;
	}

	/** The plane appears the moment the board stops being an empty doorway, so
	 *  the observer is attached wherever it is, not only at mount. */
	function watchPlane() {
		if (!watcher || plane === watched) return;
		if (watched) watcher.unobserve(watched);
		watched = plane;
		if (plane) watcher.observe(plane);
	}

	$effect(() => {
		// The reads that make this run again: the cards, the arcs, the rows the
		// threads are drawn from, and the plane itself. `$effect` runs after the
		// DOM is updated, so the elements measured here are the ones on screen.
		void allCards;
		void arcs;
		void appearances;
		void plane;
		watchPlane();
		measure();
	});

	onMount(() => {
		void (async () => {
			const w = await workStore.restore();
			if (w) await studioStore.load(w.id);
		})();

		const again = () => measure();
		window.addEventListener('resize', again);
		watcher = new ResizeObserver(again);
		watchPlane();
		measure();
		return () => {
			window.removeEventListener('resize', again);
			watcher?.disconnect();
			watcher = null;
			watched = null;
		};
	});

	// ── the drags, and their twins ─────────────────────────────────────────

	function grab(event: DragEvent, kind: 'card' | 'column', id: string) {
		dragging = { kind, id };
		if (event.dataTransfer) {
			// Firefox will not begin a drag without data on the transfer.
			event.dataTransfer.setData('text/plain', id);
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function over(event: DragEvent) {
		if (!dragging) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	async function dropOnColumn(event: DragEvent, eraId: string | null) {
		event.preventDefault();
		const held = dragging;
		dragging = null;
		if (!held) return;
		if (held.kind === 'column') {
			if (eraId && eraId !== held.id) await slideColumn(held.id, eraId);
			return;
		}
		await studioStore.place(held.id, eraId);
	}

	async function dropOnCard(event: DragEvent, target: Card) {
		event.preventDefault();
		event.stopPropagation();
		const held = dragging;
		dragging = null;
		if (!held || held.kind !== 'card' || held.id === target.partId) return;

		// The order first — ids only, the whole chapter list, because
		// `reorder_parts` writes `ord = position` for every id it is given and
		// a partial list would leave two chapters wearing the same ordinal.
		const to = chapterIds.indexOf(target.partId);
		if (to >= 0) await studioStore.orderParts(reorderWithin(chapterIds, held.id, to));

		// Then the column, but only if the card is not already in it — a part
		// standing in two eras must not lose one to a drop inside a column it
		// already belongs to.
		const on = erasOfPart(appearances, held.id);
		const same = target.eraId === null ? on.length === 0 : on.includes(target.eraId);
		if (!same) await studioStore.place(held.id, target.eraId);
	}

	/** The keyboard twin of dragging a card: one place earlier or later in the
	 *  work's own order of chapters. */
	const shove = (id: string, delta: number) =>
		studioStore.orderParts(nudge(chapterIds, id, delta));

	const slideColumn = (id: string, beforeId: string) =>
		studioStore.orderEras(reorderWithin(eraIds, id, eraIds.indexOf(beforeId)));

	/** The keyboard twin of dragging a column. */
	const shoveColumn = (id: string, delta: number) =>
		studioStore.orderEras(nudge(eraIds, id, delta));

	// ── the acts ───────────────────────────────────────────────────────────

	async function addEra(event: SubmitEvent) {
		event.preventDefault();
		const name = newEra.trim();
		if (!name) return;
		await studioStore.addEra(name);
		newEra = '';
	}

	function beginEraEdit(era: Era) {
		editingEra = era.id;
		eraDraft = era.name;
		confirmEra = null;
	}

	async function saveEra(era: Era) {
		const name = eraDraft.trim();
		editingEra = null;
		if (!name || name === era.name) return;
		await studioStore.editEra(era.id, name, era.note);
	}

	async function addArc(event: SubmitEvent) {
		event.preventDefault();
		const name = newArcName.trim();
		if (!name) return;
		await studioStore.addArc(name, newArcShape);
		newArcName = '';
	}

	function beginArcEdit(id: string, name: string, shape: ArcShape) {
		editingArc = id;
		arcNameDraft = name;
		arcShapeDraft = shape;
		confirmArc = null;
	}

	async function saveArc(id: string) {
		const name = arcNameDraft.trim();
		const shape = arcShapeDraft;
		editingArc = null;
		if (!name) return;
		await studioStore.editArc(id, name, shape);
	}

	const setEra = (partId: string, value: string) =>
		studioStore.place(partId, value === '' ? null : value);
</script>

<svelte:head><title>The board — Resonance Scribe</title></svelte:head>

{#if !work}
	<div class="doorway">
		<h1>The board</h1>
		<p>
			No work is chosen yet, so there is no board to lay out. The shelf holds every work
			this device has.
		</p>
		<p><a class="invite" href="/">Go to the shelf</a></p>
	</div>
{:else}
	<div class="board">
		<header class="head">
			<div>
				<h1>{work.title}</h1>
				<p class="quiet small">
					Chapters across the eras. A card sits where an appearance row puts it; drag one,
					or use the buttons on it — both write the same rows.
				</p>
			</div>

			<form class="add-era" onsubmit={addEra}>
				<label class="visually-hidden" for="new-era">A new era's name</label>
				<input id="new-era" bind:value={newEra} placeholder="a new era" autocomplete="off" />
				<button type="submit" disabled={!newEra.trim()}>Add era</button>
			</form>
		</header>

		{#if studioStore.error}
			<p class="error" role="alert">
				The base answered: {studioStore.error}
				<button type="button" class="plain" onclick={() => studioStore.clearError()}>
					set aside
				</button>
			</p>
		{/if}

		{#if studioStore.loading}
			<p class="quiet">opening the base…</p>
		{:else if eras.length === 0 && chapters.length === 0}
			<!-- THE EMPTY BOARD IS A DOORWAY (the-epagoge's second-day law): an
			     empty room always carries an invitation that names the next act,
			     and never reads as a dead end. Written in plain words rather than
			     through the mirror — see the note in the journal. -->
			<div class="doorway">
				<h1>An empty board</h1>
				<p>
					Two things make a board, and either one can come first. An <strong>era</strong>
					is a span of the story's time and becomes a column here; a <strong>chapter</strong>
					is a card that can stand in one.
				</p>
				<ol class="steps">
					<li>
						<strong>Name an era</strong> — the box at the top of this room. “Before”,
						“The winter”, “Part one”: whatever the story's own time is called.
					</li>
					<li>
						<strong>Add a chapter</strong> at <a class="invite" href="/desk">the desk</a>,
						then drag its card into the era it belongs to — or set the era from the
						card's own panel.
					</li>
				</ol>
				<p class="quiet small">
					Nothing is lost by doing neither yet. A chapter with no era simply waits in the
					first column, and the board says so.
				</p>
			</div>
		{:else}
			<div class="plane" bind:this={plane}>
				<!-- The threads sit over the columns and take no clicks. One
				     polyline per arc, through the cards it appears in. -->
				<svg class="threads" aria-hidden="true">
					{#each threads as t (t.id)}
						{#if t.points}
							<polyline
								points={t.points}
								fill="none"
								stroke={t.colour}
								stroke-width="2"
								stroke-linejoin="round"
								stroke-linecap="round"
								opacity="0.85"
							/>
						{/if}
					{/each}
				</svg>

				<div class="columns">
					{#each columns as col (col.key)}
						<section
							class="column"
							class:loose={col.era === null}
							ondragover={over}
							ondrop={(e) => dropOnColumn(e, col.era ? col.era.id : null)}
							aria-label={col.era ? col.era.name : UNPLACED}
						>
							<div class="column-head">
								{#if col.era === null}
									<h2>{UNPLACED}</h2>
									<p class="quiet small">
										{col.cards.length === 0
											? 'Every chapter has a place.'
											: 'A card here belongs to no era yet — that is a state, not a mistake.'}
									</p>
								{:else if editingEra === col.era.id}
									<div class="renaming">
										<label class="visually-hidden" for="era-{col.era.id}">
											The era's name
										</label>
										<input
											id="era-{col.era.id}"
											bind:value={eraDraft}
											autocomplete="off"
										/>
										<button type="button" onclick={() => col.era && saveEra(col.era)}>
											Save
										</button>
										<button type="button" class="plain" onclick={() => (editingEra = null)}>
											Cancel
										</button>
									</div>
								{:else}
									<!-- The heading itself is what a mouse grabs to move a column;
									     the ◀ ▶ buttons below it are the same act from the keyboard.
									     The drag lives on the heading rather than a bare `div`
									     because a heading has a role and a `div` has none. -->
									<h2
										draggable="true"
										ondragstart={(e) => col.era && grab(e, 'column', col.era.id)}
										ondragend={() => (dragging = null)}
									>
										<span class="grip" aria-hidden="true">⠿</span>
										{col.era.name}
									</h2>
									<div class="column-acts">
										<button
											type="button"
											class="plain tiny"
											onclick={() => col.era && shoveColumn(col.era.id, -1)}
											disabled={eraIds.indexOf(col.era.id) === 0}
										>
											◀<span class="visually-hidden"> move {col.era.name} earlier</span>
										</button>
										<button
											type="button"
											class="plain tiny"
											onclick={() => col.era && shoveColumn(col.era.id, 1)}
											disabled={eraIds.indexOf(col.era.id) === eraIds.length - 1}
										>
											▶<span class="visually-hidden"> move {col.era.name} later</span>
										</button>
										<button
											type="button"
											class="plain tiny"
											onclick={() => col.era && beginEraEdit(col.era)}
										>
											Rename<span class="visually-hidden"> {col.era.name}</span>
										</button>
										{#if confirmEra === col.era.id}
											<span class="confirm small">
												Delete “{col.era.name}”? The chapters stay; they return to
												the first column.
												<button
													type="button"
													class="danger tiny"
													onclick={() => col.era && studioStore.removeEra(col.era.id)}
												>
													Yes
												</button>
												<button
													type="button"
													class="plain tiny"
													onclick={() => (confirmEra = null)}
												>
													Keep it
												</button>
											</span>
										{:else}
											<button
												type="button"
												class="plain tiny"
												onclick={() => col.era && (confirmEra = col.era.id)}
											>
												Delete<span class="visually-hidden"> {col.era.name}</span>
											</button>
										{/if}
									</div>
								{/if}
							</div>

							<ul class="cards">
								{#each col.cards as c (c.key)}
									<li
										class="card"
										class:lifted={dragging?.kind === 'card' && dragging.id === c.partId}
										draggable="true"
										use:measured={c.key}
										ondragstart={(e) => grab(e, 'card', c.partId)}
										ondragend={() => (dragging = null)}
										ondragover={over}
										ondrop={(e) => dropOnCard(e, c)}
									>
										<button
											class="card-face"
											type="button"
											aria-expanded={openPanel === c.key}
											onclick={() => (openPanel = openPanel === c.key ? null : c.key)}
										>
											<span class="card-title">{c.part.title}</span>
											<span class="card-words">{c.part.words}</span>
										</button>

										<div class="card-marks">
											{#each charactersOfPart(appearances, c.partId) as cid (cid)}
												{@const who = characterOf(cid)}
												{#if who}
													<span class="mark-emoji" title={who.name}>
														{who.emoji}<span class="visually-hidden">{who.name}</span>
													</span>
												{/if}
											{/each}
											{#each arcsOfPart(appearances, c.partId) as aid (aid)}
												{@const arc = arcs.find((a) => a.id === aid)}
												{#if arc}
													<span
														class="mark-thread"
														style="--thread: {threadColour(arc.shape)}"
														title="{arc.name} · {arc.shape}"
													>
														<span class="visually-hidden">
															the arc {arc.name}, {arc.shape}
														</span>
													</span>
												{/if}
											{/each}
										</div>

										{#if c.scenes.length > 0}
											<ul class="card-scenes">
												{#each c.scenes as s (s.id)}
													<li>{s.title}</li>
												{/each}
											</ul>
										{/if}

										{#if openPanel === c.key}
											<div class="panel">
												<div class="panel-row">
													<label>
														<span class="panel-name">Its era</span>
														<select
															value={c.eraId ?? ''}
															onchange={(e) => setEra(c.partId, e.currentTarget.value)}
														>
															<option value="">{UNPLACED}</option>
															{#each eras as e (e.id)}
																<option value={e.id}>{e.name}</option>
															{/each}
														</select>
													</label>

													<div class="panel-move">
														<span class="panel-name">Its place in the order</span>
														<button
															type="button"
															class="plain tiny"
															onclick={() => shove(c.partId, -1)}
															disabled={chapterIds.indexOf(c.partId) === 0}
														>
															Earlier
														</button>
														<button
															type="button"
															class="plain tiny"
															onclick={() => shove(c.partId, 1)}
															disabled={chapterIds.indexOf(c.partId) ===
																chapterIds.length - 1}
														>
															Later
														</button>
													</div>
												</div>

												<div class="panel-row">
													<div class="panel-set">
														<span class="panel-name">Who appears</span>
														{#if characters.length === 0}
															<p class="quiet small">
																No one in the cast yet —
																<a class="invite" href="/cast">the cast</a> is where a
																character is named.
															</p>
														{:else}
															<div class="chips">
																{#each characters as ch (ch.id)}
																	{@const on = charactersOfPart(
																		appearances,
																		c.partId
																	).includes(ch.id)}
																	<button
																		type="button"
																		class="chip"
																		class:on
																		aria-pressed={on}
																		onclick={() =>
																			studioStore.toggleHang(
																				c.partId,
																				'character_id',
																				ch.id
																			)}
																	>
																		<span aria-hidden="true">{ch.emoji}</span>
																		{ch.name}
																	</button>
																{/each}
															</div>
														{/if}
													</div>
												</div>

												<div class="panel-row">
													<div class="panel-set">
														<span class="panel-name">Which arcs run through</span>
														{#if arcs.length === 0}
															<p class="quiet small">
																No arcs yet — the threads drawer below names the first
																one.
															</p>
														{:else}
															<div class="chips">
																{#each arcs as arc (arc.id)}
																	{@const on = arcsOfPart(appearances, c.partId).includes(
																		arc.id
																	)}
																	<button
																		type="button"
																		class="chip"
																		class:on
																		style="--thread: {threadColour(arc.shape)}"
																		aria-pressed={on}
																		onclick={() =>
																			studioStore.toggleHang(c.partId, 'arc_id', arc.id)}
																	>
																		{arc.name}
																	</button>
																{/each}
															</div>
														{/if}
													</div>
												</div>
											</div>
										{/if}
									</li>
								{/each}

								{#if col.cards.length === 0 && col.era !== null}
									<li class="empty-column">
										Nothing here yet. Drag a card in, or set this era from a card's own
										panel.
									</li>
								{/if}
							</ul>
						</section>
					{/each}

					{#if eras.length === 0}
						<section class="column invite-column">
							<h2>No eras yet</h2>
							<p class="quiet small">
								An era becomes a column. Name one at the top of this room and the cards
								can start standing somewhere.
							</p>
						</section>
					{/if}
				</div>
			</div>

			{#if chapters.length === 0}
				<p class="quiet">
					No chapters yet, so there are no cards. <a class="invite" href="/desk">The desk</a>
					is where a chapter begins.
				</p>
			{/if}

			<details class="drawer" open={arcs.length > 0}>
				<summary>Threads — the arcs, and where they run</summary>

				<form class="add-arc" onsubmit={addArc}>
					<label>
						<span class="visually-hidden">A new arc's name</span>
						<input bind:value={newArcName} placeholder="a new arc" autocomplete="off" />
					</label>
					<label>
						<span class="visually-hidden">Its shape</span>
						<select bind:value={newArcShape}>
							{#each ARC_SHAPES as s (s)}
								<option value={s}>{s}</option>
							{/each}
						</select>
					</label>
					<button type="submit" disabled={!newArcName.trim()}>Add arc</button>
				</form>

				{#if arcs.length === 0}
					<p class="quiet small">
						No arcs yet. An arc is a line through the story — rising, turning, resolving,
						or a shape of your own — and it is drawn across the cards it appears in.
					</p>
				{:else}
					<ul class="legend">
						{#each threads as t (t.id)}
							<li>
								<span class="swatch" style="--thread: {t.colour}" aria-hidden="true"></span>
								{#if editingArc === t.id}
									<input bind:value={arcNameDraft} autocomplete="off" />
									<select bind:value={arcShapeDraft}>
										{#each ARC_SHAPES as s (s)}
											<option value={s}>{s}</option>
										{/each}
									</select>
									<button type="button" class="tiny" onclick={() => saveArc(t.id)}>
										Save
									</button>
									<button type="button" class="plain tiny" onclick={() => (editingArc = null)}>
										Cancel
									</button>
								{:else}
									<span class="legend-name">{t.name}</span>
									<span class="quiet small">{t.shape}</span>
									<span class="quiet small">
										{t.through}
										{t.through === 1 ? 'card' : 'cards'}
									</span>
									<button
										type="button"
										class="plain tiny"
										onclick={() => beginArcEdit(t.id, t.name, t.shape)}
									>
										Rename<span class="visually-hidden"> {t.name}</span>
									</button>
									{#if confirmArc === t.id}
										<span class="confirm small">
											Delete “{t.name}”? Its thread goes; the chapters stay.
											<button
												type="button"
												class="danger tiny"
												onclick={() => studioStore.removeArc(t.id)}
											>
												Yes
											</button>
											<button type="button" class="plain tiny" onclick={() => (confirmArc = null)}>
												Keep it
											</button>
										</span>
									{:else}
										<button
											type="button"
											class="plain tiny"
											onclick={() => (confirmArc = t.id)}
										>
											Delete<span class="visually-hidden"> {t.name}</span>
										</button>
									{/if}
								{/if}
							</li>
						{/each}
					</ul>
					<p class="quiet small">
						A thread with one card is real and is counted here; it is simply not drawn,
						because a line needs two ends.
					</p>
				{/if}
			</details>
		{/if}
	</div>
{/if}

<style>
	.board {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.1rem 1.25rem 2rem;
		min-height: 100%;
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-start;
		justify-content: space-between;
	}

	h1 {
		font-size: 1.4rem;
		font-weight: 600;
	}

	h2 {
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		overflow-wrap: anywhere;
	}

	.add-era {
		display: flex;
		gap: 0.4rem;
	}

	.plane {
		position: relative;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}

	.threads {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}

	.columns {
		display: flex;
		gap: 0.85rem;
		align-items: flex-start;
		min-width: min-content;
	}

	.column {
		flex: 0 0 15rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.6rem;
		padding: 0.7rem 0.6rem;
	}

	.column.loose {
		border-style: dashed;
	}

	.invite-column {
		border-style: dashed;
	}

	.column-head {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.grip {
		color: var(--text-muted);
		margin-right: 0.25rem;
		cursor: grab;
	}

	.column-acts,
	.renaming {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
	}

	.renaming input {
		flex: 1 1 6rem;
		min-width: 0;
	}

	.cards {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 3rem;
	}

	.card {
		position: relative;
		z-index: 1;
		background: var(--bg-surface);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.5rem 0.55rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.card.lifted {
		opacity: 0.55;
		border-color: var(--accent);
	}

	.card-face {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		width: 100%;
		background: none;
		border: none;
		color: var(--text);
		font: inherit;
		font-weight: 600;
		text-align: left;
		padding: 0;
		cursor: pointer;
	}

	.card-title {
		flex: 1;
		overflow-wrap: anywhere;
	}

	.card-words {
		color: var(--text-muted);
		font-size: 0.7rem;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}

	.card-marks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
		min-height: 0.9rem;
	}

	.mark-emoji {
		font-size: 0.9rem;
		line-height: 1;
	}

	.mark-thread {
		width: 0.75rem;
		height: 0.25rem;
		border-radius: 999px;
		background: var(--thread);
	}

	.card-scenes {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		border-left: 2px solid var(--border-color);
		padding-left: 0.45rem;
	}

	.empty-column {
		list-style: none;
		font-size: 0.75rem;
		color: var(--text-muted);
		line-height: 1.45;
		padding: 0.4rem 0.1rem;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		border-top: 1px solid var(--border-color);
		padding-top: 0.5rem;
	}

	.panel-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.panel-row label,
	.panel-move,
	.panel-set {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1 1 100%;
	}

	.panel-move {
		flex-direction: row;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
	}

	.panel-name {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--text-muted);
		flex: 1 1 100%;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.chip {
		background: none;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		border-radius: 999px;
		padding: 0.15rem 0.5rem;
		font: inherit;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.chip.on {
		border-color: var(--thread, var(--accent));
		background: color-mix(in srgb, var(--thread, var(--accent)) 22%, transparent);
		color: var(--text);
	}

	.drawer {
		border: 1px solid var(--border-color);
		border-radius: 0.6rem;
		padding: 0.7rem 0.85rem;
		background: color-mix(in srgb, var(--bg-surface) 70%, transparent);
	}

	summary {
		cursor: pointer;
		font-size: 0.82rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.add-arc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.75rem 0;
	}

	.legend {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.legend li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-name {
		font-weight: 600;
	}

	.swatch {
		width: 1.4rem;
		height: 0.28rem;
		border-radius: 999px;
		background: var(--thread);
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-left: 1.2rem;
		color: var(--text-secondary);
		line-height: 1.55;
	}

	.doorway {
		max-width: 36rem;
		margin: 0 auto;
		padding: 2.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.doorway h1 {
		font-size: 1.5rem;
	}

	.doorway p {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.invite {
		color: var(--accent);
		font-weight: 600;
	}

	.quiet {
		color: var(--text-muted);
	}

	.small {
		font-size: 0.76rem;
		line-height: 1.45;
	}

	.confirm {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		align-items: center;
		color: var(--text);
	}

	.error {
		border: 1px solid var(--accent);
		border-radius: 0.5rem;
		padding: 0.6rem 0.85rem;
		background: var(--bg-surface);
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: baseline;
	}

	input,
	select {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.35rem 0.5rem;
		font: inherit;
		font-size: 0.85rem;
	}

	button {
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.35rem 0.7rem;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	button.plain {
		background: none;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	button.danger {
		background: none;
		color: var(--text);
		border: 1px solid var(--accent);
	}

	button.tiny {
		font-size: 0.72rem;
		padding: 0.2rem 0.45rem;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	/* THE THREADS ARE NEVER ANIMATED. A polyline's points change and the new
	   line is simply there — no transition, no draw-on, nothing that moves
	   while it is being read. The card's own lift is the one thing that fades,
	   and reduced motion takes even that (app.css turns every transition in
	   the app off besides). */
	.card {
		transition: opacity 120ms ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
	}
</style>
