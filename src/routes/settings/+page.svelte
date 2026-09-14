<script lang="ts">
	// SETTINGS — the author, the atmosphere, and the whole studio's way in and out.
	//
	// THE DISK IS REACHED THROUGH `$lib/host` AND NOWHERE ELSE, and the base
	// through `$lib/base`. No plugin is imported here; the save dialog and the
	// never-overwrite law come with `deliver`, and the chooser with `openFrom`.
	//
	// THE EXPORT IS AWAITED BEFORE ANYTHING DELETES — the-envelope's second law,
	// word for word: "the export must be complete IN HAND before anything
	// deletes". An export that did not land stops the purge, and the room says
	// so rather than deleting anyway.
	//
	// THE PURGE CLEARS EVERYTHING, NEVER A CURATED LIST. `purgeAll` empties
	// every table in one transaction and `localStorage.clear()` takes the rest,
	// so a key written tomorrow cannot survive by omission.
	//
	// AN IMPORT IS NEVER A MERGE. Every work in a file becomes a NEW work with
	// ids minted by the base, and an author already standing is never written
	// over without a hand saying so twice.

	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { version as APP_VERSION } from '../../../package.json';

	import {
		createAppearance,
		createArc,
		createCharacter,
		createEra,
		createPart,
		createWork,
		purgeAll,
		readAll
	} from '$lib/base';
	import {
		SCRIBE_FORMAT,
		STUDIO_FORMAT,
		readingToImport,
		readingToStudioImport,
		studioEnvelopeOf
	} from '$lib/bind';
	import type { ImportPlan, StudioAuthor, StudioImportPlan } from '$lib/bind';
	import { deliver, openFrom } from '$lib/envelope';
	import { scribeHost } from '$lib/host';
	import { authorStore } from '$lib/stores/author.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { workStore } from '$lib/stores/work.svelte';
	import { PRESET_THEMES, presetSwatch } from '$lib/theme/theme';
	import type { StudioDump } from '$lib/types/types';

	/** What a road answers: one plain line, and every told line under it. */
	interface Said {
		tone: 'done' | 'refused' | 'declined';
		line: string;
		told: string[];
	}

	const said = (tone: Said['tone'], line: string, told: string[] = []): Said => ({
		tone,
		line,
		told
	});

	const sentence = (e: unknown): string => (e instanceof Error ? e.message : String(e));

	let busy = $state<string | null>(null);

	// ── the author ─────────────────────────────────────────────────────────

	let nameBox = $state('');
	let bylineBox = $state('');
	let contactBox = $state('');
	let filled = $state(false);
	let authorSaid = $state<Said | null>(null);

	// The boxes follow the stored row the first time it arrives and never again,
	// so a load cannot yank back what a hand is typing.
	$effect(() => {
		const who = authorStore.author;
		if (!who || filled) return;
		filled = true;
		nameBox = who.name;
		bylineBox = who.byline;
		contactBox = who.contact;
	});

	async function saveAuthor() {
		busy = 'author';
		authorSaid = null;
		try {
			const saved = await authorStore.save(nameBox, bylineBox, contactBox);
			authorSaid = saved
				? said(
						'done',
						`Saved. ${saved.name.trim() === '' ? 'No name is set' : `“${saved.name}”`}${saved.contact.trim() === '' ? ', and the contact block is empty — the manuscript road notes that out loud and invents nothing.' : `, with a contact block of ${saved.contact.split('\n').length} line(s), kept verbatim.`}`
					)
				: said(
						'refused',
						`Nothing was written — ${authorStore.refusal ?? 'the base did not answer.'}`
					);
		} finally {
			busy = null;
		}
	}

	// ── the theme, as the mother offers it ─────────────────────────────────

	const themeOptions = Object.entries(PRESET_THEMES).map(([key, t]) => ({
		key,
		icon: t.icon ?? '✨',
		name: t.presetName,
		accent: t.accentColor,
		swatch: presetSwatch(t)
	}));

	// Matched on presetName, not accent — Dark and AMOLED share an accent colour.
	const activePreset = $derived(
		Object.entries(PRESET_THEMES).find(
			([, p]) => p.presetName === themeStore.config.presetName
		)?.[0] ?? 'dark'
	);

	const displayModes = [
		{ key: 'light' as const, label: '☀️ Light' },
		{ key: 'dark' as const, label: '🌙 Dark' },
		{ key: 'amoled' as const, label: '⚫ AMOLED' }
	];
	const tintLevels = [
		{ key: 'off' as const, label: 'Off' },
		{ key: 'subtle' as const, label: 'Subtle' },
		{ key: 'full' as const, label: 'Full' }
	];
	const fontSizes = [
		{ key: 'small' as const, label: 'Small' },
		{ key: 'medium' as const, label: 'Medium' },
		{ key: 'large' as const, label: 'Large' }
	];

	// ── the studio, counted ────────────────────────────────────────────────

	let dump = $state<StudioDump | null>(null);
	let dumpSaid = $state<Said | null>(null);

	async function countStudio() {
		try {
			dump = await readAll();
			dumpSaid = null;
		} catch (e) {
			dump = null;
			dumpSaid = said('refused', `The studio could not be counted — ${sentence(e)}`);
		}
	}

	onMount(() => {
		void authorStore.load();
		void countStudio();
	});

	// ── the export ─────────────────────────────────────────────────────────

	let exportSaid = $state<Said | null>(null);

	/** THE ROOM READS THE CLOCK. `studioEnvelopeOf` stamps `sealedAt` from what
	 *  it is handed and reads none of its own. True only when bytes landed. */
	async function exportStudio(): Promise<boolean> {
		exportSaid = null;
		let all: StudioDump;
		try {
			all = await readAll();
		} catch (e) {
			exportSaid = said('refused', `Nothing was read and nothing was written — ${sentence(e)}`);
			return false;
		}
		const at = new Date().toISOString();
		const envelope = studioEnvelopeOf(all, { appVersion: APP_VERSION, at });
		const delivery = await deliver(scribeHost(), envelope);
		const told = [
			`the counts are written on the OUTSIDE of the envelope: ${Object.entries(envelope.counts)
				.map(([k, n]) => `${n} ${k}`)
				.join(' · ')}. A hand can read them without opening it.`,
			`sealed at ${at}, by this room's own reading of the clock, and stated inside the file as well as on it.`,
			'every work inside is sealed exactly as the bind room seals one on its own, so a studio file and a work file read the same way.'
		];
		if (!delivery.delivered) {
			exportSaid = said('declined', delivery.why, told);
			return false;
		}
		exportSaid = said(
			'done',
			`Delivered to ${delivery.destination} — ${delivery.bytes.length.toLocaleString()} bytes.`,
			told
		);
		return true;
	}

	async function exportPressed() {
		busy = 'export';
		try {
			await exportStudio();
		} finally {
			busy = null;
		}
	}

	// ── the import ─────────────────────────────────────────────────────────

	type Held =
		| { kind: 'studio'; name: string; plan: StudioImportPlan }
		| { kind: 'work'; name: string; plan: ImportPlan };

	let openSaid = $state<Said | null>(null);
	let importSaid = $state<Said | null>(null);
	let held = $state<Held | null>(null);
	let replaceAsking = $state(false);

	const heldAuthor = $derived<StudioAuthor | null>(
		held && held.kind === 'studio' ? held.plan.author : null
	);

	async function openFile() {
		busy = 'open';
		openSaid = null;
		importSaid = null;
		held = null;
		replaceAsking = false;
		try {
			const opening = await openFrom(scribeHost(), 'resonance-scribe');
			if (!opening.opened) {
				// The-envelope's own refusal, word for word — one refusal, one wording.
				openSaid = said('refused', opening.why);
				return;
			}
			if (opening.reading.kind === 'legacy') {
				openSaid = said(
					'refused',
					'this file is a bare list from before the envelope — Scribe has never written one, so there is nothing here it knows how to read.'
				);
				return;
			}
			const format = (opening.reading.data as Record<string, unknown>).format;
			if (format === STUDIO_FORMAT) {
				const plan = readingToStudioImport(opening.reading);
				if (plan.refused !== null) {
					openSaid = said('refused', plan.refused);
					return;
				}
				held = { kind: 'studio', name: opening.name, plan };
				openSaid = said(
					'done',
					`${opening.name} holds a whole studio: ${plan.works.length} work${plan.works.length === 1 ? '' : 's'}${plan.author ? ' and an author' : ' and no author'}. Nothing has been created yet.`,
					plan.told
				);
				return;
			}
			if (format === SCRIBE_FORMAT) {
				const plan = readingToImport(opening.reading);
				if (plan.refused !== null) {
					openSaid = said('refused', plan.refused);
					return;
				}
				held = { kind: 'work', name: opening.name, plan };
				openSaid = said(
					'done',
					`${opening.name} holds one work, “${plan.title}”. Nothing has been created yet.`,
					plan.told
				);
				return;
			}
			openSaid = said(
				'refused',
				`this envelope holds ${JSON.stringify(format)}, and this room reads "${STUDIO_FORMAT}" and "${SCRIBE_FORMAT}". The file was not altered.`
			);
		} finally {
			busy = null;
		}
	}

	/** One plan's rows, created through `$lib/base.ts`. THE BASE MINTS EVERY ID:
	 *  the plan speaks in array indices and carries no id from the file. */
	async function createFrom(plan: ImportPlan): Promise<{ title: string; rows: number }> {
		const made = await createWork(plan.work!.kind, plan.work!.title, plan.work!.byline, plan.work!.note);
		let rows = 1;

		const partIds: string[] = [];
		for (const row of plan.parts) {
			const parent = row.parentIndex === null ? null : (partIds[row.parentIndex] ?? null);
			partIds.push((await createPart(made.id, parent, row.title, row.body)).id);
			rows += 1;
		}
		const eraIds: string[] = [];
		for (const row of plan.eras) {
			eraIds.push((await createEra(made.id, row.name, row.note)).id);
			rows += 1;
		}
		const charIds: string[] = [];
		for (const row of plan.characters) {
			charIds.push((await createCharacter(made.id, row.name, row.note, row.emoji)).id);
			rows += 1;
		}
		const arcIds: string[] = [];
		for (const row of plan.arcs) {
			arcIds.push((await createArc(made.id, row.name, row.shape, row.note)).id);
			rows += 1;
		}
		for (const row of plan.appearances) {
			await createAppearance(made.id, {
				partId: row.partIndex === null ? null : (partIds[row.partIndex] ?? null),
				eraId: row.eraIndex === null ? null : (eraIds[row.eraIndex] ?? null),
				characterId: row.characterIndex === null ? null : (charIds[row.characterIndex] ?? null),
				arcId: row.arcIndex === null ? null : (arcIds[row.arcIndex] ?? null),
				note: row.note
			});
			rows += 1;
		}
		return { title: made.title, rows };
	}

	async function importHeld() {
		const have = held;
		if (!have) return;
		busy = 'import';
		importSaid = null;
		try {
			const plans = have.kind === 'studio' ? have.plan.works : [have.plan];
			const titles: string[] = [];
			let rows = 0;
			for (const plan of plans) {
				if (!plan.work) continue;
				const out = await createFrom(plan);
				titles.push(out.title);
				rows += out.rows;
			}

			const told = [...have.plan.told];
			let authorLine = '';
			if (have.kind === 'studio' && have.plan.author) {
				if (authorStore.absent) {
					const saved = await authorStore.save(
						have.plan.author.name,
						have.plan.author.byline,
						have.plan.author.contact
					);
					filled = false;
					authorLine = saved
						? ' The author came in too, because none stood here.'
						: ` The author was not written — ${authorStore.refusal ?? 'the base did not answer.'}`;
				} else {
					authorLine =
						' An author already stands here, so the one in the file was left where it is; Replace is below.';
				}
			}

			await countStudio();
			importSaid = said(
				'done',
				`${titles.length} work${titles.length === 1 ? '' : 's'} created — ${titles.map((t) => `“${t}”`).join(', ')} — ${rows} row${rows === 1 ? '' : 's'} in all. Everything that stood here before is untouched.${authorLine}`,
				told
			);
			if (!(have.kind === 'studio' && have.plan.author && !authorStore.absent)) held = null;
		} catch (e) {
			importSaid = said('refused', `Not everything was created — ${sentence(e)}`);
		} finally {
			busy = null;
		}
	}

	async function replaceAuthor() {
		const who = heldAuthor;
		if (!who) return;
		busy = 'replace';
		try {
			const saved = await authorStore.save(who.name, who.byline, who.contact);
			filled = false;
			importSaid = saved
				? said('done', `The author is now “${saved.name}”, as the file carries them.`)
				: said(
						'refused',
						`Nothing was written — ${authorStore.refusal ?? 'the base did not answer.'}`
					);
			replaceAsking = false;
			if (saved) held = null;
		} finally {
			busy = null;
		}
	}

	// ── the purge ──────────────────────────────────────────────────────────

	let purgeState = $state<'idle' | 'confirm1' | 'confirm2'>('idle');
	let pendingExport = $state(false);
	let purgeSaid = $state<Said | null>(null);
	let purgeDone = $state(false);

	function startPurge(withExport: boolean) {
		pendingExport = withExport;
		purgeState = 'confirm1';
		purgeSaid = null;
		purgeDone = false;
	}

	function cancelPurge() {
		purgeState = 'idle';
		pendingExport = false;
	}

	async function runPurge() {
		busy = 'purge';
		purgeSaid = null;
		purgeDone = false;
		try {
			// AWAITED: the export must be complete IN HAND before anything deletes.
			if (pendingExport) {
				const landed = await exportStudio();
				if (!landed) {
					purgeSaid = said(
						'refused',
						'Nothing was deleted. The export did not land, and an export-then-purge never destroys what it could not carry out first.'
					);
					return;
				}
			}
			let rows: number;
			try {
				rows = await purgeAll();
			} catch (e) {
				purgeSaid = said('refused', `Nothing was deleted — ${sentence(e)}`);
				return;
			}
			// Everything, never a curated list: a key written tomorrow must not
			// survive by omission.
			if (typeof localStorage !== 'undefined') localStorage.clear();
			authorStore.forget();
			workStore.clear();
			nameBox = '';
			bylineBox = '';
			contactBox = '';
			filled = false;
			purgeState = 'idle';
			pendingExport = false;
			purgeSaid = said('done', `${rows} row${rows === 1 ? '' : 's'} went. The studio is empty.`);
			purgeDone = true;
			// The room reads itself back, so what stands is what a fresh load shows.
			await countStudio();
			await authorStore.load();
		} finally {
			busy = null;
		}
	}
