// PROOF — THE BIND ROOM. Movement S3 of THE AUTHOR'S STUDIO, 2026-09-02.
//
//   node .journals/proofs/2026-09-02-the-bind/bind.mjs
//
// from the repo root. Prints one TRUE or FALSE per claim and exits non-zero on
// any FALSE.
//
// IT RUNS THE REAL FILES. `src/lib/bind.ts` and the four mirrors are imported
// here as themselves — no twin, no copy, no rewrite. Node 24 strips the type
// annotations; the ONE thing it does not know is SvelteKit's `$lib` alias, so
// this file teaches it that single mapping through `module.registerHooks` and
// nothing else. No `tsx`, no new dependency, no `npm install` — the plan
// forbids all three and the runtime already does the job.
//
// WHAT IT CANNOT PROVE, said plainly rather than left to be discovered:
//   · NO DIALOG IS OPENED AND NO BYTE IS WRITTEN. Every function in
//     `src/lib/host.ts` is a Tauri plugin call and there is no Tauri here. The
//     claims about `host.ts` read its TEXT — they prove that the imports are
//     where the law says they are, not that a save dialog returns a path.
//   · The fs SCOPE a dialog grants on a chosen folder is a running app's
//     answer. Whether `mkdir` and `writeFile` are allowed inside a directory a
//     hand picked in `open({ directory: true })` cannot be read from here.
//   · WHETHER THE EPUB OPENS IN A READER. The container is parsed back by a
//     reader written below — signatures, methods, CRCs, the central directory,
//     the end record — and the-binder's own proofs stand behind the XHTML. No
//     EPUB conformance checker stands on this machine and none is claimed.
//   · CHILD-BUILDS step 8: the window has never been opened by a lamp. That is
//     KP's own hands.

import { createHash } from 'node:crypto';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
const AWEN = 'C:/_superposition/resonance-awen/tools';

// THE ONE THING NODE IS TAUGHT: `$lib` is `src/lib`. SvelteKit's own alias,
// declared in `.svelte-kit/tsconfig.json`; nothing else is patched, nothing is
// transformed, and every file below is read from disk exactly as it stands.
registerHooks({
	resolve(specifier, context, next) {
		if (specifier.startsWith('$lib/')) {
			const base = join(repo, 'src', 'lib', specifier.slice('$lib/'.length));
			for (const candidate of [base + '.ts', join(base, 'index.ts')]) {
				if (existsSync(candidate)) {
					return { url: pathToFileURL(candidate).href, shortCircuit: true };
				}
			}
		}
		return next(specifier, context);
	}
});

const {
	SCENE_BREAK,
	chapterFileName,
	decodeWorkId,
	encodeWorkId,
	envelopeOf,
	firstHeading,
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
} = await import('../../../src/lib/bind.ts');

const binder = await import('../../../src/lib/binder/index.ts');
const pandulipiWater = await import('../../../src/lib/pandulipi/index.ts');
const envelope = await import('../../../src/lib/envelope/index.ts');
const sphragis = await import('../../../src/lib/sphragis/index.ts');

let failed = false;
const claim = (name, ok) => {
	console.log(`${ok ? 'TRUE ' : 'FALSE'} — ${name}`);
	if (!ok) failed = true;
};

const read = (...p) => readFileSync(join(repo, ...p), 'utf8');
const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// ── THE FIXTURE ──────────────────────────────────────────────────────────
//
// One work, two chapters. The first has its own text AND two scenes, so the
// scene break is exercised twice in one file. The bodies carry on purpose:
// a run of three spaces, a trailing newline, an em dash and the sentence the
// whole studio is built around. If any of those changed on the way out, the
// slice claims below would go FALSE.

const WORK = {
	id: 'w-old-1',
	kind: 'book',
	title: 'The Pier',
	byline: 'Wren Halloway',
	note: 'a fixture, not a book',
	created_at: 1,
	updated_at: 2
};

const part = (id, over) => ({
	id,
	work_id: WORK.id,
	parent_id: null,
	ord: 0,
	title: '',
	body: '',
	words: 0,
	created_at: 1,
	updated_at: 2,
	...over
});

// Deliberately out of `ord` order in the array, so sorting has to do the work.
const PARTS = [
	part('pt-old-c2', { parent_id: null, ord: 1, title: 'Salt', body: 'Salt on the rail — typos are fingerprints.' }),
	part('pt-old-s2', { parent_id: 'pt-old-c1', ord: 1, title: 'Evening', body: 'Nobody   saw  it   go.\n' }),
	part('pt-old-c1', { parent_id: null, ord: 0, title: 'The pier', body: 'The tide came in.' }),
	part('pt-old-s1', { parent_id: 'pt-old-c1', ord: 0, title: 'Morning', body: 'It went out again.' })
];

