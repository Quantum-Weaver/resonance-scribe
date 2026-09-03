<script lang="ts">
	// THE CAST — the characters, and where each of them appears.
	//
	// THE APPEARANCES ARE DERIVED HERE AND KEPT NOWHERE. There is no second
	// list and no second store: the rows are the same `appearances` the board
	// draws its marks from, joined in this window to the parts they name and,
	// through those parts' own placement rows, to the eras those parts stand
	// in. Add a character to a card on the board and this room already knows;
	// there is nothing to keep in step, because there is only one truth.
	//
	// Which is the sixth noun's whole point: a character in a scene is ONE row.
	import { onMount } from 'svelte';
	import { chaptersOf } from '$lib/base';
	import { erasOfPart } from '$lib/board';
	import { filterData, sortData } from '$lib/panti';
	import { studioStore } from '$lib/stores/studio.svelte';
	import { workStore } from '$lib/stores/work.svelte';
	import type { Character, Part } from '$lib/types/types';

	let needle = $state('');
	let newName = $state('');
	let newEmoji = $state('');
	let newNote = $state('');
	let editing = $state<string | null>(null);
	let draftName = $state('');
	let draftEmoji = $state('');
	let draftNote = $state('');
	let confirming = $state<string | null>(null);

	const work = $derived(workStore.work);
	const parts = $derived(studioStore.parts);
	const appearances = $derived(studioStore.appearances);
	const eras = $derived(sortData(studioStore.eras, 'ord', 'asc'));

	// THE-PANTI FOR EVERY LIST. A character has no ordinal in the base — the
	// plan gave `ord` to parts and eras alone — so the cast is ordered by name
	// through `sortData`, and narrowed by name through `filterData` in
	// `contains` mode. Both copy; the store's array is never touched.
	const shown = $derived(
		filterData(sortData(studioStore.characters, 'name', 'asc'), {
			key: 'name',
			value: needle
		})
	);

	const partOf = (id: string): Part | null => parts.find((p) => p.id === id) ?? null;
	const eraName = (id: string) => eras.find((e) => e.id === id)?.name ?? '';

	interface Where {
		part: Part;
		/** The chapter a scene sits under, so a scene's name is never alone. */
		under: Part | null;
		eras: string[];
	}

	/**
	 * Where one character appears, derived. Every row with this character's id
	 * and a part id becomes one line; the eras come from that part's OWN
	 * placement rows, which is the same join the board makes when it decides
	 * which column a card belongs in.
	 */
	function whereAppears(character: Character): Where[] {
		const seen = new Set<string>();
		const out: Where[] = [];
		for (const a of appearances) {
			if (a.character_id !== character.id || a.part_id === null) continue;
			if (seen.has(a.part_id)) continue;
			seen.add(a.part_id);
			const part = partOf(a.part_id);
			if (!part) continue;
			out.push({
				part,
				under: part.parent_id ? partOf(part.parent_id) : null,
				eras: erasOfPart(appearances, part.id).map(eraName).filter(Boolean)
			});
		}
		// In the work's own reading order, which the base already sorted the
		// parts into — so this room and the desk's rail agree about what comes
		// first.
		const order = parts.map((p) => p.id);
		return out.sort((x, y) => order.indexOf(x.part.id) - order.indexOf(y.part.id));
	}

	async function add(event: SubmitEvent) {
		event.preventDefault();
		const name = newName.trim();
		if (!name) return;
		await studioStore.addCharacter(name, newEmoji.trim(), newNote.trim() || null);
		newName = '';
		newEmoji = '';
		newNote = '';
	}

	function begin(c: Character) {
		editing = c.id;
		draftName = c.name;
		draftEmoji = c.emoji;
		draftNote = c.note ?? '';
		confirming = null;
	}

	async function save(c: Character) {
		const name = draftName.trim();
		editing = null;
		if (!name) return;
		await studioStore.editCharacter(c.id, name, draftEmoji.trim(), draftNote.trim() || null);
	}

	async function remove(c: Character) {
		confirming = null;
		await studioStore.removeCharacter(c.id);
	}

	const chapterCount = $derived(chaptersOf(parts).length);

	onMount(() => {
		void (async () => {
			const w = await workStore.restore();
			if (w) await studioStore.load(w.id);
		})();
	});
</script>

<svelte:head><title>The cast — Resonance Scribe</title></svelte:head>