</script>

<svelte:head><title>Settings — Resonance Scribe</title></svelte:head>

{#snippet says(s: Said | null)}
	{#if s}
		<p class="line" data-tone={s.tone} role="status">{s.line}</p>
		{#if s.told.length > 0}
			<details class="told">
				<summary>{s.told.length} thing{s.told.length === 1 ? '' : 's'} said out loud</summary>
				<ol>
					{#each s.told as t, i (i)}<li>{t}</li>{/each}
				</ol>
			</details>
		{/if}
	{/if}
{/snippet}

<div class="settings">
	<header class="head">
		<h1>Settings</h1>
		<p class="lede">
			Everything here is kept on this device. Nothing is uploaded, nothing is analysed elsewhere,
			and no file of yours is ever written over.
		</p>
	</header>

	<!-- ── the author ──────────────────────────────────────────────── -->
	<section class="part">
		<h2>The author</h2>
		<p class="quiet small">
			The one row the studio keeps about you. The by-line fills a work's own when it has none, and
			the contact block is the one a standard manuscript sets at the top left of its title page.
		</p>

		<label class="field">
			<span>Name</span>
			<input bind:value={nameBox} placeholder="a name, a nickname, anything" autocomplete="off" />
		</label>
		<label class="field">
			<span>By-line, as it should appear on a title page</span>
			<input bind:value={bylineBox} placeholder="the name a reader sees" autocomplete="off" />
		</label>
		<label class="field">
			<span>Contact block — one line per line, kept verbatim, may be empty</span>
			<textarea
				bind:value={contactBox}
				rows="4"
				placeholder="nothing is looked up and nothing is invented"
			></textarea>
		</label>

		<div class="row">
			<button type="button" onclick={saveAuthor} disabled={busy !== null}>
				{busy === 'author' ? 'writing…' : 'Save'}
			</button>
			<a class="plain-link" href="/onboarding">Walk the door again</a>
		</div>

		{@render says(authorSaid)}
		{#if authorStore.absent}
			<p class="quiet small">No author stands here yet.</p>
		{/if}
	</section>

	<!-- ── the theme ───────────────────────────────────────────────── -->
	<section class="part">
		<h2>Theme</h2>

		<div class="themes">
			{#each themeOptions as opt (opt.key)}
				<button
					type="button"
					class="theme-card"
					class:selected={activePreset === opt.key}
					style="--card-accent: {opt.accent};"
					onclick={() => themeStore.setPreset(opt.key)}
					aria-pressed={activePreset === opt.key}
				>
					<span class="theme-icon" aria-hidden="true">{opt.icon}</span>
					<span class="theme-name">{opt.name}</span>
					<span class="theme-swatch" style="background: {opt.swatch};"></span>
				</button>
			{/each}
		</div>

		<div class="pill-row">
			<span class="pill-label" id="mode-label">Display mode</span>
			<div class="pills" role="group" aria-labelledby="mode-label">
				{#each displayModes as { key, label } (key)}
					<button
						type="button"
						class="pill"
						class:active={themeStore.config.mode === key}
						onclick={() => themeStore.setMode(key)}>{label}</button
					>
				{/each}
			</div>
		</div>

		<div class="pill-row">
			<span class="pill-label" id="tint-label">Background tint</span>
			<div class="pills" role="group" aria-labelledby="tint-label">
				{#each tintLevels as { key, label } (key)}
					<button
						type="button"
						class="pill"
						class:active={themeStore.config.tint === key}
						onclick={() => themeStore.setTint(key)}>{label}</button
					>
				{/each}
			</div>
		</div>

		<div class="pill-row">
			<span class="pill-label" id="size-label">Type size</span>
			<div class="pills" role="group" aria-labelledby="size-label">
				{#each fontSizes as { key, label } (key)}
					<button
						type="button"
						class="pill"
						class:active={themeStore.config.fontSize === key}
						onclick={() => themeStore.setFontSize(key)}>{label}</button
					>
				{/each}
			</div>
		</div>
	</section>

	<!-- ── the studio ──────────────────────────────────────────────── -->
	<section class="part">
		<h2>The studio</h2>
		{#if dump}
			<dl class="counts">
				<div><dt>works</dt><dd>{dump.works.length}</dd></div>
				<div><dt>parts</dt><dd>{dump.parts.length}</dd></div>
				<div><dt>eras</dt><dd>{dump.eras.length}</dd></div>
				<div><dt>characters</dt><dd>{dump.characters.length}</dd></div>
				<div><dt>arcs</dt><dd>{dump.arcs.length}</dd></div>
			</dl>
			<p class="quiet small">Every row of every table, counted by the base itself.</p>
		{:else}
			<p class="quiet small">The studio has not been counted.</p>
		{/if}
		{@render says(dumpSaid)}
	</section>

	<!-- ── the export ──────────────────────────────────────────────── -->
	<section class="part">
		<h2>Export</h2>
		<p>
			The whole studio in one file — the author and every work, each sealed exactly as the bind
			room seals one, with the counts written on the outside. You choose where it lands, and
			nothing standing there is ever written over.
		</p>
		<button type="button" onclick={exportPressed} disabled={busy !== null}>
			{busy === 'export' ? 'sealing…' : 'Export the studio'}
		</button>
		{@render says(exportSaid)}
	</section>

	<!-- ── the import ──────────────────────────────────────────────── -->
	<section class="part">
		<h2>Import</h2>
		<p>
			A studio file brings every work in it; a single <code>.scribe.json</code> brings that one.
			Either way each work arrives as a NEW work with ids minted here, and nothing standing is
			merged into, changed or removed.
		</p>
		<button type="button" onclick={openFile} disabled={busy !== null}>
			{busy === 'open' ? 'opening…' : 'Import'}
		</button>

		{@render says(openSaid)}

		{#if held}
			<div class="opened">
				<h3>What {held.name} holds</h3>
				{#if held.kind === 'studio'}
					<dl class="counts">
						{#each Object.entries(held.plan.counts) as [what, n] (what)}
							<div><dt>{what}, on the outside</dt><dd>{n}</dd></div>
						{/each}
						<div><dt>works to create</dt><dd>{held.plan.works.length}</dd></div>
						<div><dt>author in the file</dt><dd>{held.plan.author ? 'yes' : 'no'}</dd></div>
					</dl>
					{#if held.plan.titles.length > 0}
						<ul class="names">
							{#each held.plan.titles as t, i (i)}<li>{t}</li>{/each}
						</ul>
					{/if}
				{:else}
					<dl class="counts">
						<div><dt>title</dt><dd>{held.plan.title}</dd></div>
						<div><dt>parts to create</dt><dd>{held.plan.parts.length}</dd></div>
						<div><dt>eras to create</dt><dd>{held.plan.eras.length}</dd></div>
						<div><dt>characters to create</dt><dd>{held.plan.characters.length}</dd></div>
						<div><dt>arcs to create</dt><dd>{held.plan.arcs.length}</dd></div>
						<div><dt>appearances to create</dt><dd>{held.plan.appearances.length}</dd></div>
					</dl>
				{/if}

				<button type="button" onclick={importHeld} disabled={busy !== null}>
					{busy === 'import' ? 'creating…' : 'Create them'}
				</button>

				{#if heldAuthor && !authorStore.absent}
					<div class="ask">
						<p>
							An author already stands here: “{authorStore.name}”. The file carries “{heldAuthor.name}”.
							Yours is kept unless you say otherwise.
						</p>
						{#if !replaceAsking}
							<button type="button" class="plain" onclick={() => (replaceAsking = true)}>
								Replace
							</button>
						{:else}
							<div class="row">
								<button type="button" class="plain" onclick={() => (replaceAsking = false)}>
									Keep mine
								</button>
								<button type="button" onclick={replaceAuthor} disabled={busy !== null}>
									{busy === 'replace' ? 'writing…' : 'Replace the author'}
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}

		{@render says(importSaid)}
	</section>

	<!-- ── the purge ───────────────────────────────────────────────── -->
	<section class="part danger">
		<h2>Purge</h2>
		<p>
			Every work, every part, every era, every character, every arc, every appearance and the
			author — emptied from the base in one transaction. The file and its schema stand; nothing
			in them does. This cannot be undone.
		</p>

		{#if purgeState === 'idle'}
			<div class="row">
				<button type="button" class="warn" onclick={() => startPurge(true)} disabled={busy !== null}>
					Export, then purge
				</button>
				<button type="button" class="warn" onclick={() => startPurge(false)} disabled={busy !== null}>
					Purge without export
				</button>
			</div>
		{:else if purgeState === 'confirm1'}
			<div class="confirm">
				<p>
					{pendingExport
						? 'The studio will be written to a file you choose, and then everything here is deleted.'
						: 'Everything here is deleted, and nothing is written out first.'}
				</p>
				<div class="row">
					<button type="button" class="plain" onclick={cancelPurge}>Cancel</button>
					<button type="button" class="warn" onclick={() => (purgeState = 'confirm2')}>
						Continue
					</button>
				</div>
			</div>
		{:else}
			<div class="confirm final">
				<p>
					{pendingExport
						? 'Last word: the export is awaited first, and if it does not land nothing is deleted.'
						: 'Last word: nothing is written out, and nothing can be recovered.'}
				</p>
				<div class="row">
					<button type="button" class="plain" onclick={cancelPurge}>Cancel</button>
					<button type="button" class="warn" onclick={runPurge} disabled={busy !== null}>
						{busy === 'purge' ? 'purging…' : 'Purge everything'}
					</button>
				</div>
			</div>
		{/if}

		{@render says(purgeSaid)}

		{#if purgeDone}
			<!-- The road ends in a choice; nothing here navigates on its own. -->
			<div class="row">
				<button type="button" onclick={() => void goto('/onboarding')}>To the door</button>
				<button type="button" class="plain" onclick={() => (purgeDone = false)}>Stay</button>
			</div>
		{/if}
	</section>
</div>

<style>
	.settings {
		max-width: 46rem;
		margin: 0 auto;
		padding: 2.25rem 1.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	h1 {
		font-size: 1.6rem;
		font-weight: 600;
	}

	h2 {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
		margin-bottom: 0.6rem;
	}

	h3 {
		font-size: 0.95rem;
		font-weight: 600;
		margin-bottom: 0.4rem;
	}

	p {
		color: var(--text-secondary);
		line-height: 1.6;
	}

	.lede {
		color: var(--text);
		margin-top: 0.4rem;
	}

	.head {
		display: flex;
		flex-direction: column;
	}

	.part {
		border-top: 1px solid var(--border-color);
		padding-top: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.field span {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	input,
	textarea {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.45rem 0.55rem;
		font: inherit;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	textarea {
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		resize: vertical;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	button {
		align-self: flex-start;
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 0.4rem;
		padding: 0.45rem 0.85rem;
		font: inherit;
		font-size: 0.86rem;
		font-weight: 600;
		cursor: pointer;
	}

	button.plain {
		background: none;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
	}

	button.warn {
		background: none;
		color: var(--text);
		border: 1px solid var(--accent);
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.plain-link {
		color: var(--accent);
		font-size: 0.86rem;
		font-weight: 600;
	}

	.themes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 0.6rem;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 0.9rem 0.5rem 0.7rem;
		background: var(--bg-surface);
		color: var(--text-secondary);
		border: 2px solid var(--border-color);
		border-radius: 0.7rem;
		align-self: stretch;
		font-weight: 500;
	}

	.theme-card.selected {
		border-color: var(--card-accent);
		color: var(--text);
	}

	.theme-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.theme-name {
		font-size: 0.78rem;
	}

	.theme-swatch {
		width: 26px;
		height: 4px;
		border-radius: 2px;
	}

	.pill-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.pill-label {
		font-size: 0.82rem;
		color: var(--text-secondary);
	}

	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.pill {
		background: var(--bg-surface);
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
		border-radius: 1.2rem;
		padding: 0.25rem 0.7rem;
		font-size: 0.78rem;
		font-weight: 500;
	}

	.pill.active {
		border-color: var(--accent);
		color: var(--text);
	}

	.counts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.25rem;
		font-size: 0.85rem;
	}

	.counts div {
		display: flex;
		gap: 0.35rem;
		align-items: baseline;
	}

	.counts dt {
		color: var(--text-muted);
	}

	.counts dd {
		color: var(--text);
		font-weight: 600;
	}

	.names {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		font-size: 0.78rem;
		color: var(--text-secondary);
	}

	.names li {
		border: 1px solid var(--border-color);
		border-radius: 0.3rem;
		padding: 0.1rem 0.4rem;
	}

	.opened,
	.confirm,
	.ask {
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.confirm.final {
		border-color: var(--accent);
	}

	.line {
		border-left: 2px solid var(--border-color);
		padding-left: 0.75rem;
		color: var(--text);
		line-height: 1.55;
		overflow-wrap: anywhere;
	}

	.line[data-tone='done'] {
		border-left-color: var(--accent);
	}

	.line[data-tone='refused'] {
		border-left-color: var(--accent);
	}

	.told summary {
		font-size: 0.78rem;
		color: var(--text-muted);
		cursor: pointer;
	}

	.told ol {
		margin: 0.5rem 0 0 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.82rem;
		color: var(--text-secondary);
		line-height: 1.55;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.85em;
		color: var(--text);
	}

	.quiet {
		color: var(--text-muted);
	}

	.small {
		font-size: 0.8rem;
		line-height: 1.55;
	}
</style>