const ERAS = [
	{ id: 'er-old-b', work_id: WORK.id, ord: 1, name: 'After', note: null },
	{ id: 'er-old-a', work_id: WORK.id, ord: 0, name: 'Before', note: 'the tide' }
];
const CHARACTERS = [{ id: 'ch-old-1', work_id: WORK.id, name: 'Wren', note: null, emoji: '🐦' }];
const ARCS = [{ id: 'ar-old-1', work_id: WORK.id, name: 'The turning', shape: 'turning', note: null }];
const APPEARANCES = [
	{ id: 'ap-old-1', work_id: WORK.id, part_id: 'pt-old-c1', era_id: 'er-old-a', character_id: null, arc_id: null, note: null },
	{ id: 'ap-old-2', work_id: WORK.id, part_id: 'pt-old-s1', era_id: null, character_id: 'ch-old-1', arc_id: null, note: null },
	{ id: 'ap-old-3', work_id: WORK.id, part_id: 'pt-old-c2', era_id: null, character_id: null, arc_id: 'ar-old-1', note: 'the hinge' },
	{ id: 'ap-old-4', work_id: WORK.id, part_id: 'pt-old-c2', era_id: 'er-old-b', character_id: null, arc_id: null, note: null }
];

const OLD_IDS = [
	WORK.id,
	...PARTS.map((p) => p.id),
	...ERAS.map((e) => e.id),
	...CHARACTERS.map((c) => c.id),
	...ARCS.map((a) => a.id),
	...APPEARANCES.map((a) => a.id)
];

const AUTHOR = 'Wren Halloway';
const MADE = manuscriptFolderOf(WORK, PARTS, AUTHOR, { language: 'en' });

console.log('── the manuscript folder, and the author’s text inside it ──');

{
	claim(
		`two chapters become two files, in ord: ${MADE.chapters.map((c) => c.name).join(' · ')}`,
		MADE.chapters.length === 2 &&
			MADE.chapters[0].name === '01-the-pier.md' &&
			MADE.chapters[1].name === '02-salt.md'
	);

	const byName = new Map(MADE.chapters.map((c) => [c.name, c.markdown]));

	// THE EDITORIAL LAW, AS ARITHMETIC. `placed` carries the byte offsets, so
	// the claim is a slice equality and not a promise.
	let allSliced = true;
	let inOrder = true;
	let lastFile = null;
	let lastEnd = -1;
	for (const p of MADE.placed) {
		const body = PARTS.find((x) => x.id === p.partId).body;
		const cut = byName.get(p.file).slice(p.at, p.end);
		if (cut !== body) allSliced = false;
		if (p.file === lastFile && p.at < lastEnd) inOrder = false;
		lastFile = p.file;
		lastEnd = p.end;
	}
	claim(
		`every part body is a BYTE-EXACT SLICE of the file it landed in — ${MADE.placed.length} of ${PARTS.length} parts placed, each checked at its own offsets`,
		allSliced && MADE.placed.length === PARTS.length
	);
	claim('and the bodies land in order — no offset runs backwards inside a file', inOrder);

	// The exact bodies, spelled out: the trailing newline and the run of three
	// spaces are the two an "improving" formatter would take first.
	const evening = MADE.placed.find((p) => p.partId === 'pt-old-s2');
	claim(
		'a trailing newline survives the crossing — the body ends "go.\\n" and so does the slice',
		byName.get(evening.file).slice(evening.at, evening.end) === 'Nobody   saw  it   go.\n'
	);
	claim(
		'a run of three spaces survives it too — nothing collapses whitespace',
		byName.get(evening.file).slice(evening.at, evening.end).includes('Nobody   saw  it   go.')
	);

	claim(
		'the first line of each chapter file is its own `# title`',
		MADE.chapters[0].markdown.split('\n')[0] === '# The pier' &&
			MADE.chapters[1].markdown.split('\n')[0] === '# Salt'
	);
	claim(
		'and both waters read that first line back as the chapter’s title',
		firstHeading(MADE.chapters[0].markdown) === 'The pier' &&
			firstHeading(MADE.chapters[1].markdown) === 'Salt'
	);

	const breaks = (MADE.chapters[0].markdown.match(/\n\*\*\*\n/g) ?? []).length;
	claim(
		`the chapter with two scenes carries two scene-break lines and the chapter with none carries none (got ${breaks})`,
		breaks === 2 && !MADE.chapters[1].markdown.includes(SCENE_BREAK)
	);

	claim(
		'`chapterFileName` pads to two digits and slugs deterministically',
		chapterFileName(1, 'The pier') === '01-the-pier.md' &&
			chapterFileName(12, 'Salt & Ash') === '12-salt-ash.md' &&
			chapterFileName(3, '   ') === '03-untitled.md' &&
			chapterFileName(7, '') === '07-untitled.md'
	);
	claim(
		'at two digits, plain name order and natural order agree — and past 99 the field widens, which is why it is a parameter',
		['01-a.md', '02-a.md', '10-a.md'].slice().sort().join() === ['01-a.md', '02-a.md', '10-a.md'].join() &&
			chapterFileName(100, 'a', 3) === '100-a.md' &&
			['099-a.md', '100-a.md'].slice().sort().join() === ['099-a.md', '100-a.md'].join()
	);
	claim(
		'`slug` and `folderName` never hand back an empty name',
		slug('———') === 'untitled' && folderName({ ...WORK, title: '!!!' }) === 'untitled'
	);
	claim(
		'`pathIn` joins with one forward slash however the folder ended',
		pathIn('C:/a/b', 'c.md') === 'C:/a/b/c.md' &&
			pathIn('C:/a/b/', 'c.md') === 'C:/a/b/c.md' &&
			pathIn('C:\\a\\b\\', 'c.md') === 'C:\\a\\b/c.md'
	);
}