{#if !work}
	<div class="doorway">
		<h1>The cast</h1>
		<p>
			No work is chosen yet, so there is no cast to read. The shelf holds every work this
			device has.
		</p>
		<p><a class="invite" href="/">Go to the shelf</a></p>
	</div>
{:else}
	<div class="page">
		<header>
			<h1>The cast of {work.title}</h1>
			<p class="quiet">
				Everyone the work names, and where each of them appears. The appearances are read
				from the same rows the board draws — mark a character on a card there and it shows
				here without anything being kept in step.
			</p>
		</header>

		{#if studioStore.error}
			<p class="error" role="alert">
				The base answered: {studioStore.error}
				<button type="button" class="plain" onclick={() => studioStore.clearError()}>
					set aside
				</button>
			</p>
		{/if}

		<section class="make">
			<h2>Name someone</h2>
			<form onsubmit={add}>
				<label>
					<span>Name</span>
					<input bind:value={newName} placeholder="who they are" autocomplete="off" />
				</label>
				<label class="narrow">
					<span>Emoji</span>
					<input bind:value={newEmoji} placeholder="🙂" autocomplete="off" />
				</label>
				<label>
					<span>Note</span>
					<input bind:value={newNote} placeholder="optional" autocomplete="off" />
				</label>
				<button type="submit" disabled={!newName.trim()}>Add</button>
			</form>
		</section>

		<section>
			<div class="list-head">
				<h2>The cast</h2>
				<label class="find">
					<span class="visually-hidden">Find a character by name</span>
					<input bind:value={needle} placeholder="find a name" type="search" autocomplete="off" />
				</label>
			</div>

			{#if studioStore.loading}
				<p class="quiet">opening the base…</p>
			{:else if studioStore.characters.length === 0}
				<!-- An empty room invites, and names the next act. -->
				<p class="quiet">
					No one yet. The box above names the first — a name is all it takes, and an emoji
					if you want one, because that emoji is the mark this character wears on the
					board's cards.
					{#if chapterCount === 0}
						There are no chapters yet either;
						<a class="invite" href="/desk">the desk</a> is where the first one begins.
					{:else}
						<a class="invite" href="/board">The board</a> is where a character is put in a
						scene.
					{/if}
				</p>
			{:else if shown.length === 0}
				<p class="quiet">No name holds “{needle}”. Clear the box to see them all again.</p>
			{:else}
				<ul class="cast">
					{#each shown as c (c.id)}
						{@const where = whereAppears(c)}
						<li>
							{#if editing === c.id}
								<div class="editing">
									<label>
										<span class="visually-hidden">Name</span>
										<input bind:value={draftName} autocomplete="off" />
									</label>
									<label class="narrow">
										<span class="visually-hidden">Emoji</span>
										<input bind:value={draftEmoji} autocomplete="off" />
									</label>
									<label>
										<span class="visually-hidden">Note</span>
										<input bind:value={draftNote} placeholder="a note" autocomplete="off" />
									</label>
									<button type="button" onclick={() => save(c)}>Save</button>
									<button type="button" class="plain" onclick={() => (editing = null)}>
										Cancel
									</button>
								</div>
							{:else}
								<div class="who">
									<span class="emoji" aria-hidden="true">{c.emoji || '·'}</span>
									<span class="name">{c.name}</span>
									{#if c.note}<span class="note">{c.note}</span>{/if}
									<span class="count quiet">
										{where.length}
										{where.length === 1 ? 'appearance' : 'appearances'}
									</span>
									<button type="button" class="plain" onclick={() => begin(c)}>
										Edit<span class="visually-hidden"> {c.name}</span>
									</button>
									{#if confirming === c.id}
										<span class="confirm">
											Delete “{c.name}”? Every mark on a card goes with them; the
											chapters stay.
											<button type="button" class="danger" onclick={() => remove(c)}>
												Yes, delete
											</button>
											<button type="button" class="plain" onclick={() => (confirming = null)}>
												Keep them
											</button>
										</span>
									{:else}
										<button type="button" class="plain" onclick={() => (confirming = c.id)}>
											Delete<span class="visually-hidden"> {c.name}</span>
										</button>
									{/if}
								</div>

								{#if where.length === 0}
									<p class="quiet small nowhere">
										Named, and in no scene yet. <a class="invite" href="/board">The board</a>
										is where a character is put on a card.
									</p>
								{:else}
									<ul class="appears">
										{#each where as w (w.part.id)}
											<li>
												{#if w.under}
													<span class="quiet small">{w.under.title} ·</span>
												{/if}
												<span class="part">{w.part.title}</span>
												{#if w.eras.length > 0}
													<span class="eras small">
														{#each w.eras as e (e)}<span class="era">{e}</span>{/each}
													</span>
												{:else}
													<span class="quiet small">no era yet</span>
												{/if}
											</li>
										{/each}
									</ul>
								{/if}
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}

<style>
	.page {
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-bottom: 0.6rem;
	}

	header p {
		margin-top: 0.5rem;
		max-width: 42rem;
		line-height: 1.55;
	}

	form,
	.editing {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: flex-end;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1 1 10rem;
	}

	label.narrow {
		flex: 0 0 5rem;
	}

	label span {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.list-head {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: baseline;
		justify-content: space-between;
	}

	.find {
		flex: 0 0 12rem;
	}

	.cast {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.cast > li {
		background: var(--bg-surface);
		border: 1px solid var(--border-color);
		border-radius: 0.55rem;
		padding: 0.7rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem;
	}

	.emoji {
		font-size: 1.1rem;
	}

	.name {
		font-weight: 600;
	}

	.note {
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.count {
		margin-left: auto;
		font-size: 0.76rem;
	}

	.appears {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		border-left: 2px solid var(--border-color);
		padding-left: 0.6rem;
	}

	.appears li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: baseline;
		font-size: 0.88rem;
	}

	.part {
		color: var(--text);
	}

	.eras {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.era {
		border: 1px solid var(--border-color);
		border-radius: 999px;
		padding: 0.02rem 0.45rem;
		color: var(--text-secondary);
	}

	.nowhere {
		padding-left: 0.1rem;
	}

	.confirm {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: baseline;
		color: var(--text);
		font-size: 0.85rem;
	}

	.doorway {
		max-width: 34rem;
		margin: 0 auto;
		padding: 3.5rem 1.5rem;
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
		line-height: 1.55;
	}

	.small {
		font-size: 0.76rem;
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

	input {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.4rem 0.55rem;
		font: inherit;
		font-size: 0.9rem;
		width: 100%;
		min-width: 0;
	}

	button {
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.35rem 0.75rem;
		font: inherit;
		font-size: 0.82rem;
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
</style>
