// THE BIBLE-TO-SCRIBE IMPORTER — the Atógáil's structure into two
// `.scribe.json` envelopes the bind room opens.
//
//   node tools/atogail-import.mjs                       — dry: prints what it would write
//   node tools/atogail-import.mjs --write --out <dir>   — writes the two envelopes
//   node tools/atogail-import.mjs --bible <path>        — another copy of the book
//
// DRY IS THE DEFAULT and `--write` is the only road to a byte. `--out` is
// required with `--write`: this never picks a folder on an author's behalf.
// Nothing is overwritten — a file that already stands is refused by name.
//
// Reads the bible and never writes to it. Structure only crosses: titles,
// spans, acts, ore addresses and the names the bible bolds on its beats.
// Every body written is empty.
//
// The reading is `src/lib/atogail.ts` and the seal is `src/lib/bind.ts`, both
// imported as themselves. Node strips the type annotations; the one thing it
// does not know is SvelteKit's `$lib` alias, taught here through
// `module.registerHooks` and nowhere else. No new dependency.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');

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

const { bookRows, chaptersOf, episodesOf, readDoors, seriesRows } = await import(
	pathToFileURL(join(repo, 'src', 'lib', 'atogail.ts')).href
);
const { envelopeOf } = await import(pathToFileURL(join(repo, 'src', 'lib', 'bind.ts')).href);

// The bible, a sibling repo's read-only ground.
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

const flag = (name) => process.argv.indexOf(name) !== -1;
const value = (name, fallback) => {
	const at = process.argv.indexOf(name);
	return at !== -1 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
};

const write = flag('--write');
const bible = resolve(value('--bible', BIBLE));
const out = value('--out', null);

if (!existsSync(bible)) {
	console.log(`The bible does not stand at ${bible.replace(/\\/g, '/')} — nothing was read.`);
	process.exit(1);
}
if (write && !out) {
	console.log('--write needs --out <dir>: this never picks a folder for you. Nothing was written.');
	process.exit(1);
}

const doors = readDoors(readFileSync(bible, 'utf8'));
const stamp = { at: Date.now() };
const version = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).version;

const book = bookRows(doors, stamp);
const series = seriesRows(doors, stamp);

console.log('── the bible, as read ──');
console.log(`      ${bible.replace(/\\/g, '/')}`);
for (const line of doors.told) console.log(`      told: ${line}`);
console.log('');

console.log(
	`── DOOR THREE — THE BOOK · ${doors.divisions.length} divisions · ${chaptersOf(doors).length} chapters ──`
);
for (const d of doors.divisions) {
	console.log(`  ${d.name} — act ${d.act} · ${d.span} · ${d.chapters.length} chapters`);
	for (const c of d.chapters) console.log(`      ${String(c.ord).padStart(2)} · ${c.title} · ${c.span} · ${c.ore}`);
}
console.log('');

console.log(
	`── DOOR ONE — THE SERIES · ${doors.seasons.length} seasons · ${episodesOf(doors).length} episodes ──`
);
for (const s of doors.seasons) {
	console.log(`  ${s.name} — acts ${s.acts} · ${s.span} · ${s.episodes.length} episodes`);
	for (const e of s.episodes) {
		console.log(`      ${e.code} · ${e.title} · ${e.span} · act ${e.act} · ${e.ore}`);
		if (e.beats.length > 0) console.log(`           beats · ${e.beats.join(' · ')}`);
	}
}
console.log('');

const doorsOut = [
	['atogail-book.scribe.json', book],
	['atogail-series.scribe.json', series]
];

console.log('── the rows ──');
for (const [name, door] of doorsOut) {
	const r = door.rows;
	console.log(
		`  ${name} — ${r.parts.length} parts · ${r.eras.length} eras · ${r.characters.length} characters · ${r.arcs.length} arcs · ${r.appearances.length} appearances`
	);
}
console.log('');

if (!write) {
	console.log('DRY — nothing was written. Add --write --out <dir> to land these two files.');
	process.exit(0);
}

const dir = resolve(out);
mkdirSync(dir, { recursive: true });
let refused = 0;
for (const [name, door] of doorsOut) {
	const path = join(dir, name);
	if (existsSync(path)) {
		console.log(`REFUSED ${path.replace(/\\/g, '/')} — a file already stands there; nothing was overwritten.`);
		refused += 1;
		continue;
	}
	const envelope = envelopeOf(door.work, door.rows, { appVersion: version, at: new Date(stamp.at).toISOString() });
	writeFileSync(path, JSON.stringify(envelope, null, 2) + '\n', 'utf8');
	console.log(`WROTE   ${path.replace(/\\/g, '/')}`);
}
console.log('');
console.log('Open each in the bind room: it comes in as a NEW work and merges with nothing.');
process.exit(refused > 0 ? 1 : 0);
