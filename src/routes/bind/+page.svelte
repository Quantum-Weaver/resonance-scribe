<script lang="ts">
	// THE BIND — where a finished work leaves the studio, five ways.
	//
	// ONE LAW TRAVELS WITH ALL FIVE and it is the law of the desk at the other
	// end of this app: the text goes out exactly as it was typed. Nothing is
	// reflowed, nothing is normalised, no quote is curled, no trailing newline
	// is dropped. "Typos are fingerprints unless he says otherwise."
	//
	// THE ARITHMETIC IS NOT IN THIS FILE. `$lib/bind.ts` builds the folder, the
	// front matter, the container and the import plan, and it is framework-free
	// so a proof can run it in node. This room reads the clock, asks the hand,
	// and shows what the waters said.
	//
	// THE DISK IS REACHED THROUGH `$lib/host` AND NOWHERE ELSE. No plugin is
	// imported here. Every path this room writes to was chosen by a hand in a
	// dialog, and `writeNew` refuses an occupied one before a byte moves.
	//
	// EVERY `told` LINE IS SHOWN. The waters say out loud what they derived and
	// what was absent — a surname taken from a by-line, a short title cut from a
	// title, a manuscript with no cover art, a rights block nobody declared, a
	// key this base has no column for. None of it is swallowed. The told lines
	// are drawn as a plain ordered list in the water's own order and do NOT pass
	// through the-panti: this room offers no way to sort or narrow them, and
	// re-ordering a water's account of itself is not a courtesy.
	//
	// NOTHING HERE ANIMATES, so `prefers-reduced-motion` is honoured by
	// construction as well as by `app.css`.

	import { onMount } from 'svelte';
	import { version as APP_VERSION } from '../../../package.json';

	import {
		createAppearance,
		createArc,
		createCharacter,
		createEra,
		createPart,
		createWork,
		updateWork
	} from '$lib/base';
	import {
		SCENE_BREAK,
		chapterFileName,
		envelopeOf,
		folderName,
		frontOf,
		manuscriptFolderOf,
		manuscriptOf,
		pathIn,
		readingToImport,
		slug,
		snapshotFolder,
		snapshotName,
		zipStore
	} from '$lib/bind';
	import type { ImportPlan, MadeFolder } from '$lib/bind';
	import { PAGE_DEFAULT, bind, isRefusal, typeset } from '$lib/binder';
	import type { Manuscript, PagePlan, Rights } from '$lib/binder';
	import { deliver, openFrom } from '$lib/envelope';
	import { appDataFolder, chooseFolder, makeFolder, occupied, saveAs, scribeHost, writeNew } from '$lib/host';
	import { isRefusal as isSettingRefusal, pandulipi } from '$lib/pandulipi';
	import { GRANT_ORDER, HOUSE_SPLIT, draw, render } from '$lib/sphragis';
	import type { GrantName, Sphragis } from '$lib/sphragis';
	import { studioStore } from '$lib/stores/studio.svelte';
	import { workStore } from '$lib/stores/work.svelte';

	type Breaks = 'keep' | 'fold';

	/** What a way out answers: one plain line, and every told line under it. */
	interface Said {
		tone: 'done' | 'refused' | 'declined';
		line: string;
		told: string[];
		names?: string[];
	}

	const work = $derived(workStore.work);
	const parts = $derived(studioStore.parts);

	// ── the shared options ─────────────────────────────────────────────────

	let lineBreaks = $state<Breaks>('keep');
	let author = $state('');
	let keepAuthor = $state(false);
	let year = $state('');
	let touchedAuthor = $state(false);

	// The by-line is the author's, and it fills this box until a hand types
	// over it. `touchedAuthor` is what keeps a prefill from stamping on an
	// edit when the store refreshes.
	$effect(() => {
		const w = workStore.work;
		if (w && !touchedAuthor) author = w.byline ?? '';
	});

	const authorGiven = $derived(author.trim() !== '');
	const bylineDiffers = $derived(!!work && authorGiven && author !== (work.byline ?? ''));

	// ── the rights drawer ──────────────────────────────────────────────────

	let drawerOpen = $state(false);
	let holder = $state('');
	let touchedHolder = $state(false);
	let permitWords = $state<Record<GrantName, string>>({
		'artist-to-platform': '',
		'platform-to-listener': '',
		'artist-to-buyer': ''
	});
	let splitArtist = $state(HOUSE_SPLIT.artist);
	let splitPlatform = $state(HOUSE_SPLIT.platform);
	let drawn = $state<Sphragis | null>(null);

	$effect(() => {
		if (!touchedHolder && authorGiven) holder = author;
	});

	const rendered = $derived(drawn ? render(drawn) : null);

	/** Free words, one grant at a time. The-sphragis keeps `permits` OPEN by
	 *  KP's ⚛ reserved stroke, so nothing here offers a closed list. Commas and
	 *  line breaks both separate; blanks are dropped. */
	const wordsOf = (s: string): string[] =>
		s
			.split(/[,\n]/)
			.map((w) => w.trim())
			.filter((w) => w !== '');

	function drawLicence() {
		const w = work;
		if (!w) return;
		const permits: Partial<Record<GrantName, string[]>> = {};
		for (const name of GRANT_ORDER) permits[name] = wordsOf(permitWords[name]);
		drawn = draw({
			ergon: { id: w.id, name: w.title, kind: w.kind },
			holder: holder.trim() === '' ? author.trim() : holder.trim(),
			permits,
			split: { artist: splitArtist, platform: splitPlatform }
		});
	}

	function setLicenceAside() {
		drawn = null;
	}

	/** The-binder's `Rights` block, keyed to the-sphragis' own shape and read
	 *  AS KEYS — holder · grants[].name · permits · revocable · exclusive ·
	 *  split — with the lawyer gate carried in as the notice, so it is printed
	 *  into the book and not only shown on this screen. */
	const rightsNow = (): Rights | null => {
		if (!drawn || !rendered) return null;
		// The-sphragis lets a realm's own keys ride on `split` through an index
		// signature; the-binder's rights page prints SHARES, which are numbers.
		// Every numeric share crosses, whatever it is called — a key that is not
		// a number was never a share and has no line on a rights page.
		const split: Record<string, number> = {};
		for (const [party, share] of Object.entries(drawn.split)) {
			if (typeof share === 'number') split[party] = share;
		}
		return {
			holder: drawn.holder,
			grants: drawn.grants.map((g) => ({
				name: g.name,
				permits: g.permits.slice(),
				revocable: g.revocable,
				exclusive: g.exclusive
			})),
			split,
			notice: rendered.gate
		};
	};

	// ── the standard-manuscript options ────────────────────────────────────

	let paper = $state<'us-letter' | 'a4'>('us-letter');
	let emphasis = $state<'italic' | 'underline'>('italic');
	let surname = $state('');
	let shortTitle = $state('');
	let contact = $state('');

	const contactLines = (): string[] =>
		contact.split('\n').filter((l, i, all) => !(l.trim() === '' && i === all.length - 1));

	// ── the page plan ──────────────────────────────────────────────────────

	let pageSize = $state(PAGE_DEFAULT.size);
	let marginTop = $state(PAGE_DEFAULT.marginTop);
	let marginBottom = $state(PAGE_DEFAULT.marginBottom);
	let marginInner = $state(PAGE_DEFAULT.marginInner);
	let marginOuter = $state(PAGE_DEFAULT.marginOuter);
	let runningHeads = $state(PAGE_DEFAULT.runningHeads);
	let pageNumbers = $state(PAGE_DEFAULT.pageNumbers);
	let printFontSize = $state(PAGE_DEFAULT.fontSize);

	const pagePlan = (): PagePlan => ({
		size: pageSize,
		marginTop,
		marginBottom,
		marginInner,
		marginOuter,
		runningHeads,
		pageNumbers,
		fontSize: printFontSize
	});

	// ── what each way out last said ────────────────────────────────────────

	let busy = $state<string | null>(null);
	let folderSaid = $state<Said | null>(null);
	let epubSaid = $state<Said | null>(null);
	let printSaid = $state<Said | null>(null);
	let setSaid = $state<Said | null>(null);
	let sealSaid = $state<Said | null>(null);
	let openSaid = $state<Said | null>(null);
	let importSaid = $state<Said | null>(null);
	let opened = $state<{ name: string; plan: ImportPlan } | null>(null);
	let submission = $state<{ words: number; rounded: number; head: string } | null>(null);

	// ── the pieces every way out needs ─────────────────────────────────────

	/** The by-line, kept on the work when the hand asked for that. One write,
	 *  through `updateWork`, and the rail is told so the title bar agrees. */
	async function keepBylineIfAsked(): Promise<void> {
		const w = work;
		if (!w || !keepAuthor || !bylineDiffers) return;
		const saved = await updateWork(w.id, w.kind, w.title, author.trim(), w.note);
		workStore.refresh(saved);
	}

	const folderNow = (): MadeFolder | null => {
		const w = work;
		if (!w) return null;
		return manuscriptFolderOf(w, parts, author.trim(), {
			surname: surname.trim() === '' ? null : surname.trim(),
			shortTitle: shortTitle.trim() === '' ? null : shortTitle.trim(),
			contact: contactLines(),
			language: 'en'
		});
	};

	/** THE ROOM READS THE CLOCK. The-binder refuses a blank `dcterms:modified`
	 *  rather than guessing one, and it is right to: a stamped guess is a lie in
	 *  a book's own metadata. So the clock is read HERE, once per act. */
	const manuscriptNow = (made: MadeFolder): Manuscript | null => {
		const w = work;
		if (!w) return null;
		return manuscriptOf(
			made,
			frontOf(w, {
				author: author.trim(),
				modified: new Date().toISOString(),
				year: year.trim() === '' ? null : year.trim(),
				rights: rightsNow(),
				language: 'en'
			})
		);
	};

	const said = (tone: Said['tone'], line: string, told: string[] = [], names?: string[]): Said => ({
		tone,
		line,
		told,
		names
	});

	// ── 1 · a manuscript folder ────────────────────────────────────────────

	async function writeFolder() {
		const w = work;
		if (!w || !authorGiven) return;
		busy = 'folder';
		folderSaid = null;
		try {
			await keepBylineIfAsked();
			const made = folderNow();
			if (!made) return;

			const chose = await chooseFolder('Where should the manuscript folder go?');
			if (chose.path === null) {
				folderSaid = said(
					chose.why ? 'refused' : 'declined',
					chose.why ?? 'No folder was chosen, and nothing was written.'
				);
				return;
			}

			const dir = pathIn(chose.path, folderName(w));
			const bookAt = pathIn(dir, 'book.json');
			const paths = [dir, bookAt, ...made.chapters.map((c) => pathIn(dir, c.name))];

			// THE WHOLE EXPORT REFUSES BEFORE A BYTE MOVES. Every path is asked
			// about first, so a folder is never half-written and no standing file
			// is ever replaced.
			const taken = await occupied(paths);
			if (taken.length > 0) {
				folderSaid = said(
					'refused',
					`Something already stands at ${taken.length} of these ${paths.length} paths, so nothing was written at all — this studio never overwrites. Move or rename what is there, or choose another folder.`,
					made.told,
					taken
				);
				return;
			}

			const madeDir = await makeFolder(dir);
			if (!madeDir.written) {
				folderSaid = said('refused', madeDir.why ?? 'The folder could not be made.', made.told);
				return;
			}

			const written: string[] = [];
			const book = await writeNew(bookAt, JSON.stringify(made.book, null, 2) + '\n');
			if (!book.written) {
				folderSaid = said('refused', book.why ?? 'book.json could not be written.', made.told);
				return;
			}
			written.push('book.json');

			for (const c of made.chapters) {
				const wrote = await writeNew(pathIn(dir, c.name), c.markdown);
				if (!wrote.written) {
					folderSaid = said(
						'refused',
						`${wrote.why ?? 'A chapter could not be written.'} ${written.length} file(s) had already landed in ${dir} and were left exactly as they are.`,
						made.told,
						written
					);
					return;
				}
				written.push(c.name);
			}

			folderSaid = said(
				'done',
				`${written.length} files written to ${dir}.`,
				made.told,
				written
			);
		} finally {
			busy = null;
		}
	}

	// ── 2 · EPUB 3 ─────────────────────────────────────────────────────────

	async function bindEpub() {
		const w = work;
		if (!w || !authorGiven) return;
		busy = 'epub';
		epubSaid = null;
		try {
			await keepBylineIfAsked();
			const made = folderNow();
			if (!made) return;
			const ms = manuscriptNow(made);
			if (!ms) return;

			const book = bind(ms, { lineBreaks });
			if (isRefusal(book)) {
				epubSaid = said('refused', book.refused, made.told);
				return;
			}

			const bytes = zipStore(book.files);
			const chose = await saveAs(slug(w.title) + '.epub', [
				{ name: 'EPUB', extensions: ['epub'] }
			]);
			if (chose.path === null) {
				epubSaid = said(
					chose.why ? 'refused' : 'declined',
					chose.why ?? 'No destination was chosen, and nothing was written.',
					[...made.told, ...book.told]
				);
				return;
			}
			const wrote = await writeNew(chose.path, bytes);
			epubSaid = said(
				wrote.written ? 'done' : 'refused',
				wrote.written
					? `${bytes.length.toLocaleString()} bytes written to ${chose.path} — ${book.files.length} files in the container, every one of them stored uncompressed.`
					: (wrote.why ?? 'Nothing was written.'),
				[...made.told, ...book.told]
			);
		} finally {
			busy = null;
		}
	}

	// ── 3 · paged HTML ─────────────────────────────────────────────────────

	async function typesetPrint() {
		const w = work;
		if (!w || !authorGiven) return;
		busy = 'print';
		printSaid = null;
		try {
			await keepBylineIfAsked();
			const made = folderNow();
			if (!made) return;
			const ms = manuscriptNow(made);
			if (!ms) return;

			// `typeset` hands back a string, so its told lines come out through the
			// endpaper and nowhere else. They are collected rather than dropped.
			const told: string[] = [...made.told];
			const html = typeset(ms, { lineBreaks, page: pagePlan() }, (line) => told.push(line));
			if (isRefusal(html)) {
				printSaid = said('refused', html.refused, told);
				return;
			}

			const chose = await saveAs(slug(w.title) + '-print.html', [
				{ name: 'HTML', extensions: ['html'] }
			]);
			if (chose.path === null) {
				printSaid = said(
					chose.why ? 'refused' : 'declined',
					chose.why ?? 'No destination was chosen, and nothing was written.',
					told
				);
				return;
			}
			const wrote = await writeNew(chose.path, html);
			printSaid = said(
				wrote.written ? 'done' : 'refused',
				wrote.written
					? `Written to ${chose.path}. It is print-READY, not printed — a PDF engine is not in this house, and whichever one you point at this file turns it into pages.`
					: (wrote.why ?? 'Nothing was written.'),
				told
			);
		} finally {
			busy = null;
		}
	}

	// ── 4 · standard manuscript format ─────────────────────────────────────

	async function setManuscript() {
		const w = work;
		if (!w || !authorGiven) return;
		busy = 'set';
		setSaid = null;
		submission = null;
		try {
			await keepBylineIfAsked();
			const made = folderNow();
			if (!made) return;

			const out = pandulipi(made, { paper, lineBreaks, emphasis });
			if (isSettingRefusal(out)) {
				setSaid = said('refused', out.refused, made.told);
				return;
			}
			submission = {
				words: out.wordCount,
				rounded: out.roundedWordCount,
				head: out.head
			};

			const chose = await saveAs(slug(w.title) + '-manuscript.html', [
				{ name: 'HTML', extensions: ['html'] }
			]);
			if (chose.path === null) {
				setSaid = said(
					chose.why ? 'refused' : 'declined',
					chose.why ?? 'No destination was chosen, and nothing was written.',
					[...made.told, ...out.told]
				);
				return;
			}
			const wrote = await writeNew(chose.path, out.html);
			setSaid = said(
				wrote.written ? 'done' : 'refused',
				wrote.written ? `Written to ${chose.path}.` : (wrote.why ?? 'Nothing was written.'),
				[...made.told, ...out.told]
			);
		} finally {
			busy = null;
		}
	}

	// ── 5 · the envelope ───────────────────────────────────────────────────

	async function sealWork() {
		const w = work;
		if (!w) return;
		busy = 'seal';
		sealSaid = null;
		try {
			const envelope = envelopeOf(
				w,
				{
					parts: studioStore.parts,
					eras: studioStore.eras,
					characters: studioStore.characters,
					arcs: studioStore.arcs,
					appearances: studioStore.appearances
				},
				{ appVersion: APP_VERSION, at: new Date().toISOString() }
			);

			const delivery = await deliver(scribeHost(), envelope);
			const told: string[] = [];
			told.push(
				`the counts are written on the OUTSIDE of the envelope: ${Object.entries(envelope.counts)
					.map(([k, n]) => `${n} ${k}`)
					.join(' · ')}. A hand can read them without opening it.`
			);

			if (!delivery.delivered) {
				sealSaid = said('declined', delivery.why, told);
				return;
			}

			// A SNAPSHOT BESIDE THE BASE, and it never overwrites. `host.ts` has no
			// `readDir`, so the naming half cannot see what already stands; the
			// half that holds is `writeNew`, which refuses an occupied path. The
			// two meet here: each name that is refused is added to what this call
			// already knows and a new one is asked for.
			const home = await appDataFolder();
			if (home.path === null) {
				told.push(
					`the delivered file is yours; a snapshot copy could not be kept beside the base — ${home.why ?? 'this platform did not name an app data directory.'}`
				);
			} else {
				const dir = snapshotFolder(home.path);
				const dirMade = await makeFolder(dir);
				if (!dirMade.written) {
					told.push(`no snapshot copy was kept — ${dirMade.why ?? 'the snapshot folder could not be made.'}`);
				} else {
					const at = Date.now();
					const tried: string[] = [];
					let kept: string | null = null;
					let why: string | null = null;
					for (let n = 0; n < 5 && kept === null; n += 1) {
						const name = snapshotName(w.id, at, tried);
						tried.push(name);
						const wrote = await writeNew(pathIn(dir, name), JSON.stringify(envelope));
						if (wrote.written) kept = name;
						else why = wrote.why;
					}
					told.push(
						kept === null
							? `no snapshot copy was kept — ${why ?? 'every name tried was already taken.'} Nothing standing was touched.`
							: `a snapshot copy was kept at ${pathIn(dir, kept)}. Nothing there is ever overwritten; a name already taken is refused and a new one asked for.`
					);
				}
			}

			sealSaid = said('done', `Delivered to ${delivery.destination}.`, told);
		} finally {
			busy = null;
		}
	}

	async function openWork() {
		busy = 'open';
		openSaid = null;
		importSaid = null;
		opened = null;
		try {
			const opening = await openFrom(scribeHost(), 'resonance-scribe');
			if (!opening.opened) {
				// The-envelope's own refusal, word for word. This room adds no
				// second wording — two wordings for one refusal is how a hand
				// learns to distrust both.
				openSaid = said('refused', opening.why);
				return;
			}
			const plan = readingToImport(opening.reading);
			if (plan.refused !== null) {
				openSaid = said('refused', plan.refused);
				return;
			}
			opened = { name: opening.name, plan };
			openSaid = said(
				'done',
				`${opening.name} holds “${plan.title}”. Nothing has been created yet — the button below is what does that.`,
				plan.told
			);
		} finally {
			busy = null;
		}
	}

	/** AN IMPORT IS A NEW WORK. Every row is created through `$lib/base.ts`,
	 *  which is the only door to the base, and the BASE mints every id: the plan
	 *  speaks in array indices and carries no id from the file at all. */
	async function importAsNewWork() {
		const held = opened;
		if (!held || !held.plan.work) return;
		busy = 'import';
		importSaid = null;
		try {
			const p = held.plan;
			const made = await createWork(p.work!.kind, p.work!.title, p.work!.byline, p.work!.note);

			const partIds: string[] = [];
			for (const row of p.parts) {
				const parent = row.parentIndex === null ? null : (partIds[row.parentIndex] ?? null);
				const got = await createPart(made.id, parent, row.title, row.body);
				partIds.push(got.id);
			}
			const eraIds: string[] = [];
			for (const row of p.eras) eraIds.push((await createEra(made.id, row.name, row.note)).id);
			const charIds: string[] = [];
			for (const row of p.characters)
				charIds.push((await createCharacter(made.id, row.name, row.note, row.emoji)).id);
			const arcIds: string[] = [];
			for (const row of p.arcs)
				arcIds.push((await createArc(made.id, row.name, row.shape, row.note)).id);
			for (const row of p.appearances) {
				await createAppearance(made.id, {
					partId: row.partIndex === null ? null : (partIds[row.partIndex] ?? null),
					eraId: row.eraIndex === null ? null : (eraIds[row.eraIndex] ?? null),
					characterId: row.characterIndex === null ? null : (charIds[row.characterIndex] ?? null),
					arcId: row.arcIndex === null ? null : (arcIds[row.arcIndex] ?? null),
					note: row.note
				});
			}

			workStore.choose(made);
			await studioStore.load(made.id, true);
			opened = null;
			importSaid = said(
				'done',
				`“${made.title}” now stands on the shelf as a new work and is the chosen one. Everything that was here before it is untouched.`,
				p.told
			);
		} catch (e) {
			importSaid = said('refused', e instanceof Error ? e.message : String(e));
		} finally {
			busy = null;
		}
	}

	// ── the room's life ────────────────────────────────────────────────────

	onMount(() => {
		void (async () => {
			const w = await workStore.restore();
			if (w) await studioStore.load(w.id);
		})();
		year = String(new Date().getFullYear());
	});

	const chapterCount = $derived(parts.filter((p) => p.parent_id === null).length);
	const sceneCount = $derived(parts.filter((p) => p.parent_id !== null).length);
	const firstNames = $derived(
		parts
			.filter((p) => p.parent_id === null)
			.slice()
			.sort((a, b) => a.ord - b.ord)
			.slice(0, 3)
			.map((p, i) => chapterFileName(i + 1, p.title))
	);