console.log('');
console.log('── the scene break, in BOTH waters, over a two-scene chapter ──');

{
	const chapterOne = MADE.chapters[0].markdown;

	// THE-BINDER: `***` on a line of its own is its RULE, and a rule is <hr/>.
	// Not a heading, not italics, not a list.
	const imposed = binder.impose(chapterOne, 'keep');
	const rules = (imposed.xhtml.match(/<hr\/>/g) ?? []).length;
	claim(
		`the-binder sets "${SCENE_BREAK}" as a BREAK — two scene breaks became two <hr/> and nothing else (got ${rules})`,
		rules === 2 && !imposed.xhtml.includes('<em>') && !imposed.xhtml.includes('<ul>')
	);

	let inkExact = true;
	for (const k of imposed.ink) if (chapterOne.slice(k.at, k.end) !== k.text) inkExact = false;
	claim(
		`and it loses no character — every one of its ${imposed.ink.length} runs is a byte-exact slice of the chapter`,
		inkExact && imposed.ink.length > 0
	);

	const covered = new Array(chapterOne.length).fill(false);
	for (const k of imposed.ink) for (let i = k.at; i < k.end; i += 1) covered[i] = true;
	let onlyMarkup = true;
	for (let i = 0; i < chapterOne.length; i += 1) {
		if (!covered[i] && binder.MARKUP_ALPHABET.indexOf(chapterOne.charAt(i)) === -1) onlyMarkup = false;
	}
	claim(
		'every character the-binder did NOT set is one of its own MARKUP_ALPHABET — a dropped word would show up in the gap',
		onlyMarkup
	);

	// THE-PANDULIPI: the same line is its SCENE_LINE, and a scene break on the
	// page. One marker, a break in both waters.
	const set = pandulipiWater.pandulipi(MADE, { paper: 'us-letter', lineBreaks: 'fold' });
	claim('the-pandulipi sets the folder rather than refusing it', !pandulipiWater.isRefusal(set));

	const sceneBreaks = (set.html.match(/class="scene-break"/g) ?? []).length;
	claim(
		`the-pandulipi sets "${SCENE_BREAK}" as a SCENE BREAK — two of them on the page (got ${sceneBreaks})`,
		sceneBreaks === 2
	);

	let runsExact = true;
	for (const r of set.runs) {
		const source = MADE.chapters.find((c) => c.name === r.from).markdown;
		if (source.slice(r.at, r.end) !== r.text) runsExact = false;
	}
	claim(
		`and it loses no character either — every one of its ${set.runs.length} runs is a byte-exact slice of the chapter it came from (the gap rule)`,
		runsExact && set.runs.length > 0
	);

	let gapsAreMarkup = true;
	for (const chapter of MADE.chapters) {
		const seen = new Array(chapter.markdown.length).fill(false);
		for (const r of set.runs) {
			if (r.from !== chapter.name) continue;
			for (let i = r.at; i < r.end; i += 1) seen[i] = true;
		}
		for (let i = 0; i < chapter.markdown.length; i += 1) {
			if (!seen[i] && pandulipiWater.MARKUP_MARKS.indexOf(chapter.markdown.charAt(i)) === -1) {
				gapsAreMarkup = false;
			}
		}
	}
	claim(
		'every character the-pandulipi did NOT set is one of its own MARKUP_MARKS — the same visible-loss rule, on the other side',
		gapsAreMarkup
	);

	// THE HAND COUNT. Written out here rather than derived from the water, so
	// the two answers are independent:
	//   chapter one  "The pier" (2) + "The tide came in." (4)
	//                + "It went out again." (4) + "Nobody saw it go." (4) = 14
	//   chapter two  "Salt" (1) + "Salt on the rail — typos are fingerprints." (8) = 9
	const HAND = [
		'The pier',
		'The tide came in.',
		'It went out again.',
		'Nobody   saw  it   go.',
		'Salt',
		'Salt on the rail — typos are fingerprints.'
	]
		.join(' ')
		.split(/\s+/)
		.filter((w) => w !== '').length;
	claim(
		`the word count is the author’s own words and nothing else — a hand count says ${HAND}, the water says ${set.wordCount}`,
		set.wordCount === HAND && HAND === 23
	);
	claim(
		`the title page rounds to the nearest hundred: ${set.roundedWordCount}`,
		set.roundedWordCount === 0
	);
	claim(
		`the running head is derived and said out loud: "${set.head}"`,
		set.head === 'Halloway / Pier /' + ' page' || set.head.endsWith(' page')
	);
	claim(
		`the page count is never invented — \`pages\` is declared and absent`,
		set.pages === undefined
	);
	claim(`and every derivation is told — ${set.told.length} lines`, set.told.length > 0);
}

