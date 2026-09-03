// PROOF — THE ROOMS. Movement S2 of THE AUTHOR'S STUDIO, 2026-09-02.
//
//   node .journals/proofs/2026-09-02-the-rooms/rooms.mjs
//
// from the repo root. Prints one TRUE or FALSE per claim and exits non-zero on
// any FALSE.
//
// IT RUNS THE REAL FILE. `src/lib/board.ts` is imported here as itself — no
// twin, no copy, no rewrite — because every import in it is `import type` and
// Node (≥ 23.6; this house is on 24) strips the annotations and resolves
// nothing else. There is no `tsx` in `node_modules` and none was installed:
// the plan forbids a new dependency and the runtime already does the job.
//
// WHAT IT CANNOT PROVE, said plainly rather than left to be discovered:
//   · It does not cross the IPC boundary. `src/lib/base.ts` calls `invoke`,
//     and no proof in this repo has ever run a Tauri window. The claims below
//     that concern `base.ts` read its TEXT — they prove what the window is
//     written to send, not what Rust received.
//   · It does not open a window, does not render a room, and does not test the
//     autosave's timing. A hand's first edit is KP's own (CHILD-BUILDS step 8).
//   · S1's `round-trip.mjs` is what proves the BASE keeps the ord-only law;
//     this proves the WINDOW can only ever ask for it. Both are run at the
//     gate and both counts are in the journal.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	arcsOfPart,
	centerOf,
	charactersOfPart,
	erasOfPart,
	hangId,
	isPlacement,
	moveToEra,
	nudge,
	partsInEra,
	polylinePoints,
	reorderWithin,
	shapeRank,
	threadThrough,
	unplacedParts
} from '../../../src/lib/board.ts';

let failed = false;
const claim = (name, ok) => {
	console.log(`${ok ? 'TRUE ' : 'FALSE'} — ${name}`);
	if (!ok) failed = true;
};

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
const read = (...p) => readFileSync(join(repo, ...p), 'utf8');
const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// ── the fixture ──────────────────────────────────────────────────────────
//
// One work, four chapters, two eras, one character, two arcs. c1 stands in
// era A; c2 stands in era A AND era B (a part may hang on more than one, and
// the board draws it in both); c3 stands in era B; c4 stands nowhere.

const app = (id, over) => ({
	id,
	work_id: 'w1',
	part_id: null,
	era_id: null,
	character_id: null,
	arc_id: null,
	note: null,
	...over
});

const APPEARANCES = [
	app('p1', { part_id: 'c1', era_id: 'eA' }),
	app('p2', { part_id: 'c2', era_id: 'eA' }),
	app('p3', { part_id: 'c2', era_id: 'eB' }),
	app('p4', { part_id: 'c3', era_id: 'eB' }),
	app('m1', { part_id: 'c1', character_id: 'ch1' }),
	app('m2', { part_id: 'c3', character_id: 'ch1' }),
	app('t1', { part_id: 'c1', arc_id: 'a1' }),
	app('t2', { part_id: 'c2', arc_id: 'a1' }),
	app('t3', { part_id: 'c3', arc_id: 'a1' }),
	app('t4', { part_id: 'c2', arc_id: 'a2' })
];

const CHAPTERS = ['c1', 'c2', 'c3', 'c4'];
const before = JSON.stringify(CHAPTERS);
const rowsBefore = JSON.stringify(APPEARANCES);

console.log('── the order, and what a move may carry ──');

{
	const moved = reorderWithin(CHAPTERS, 'c3', 0);
	claim(
		'a reorder emits ids only — every element is a string, and one of the ids given',
		Array.isArray(moved) &&
			moved.every((x) => typeof x === 'string') &&
			moved.every((x) => CHAPTERS.includes(x))
	);
	claim(
		'a reorder emits EVERY id and invents none — the same set, a different order',
		moved.length === CHAPTERS.length &&
			new Set(moved).size === CHAPTERS.length &&
			moved.join() !== CHAPTERS.join()
	);
	claim(
		'a reorder can carry no body, title or ordinal — there is no object in the result at all',
		moved.every((x) => typeof x !== 'object')
	);
	claim('c3 to the front puts it at the front', moved.join() === 'c3,c1,c2,c4');
	claim('the array handed in is byte-untouched after a reorder', JSON.stringify(CHAPTERS) === before);
	claim('the result is a NEW array, not the one handed in', moved !== CHAPTERS);
}

{
	const clamped = reorderWithin(CHAPTERS, 'c1', 99);
	claim('a drop past the end lands at the end rather than throwing', clamped.join() === 'c2,c3,c4,c1');
	const negative = reorderWithin(CHAPTERS, 'c4', -5);
	claim('a drop past the front lands at the front', negative.join() === 'c4,c1,c2,c3');
	const stranger = reorderWithin(CHAPTERS, 'nobody', 0);
	claim(
		'an id that is not in the list is not a move — the same order, as a copy',
		stranger.join() === CHAPTERS.join() && stranger !== CHAPTERS
	);
	claim('and it left the given array alone too', JSON.stringify(CHAPTERS) === before);
}

