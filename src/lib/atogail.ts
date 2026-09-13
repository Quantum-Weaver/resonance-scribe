// THE BIBLE, READ AS STRUCTURE — the Atógáil's three-doors book into this
// studio's own rows.
//
// The bible (`../resonance-chamber/desk/records/the-atogail/bible/
// THE-THREE-DOORS.md`) is read-only ground and is never written by anything
// here. What crosses is STRUCTURE ONLY: a title, a span, an act, the address
// of the ore a row stands on, and the names the bible bolds on its beats.
// Every body this file emits is empty; a beat name carrying a quotation
// mark is dropped rather than carried.
//
// This file touches no disk and no clock: it takes the bible's text and the
// caller's stamp and returns rows. `tools/atogail-import.mjs` is the hand
// that reads the file and seals the envelope.

import type { WorkRows } from '$lib/bind';
import type { Appearance, Arc, Character, Era, Part, Work } from '$lib/types/types';

// ── WHAT THE BIBLE SAYS ──────────────────────────────────────────────────

/** One chapter row of a part's table: `| ch | title | span | ore |`. */
export interface BibleChapter {
	ord: number;
	title: string;
	span: string;
	ore: string;
	/** the line in THE-THREE-DOORS.md this row stands on, 1-based. */
	at: number;
}

/** A prologue, a numbered part or the coda, with its chapters. */
export interface BibleDivision {
	name: string;
	act: string;
	span: string;
	at: number;
	chapters: BibleChapter[];
}

/** One episode block: `### S1E1 · **PAST FULL**` and the fields under it. */
export interface BibleEpisode {
	code: string;
	title: string;
	span: string;
	act: string;
	ore: string;
	beats: string[];
	at: number;
}

/** A season of the series, or the coda season. */
export interface BibleSeason {
	name: string;
	acts: string;
	span: string;
	at: number;
	episodes: BibleEpisode[];
}

/** The two doors this studio has rows for. The film door is one through-line
 *  rather than a structure of parts, and is not read here. */
export interface Doors {
	divisions: BibleDivision[];
	seasons: BibleSeason[];
	/** every place the bible's shape did not match what was expected. */
	told: string[];
}

// ── THE READING ──────────────────────────────────────────────────────────

/** Markdown emphasis markers off a cell; the words themselves untouched. */
const plain = (s: string): string =>
	s
		.replace(/\*\*/g, '')
		.replace(/\*/g, '')
		.replace(/\s+/g, ' ')
		.trim();

/** The cells of one markdown table row, emphasis stripped. */
const cells = (line: string): string[] =>
	line
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((c) => plain(c));

/** A bold run is closed only when its markers pair up; a heading that wraps
 *  onto the next line is joined until they do. */
const balanced = (s: string): boolean => (s.match(/\*\*/g) ?? []).length % 2 === 0;

/** The body rows of the one table whose header line matches, bounded to that
 *  table so a row of the same shape elsewhere in the book cannot join it. */
function tableUnder(lines: string[], header: RegExp): string[][] {
	const at = lines.findIndex((l) => header.test(l));
	if (at === -1) return [];
	const out: string[][] = [];
	for (let i = at + 1; i < lines.length && lines[i].trim().startsWith('|'); i += 1) {
		if (/^\|[\s:-]+\|/.test(lines[i])) continue;
		out.push(cells(lines[i]));
	}
	return out;
}

/** The bible book these rows are read from. */
export const BIBLE_FILE = 'THE-THREE-DOORS.md';

/** Where in the bible a row stands — the address this studio keeps. */
const address = (line: number): string => `${BIBLE_FILE}:${line}`;

/** The ore references inside a block: `H1 §I`, `H10 §5 cat track`, in order
 *  of first appearance and never twice. */