console.log('');
console.log('── the book, and the container ──');

const FRONT = frontOf(WORK, {
	author: AUTHOR,
	modified: '2026-09-02T00:00:00Z',
	year: '2026',
	rights: null,
	language: 'en'
});
const MS = manuscriptOf(MADE, FRONT);

{
	claim(
		`the identifier is STABLE and made from the work’s id, not its title: ${FRONT.identifier}`,
		FRONT.identifier === 'urn:resonance-scribe:' + WORK.id
	);
	claim(
		'the manuscript carries both chapters with their headings read back as titles',
		MS.chapters.length === 2 &&
			MS.chapters[0].title === 'The pier' &&
			MS.chapters[1].title === 'Salt' &&
			MS.chapters[0].text === MADE.chapters[0].markdown
	);

	const book = binder.bind(MS, { lineBreaks: 'keep' });
	claim('`bind` returns a Book, not a Refusal', !binder.isRefusal(book));
	claim(
		`and it told what it did — ${book.told.length} lines, including the absent cover and the absent rights block`,
		book.told.length > 0 &&
			book.told.some((t) => t.includes('cover')) &&
			book.told.some((t) => t.includes('rights'))
	);

	const zipped = zipStore(book.files);
	const again = zipStore(binder.bind(MS, { lineBreaks: 'keep' }).files);
	claim(
		`the container is byte-identical across two runs — ${zipped.length} bytes both times`,
		zipped.length === again.length && zipped.every((b, i) => b === again[i])
	);

	// ── a small ZIP reader, written here so the claim is a reading and not a
	//    restatement of the writer.
	const dv = new DataView(zipped.buffer, zipped.byteOffset, zipped.byteLength);
	const text = (from, len) => new TextDecoder().decode(zipped.subarray(from, from + len));

	let eocd = -1;
	for (let i = zipped.length - 22; i >= 0; i -= 1) {
		if (dv.getUint32(i, true) === 0x06054b50) {
			eocd = i;
			break;
		}
	}
	claim('the end-of-central-directory record is found', eocd >= 0);

	const total = dv.getUint16(eocd + 10, true);
	const cdSize = dv.getUint32(eocd + 12, true);
	const cdStart = dv.getUint32(eocd + 16, true);
	claim(
		`the central directory names every file and no more — ${total} entries, ${book.files.length} files`,
		total === book.files.length && cdStart + cdSize === eocd
	);

	const entries = [];
	let at = cdStart;
	let cdOk = true;
	for (let n = 0; n < total; n += 1) {
		if (dv.getUint32(at, true) !== 0x02014b50) {
			cdOk = false;
			break;
		}
		const method = dv.getUint16(at + 10, true);
		const crc = dv.getUint32(at + 16, true);
		const size = dv.getUint32(at + 24, true);
		const nameLen = dv.getUint16(at + 28, true);
		const extraLen = dv.getUint16(at + 30, true);
		const commentLen = dv.getUint16(at + 32, true);
		const offset = dv.getUint32(at + 42, true);
		entries.push({ name: text(at + 46, nameLen), method, crc, size, offset });
		at += 46 + nameLen + extraLen + commentLen;
	}
	claim('every central-directory header carries its own signature', cdOk && entries.length === total);

	let localOk = true;
	let allStored = true;
	let crcOk = true;
	for (const e of entries) {
		if (dv.getUint32(e.offset, true) !== 0x04034b50) localOk = false;
		const lMethod = dv.getUint16(e.offset + 8, true);
		const lNameLen = dv.getUint16(e.offset + 26, true);
		const lExtraLen = dv.getUint16(e.offset + 28, true);
		if (lMethod !== 0 || e.method !== 0) allStored = false;
		if (lExtraLen !== 0) localOk = false;
		const bodyAt = e.offset + 30 + lNameLen + lExtraLen;
		const body = Array.from(zipped.subarray(bodyAt, bodyAt + e.size));
		if (binder.crc32(body) !== e.crc) crcOk = false;
	}
	claim('every local file header carries its own signature and no extra field', localOk);
	claim(`every entry is STORED — method 0, all ${entries.length} of them, no deflate anywhere`, allStored);
	claim("every entry's CRC-32 equals the-binder's own `crc32` of the bytes that stand there", crcOk);

	const first = entries[0];
	const firstBodyAt = first.offset + 30 + dv.getUint16(first.offset + 26, true);
	claim(
		'the `mimetype` entry is FIRST, stored, and carries exactly `application/epub+zip` — the OCF’s own rule',
		first.offset === 0 &&
			first.name === 'mimetype' &&
			first.method === 0 &&
			text(firstBodyAt, first.size) === 'application/epub+zip'
	);

	const told = [];
	const printed = binder.typeset(MS, { lineBreaks: 'keep' }, (l) => told.push(l));
	claim(
		'`typeset` returns a string of paged HTML, not a Refusal',
		typeof printed === 'string' && printed.startsWith('<!DOCTYPE html>') && printed.includes('@page')
	);
	claim(
		`and it says what it did — ${told.length} told line(s), and it does not claim to have printed anything`,
		told.length > 0 && told.some((t) => t.includes('print-READY'))
	);

	// The rights page: drawn with the-sphragis, handed to the-binder AS KEYS.
	const licence = sphragis.draw({
		ergon: { id: WORK.id, name: WORK.title, kind: WORK.kind },
		holder: AUTHOR,
		permits: { 'artist-to-platform': ['carry', 'show'] },
		split: { ...sphragis.HOUSE_SPLIT }
	});
	const rendering = sphragis.render(licence);
	claim(
		'the lawyer gate rides inside the rendered text and there is no way to ask for it without the warning',
		rendering.text.includes(sphragis.LAWYER_GATE) && rendering.gate === sphragis.LAWYER_GATE
	);
	const withRights = binder.bind(
		manuscriptOf(
			MADE,
			frontOf(WORK, {
				author: AUTHOR,
				modified: '2026-09-02T00:00:00Z',
				rights: {
					holder: licence.holder,
					grants: licence.grants.map((g) => ({
						name: g.name,
						permits: g.permits.slice(),
						revocable: g.revocable,
						exclusive: g.exclusive
					})),
					split: { artist: licence.split.artist, platform: licence.split.platform },
					notice: rendering.gate
				}
			})
		),
		{ lineBreaks: 'keep' }
	);
	claim(
		'a drawn licence binds a rights page, and an undrawn one binds none — both told',
		!binder.isRefusal(withRights) &&
			withRights.files.some((f) => f.path.endsWith('rights.xhtml')) &&
			!book.files.some((f) => f.path.endsWith('rights.xhtml'))
	);
	claim(
		'and the gate is printed INTO the book, not only onto the screen',
		withRights.files.some((f) => (f.text ?? '').includes('not legal advice'))
	);
}

