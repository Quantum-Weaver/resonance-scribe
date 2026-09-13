// PROOF — THE BIBLE-TO-SCRIBE IMPORTER. 2026-09-13.
//
//   node .journals/proofs/2026-09-13-the-atogail-importer/importer.mjs
//
// from the repo root. Prints one TRUE or FALSE per claim and exits non-zero on
// any FALSE.
//
// IT RUNS THE REAL FILES. `src/lib/atogail.ts`, `src/lib/bind.ts` and
// `src/lib/envelope/index.ts` are imported here as themselves, and the real
// bible is read from the sibling repo. Node strips the type annotations; the
// one thing it does not know is SvelteKit's `$lib` alias, taught through
// `module.registerHooks` and nothing else. No new dependency.
//
// WHAT IT CANNOT PROVE, said plainly:
//   · NO TAURI RUNS HERE, so the two envelopes are never carried through the
//     bind room into the base. The import road is proven to the edge of
//     `readingToImport` — the rows the base would be asked to create — and
//     no further.
//   · It does not read KP's eye. Whether the bible's cut is the cut is theirs,
//     and this proves only that what the bible says is what crossed.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

let failed = false;
const claim = (name, ok) => {
	console.log(`${ok ? 'TRUE ' : 'FALSE'} — ${name}`);
	if (!ok) failed = true;
};

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');

// THE ONE THING NODE IS TAUGHT: `$lib` is `src/lib`.
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

const { ATOGAIL, beatNames, bookRows, chaptersOf, episodesOf, readDoors, seriesRows } =
	await import(pathToFileURL(join(repo, 'src', 'lib', 'atogail.ts')).href);
const { envelopeOf, readingToImport, SCRIBE_APP } = await import(
	pathToFileURL(join(repo, 'src', 'lib', 'bind.ts')).href
);
const { open } = await import(pathToFileURL(join(repo, 'src', 'lib', 'envelope', 'index.ts')).href);

// The bible, a sibling repo's read-only ground — the same address the tool uses.
const BIBLE = resolve(
	repo,
	'..',
	'resonance-chamber',
	'desk',
	'records',
	'the-atogail',
	'bible',
	'THE-THREE-DOORS.md'
);

console.log('── the bible ──');
claim(`the bible stands at ${BIBLE.replace(/\\/g, '/')}`, existsSync(BIBLE));
if (!existsSync(BIBLE)) {
	console.log('');
	console.log('A CLAIM IS FALSE.');
	process.exit(1);
}

const source = readFileSync(BIBLE, 'utf8');
const before = createHashOf(source);
const doors = readDoors(source);
claim('reading it told of no shape that did not match — ' + (doors.told.length === 0 ? 'nothing told' : doors.told.join(' ')), doors.told.length === 0);

console.log('');
console.log('── DOOR THREE — THE BOOK ──');

const chapters = chaptersOf(doors);
claim(`a prologue, nine parts and a coda — ${doors.divisions.length} divisions`, doors.divisions.length === 11);
claim(`${chapters.length} chapters`, chapters.length === 55);
claim(
	'the chapter numbers run 1 to 55 with no gap and no repeat',
	chapters.every((c, i) => c.ord === i + 1)
);
claim('every chapter carries a title', chapters.every((c) => c.title.trim() !== ''));
claim('every chapter carries a span', chapters.every((c) => c.span.trim() !== ''));
claim('every chapter carries an address to its ore', chapters.every((c) => c.ore.trim() !== ''));
claim(
	'every division carries a name, an act and a span',
	doors.divisions.every((d) => d.name.trim() !== '' && d.act.trim() !== '' && d.span.trim() !== '')
);
claim(
	`the divisions' chapter counts sum to 55 — ${doors.divisions.map((d) => d.chapters.length).join(' + ')}`,
	doors.divisions.reduce((n, d) => n + d.chapters.length, 0) === 55
);

console.log('');
console.log('── DOOR ONE — THE SERIES ──');

