<script lang="ts">
	// THE SHELF — the only room S1 builds. It opens the base, lists the works,
	// and makes one. The desk, the board, the cast and the bind are S2's and
	// S3's; they are named below as DOORWAYS, never as dead ends
	// (the-epagoge's second day, and the plan's §The rulings that governed).
	import { onMount } from 'svelte';
	import { createWork, listWorks } from '$lib/base';
	import { WORK_KINDS, type Work, type WorkKind } from '$lib/types/types';

	let works = $state<Work[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let title = $state('');
	let kind = $state<WorkKind>('book');
	let byline = $state('');
	let saving = $state(false);

	const ready = $derived(title.trim().length > 0 && !saving);

	async function refresh() {
		try {
			works = await listWorks();
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			loading = false;
		}
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!ready) return;
		saving = true;
		try {
			await createWork(kind, title.trim(), byline.trim() || null, null);
			title = '';
			byline = '';
			await refresh();
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	const when = (ms: number) => new Date(ms).toLocaleDateString();

	onMount(refresh);

	const doorways = [
		{ name: 'The desk', says: 'a work’s parts in a rail, the chosen part in a plain markdown editor, the word count as data.' },
		{ name: 'The board', says: 'parts as cards across the eras, arcs drawn through the cards they appear in, characters as marks.' },
		{ name: 'The cast', says: 'characters and their appearances, read from the board and never kept as a second list.' },
		{ name: 'The bind', says: 'a work out as a manuscript folder, an EPUB, paged HTML, or standard manuscript format.' }
	];
</script>

<svelte:head><title>Resonance Scribe</title></svelte:head>

<div class="page">
	<header>
		<h1>Resonance Scribe</h1>
		<p class="sub">
			The author’s studio. A book, a manuscript, an article, an essay — held as works and
			their parts, with eras, characters and arcs hanging on them. Everything stays on this
			device.
		</p>
	</header>

	{#if error}
		<p class="error" role="alert">The base answered: {error}</p>
	{/if}

	<section class="make">
		<h2>Begin a work</h2>
		<form onsubmit={submit}>
			<label>
				<span>Title</span>
				<input bind:value={title} placeholder="what it is called" autocomplete="off" />
			</label>
			<label>
				<span>Kind</span>
				<select bind:value={kind}>
					{#each WORK_KINDS as k (k)}
						<option value={k}>{k}</option>
					{/each}
				</select>
			</label>
			<label>
				<span>Byline</span>
				<input bind:value={byline} placeholder="optional" autocomplete="off" />
			</label>
			<button type="submit" disabled={!ready}>{saving ? 'writing…' : 'Create'}</button>
		</form>
	</section>

	<section class="shelf">
		<h2>The shelf</h2>
		{#if loading}
			<p class="quiet">opening the base…</p>
		{:else if works.length === 0}
			<p class="quiet">Nothing here yet. The first work is one line above.</p>
		{:else}
			<ul>
				{#each works as w (w.id)}
					<li>
						<span class="kind">{w.kind}</span>
						<span class="title">{w.title}</span>
						{#if w.byline}<span class="byline">{w.byline}</span>{/if}
						<span class="when">touched {when(w.updated_at)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="doorways">
		<h2>Four doorways, not yet built</h2>
		<p class="quiet">
			The body and the base stand; the rooms do not. These are doorways — each one is
			planned, none of them is a dead end, and nothing behind them is lost because
			nothing is behind them yet.
		</p>
		<ul>
			{#each doorways as d (d.name)}
				<li><strong>{d.name}</strong> — {d.says}</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.page {
		max-width: 52rem;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
	}

	h1 {
		font-size: 1.9rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-bottom: 0.75rem;
	}

	.sub {
		margin-top: 0.5rem;
		color: var(--text-secondary);
		max-width: 40rem;
		line-height: 1.55;
	}

	.quiet {
		color: var(--text-muted);
		line-height: 1.55;
	}

	.error {
		border: 1px solid var(--accent);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		color: var(--text);
		background: var(--bg-surface);
	}

	form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: flex-end;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		flex: 1 1 12rem;
	}

	label span {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	input,
	select {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.5rem 0.6rem;
		font: inherit;
	}

	button {
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.55rem 1.1rem;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.shelf ul,
	.doorways ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.shelf li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem;
		background: var(--bg-surface);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.7rem 0.9rem;
	}

	.kind {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
	}

	.title {
		font-weight: 600;
	}

	.byline,
	.when {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.when {
		margin-left: auto;
	}

	.doorways li {
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.doorways strong {
		color: var(--text);
	}
</style>