console.log('');
console.log('── the envelope, and the way back ──');

let PLAN = null;

{
	const env = envelopeOf(
		WORK,
		{ parts: PARTS, eras: ERAS, characters: CHARACTERS, arcs: ARCS, appearances: APPEARANCES },
		{ appVersion: '0.1.0', at: '2026-09-02T00:00:00.000Z' }
	);

	claim(
		`sealed under this app’s own name — app "${env.app}", envelope "${env.envelope}" v${env.envelopeVersion}`,
		env.app === 'resonance-scribe' && env.envelope === envelope.ENVELOPE
	);
	claim(
		`the counts are on the OUTSIDE and equal the lists — ${JSON.stringify(env.counts)}`,
		env.counts.parts === PARTS.length &&
			env.counts.eras === ERAS.length &&
			env.counts.characters === CHARACTERS.length &&
			env.counts.arcs === ARCS.length &&
			env.counts.appearances === APPEARANCES.length
	);
	claim(
		'the data inside wears the-board-charter’s shape — format, version, a heart with an id minted once and never derived from the name',
		env.data.format === 'scribe-work' &&
			env.data.scribeVersion === 1 &&
			env.data.work.id === WORK.id &&
			env.data.work.name === WORK.title &&
			env.data.work.savedAt === '2026-09-02T00:00:00.000Z'
	);

	const onDisk = JSON.parse(JSON.stringify(env));
	const reading = envelope.open(onDisk, 'resonance-scribe');
	claim('it reads back as an envelope after a round trip through JSON', reading.kind === 'envelope');

	let refusedForeign = null;
	try {
		envelope.open(onDisk, 'resonance-echoes');
	} catch (e) {
		refusedForeign = e.message;
	}
	claim(
		`another app’s reader is refused in one plain sentence: "${refusedForeign}"`,
		typeof refusedForeign === 'string' && refusedForeign.includes('resonance-scribe')
	);

	// UNKNOWN KEYS RIDE WHOLE. The-board-charter's first law, checked on the
	// road the file actually travels.
	const strange = envelope.seal(
		'resonance-scribe',
		'0.1.0',
		{ format: 'scribe-work', scribeVersion: 1, aKeyNobodyKnows: { deep: [1, 'two', null] } },
		{ parts: 0 }
	);
	const back = envelope.open(JSON.parse(JSON.stringify(strange)), 'resonance-scribe');
	claim(
		'a key this studio has never heard of rides seal → stringify → parse → open WHOLE',
		JSON.stringify(back.data.aKeyNobodyKnows) === JSON.stringify({ deep: [1, 'two', null] })
	);

	PLAN = readingToImport(reading);
	claim('and an opened envelope becomes a plan, not a refusal', PLAN.refused === null);
}

console.log('');
console.log('── the import: a NEW work, and not one id from the file ──');