</script>

<svelte:head><title>The bind — Resonance Scribe</title></svelte:head>

{#snippet says(s: Said | null)}
	{#if s}
		<p class="line" data-tone={s.tone} role="status">{s.line}</p>
		{#if s.names && s.names.length > 0}
			<ul class="names">
				{#each s.names as n (n)}<li>{n}</li>{/each}
			</ul>
		{/if}
		{#if s.told.length > 0}
			<details class="told" open>
				<summary>{s.told.length} thing{s.told.length === 1 ? '' : 's'} the waters said out loud</summary>
				<ol>
					{#each s.told as t, i (i)}<li>{t}</li>{/each}
				</ol>
			</details>
		{/if}
	{/if}
{/snippet}

{#if !work}
	<div class="doorway">
		<h1>The bind</h1>
		<p>
			No work is chosen yet, so there is nothing to send out. The shelf holds every work
			this device has, and one line on it begins a new one.
		</p>
		<p><a class="invite" href="/">Go to the shelf</a></p>
		<p class="quiet small">
			A <code>.scribe.json</code> saved from another sitting can be opened here too — but a
			work has to be chosen first, because opening one is how this room knows whose studio it
			is standing in.
		</p>
	</div>
{:else}
	<div class="bind">
		<header class="head">
			<h1>The bind</h1>
			<p class="lede">
				<strong>{work.title}</strong> — {chapterCount}
				{chapterCount === 1 ? 'chapter' : 'chapters'}, {sceneCount}
				{sceneCount === 1 ? 'scene' : 'scenes'}. Five ways out, and the same law on all of
				them: the text leaves exactly as it was typed.
			</p>
		</header>

		<!-- ── the shared options ──────────────────────────────────────── -->
		<section class="shared">
			<h2>What the first four ways all need</h2>

			<div class="fields">
				<label class="field">
					<span>Author</span>
					<input
						bind:value={author}
						oninput={() => (touchedAuthor = true)}
						placeholder="the name on the title page"
						autocomplete="off"
					/>
				</label>

				<label class="field short">
					<span>Year</span>
					<input bind:value={year} placeholder="blank is fine" autocomplete="off" />
				</label>
			</div>

			{#if !authorGiven}
				<p class="ask">
					The-binder and the-pandulipi both refuse a manuscript with no author, and they
					are right to — an editor needs a name on the page. This work carries no by-line,
					so type one above and the four ways below open.
				</p>
			{/if}

			{#if bylineDiffers}
				<label class="check">
					<input type="checkbox" bind:checked={keepAuthor} />
					<span>Keep “{author.trim()}” on the work as its by-line</span>
				</label>
			{/if}

			<fieldset class="breaks">
				<legend>Line breaks</legend>
				<label>
					<input type="radio" bind:group={lineBreaks} value="keep" />
					<span
						><strong>keep</strong> — every line break in the text becomes a line break on
						the page. The reading verse needs, and the-binder's own default.</span
					>
				</label>
				<label>
					<input type="radio" bind:group={lineBreaks} value="fold" />
					<span
						><strong>fold</strong> — the lines of a paragraph are joined by one space
						into flowing prose. The-pandulipi's own default, and the wrong one for a
						poem.</span
					>
				</label>
			</fieldset>

			<p class="quiet small">
				Chapters become one markdown file each — {#if firstNames.length > 0}{firstNames.join(
						', '
					)}{#if chapterCount > firstNames.length}, and {chapterCount - firstNames.length} more{/if}{:else}none
					yet{/if}. A chapter's own text comes first, then each of its scenes, separated by
				<code>{SCENE_BREAK}</code> on a line of its own — the one marker the-binder sets as a
				rule and the-pandulipi sets as a scene break. Scene titles stay in the studio: on a
				manuscript page a scene is a break, not a heading.
			</p>
		</section>

		<!-- ── the rights drawer ───────────────────────────────────────── -->
		<section class="rights">
			<h2>A licence, if you want one</h2>
			<button type="button" class="plain" onclick={() => (drawerOpen = !drawerOpen)}>
				{drawerOpen ? 'Close the licence drawer' : 'Draw a licence'}
			</button>
			<p class="quiet small">
				Undrawn, no rights page is bound at all, and the-binder says so in its own words
				rather than printing a licence nobody declared.
			</p>

			{#if drawerOpen}
				<div class="drawer">
					<label class="field">
						<span>Holder — who the copyright belongs to</span>
						<input
							bind:value={holder}
							oninput={() => (touchedHolder = true)}
							placeholder="a name"
							autocomplete="off"
						/>
					</label>

					{#each GRANT_ORDER as name (name)}
						<label class="field">
							<span>{name} — what it permits</span>
							<textarea
								bind:value={permitWords[name]}
								rows="2"
								placeholder="your own words, separated by commas or line breaks"
							></textarea>
						</label>
					{/each}
					<p class="quiet small">
						The permitted verbs are open words on purpose: the vocabulary is a stroke KP
						reserved, so nothing here offers a closed list to pick from.
					</p>

					<div class="fields">
						<label class="field short">
							<span>Artist's share</span>
							<input type="number" bind:value={splitArtist} min="0" max="100" />
						</label>
						<label class="field short">
							<span>Platform's share</span>
							<input type="number" bind:value={splitPlatform} min="0" max="100" />
						</label>
					</div>

					<div class="row">
						<button type="button" onclick={drawLicence} disabled={holder.trim() === '' && !authorGiven}>
							{drawn ? 'Draw it again' : 'Draw it'}
						</button>
						{#if drawn}
							<button type="button" class="plain" onclick={setLicenceAside}>
								Set it aside
							</button>
						{/if}
					</div>

					{#if drawn && rendered}
						<p class="quiet small">
							While this stands, the four ways above bind a rights page from it. The
							warning below is welded to the text and this app may not remove it.
						</p>
						<pre class="licence">{rendered.text}</pre>
						{#if drawn.flagged.length > 0}
							<details class="told" open>
								<summary>{drawn.flagged.length} thing{drawn.flagged.length === 1 ? '' : 's'} the licence flagged</summary>
								<ol>
									{#each drawn.flagged as f, i (i)}<li>{f}</li>{/each}
								</ol>
							</details>
						{/if}
					{/if}
				</div>
			{/if}
		</section>

		<!-- ── 1 · the folder ──────────────────────────────────────────── -->
		<section class="way">
			<h2>1 · A manuscript folder</h2>
			<p>
				The work written out in the-binder's own shape — a <code>book.json</code> and one
				markdown file per chapter — in a new folder named
				<code>{folderName(work)}</code> under whichever folder you choose. Nothing is ever
				written over: if anything already stands at any of those paths, the whole export
				refuses before a single byte moves.
			</p>
			<button type="button" onclick={writeFolder} disabled={!authorGiven || busy !== null}>
				{busy === 'folder' ? 'writing…' : 'Choose a folder and write it'}
			</button>
			{@render says(folderSaid)}
		</section>

		<!-- ── 2 · EPUB ────────────────────────────────────────────────── -->
		<section class="way">
			<h2>2 · EPUB 3</h2>
			<p>
				One <code>.epub</code>, bound by the-binder and packed here — every entry STORED,
				never compressed, with the container's timestamps pinned to 1980 so the same work
				binds to the same bytes forever. A store-only EPUB is a valid EPUB.
			</p>
			<button type="button" onclick={bindEpub} disabled={!authorGiven || busy !== null}>
				{busy === 'epub' ? 'binding…' : 'Bind an EPUB'}
			</button>
			{@render says(epubSaid)}
		</section>

		<!-- ── 3 · paged HTML ──────────────────────────────────────────── -->
		<section class="way">
			<h2>3 · Paged HTML, print-ready</h2>
			<p>
				One self-contained HTML carrying <code>@page</code> rules — trim size, mirrored
				inner and outer margins, running heads, page numbers. A PDF engine is not in this
				house, so this file is print-<em>ready</em> and not printed; the numbers below are
				the-binder's own defaults and every one of them is yours to change.
			</p>

			<div class="fields">
				<label class="field short"><span>Trim size</span><input bind:value={pageSize} /></label>
				<label class="field short"><span>Top</span><input bind:value={marginTop} /></label>
				<label class="field short"><span>Bottom</span><input bind:value={marginBottom} /></label>
				<label class="field short"><span>Inner</span><input bind:value={marginInner} /></label>
				<label class="field short"><span>Outer</span><input bind:value={marginOuter} /></label>
				<label class="field short"><span>Type size</span><input bind:value={printFontSize} /></label>
			</div>
			<div class="row">
				<label class="check">
					<input type="checkbox" bind:checked={runningHeads} /><span>Running heads</span>
				</label>
				<label class="check">
					<input type="checkbox" bind:checked={pageNumbers} /><span>Page numbers</span>
				</label>
			</div>

			<button type="button" onclick={typesetPrint} disabled={!authorGiven || busy !== null}>
				{busy === 'print' ? 'typesetting…' : 'Typeset paged HTML'}
			</button>
			{@render says(printSaid)}
		</section>

		<!-- ── 4 · standard manuscript format ──────────────────────────── -->
		<section class="way">
			<h2>4 · Standard manuscript format</h2>
			<p>
				What an editor expects: twelve-point monospace, double-spaced, one-inch margins, the
				surname-and-short-title running head with the page number, the word count on the
				title page, each chapter a third of the way down a fresh page. Leave the surname and
				short title blank and the-pandulipi derives them and says exactly what it did.
			</p>

			<div class="fields">
				<label class="field">
					<span>Surname for the running head</span>
					<input bind:value={surname} placeholder="derived from the author if blank" autocomplete="off" />
				</label>
				<label class="field">
					<span>Short title for the running head</span>
					<input bind:value={shortTitle} placeholder="derived from the title if blank" autocomplete="off" />
				</label>
				<label class="field short">
					<span>Paper</span>
					<select bind:value={paper}>
						<option value="us-letter">US Letter</option>
						<option value="a4">A4</option>
					</select>
				</label>
				<label class="field short">
					<span>Emphasis</span>
					<select bind:value={emphasis}>
						<option value="italic">italic</option>
						<option value="underline">underline</option>
					</select>
				</label>
			</div>

			<label class="field">
				<span>Contact block — one line per line, set verbatim, in this order</span>
				<textarea bind:value={contact} rows="4" placeholder="nothing is looked up and nothing is invented"></textarea>
			</label>

			<button type="button" onclick={setManuscript} disabled={!authorGiven || busy !== null}>
				{busy === 'set' ? 'setting…' : 'Set a standard manuscript'}
			</button>

			{#if submission}
				<p class="counted">
					<strong>{submission.words.toLocaleString()}</strong> words exactly · the title page
					carries <strong>{submission.rounded.toLocaleString()}</strong> · running head
					<code>{submission.head}</code>
				</p>
			{/if}
			{@render says(setSaid)}
		</section>

		<!-- ── 5 · the envelope ────────────────────────────────────────── -->
		<section class="way">
			<h2>5 · The whole work, as a <code>.scribe.json</code></h2>
			<p>
				One versioned envelope with the counts written on the outside, so you can see at a
				glance that the file holds what this studio shows. It is the work, its parts, its
				eras, its cast, its arcs and every appearance — nothing summarised.
			</p>
			<p class="quiet small">
				There is no autosave slot here, and there does not need to be: the base on this
				device is this studio's autosave, and the desk has already written every keystroke
				into it. This is for carrying a work somewhere else.
			</p>

			<div class="row">
				<button type="button" onclick={sealWork} disabled={busy !== null}>
					{busy === 'seal' ? 'sealing…' : 'Save as .scribe.json'}
				</button>
				<button type="button" class="plain" onclick={openWork} disabled={busy !== null}>
					{busy === 'open' ? 'opening…' : 'Open a .scribe.json'}
				</button>
			</div>

			{@render says(sealSaid)}
			{@render says(openSaid)}

			{#if opened}
				<div class="opened">
					<h3>What {opened.name} holds</h3>
					<dl>
						<div><dt>Title</dt><dd>{opened.plan.title}</dd></div>
						{#each Object.entries(opened.plan.counts) as [what, n] (what)}
							<div><dt>{what}, on the outside</dt><dd>{n}</dd></div>
						{/each}
						<div><dt>parts to create</dt><dd>{opened.plan.parts.length}</dd></div>
						<div><dt>eras to create</dt><dd>{opened.plan.eras.length}</dd></div>
						<div><dt>characters to create</dt><dd>{opened.plan.characters.length}</dd></div>
						<div><dt>arcs to create</dt><dd>{opened.plan.arcs.length}</dd></div>
						<div><dt>appearances to create</dt><dd>{opened.plan.appearances.length}</dd></div>
					</dl>
					<button type="button" onclick={importAsNewWork} disabled={busy !== null}>
						{busy === 'import' ? 'creating…' : 'Import as a new work'}
					</button>
					<p class="quiet small">
						It becomes a NEW work. Nothing standing on the shelf is merged into, changed
						or removed, and every id is minted fresh by the base — the ids in the file
						are used to re-hang the rows on each other and are then set down.
					</p>
				</div>
			{/if}

			{@render says(importSaid)}
		</section>
	</div>
{/if}

<style>
	.bind {
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

	.shared,
	.rights,
	.way {
		border-top: 1px solid var(--border-color);
		padding-top: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.head {
		display: flex;
		flex-direction: column;
	}

	.fields {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		flex: 1 1 14rem;
	}

	.field.short {
		flex: 0 1 8.5rem;
	}

	.field span {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.check {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.breaks {
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.7rem 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.breaks legend {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
		padding: 0 0.3rem;
	}

	.breaks label {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.breaks strong {
		color: var(--text);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.ask {
		border-left: 2px solid var(--accent);
		padding-left: 0.75rem;
		color: var(--text);
	}

	.drawer {
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.licence {
		background: var(--bg-surface);
		border: 1px solid var(--border-color);
		border-radius: 0.45rem;
		padding: 0.8rem 0.9rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.78rem;
		line-height: 1.55;
		color: var(--text-secondary);
		max-height: 24rem;
		overflow-y: auto;
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
		color: var(--text);
	}

	.names {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
	}

	.names li {
		border: 1px solid var(--border-color);
		border-radius: 0.3rem;
		padding: 0.1rem 0.4rem;
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

	.counted {
		color: var(--text);
	}

	.opened {
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.opened dl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.25rem;
		font-size: 0.82rem;
	}

	.opened dl div {
		display: flex;
		gap: 0.35rem;
		align-items: baseline;
	}

	.opened dt {
		color: var(--text-muted);
	}

	.opened dd {
		color: var(--text);
		font-weight: 600;
	}

	code {
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.85em;
		color: var(--text);
	}

	.doorway {
		max-width: 34rem;
		margin: 0 auto;
		padding: 3.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.invite {
		color: var(--accent);
		font-weight: 600;
	}

	.quiet {
		color: var(--text-muted);
	}

	.small {
		font-size: 0.8rem;
		line-height: 1.55;
	}

	input,
	select,
	textarea {
		background: var(--bg-surface);
		color: var(--text);
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		padding: 0.45rem 0.55rem;
		font: inherit;
		width: 100%;
		min-width: 0;
	}

	textarea {
		font-family: ui-monospace, SFMono-Regular, 'Cascadia Mono', Menlo, monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		resize: vertical;
	}

	.check input,
	.breaks input {
		width: auto;
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

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
</style>