function oreOf(block: string): string {
	const found: string[] = [];
	const re = /\bH(\d{1,2})\b((?:\s*§[^·()[\];,\n*—"“”→]+)*)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(block)) !== null) {
		const ref = plain(`H${m[1]}${m[2] ?? ''}`).replace(/[\s.;,]+$/, '');
		if (found.indexOf(ref) === -1) found.push(ref);
	}
	// A bare harvest file is dropped where the same file is also cited by
	// section: the narrower address already carries it.
	return found
		.filter((r) => !/^H\d{1,2}$/.test(r) || !found.some((o) => o.startsWith(r + ' §')))
		.join('; ');
}

/** The longest a beat name may be before it reads as telling rather than a
 *  name, and is dropped. */
const BEAT_NAME_MAX = 80;

/**
 * The names the bible bolds at the head of its beats.
 *
 * A beat name is a bold run that opens the beats block or follows the `·`
 * that separates one beat from the next. A run carrying a quotation mark is
 * ore quoted verbatim, not a name, and is dropped.
 */
export function beatNames(beats: string): string[] {
	const out: string[] = [];
	const re = /\*\*([^*]+?)\*\*/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(beats)) !== null) {
		const before = beats.slice(0, m.index).replace(/\s+$/, '');
		if (before !== '' && !before.endsWith('·')) continue;
		const name = m[1]
			.replace(/`/g, '')
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/[.,;:]+$/, '');
		if (name === '' || name.length > BEAT_NAME_MAX) continue;
		if (/["“”]/.test(name)) continue;
		if (out.indexOf(name) === -1) out.push(name);
	}
	return out;
}

/** DOOR THREE — the prologue, the nine parts and the coda, with their
 *  chapters. The part map's table carries each division's act and span; the
 *  table under each heading carries the chapters. */
function readBook(lines: string[], told: string[]): BibleDivision[] {
	const map = tableUnder(lines, /^\|\s*part\s*\|\s*act\s*\|/)
		.filter((c) => c.length >= 3)
		.map((c) => ({ act: c[1], span: c[2] }));

	const divisions: BibleDivision[] = [];
	for (let i = 0; i < lines.length; i += 1) {
		const head = /^## ((?:PROLOGUE|PART [A-Z]+|CODA) · .*?)(?: — \*Act ([^*]+)\*)?\s*$/.exec(
			lines[i]
		);
		if (!head) continue;
		const div: BibleDivision = {
			name: plain(head[1]),
			act: (head[2] ?? '').trim(),
			span: '',
			at: i + 1,
			chapters: []
		};
		for (let j = i + 1; j < lines.length && !/^#{1,2} /.test(lines[j]); j += 1) {
			const row = /^\|\s*(\d+)\s*\|/.exec(lines[j]);
			if (!row) continue;
			const c = cells(lines[j]);
			if (c.length < 4) continue;
			div.chapters.push({ ord: Number(row[1]), title: c[1], span: c[2], ore: c[3], at: j + 1 });
		}
		divisions.push(div);
	}

	if (map.length === divisions.length) {
		for (let i = 0; i < divisions.length; i += 1) {
			divisions[i].span = map[i].span;
			if (divisions[i].act === '') divisions[i].act = map[i].act;
		}
	} else {
		told.push(
			`the book's part map names ${map.length} divisions and ${divisions.length} stand under their own headings — the spans were left off rather than matched by guess.`
		);
	}
	return divisions;
}