{
	const p = PLAN;

	claim(
		`the plan names a new work by the file’s own title — "${p.title}"`,
		p.work !== null && p.work.title === 'The Pier' && p.title === 'The Pier'
	);
	claim(
		'`ord` is preserved as ORDER — chapters first in ord, then each chapter’s scenes in ord, which is the order the base appends in',
		p.parts.length === 4 &&
			p.parts[0].title === 'The pier' &&
			p.parts[1].title === 'Salt' &&
			p.parts[2].title === 'Morning' &&
			p.parts[3].title === 'Evening'
	);
	claim(
		'`parent_id` is re-mapped to an INDEX — both scenes point at the chapter they belong to, and neither chapter points at anything',
		p.parts[0].parentIndex === null &&
			p.parts[1].parentIndex === null &&
			p.parts[2].parentIndex === 0 &&
			p.parts[3].parentIndex === 0
	);
	claim(
		'the eras come back in ord too',
		p.eras.length === 2 && p.eras[0].name === 'Before' && p.eras[1].name === 'After'
	);
	claim(
		'all four hands of every appearance are re-mapped — a part, an era, a character and an arc, each to its own index',
		p.appearances.length === 4 &&
			p.appearances[0].partIndex === 0 &&
			p.appearances[0].eraIndex === 0 &&
			p.appearances[1].partIndex === 2 &&
			p.appearances[1].characterIndex === 0 &&
			p.appearances[2].partIndex === 1 &&
			p.appearances[2].arcIndex === 0 &&
			p.appearances[2].note === 'the hinge' &&
			p.appearances[3].partIndex === 1 &&
			p.appearances[3].eraIndex === 1
	);
	claim(
		'the bodies cross whole — the trailing newline and the three spaces are still there',
		p.parts[3].body === 'Nobody   saw  it   go.\n' &&
			p.parts[1].body === 'Salt on the rail — typos are fingerprints.'
	);

	// THE STRONG FORM: no id from the file appears ANYWHERE on the plan. The
	// plan speaks in array indices, so there is nothing for an old id to be.
	const asText = JSON.stringify(p);
	const leaked = OLD_IDS.filter((id) => asText.includes(id));
	claim(
		`not one of the file’s ${OLD_IDS.length} ids appears anywhere on the plan — the base mints every one${leaked.length ? ' [leaked: ' + leaked.join(' ') + ']' : ''}`,
		leaked.length === 0
	);
	claim(
		'and the plan carries no `id` key at all, at any depth',
		!/"id"\s*:/.test(asText)
	);

	// The tellings this studio owes a hand.
	claim(
		'the plan says out loud that this becomes a NEW work and merges into nothing',
		p.told.some((t) => t.includes('NEW work')) && p.told.some((t) => t.includes('minted fresh'))
	);

	// UNKNOWN KEYS ARE TOLD AND NOT STORED — the base has no column for one.
	const strangeReading = envelope.open(
		JSON.parse(
			JSON.stringify(
				envelope.seal(
					'resonance-scribe',
					'0.1.0',
					{
						format: 'scribe-work',
						scribeVersion: 1,
						work: { id: 'w-old-9', name: 'A stranger', savedAt: 'x' },
						kind: 'book',
						byline: null,
						note: null,
						colophon: 'a key this base has no column for',
						parts: [{ id: 'pt-old-9', parent_id: null, ord: 0, title: 'One', body: 'x', mood: 'blue' }],
						eras: [],
						characters: [],
						arcs: [],
						appearances: []
					},
					{ parts: 1 }
				)
			)
		),
		'resonance-scribe'
	);
	const strangePlan = readingToImport(strangeReading);
	const strangeText = JSON.stringify(strangePlan);
	claim(
		'an unknown key is NAMED in the telling — by its name, in plain words',
		strangePlan.told.some((t) => t.includes('colophon')) && strangePlan.told.some((t) => t.includes('mood'))
	);
	claim(
		'…and is NOT stored: it appears in no row of the plan, because this base has no column for it',
		!strangeText.includes('a key this base has no column for') && !strangeText.includes('blue')
	);
	claim(
		'a version newer than this studio reads is refused rather than upgraded silently',
		readingToImport({ kind: 'envelope', data: { format: 'scribe-work', scribeVersion: 99 }, counts: {}, envelope: {} })
			.refused !== null
	);
	claim(
		'a foreign format is refused in one plain sentence, and the file is not altered',
		readingToImport({ kind: 'envelope', data: { format: 'skapa-board' }, counts: {}, envelope: {} }).refused !== null
	);
	claim(
		'a legacy bare list is refused plainly rather than half-read',
		readingToImport({ kind: 'legacy', raw: [] }).refused !== null
	);
}

console.log('');
console.log('── the snapshot’s name ──');

