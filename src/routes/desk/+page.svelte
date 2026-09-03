<script lang="ts">
	// THE DESK — a work's parts in a rail, and the chosen one in a plain box.
	//
	// THE-BINDER'S LAW IS THE LAW OF THIS ROOM: "typos are fingerprints unless
	// he says otherwise." The body is stored exactly as it was typed. Nothing
	// here trims it, normalises it, reflows it, curls a quote, collapses a run
	// of spaces or strips a trailing newline — the textarea's value goes to
	// `updatePart` and `updatePart` is the only write of a part's text in this
	// whole app. The title is the author's text too and is left alone the same
	// way.
	//
	// THE WORD COUNT IS DATA. `words` is the number the base wrote when it last
	// saved this part, read off the row it handed back. It is never counted in
	// the window, and while there are unsaved keystrokes the screen says so
	// rather than guessing.
	//
	// THE PREVIEW IS THE-SCROLLS' and no other. `renderScrollBody` escapes
	// `&`, `<`, `>` and `"` before it shapes anything, so `{@html}` here can
	// only ever show what the author typed. No markdown library is installed
	// and none may be.
	import { onDestroy, onMount } from 'svelte';
	import { chaptersOf, scenesOf } from '$lib/base';
	import { filterData, sortData } from '$lib/panti';
	import { renderScrollBody } from '$lib/scrolls/the-scrolls.mjs';
	import { studioStore } from '$lib/stores/studio.svelte';
	import { workStore } from '$lib/stores/work.svelte';
	import type { Part } from '$lib/types/types';

	/** The quiet after a keystroke before the base is written to. */
	const QUIET_MS = 800;

	let needle = $state('');
	let chosenId = $state<string | null>(null);
	let draftTitle = $state('');
	let draftBody = $state('');
	let save = $state<'saved' | 'unsaved' | 'saving'>('saved');
	let confirming = $state<string | null>(null);
	let newChapter = $state('');
	let newScene = $state('');

	let timer: ReturnType<typeof setTimeout> | null = null;

	const work = $derived(workStore.work);
	const parts = $derived(studioStore.parts);
	const chosen = $derived(chosenId ? studioStore.part(chosenId) : null);
	/** Where a new scene would go: the chosen chapter, or the chosen scene's own. */
	const underChapter = $derived(chosen ? (chosen.parent_id ?? chosen.id) : null);
	const underChapterTitle = $derived(
		underChapter ? (studioStore.part(underChapter)?.title ?? '') : ''
	);

	interface Row {
		chapter: Part;
		scenes: Part[];
	}

	// THE-PANTI FOR EVERY LIST. `sortData` puts each level in the base's own
	// order (`ord` ascending — the order `reorder_parts` writes and nothing
	// else touches) and COPIES rather than sorting the store's array in place.
	// `filterData` narrows by title in `contains` mode; a whitespace-only
	// needle is not a filter and the whole rail comes back.
	const rail = $derived.by<Row[]>(() => {
		const chapters = sortData(chaptersOf(parts), 'ord', 'asc');
		const under = (c: Part) => sortData(scenesOf(parts, c.id), 'ord', 'asc');
		if (!needle.trim()) return chapters.map((c) => ({ chapter: c, scenes: under(c) }));

		// A chapter whose own title matches shows all its scenes; a chapter that
		// does not match shows only the scenes that do, and disappears when none
		// of them does either.
		const hit = new Set(filterData(chapters, { key: 'title', value: needle }).map((c) => c.id));
		const rows: Row[] = [];
		for (const c of chapters) {
			const scenes = under(c);
			if (hit.has(c.id)) rows.push({ chapter: c, scenes });
			else {
				const some = filterData(scenes, { key: 'title', value: needle });
				if (some.length > 0) rows.push({ chapter: c, scenes: some });
			}
		}
		return rows;
	});

	const counted = $derived(rail.reduce((n, r) => n + 1 + r.scenes.length, 0));

	// ── the autosave ───────────────────────────────────────────────────────

	function schedule() {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			void flush();
		}, QUIET_MS);
	}

	/** A keystroke: unsaved now, written after the quiet. */
	function touched() {
		save = 'unsaved';
		schedule();
	}

	/**
	 * Write, if there is anything to write. Called after the quiet, on blur,
	 * before switching parts, and when the room closes.
	 *
	 * The draft is captured before the await: if the hand kept typing while the
	 * base was writing, the state stays `unsaved` and another write is
	 * scheduled, so no keystroke is ever reported as saved that was not.
	 */
	async function flush(): Promise<void> {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		const id = chosenId;
		if (!id || save === 'saved') return;
		const title = draftTitle;
		const body = draftBody;
		save = 'saving';
		const row = await studioStore.savePart(id, title, body);
		if (chosenId !== id) return; // the hand moved on; that part's own flush ran
		if (row === null) {
			save = 'unsaved'; // the store has put the base's sentence on the screen
			return;
		}
		if (draftTitle === title && draftBody === body) save = 'saved';
		else {
			save = 'unsaved';
			schedule();
		}
	}

	async function choose(p: Part) {
		if (chosenId === p.id) return;
		await flush(); // immediately, before the drafts are replaced
		chosenId = p.id;
		draftTitle = p.title;
		draftBody = p.body;
		save = 'saved';
		confirming = null;
	}

	// ── the acts ───────────────────────────────────────────────────────────

	async function addChapter(event: SubmitEvent) {
		event.preventDefault();
		const title = newChapter.trim();
		if (!title) return;
		const made = await studioStore.addChapter(title);
		newChapter = '';
		if (made) await choose(made);
	}

	async function addScene(event: SubmitEvent) {
		event.preventDefault();
		const title = newScene.trim();
		if (!title || !underChapter) return;
		const made = await studioStore.addScene(underChapter, title);
		newScene = '';
		if (made) await choose(made);
	}

	async function remove(p: Part) {
		confirming = null;
		if (chosenId === p.id) {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			save = 'saved'; // nothing to write to a row that is about to be gone
			chosenId = null;
			draftTitle = '';
			draftBody = '';
		}
		await studioStore.removePart(p.id);
	}

	const isChapter = (p: Part) => p.parent_id === null;

	const saidState = $derived(
		save === 'saving' ? 'saving' : save === 'unsaved' ? 'unsaved' : 'saved'
	);

	// ── the room's life ────────────────────────────────────────────────────

	function leaving() {
		void flush();
	}

	onMount(() => {
		void (async () => {
			const w = await workStore.restore();
			if (w) await studioStore.load(w.id);
		})();
		window.addEventListener('beforeunload', leaving);
		return () => window.removeEventListener('beforeunload', leaving);
	});

	onDestroy(() => {
		// The write is dispatched; a room being torn down cannot await it.
		void flush();
	});