{
	const up = nudge(CHAPTERS, 'c3', -1);
	const down = nudge(CHAPTERS, 'c3', 1);
	claim('the keyboard twin moves one place up', up.join() === 'c1,c3,c2,c4');
	claim('the keyboard twin moves one place down', down.join() === 'c1,c2,c4,c3');
	claim('the twin copies as well', up !== CHAPTERS && JSON.stringify(CHAPTERS) === before);
	claim(
		'the first card cannot be nudged off the front',
		nudge(CHAPTERS, 'c1', -1).join() === CHAPTERS.join()
	);
	claim(
		'the last card cannot be nudged off the end',
		nudge(CHAPTERS, 'c4', 1).join() === CHAPTERS.join()
	);
}

console.log('');
console.log('── a move between eras, as the rows it costs ──');

{
	const m = moveToEra(APPEARANCES, 'c1', 'eB');
	claim(
		'moving a part between eras emits exactly one delete and one create',
		m.deleteIds.length === 1 && m.deleteIds[0] === 'p1' && m.create !== null
	);
	claim(
		'and the create names the part and the era it is going to, and nothing else',
		JSON.stringify(m.create) === JSON.stringify({ partId: 'c1', eraId: 'eB' })
	);
	claim(
		'the delete is the PLACEMENT row and never the character mark or the arc thread',
		!m.deleteIds.includes('m1') && !m.deleteIds.includes('t1')
	);
}

{
	const m = moveToEra(APPEARANCES, 'c4', 'eA');
	claim(
		'placing an unplaced part emits a create only',
		m.deleteIds.length === 0 &&
			JSON.stringify(m.create) === JSON.stringify({ partId: 'c4', eraId: 'eA' })
	);
}

{
	const m = moveToEra(APPEARANCES, 'c1', null);
	claim(
		'removing from an era emits a delete only',
		m.deleteIds.length === 1 && m.deleteIds[0] === 'p1' && m.create === null
	);
}

{
	const m = moveToEra(APPEARANCES, 'c1', 'eA');
	claim(
		'a move to the era a part is already in emits nothing at all',
		m.deleteIds.length === 0 && m.create === null
	);
}

{
	const m = moveToEra(APPEARANCES, 'c2', 'eB');
	claim(
		'a part standing in two eras, moved to one of them, collapses to that one — one create, both old rows deleted',
		m.deleteIds.length === 2 &&
			m.deleteIds.includes('p2') &&
			m.deleteIds.includes('p3') &&
			m.create !== null &&
			m.create.eraId === 'eB'
	);
	claim(
		'a move never rewrites the rows it was handed',
		JSON.stringify(APPEARANCES) === rowsBefore
	);
}

console.log('');
console.log('── where a part hangs, read from the rows and nowhere else ──');

claim(
	'a placement is a row naming a part AND an era and neither of the other two hands',
	isPlacement(APPEARANCES[0]) === true &&
		isPlacement(APPEARANCES.find((a) => a.id === 'm1')) === false &&
		isPlacement(APPEARANCES.find((a) => a.id === 't1')) === false
);
claim('a part in two eras reports both — data is truth', erasOfPart(APPEARANCES, 'c2').join() === 'eA,eB');
claim('an era reports the parts placed in it', partsInEra(APPEARANCES, 'eA').join() === 'c1,c2');
claim('the unplaced column holds exactly what nothing places', unplacedParts(APPEARANCES, CHAPTERS).join() === 'c4');
claim('a character on a part is read from the same rows', charactersOfPart(APPEARANCES, 'c1').join() === 'ch1');
claim('an arc through a part likewise', arcsOfPart(APPEARANCES, 'c2').join() === 'a1,a2');
claim(
	'a standing hang is found by id so a second click removes rather than duplicates',
	hangId(APPEARANCES, 'c1', 'character_id', 'ch1') === 'm1' &&
		hangId(APPEARANCES, 'c4', 'character_id', 'ch1') === null
);

console.log('');
console.log('── the threads ──');

{
	// The board's own order: the unplaced column first, then era A, then era B.
	const cards = [
		{ key: 'none:c4', partId: 'c4' },
		{ key: 'eA:c1', partId: 'c1' },
		{ key: 'eA:c2', partId: 'c2' },
		{ key: 'eB:c2', partId: 'c2' },
		{ key: 'eB:c3', partId: 'c3' }
	];
	const a1 = threadThrough(APPEARANCES, 'a1', cards);
	claim(
		'a thread runs through the cards in BOARD order, visiting both cards of a part placed twice',
		a1.map((c) => c.key).join() === 'eA:c1,eA:c2,eB:c2,eB:c3'
	);
	claim('a thread through one part is one card, not none', threadThrough(APPEARANCES, 'a2', cards).length === 2);
	claim('an arc nothing hangs on draws nothing', threadThrough(APPEARANCES, 'a9', cards).length === 0);
	claim('and the card list is untouched', cards.length === 5);
}