{
	const at = Date.UTC(2026, 8, 2, 6, 45, 12);
	const seen = [];
	for (let i = 0; i < 10; i += 1) seen.push(snapshotName('w-old-1', at, seen));
	claim(
		`ten names in one second, and no two the same — ${seen[0]} … ${seen[9]}`,
		new Set(seen).size === 10 && seen[0] === 'w-old-1.2026-09-02T064512Z.scribe.json'
	);
	claim('every one of them wears this studio’s own suffix', seen.every((n) => n.endsWith('.scribe.json')));
	claim(
		'`.` and `..` are guarded — an id can never name a folder above itself',
		encodeWorkId('.') === '%2E' &&
			encodeWorkId('..') === '%2E%2E' &&
			!snapshotName('..', at, []).startsWith('..') &&
			!snapshotName('../../etc', at, []).includes('/')
	);
	claim(
		'the encoding is reversible — every id comes back exactly',
		['w-1', '..', '.', 'a/b', 'a b', 'ünïcode', '💠'].every((id) => decodeWorkId(encodeWorkId(id)) === id)
	);
	claim(
		`the snapshots live beside the base, in this app’s own data directory — ${snapshotFolder('C:/Users/x/AppData/Roaming/com.audhd.resonance-scribe')}`,
		snapshotFolder('C:/a/') === 'C:/a/.scribe/snapshots' && snapshotFolder('C:/a') === 'C:/a/.scribe/snapshots'
	);
}

console.log('');
console.log('── the two doors out of this window, and no third ──');