</script>

<svelte:head><title>The desk — Resonance Scribe</title></svelte:head>

{#if !work}
	<div class="doorway">
		<h1>The desk</h1>
		<p>
			No work is chosen yet, so there is nothing to write in. The shelf holds every work
			this device has, and one line on it begins a new one.
		</p>
		<p><a class="invite" href="/">Go to the shelf</a></p>
	</div>
{:else}
	<div class="desk">
		<aside class="rail" aria-label="The parts of {work.title}">
			<div class="rail-head">
				<h2>{work.title}</h2>
				<label class="find">
					<span class="visually-hidden">Find a part by title</span>
					<input
						bind:value={needle}
						placeholder="find a title"
						autocomplete="off"
						type="search"
					/>
				</label>
				{#if needle.trim()}
					<p class="quiet small">{counted} showing</p>
				{/if}
			</div>

			{#if studioStore.loading}
				<p class="quiet small">opening the base…</p>
			{:else if parts.length === 0}
				<p class="quiet small">
					No chapters yet. The first one is the box at the foot of this rail — a chapter
					can hold scenes, or hold the writing itself.
				</p>
			{:else if rail.length === 0}
				<p class="quiet small">
					No title holds “{needle}”. Clear the box to see them all again.
				</p>
			{/if}

			<ul class="tree">
				{#each rail as row (row.chapter.id)}
					<li>
						<button
							class="part chapter"
							class:current={chosenId === row.chapter.id}
							type="button"
							aria-current={chosenId === row.chapter.id ? 'true' : undefined}
							onclick={() => choose(row.chapter)}
						>
							<span class="part-title">{row.chapter.title}</span>
							<span class="part-words">{row.chapter.words}</span>
						</button>
						{#if row.scenes.length > 0}
							<ul class="scenes">
								{#each row.scenes as scene (scene.id)}
									<li>
										<button
											class="part scene"
											class:current={chosenId === scene.id}
											type="button"
											aria-current={chosenId === scene.id ? 'true' : undefined}
											onclick={() => choose(scene)}
										>
											<span class="part-title">{scene.title}</span>
											<span class="part-words">{scene.words}</span>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>

			<div class="rail-foot">
				<form onsubmit={addChapter}>
					<label class="visually-hidden" for="new-chapter">A new chapter's title</label>
					<input
						id="new-chapter"
						bind:value={newChapter}
						placeholder="a new chapter"
						autocomplete="off"
					/>
					<button type="submit" disabled={!newChapter.trim()}>Add chapter</button>
				</form>

				<form onsubmit={addScene}>
					<label class="visually-hidden" for="new-scene">A new scene's title</label>
					<input
						id="new-scene"
						bind:value={newScene}
						placeholder="a new scene"
						autocomplete="off"
						disabled={!underChapter}
					/>
					<button type="submit" disabled={!newScene.trim() || !underChapter}>
						Add scene
					</button>
					<p class="quiet small">
						{#if underChapter}
							under <strong>{underChapterTitle}</strong>
						{:else}
							choose a chapter first, and a scene goes under it
						{/if}
					</p>
				</form>
			</div>
		</aside>

		<section class="sheet">
			{#if studioStore.error}
				<p class="error" role="alert">
					The base answered: {studioStore.error}
					<button type="button" class="plain" onclick={() => studioStore.clearError()}>
						set aside
					</button>
				</p>
			{/if}

			{#if !chosen}
				<div class="doorway inner">
					<h1>Nothing chosen</h1>
					<p>
						Choose a part in the rail and it opens here — a plain box, the words as the
						base counted them, and the same text rendered beside it. Nothing is
						formatted on the way in or out.
					</p>
				</div>
			{:else}
				<header class="sheet-head">
					<label class="title-line">
						<span class="visually-hidden">The part's title</span>
						<input
							class="title-input"
							bind:value={draftTitle}
							oninput={touched}
							onblur={() => flush()}
							autocomplete="off"
						/>
					</label>

					<div class="marks">
						<span class="mark kind">{isChapter(chosen) ? 'chapter' : 'scene'}</span>
						<span class="mark words">
							{chosen.words}
							{chosen.words === 1 ? 'word' : 'words'}
							{#if save !== 'saved'}<span class="quiet"> · as of the last save</span>{/if}
						</span>
						<span class="mark state" data-state={saidState}>{saidState}</span>
						{#if confirming === chosen.id}
							<span class="confirm">
								Delete “{chosen.title}”?
								{#if isChapter(chosen)}
									Its scenes go with it, and every mark and thread on any of them.
								{:else}
									Its marks and threads go with it.
								{/if}
								<button type="button" class="danger" onclick={() => { if (chosen) void remove(chosen); }}>
									Yes, delete it
								</button>
								<button type="button" class="plain" onclick={() => (confirming = null)}>
									Keep it
								</button>
							</span>
						{:else}
							<button
								type="button"
								class="plain"
								onclick={() => { if (chosen) confirming = chosen.id; }}
							>
								Delete
							</button>
						{/if}
					</div>
				</header>

				<div class="panes">
					<label class="pane">
						<span class="pane-name">The text</span>
						<textarea
							bind:value={draftBody}
							oninput={touched}
							onblur={() => flush()}
							spellcheck="true"
							placeholder="write here"
						></textarea>
					</label>

					<div class="pane">
						<span class="pane-name">As it reads</span>
						<div class="preview">
							{#if draftBody.trim() === ''}
								<p class="quiet">Nothing yet.</p>
							{:else}
								<!-- the-scrolls escapes before it shapes; this is its output and
								     no other renderer's. -->
								{@html renderScrollBody(draftBody)}
							{/if}
						</div>
						<p class="quiet small">
							The preview shows five forms — headings, bold, italic, bullets and
							checklists. Anything else stays a plain paragraph here and is stored
							exactly as you typed it.
						</p>
					</div>
				</div>
			{/if}
		</section>
	</div>
{/if}

<style>
	.desk {
		display: flex;
		height: 100%;
		min-height: 0;
	}

	.rail {
		flex: 0 0 17rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 0.85rem;
		border-right: 1px solid var(--border-color);
		overflow-y: auto;
	}

	.rail-head h2 {
		font-size: 0.95rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		overflow-wrap: anywhere;
	}

	.find input {
		width: 100%;
	}

	.tree,
	.scenes {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.scenes {
		margin-left: 0.85rem;
		border-left: 1px solid var(--border-color);
		padding-left: 0.35rem;
	}

	.part {
		display: flex;
		width: 100%;
		gap: 0.5rem;
		align-items: baseline;
		background: none;
		border: none;
		border-radius: 0.35rem;
		color: var(--text-secondary);
		padding: 0.35rem 0.45rem;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.part:hover {
		background: color-mix(in srgb, var(--text) 7%, transparent);
		color: var(--text);
	}

	.part.current {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		color: var(--text);
	}

	.part.chapter .part-title {
		font-weight: 600;
	}

	.part.scene {
		font-size: 0.9rem;
	}

	.part-title {
		flex: 1;
		overflow-wrap: anywhere;
	}

	.part-words {
		color: var(--text-muted);
		font-size: 0.72rem;
		font-variant-numeric: tabular-nums;
	}

	.rail-foot {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-color);
	}

	.rail-foot form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.rail-foot input {
		flex: 1 1 8rem;
		min-width: 0;
	}

	.sheet {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 1.25rem 1.5rem;
		overflow-y: auto;
	}

	.sheet-head {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title-line {
		display: block;
	}

	.title-input {
		width: 100%;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.marks {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.78rem;
		color: var(--text-muted);
	}

	.mark.kind {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent);
	}

	.mark.state {
		border: 1px solid var(--border-color);
		border-radius: 999px;
		padding: 0.1rem 0.55rem;
	}

	.mark.state[data-state='unsaved'] {
		border-color: var(--accent);
		color: var(--text);
	}

	.confirm {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		color: var(--text);
	}

	.panes {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-height: 22rem;
	}

	.pane-name {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	textarea {
		flex: 1;
		resize: vertical;
		min-height: 18rem;
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.45rem;
		padding: 0.85rem 0.95rem;
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.92rem;
		line-height: 1.6;
		tab-size: 4;
	}

	.preview {
		flex: 1;
		overflow-y: auto;
		background: var(--bg-surface);
		border: 1px solid var(--border-color);
		border-radius: 0.45rem;
		padding: 0.85rem 0.95rem;
		line-height: 1.6;
	}

	/* the-scrolls' own class names, styled here because the pure renderer ships
	   markup and no stylesheet (its element carries the styles; this is not the
	   element). */
	.preview :global(p) {
		margin: 0.45em 0;
	}

	.preview :global(.scroll-h1) {
		font-size: 1.2em;
		font-weight: 700;
		margin: 0.7em 0 0.25em;
	}

	.preview :global(.scroll-h2) {
		font-size: 1.08em;
		font-weight: 700;
		margin: 0.6em 0 0.25em;
	}

	.preview :global(.scroll-h3) {
		font-size: 1em;
		font-weight: 600;
		margin: 0.5em 0 0.25em;
	}

	.preview :global(ul.scroll-list) {
		margin: 0.35em 0;
		padding-left: 1.25em;
		list-style: disc;
	}

	.preview :global(li.scroll-check) {
		list-style: none;
		margin-left: -1.25em;
	}

	.preview :global(li.scroll-check.done) {
		opacity: 0.75;
	}

	.doorway {
		max-width: 34rem;
		margin: 0 auto;
		padding: 3.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.doorway.inner {
		margin: 0;
		padding: 2rem 0;
	}

	.doorway h1 {
		font-size: 1.5rem;
		font-weight: 600;
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
		font-size: 0.78rem;
		line-height: 1.5;
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
	textarea {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.45rem 0.55rem;
		font: inherit;
	}

	button {
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.4rem 0.75rem;
		font: inherit;
		font-size: 0.85rem;
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

	button:disabled {
		opacity: 0.45;
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

	@media (max-width: 62rem) {
		.desk {
			flex-direction: column;
			height: auto;
		}

		.rail {
			flex: 0 0 auto;
			border-right: none;
			border-bottom: 1px solid var(--border-color);
		}

		.panes {
			grid-template-columns: 1fr;
		}
	}
</style>