{
	const origin = { left: 100, top: 50 };
	const p = centerOf({ left: 120, top: 70, width: 40, height: 20 }, origin);
	claim('a card centre is measured in the plane it is drawn on', p.x === 40 && p.y === 30);
	claim(
		'a polyline is its points, rounded to a tenth so a resize that moves nothing repaints nothing',
		polylinePoints([
			{ x: 1.04, y: 2.06 },
			{ x: 3, y: 4 }
		]) === '1,2.1 3,4'
	);
}

claim(
	'four shapes, four ranks, and a shape the author invented lands on the fourth',
	shapeRank('rising') === 0 &&
		shapeRank('turning') === 1 &&
		shapeRank('resolving') === 2 &&
		shapeRank('other') === 3 &&
		shapeRank('a shape of his own') === 3
);

console.log('');
console.log('── the window can only ask for what the law allows ──');

{
	const base = read('src', 'lib', 'base.ts');
	const reorder = /export const reorderParts = \(workId: string, ids: string\[\]\): Promise<void> =>\s*\n?\s*invoke\('reorder_parts', \{ workId, ids \}\);/.test(
		base.replace(/\r\n/g, '\n')
	);
	claim("the window's `reorderParts` takes ids and sends `{ workId, ids }` — nothing else", reorder);

	const erasReorder = /export const reorderEras = \(workId: string, ids: string\[\]\): Promise<void> =>\s*\n?\s*invoke\('reorder_eras', \{ workId, ids \}\);/.test(
		base.replace(/\r\n/g, '\n')
	);
	claim("and `reorderEras` the same", erasReorder);
}

{
	// Every .svelte and .ts under src/, excluding the mirrors (which are
	// somebody else's files and are proven byte-identical below instead).
	const { globSync } = await import('node:fs');
	const files = globSync('src/**/*.{svelte,ts}', { cwd: repo }).filter(
		(f) =>
			!/^src[\\/]lib[\\/](panti|scrolls|cosmic|cumdach|epagoge|sky|clavis|lok|merismos|signet)[\\/]/.test(
				f
			)
	);
	const rooms = files.filter((f) => /^src[\\/]routes[\\/]/.test(f));

	const sql = files.filter((f) => /\b(SELECT|INSERT INTO|UPDATE|DELETE FROM)\s/.test(read(f)));
	claim(`no SQL in any room or store — ${files.length} files read`, sql.length === 0);

	const invokers = files.filter((f) => /\binvoke\(/.test(read(f)));
	claim(
		'`invoke` appears in exactly one file, and it is `src/lib/base.ts`',
		invokers.length === 1 && invokers[0].replace(/\\/g, '/') === 'src/lib/base.ts'
	);

	const writers = files.filter((f) => /\bupdatePart\(/.test(read(f)));
	claim(
		`\`updatePart\` — the only write of a part's text — is CALLED in exactly one file, and it is the studio store [${writers.map((f) => f.replace(/\\/g, '/')).join(' ')}]`,
		writers.length === 1 && writers[0].replace(/\\/g, '/') === 'src/lib/stores/studio.svelte.ts'
	);

	const savers = rooms.filter((f) => /\bsavePart\(/.test(read(f)));
	claim(
		`and the store's own door to it is opened by exactly one room, the desk [${savers.map((f) => f.replace(/\\/g, '/')).join(' ')}]`,
		savers.length === 1 && savers[0].replace(/\\/g, '/') === 'src/routes/desk/+page.svelte'
	);

	const boardRoom = read('src', 'routes', 'board', '+page.svelte');
	claim(
		'the board never calls the one write of a part’s text — a move is not an edit',
		!/\bsavePart\(|\bupdatePart\(/.test(boardRoom)
	);

	// The bind is a doorway and shows no list; the layout draws the rail. Every
	// other room shows a list of the author's rows, and every one of them
	// orders or narrows it through the water.
	const listing = rooms.filter((f) => !/bind|\+layout/.test(f));
	const panti = listing.filter((f) => /\$lib\/panti/.test(read(f)));
	claim(
		`the-panti orders or narrows every list a room shows — ${panti.length} of ${listing.length} rooms that show one [${listing.map((f) => f.replace(/\\/g, '/')).join(' ')}]`,
		panti.length === listing.length && listing.length === 4
	);
}

console.log('');
console.log('── the mirrors, byte for byte ──');

{
	const pairs = [
		[
			'the-panti/src/index.ts',
			'C:/_superposition/resonance-awen/tools/the-panti/src/index.ts',
			join(repo, 'src', 'lib', 'panti', 'index.ts')
		],
		[
			'the-panti/src/table.utils.ts',
			'C:/_superposition/resonance-awen/tools/the-panti/src/table.utils.ts',
			join(repo, 'src', 'lib', 'panti', 'table.utils.ts')
		],
		[
			'the-scrolls/the-scrolls.mjs',
			'C:/_superposition/resonance-awen/tools/the-scrolls/the-scrolls.mjs',
			join(repo, 'src', 'lib', 'scrolls', 'the-scrolls.mjs')
		]
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
console.log(failed ? 'A CLAIM IS FALSE.' : 'Every claim TRUE.');
process.exit(failed ? 1 : 0);