{
	const files = globSync('src/**/*.{svelte,ts,mjs}', { cwd: repo }).filter(
		(f) =>
			!/^src[\\/]lib[\\/](panti|scrolls|cosmic|cumdach|epagoge|sky|clavis|lok|merismos|signet|binder|pandulipi|envelope|sphragis)[\\/]/.test(
				f
			)
	);
	const mirrors = globSync(
		'src/lib/{binder,pandulipi,envelope,sphragis}/**/*.ts',
		{ cwd: repo }
	);

	// Module specifiers, not mentions: a water's own comments name the plugins
	// it deliberately does NOT import, and a substring search would call that a
	// violation. Only a quoted specifier after `from` or inside `import(` counts.
	const specifiers = (text) => {
		const out = [];
		for (const m of text.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) out.push(m[1]);
		for (const m of text.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1]);
		for (const m of text.matchAll(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1]);
		return out;
	};

	const invokers = [...files, ...mirrors].filter((f) => /\binvoke\(/.test(read(f)));
	claim(
		`\`invoke\` appears in exactly one file, and it is \`src/lib/base.ts\` — ${files.length + mirrors.length} files read`,
		invokers.length === 1 && invokers[0].replace(/\\/g, '/') === 'src/lib/base.ts'
	);

	const plugged = [...files, ...mirrors].filter((f) =>
		specifiers(read(f)).some((s) => s.startsWith('@tauri-apps/plugin-') || s === '@tauri-apps/api/path')
	);
	claim(
		`every \`@tauri-apps/plugin-*\` and \`@tauri-apps/api/path\` import stands in exactly one file, and it is \`src/lib/host.ts\` [searched: ${[...files, ...mirrors].length} files under src/] [found in: ${plugged.map((f) => f.replace(/\\/g, '/')).join(' ') || 'none'}]`,
		plugged.length === 1 && plugged[0].replace(/\\/g, '/') === 'src/lib/host.ts'
	);

	const core = [...files, ...mirrors].filter((f) =>
		specifiers(read(f)).some((s) => s === '@tauri-apps/api/core')
	);
	claim(
		`and \`@tauri-apps/api/core\` stands in exactly one file too, and it is \`src/lib/base.ts\` [found in: ${core.map((f) => f.replace(/\\/g, '/')).join(' ')}]`,
		core.length === 1 && core[0].replace(/\\/g, '/') === 'src/lib/base.ts'
	);

	const waters = mirrors.filter((f) =>
		specifiers(read(f)).some((s) => s.startsWith('@tauri-apps/'))
	);
	claim(
		`no mirror imports anything from \`@tauri-apps\` — the waters carry no Tauri dependency, which is why they could be mirrored at all [${mirrors.length} mirror files]`,
		waters.length === 0
	);

	// What `host.ts` actually IMPORTS, not what its comments mention — a file
	// whose whole point is naming what it will not reach for says those words
	// out loud, and a substring search would call that a violation.
	const host = read('src', 'lib', 'host.ts');
	const bound = (text, from) => {
		const m = new RegExp(
			'import\\s*\\{([^}]*)\\}\\s*from\\s*[\'"]' + from.replace(/[/-]/g, '\\$&') + '[\'"]'
		).exec(text);
		return m
			? m[1]
					.split(',')
					.map((s) => s.trim())
					.filter((s) => s !== '')
					.sort()
			: [];
	};
	const fsDoors = bound(host, '@tauri-apps/plugin-fs');
	const dialogDoors = bound(host, '@tauri-apps/plugin-dialog');
	const pathDoors = bound(host, '@tauri-apps/api/path');
	claim(
		`the whole of what this window may ask a disk for: fs [${fsDoors.join(' ')}] · dialog [${dialogDoors.join(' ')}] · path [${pathDoors.join(' ')}] — no remove, no readDir, no listing of any kind`,
		fsDoors.join(' ') === 'exists mkdir readFile writeFile writeTextFile' &&
			dialogDoors.join(' ') === 'open save' &&
			pathDoors.join(' ') === 'appDataDir'
	);

	// EVERY VERB THE HOST IMPORTS MUST BE GRANTED BY NAME in the capability.
	// Tauri refuses a command at the ACL before any scope is consulted, and no
	// gate above (check · build · cargo check · this proof's other claims) can
	// see the ACL at all — which is how S3 went green with three of its five
	// ways unable to write. Found by the S3 verifier (2026-09-02):
	// `writeTextFile` invokes `plugin:fs|write_text_file`, a command that
	// `fs:allow-write-file` does not cover (it grants write_file · open · write);
	// the grant is `fs:allow-write-text-file`, its own line. The map below is
	// read against the plugin's own manifest (src-tauri/gen/schemas/acl-manifests.json
	// on a built tree); a new verb in host.ts must add its grant here AND there.
	const granted = JSON.parse(read('src-tauri', 'capabilities', 'default.json')).permissions;
	const grantOf = {
		exists: 'fs:allow-exists',
		mkdir: 'fs:allow-mkdir',
		readFile: 'fs:allow-read-file',
		writeFile: 'fs:allow-write-file',
		writeTextFile: 'fs:allow-write-text-file',
		open: 'dialog:allow-open',
		save: 'dialog:allow-save',
		appDataDir: 'core:default'
	};
	const verbs = [...fsDoors, ...dialogDoors, ...pathDoors];
	const ungranted = verbs.filter((v) => !granted.includes(grantOf[v]));
	claim(
		`every verb the host imports is granted by name in capabilities/default.json — ${verbs.map((v) => `${v}→${grantOf[v]}`).join(' · ')}` +
			(ungranted.length ? ` — UNGRANTED: ${ungranted.join(' ')}` : ''),
		verbs.every((v) => grantOf[v] !== undefined) && ungranted.length === 0
	);

	const writeNewBody = host.slice(
		host.indexOf('export async function writeNew'),
		host.indexOf('export async function makeFolder')
	);
	claim(
		'`writeNew` guards TWICE — it asks `exists` first so the refusal is a sentence with no byte moved, then writes with `createNew` so the platform closes the gap between the asking and the writing',
		/if \(await exists\(path\)\)/.test(writeNewBody) &&
			(writeNewBody.match(/createNew: true \}\)/g) ?? []).length === 2
	);

	const room = read('src', 'routes', 'bind', '+page.svelte');
	claim(
		'the bind room imports no plugin of its own — it reaches the disk through `$lib/host` and nowhere else',
		specifiers(room).every((s) => !s.startsWith('@tauri-apps')) && /\$lib\/host/.test(room)
	);

	const shelf = read('src', 'routes', '+page.svelte');
	const markup = shelf.slice(shelf.indexOf('</script>'), shelf.indexOf('<style>'));
	claim(
		'the shelf no longer calls the bind unbuilt, and links it as a room like the other three',
		!/not yet built/.test(shelf) &&
			!/not-yet/.test(shelf) &&
			/href=\{r\.href\}/.test(markup) &&
			(shelf.match(/href: '\//g) ?? []).length === 4
	);
}

console.log('');
console.log('── the mirrors, byte for byte ──');

{
	const pairs = [
		['the-binder/src/index.ts', `${AWEN}/the-binder/src/index.ts`, join(repo, 'src', 'lib', 'binder', 'index.ts')],
		['the-pandulipi/src/index.ts', `${AWEN}/the-pandulipi/src/index.ts`, join(repo, 'src', 'lib', 'pandulipi', 'index.ts')],
		['the-envelope/src/index.ts', `${AWEN}/the-envelope/src/index.ts`, join(repo, 'src', 'lib', 'envelope', 'index.ts')],
		['the-envelope/src/host-surface.ts', `${AWEN}/the-envelope/src/host-surface.ts`, join(repo, 'src', 'lib', 'envelope', 'host-surface.ts')],
		['the-envelope/src/hosts/tauri.ts', `${AWEN}/the-envelope/src/hosts/tauri.ts`, join(repo, 'src', 'lib', 'envelope', 'hosts', 'tauri.ts')],
		['the-sphragis/src/index.ts', `${AWEN}/the-sphragis/src/index.ts`, join(repo, 'src', 'lib', 'sphragis', 'index.ts')]
	];
	for (const [name, truth, mirror] of pairs) {
		const a = sha(truth);
		const b = sha(mirror);
		console.log(`      truth  ${a}  ${truth}`);
		console.log(`      mirror ${b}  ${mirror.replace(/\\/g, '/')}`);
		claim(`${name} — the mirror's SHA256 equals its truth's`, a === b);
	}
}

console.log('');
if (failed) {
	console.log('At least one claim is FALSE.');
	process.exit(1);
}
console.log('Every claim TRUE.');