const episodes = episodesOf(doors);
claim(`six seasons and a coda — ${doors.seasons.length} seasons`, doors.seasons.length === 7);
claim(`${episodes.length} episodes`, episodes.length === 55);
claim('every episode carries a title', episodes.every((e) => e.title.trim() !== ''));
claim('every episode carries a span', episodes.every((e) => e.span.trim() !== ''));
claim('every episode names its act', episodes.every((e) => e.act.trim() !== ''));
claim('every episode carries an address to its ore', episodes.every((e) => e.ore.trim() !== ''));
claim(
	'every episode code is its own — no two rows share one',
	new Set(episodes.map((e) => e.code)).size === 55
);
claim(
	`the seasons' episode counts sum to 55 — ${doors.seasons.map((s) => s.episodes.length).join(' + ')}`,
	doors.seasons.reduce((n, s) => n + s.episodes.length, 0) === 55
);
claim(
	'every season carries a name, its acts and a span',
	doors.seasons.every((s) => s.name.trim() !== '' && s.acts.trim() !== '' && s.span.trim() !== '')
);

console.log('');
console.log('── STRUCTURE ONLY — not one line of the telling ──');

const allBeats = episodes.flatMap((e) => e.beats);
console.log(`      ${allBeats.length} beat names across ${episodes.filter((e) => e.beats.length > 0).length} episodes`);
claim('no beat name carries a quotation mark — a quoted line is ore, not a name', !allBeats.some((b) => /["“”]/.test(b)));
claim('no beat name runs past 80 characters', !allBeats.some((b) => b.length > 80));
claim(
	'the beat reader keeps only what the bible bolds at a beat head',
	JSON.stringify(beatNames('**one** — some telling **not a head** · **two**')) ===
		JSON.stringify(['one', 'two'])
);
claim(
	'the beat reader drops a bold run carrying a quotation mark',
	JSON.stringify(beatNames('**a name** · **"a quoted line"**')) === JSON.stringify(['a name'])
);
claim('the bible was not altered by the reading', createHashOf(readFileSync(BIBLE, 'utf8')) === before);

console.log('');
console.log('── THE ROWS THIS STUDIO EMITS ──');

const stamp = { at: 1757721600000 };
const book = bookRows(doors, stamp);
const series = seriesRows(doors, stamp);

for (const [door, parts, eras] of [
	['the book', book, 11],
	['the series', series, 7]
]) {
	const r = parts.rows;
	console.log(`      ${door} — ${r.parts.length} parts · ${r.eras.length} eras · ${r.appearances.length} appearances`);
	claim(`${door} emits 55 parts`, r.parts.length === 55);
	claim(`${door} emits ${eras} eras`, r.eras.length === eras);
	claim(`${door} names the work ${ATOGAIL}`, parts.work.title === ATOGAIL);
	claim(`${door} — every part carries a title`, r.parts.every((p) => p.title.trim() !== ''));
	claim(`${door} — every part's body is EMPTY; the words are the author's`, r.parts.every((p) => p.body === '' && p.words === 0));
	claim(`${door} — every part is a chapter, none a scene`, r.parts.every((p) => p.parent_id === null));
	claim(
		`${door} — every part hangs on exactly one era`,
		r.parts.every(
			(p) => r.appearances.filter((a) => a.part_id === p.id && a.era_id !== null).length === 1
		)
	);
	claim(
		`${door} — every part carries an address to its ore`,
		r.parts.every((p) =>
			r.appearances.some(
				(a) => a.part_id === p.id && typeof a.note === 'string' && a.note.startsWith('ore · ') && a.note.length > 'ore · '.length
			)
		)
	);
	claim(
		`${door} — every part carries the address it was read from in the bible`,
		r.parts.every((p) =>
			r.appearances.some(
				(a) => a.part_id === p.id && typeof a.note === 'string' && /^bible · THE-THREE-DOORS\.md:\d+$/.test(a.note)
			)
		)
	);
	claim(
		`${door} — every part carries a span`,
		r.parts.every((p) =>
			r.appearances.some(
				(a) => a.part_id === p.id && typeof a.note === 'string' && a.note.startsWith('span · ') && a.note.length > 'span · '.length
			)
		)
	);
	claim(`${door} — every appearance hangs on one of the four`, r.appearances.every((a) => a.part_id || a.era_id || a.character_id || a.arc_id));
	claim(`${door} — no character and no arc is invented`, r.characters.length === 0 && r.arcs.length === 0);
	claim(`${door} — every id is its own`, new Set([...r.parts, ...r.eras, ...r.appearances].map((x) => x.id)).size === r.parts.length + r.eras.length + r.appearances.length);
}

claim(
	'the same bible read twice gives byte-identical rows — no clock and no randomness inside the reading',
	JSON.stringify(bookRows(readDoors(source), stamp)) === JSON.stringify(book)
);

console.log('');
console.log('── THE ENVELOPE, THERE AND BACK ──');

for (const [door, made, eras] of [
	['the book', book, 11],
	['the series', series, 7]
]) {
	const sealed = envelopeOf(made.work, made.rows, { appVersion: '0.1.0', at: '2026-09-13T00:00:00.000Z' });
	const reopened = JSON.parse(JSON.stringify(sealed));
	const plan = readingToImport(open(reopened, SCRIBE_APP));
	console.log(`      ${door} — counts on the outside: ${JSON.stringify(sealed.counts)}`);
	claim(`${door} — the counts on the outside say 55 parts and ${eras} eras`, sealed.counts.parts === 55 && sealed.counts.eras === eras);
	claim(`${door} — the studio's own reader refuses nothing`, plan.refused === null);
	claim(`${door} — it plans 55 parts and ${eras} eras`, plan.parts.length === 55 && plan.eras.length === eras);
	claim(`${door} — it plans ${made.rows.appearances.length} appearances, every hand landing`, plan.appearances.length === made.rows.appearances.length);
	claim(`${door} — it names no key this studio has no column for`, !plan.told.some((t) => t.includes('no column for')));
	claim(`${door} — every planned part comes in with an empty body`, plan.parts.every((p) => p.body === ''));
}

console.log('');
console.log('── THE HAND: DRY BY DEFAULT ──');

const tool = join(repo, 'tools', 'atogail-import.mjs');
const text = readFileSync(tool, 'utf8');
claim('the tool stands at tools/atogail-import.mjs', existsSync(tool));
claim('it names no drive letter — every path is anchored to the repo', !/[A-Za-z]:[\\/]/.test(text));
claim('it writes bytes through exactly one call, and it is guarded', (text.match(/writeFileSync\(/g) ?? []).length === 1);

const sandbox = mkdtempSync(join(tmpdir(), 'atogail-proof-'));
try {
	const dry = spawnSync(process.execPath, [tool], { cwd: sandbox, encoding: 'utf8' });
	claim(`a run with no flags exits 0 — ${dry.status}`, dry.status === 0);
	claim('it says DRY and nothing was written', /DRY — nothing was written/.test(dry.stdout));
	claim('it prints 55 chapters and 55 episodes', /55 chapters ──/.test(dry.stdout) && /55 episodes ──/.test(dry.stdout));
	claim(`the folder it ran in is still empty — ${readdirSync(sandbox).length} files`, readdirSync(sandbox).length === 0);

	const asked = spawnSync(process.execPath, [tool, '--write'], { cwd: sandbox, encoding: 'utf8' });
	claim(`--write without --out refuses and writes nothing — ${readdirSync(sandbox).length} files`, asked.status === 1 && readdirSync(sandbox).length === 0);

	const out = join(sandbox, 'out');
	const wrote = spawnSync(process.execPath, [tool, '--write', '--out', out], { cwd: sandbox, encoding: 'utf8' });
	const landed = readdirSync(out).sort();
	console.log(`      landed: ${landed.join(' ')}`);
	claim(`--write --out lands the two envelopes — ${landed.join(' ')}`, wrote.status === 0 && landed.length === 2);

	const onDisk = JSON.parse(readFileSync(join(out, 'atogail-book.scribe.json'), 'utf8'));
	const fromDisk = readingToImport(open(onDisk, SCRIBE_APP));
	claim('the file on disk opens as this studio’s own and plans 55 parts', fromDisk.refused === null && fromDisk.parts.length === 55);

	const again = spawnSync(process.execPath, [tool, '--write', '--out', out], { cwd: sandbox, encoding: 'utf8' });
	claim('a second run overwrites nothing and says so', again.status === 1 && /REFUSED/.test(again.stdout) && readdirSync(out).length === 2);
} finally {
	rmSync(sandbox, { recursive: true, force: true });
}

function createHashOf(s) {
	let h = 0;
	for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	return `${h}:${s.length}`;
}

console.log('');
console.log(failed ? 'A CLAIM IS FALSE.' : 'Every claim TRUE.');
process.exit(failed ? 1 : 0);