/** DOOR ONE — six seasons and a coda season, with their episodes. */
function readSeries(lines: string[], told: string[]): BibleSeason[] {
	const map = tableUnder(lines, /^\|\s*season\s*\|\s*acts\s*\|/)
		.filter((c) => c.length >= 3)
		.map((c) => ({ acts: c[1], span: c[2] }));

	const seasons: BibleSeason[] = [];
	for (let i = 0; i < lines.length; i += 1) {
		if (!/^## (?:SEASON [A-Z]+|THE CODA SEASON) · /.test(lines[i])) continue;
		const name = plain(lines[i].replace(/^## /, '').replace(/ — \*[^*]+\*\s*$/, ''));
		const season: BibleSeason = { name, acts: '', span: '', at: i + 1, episodes: [] };

		for (let j = i + 1; j < lines.length && !/^#{1,2} /.test(lines[j]); j += 1) {
			const ep = /^### ((?:S\d+E\d+|CODA E\d+)) · (.*)$/.exec(lines[j]);
			if (!ep) continue;

			let title = ep[2];
			let k = j;
			while (!balanced(title) && k + 1 < lines.length) {
				k += 1;
				title += ' ' + lines[k];
			}

			const block: string[] = [];
			for (let n = k + 1; n < lines.length && !/^#{1,3} /.test(lines[n]); n += 1) {
				block.push(lines[n]);
			}
			const body = block.join('\n');

			const head = /(^|\n)(\*\*Span[^\n]*[\s\S]*?)(?=\n\*\*Beats)/.exec(body);
			const fields = head ? head[2] : '';
			const span = /\*\*Span[^*]*\*\*([\s\S]*?)\*\*Acts?\.\*\*/.exec(fields);
			const act = /\*\*Acts?\.\*\*([\s\S]*?)(?=\*\*|$)/.exec(fields);
			const beats = /\*\*Beats[^\n]*?\*\*([\s\S]*?)(?=\n\*\*Motifs\.\*\*|$)/.exec(body);

			season.episodes.push({
				code: ep[1],
				title: plain(title),
				span: plain(span ? span[1] : '').replace(/[.·\s]+$/, ''),
				act: plain(act ? act[1] : '').replace(/[.\s]+$/, ''),
				ore: oreOf(body) || address(j + 1),
				beats: beats ? beatNames(beats[1]) : [],
				at: j + 1
			});
			j = k;
		}
		seasons.push(season);
	}

	if (map.length === seasons.length) {
		for (let i = 0; i < seasons.length; i += 1) {
			seasons[i].acts = map[i].acts;
			seasons[i].span = map[i].span;
		}
	} else {
		told.push(
			`the series' shape table names ${map.length} seasons and ${seasons.length} stand under their own headings — the spans were left off rather than matched by guess.`
		);
	}
	return seasons;
}

/** The bible's text → the two doors' structure. Nothing is invented and
 *  nothing is rephrased; a shape that does not match is TOLD, not guessed. */
export function readDoors(text: string): Doors {
	const lines = text.replace(/\r\n/g, '\n').split('\n');
	const told: string[] = [];
	return { divisions: readBook(lines, told), seasons: readSeries(lines, told), told };
}

// ── THIS STUDIO'S OWN ROWS ───────────────────────────────────────────────

/** The work's title on both doors, as the bible names the epic. */
export const ATOGAIL = 'The Atógáil';

/** What a caller hands in rather than this file reading a clock. */
export interface Stamp {
	/** epoch milliseconds, written to `created_at` and `updated_at`. */
	at: number;
}

/** A work and the five lists beneath it. */
export interface DoorRows {
	work: Work;
	rows: WorkRows;
}

const pad = (n: number): string => String(n).padStart(2, '0');

interface Group {
	name: string;
	note: string;
}

interface Item {
	title: string;
	notes: string[];
	group: number;
}

/** The rows of one door, minted with deterministic ids so the same bible
 *  yields the same file twice. The base mints its own ids on import; the
 *  first hang of each part also carries its group, which is its era. */
function build(
	workId: string,
	kind: string,
	note: string,
	groups: Group[],
	items: Item[],
	stamp: Stamp
): DoorRows {
	const work: Work = {
		id: workId,
		kind,
		title: ATOGAIL,
		byline: null,
		note,
		created_at: stamp.at,
		updated_at: stamp.at
	};

	const eras: Era[] = groups.map((g, i) => ({
		id: `${workId}-era-${pad(i + 1)}`,
		work_id: workId,
		ord: i,
		name: g.name,
		note: g.note
	}));

	const parts: Part[] = items.map((it, i) => ({
		id: `${workId}-part-${pad(i + 1)}`,
		work_id: workId,
		parent_id: null,
		ord: i,
		title: it.title,
		body: '',
		words: 0,
		created_at: stamp.at,
		updated_at: stamp.at
	}));

	const appearances: Appearance[] = [];
	items.forEach((it, i) => {
		it.notes.forEach((n, j) => {
			appearances.push({
				id: `${workId}-hang-${pad(i + 1)}-${pad(j + 1)}`,
				work_id: workId,
				part_id: parts[i].id,
				era_id: j === 0 ? (eras[it.group]?.id ?? null) : null,
				character_id: null,
				arc_id: null,
				note: n
			});
		});
	});

	const characters: Character[] = [];
	const arcs: Arc[] = [];
	return { work, rows: { parts, eras, characters, arcs, appearances } };
}

/** DOOR THREE — the book: eleven divisions as eras, 55 chapters as parts. */
export function bookRows(doors: Doors, stamp: Stamp): DoorRows {
	const groups: Group[] = doors.divisions.map((d) => ({
		name: d.name,
		note: `act ${d.act} · span ${d.span} · ${address(d.at)}`
	}));
	const items: Item[] = [];
	doors.divisions.forEach((d, g) => {
		for (const c of d.chapters) {
			items.push({
				title: c.title,
				notes: [`span · ${c.span}`, `ore · ${c.ore}`, `bible · ${address(c.at)}`],
				group: g
			});
		}
	});
	return build('atogail-book', 'book', `${BIBLE_FILE} · DOOR THREE — THE BOOK`, groups, items, stamp);
}

/** DOOR ONE — the series: seven seasons as eras, 55 episodes as parts. */
export function seriesRows(doors: Doors, stamp: Stamp): DoorRows {
	const groups: Group[] = doors.seasons.map((s) => ({
		name: s.name,
		note: `acts ${s.acts} · span ${s.span} · ${address(s.at)}`
	}));
	const items: Item[] = [];
	doors.seasons.forEach((s, g) => {
		for (const e of s.episodes) {
			const notes = [
				`span · ${e.span}`,
				`act · ${e.act}`,
				`ore · ${e.ore}`,
				`bible · ${address(e.at)}`
			];
			if (e.beats.length > 0) notes.push(`beats · ${e.beats.join(' · ')}`);
			items.push({ title: `${e.code} · ${e.title}`, notes, group: g });
		}
	});
	return build(
		'atogail-series',
		'series',
		`${BIBLE_FILE} · DOOR ONE — THE ANIMATED SERIES`,
		groups,
		items,
		stamp
	);
}

/** Every chapter the book door carries, across its eleven divisions. */
export const chaptersOf = (doors: Doors): BibleChapter[] =>
	doors.divisions.flatMap((d) => d.chapters);

/** Every episode the series door carries, across its seven seasons. */
export const episodesOf = (doors: Doors): BibleEpisode[] =>
	doors.seasons.flatMap((s) => s.episodes);
