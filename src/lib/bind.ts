// THE BIND'S ARITHMETIC — framework-free, and it imports two pure functions
// and otherwise nothing but types.
//
// Everything here is a function over rows and strings. No Svelte, no DOM, no
// `invoke`, no plugin, no clock: every moment this file needs is HANDED IN, so
// the same work binds to the same bytes forever. That is what lets
// `.journals/proofs/2026-09-02-the-bind/bind.mjs` run THIS FILE in node rather
// than a twin of it, exactly as `board.ts` is run by S2's proof.
//
// THREE RUNTIME IMPORTS, ALL FROM MIRRORS, and no fourth. `crc32` and `utf8`
// from the-binder (`$lib/binder`) are pure arithmetic over bytes — no clock,
// no disk, no host global — and the-binder computes UTF-8 by hand precisely so
// a consumer need not reach for `TextEncoder`; a second copy of a CRC table
// this app does not own would be worse. `seal` from the-envelope
// (`$lib/envelope`) stamps `exportedAt` from the clock INSIDE the mirror,
// which is the water's own doing and not this file's: no line written here
// reads a clock, and the mirror is never edited to change that.
//
// FOUR LAWS LIVE IN THIS FILE:
//
//   1. THE TEXT IS NEVER ALTERED. A part's body goes into a chapter file as a
//      BYTE-EXACT SLICE — no trim, no normalisation, no reflow, no curled
//      quote, no stripped trailing newline. `manuscriptFolderOf` hands back
//      the byte offsets of every body it placed, so the claim is checkable by
//      anybody and not merely promised. The-binder's law, and the desk's:
//      "typos are fingerprints unless he says otherwise."
//   2. NOTHING IS EVER OVERWRITTEN. `snapshotName` chooses a name clear of
//      every name it was shown, the-board-charter's law in this studio's own
//      suffix; `writeNew` in `src/lib/host.ts` refuses an occupied path
//      besides. Two halves, and only the second one can actually hold — see
//      the note on `snapshotName`.
//   3. AN IMPORT IS A NEW WORK. `readingToImport` never merges into a standing
//      work and never emits an id read from a file. Every id is the base's to
//      mint; this file speaks in ARRAY INDICES, which is why an old id cannot
//      leak into a new row even by accident.
//   4. THE ROOM READS THE CLOCK, NEVER THIS FILE. `modified`, `savedAt` and a
//      snapshot's stamp all arrive as arguments. The single exception is named
//      rather than hidden: `seal` stamps `exportedAt` inside the-envelope's
//      own mirror, and a mirror is not edited to please a law of this repo's.

import { crc32, utf8 } from '$lib/binder';
import type { BookFile, FrontMatter, Manuscript, Rights } from '$lib/binder';
import type { BookJson, ChapterFile, ManuscriptFolder } from '$lib/pandulipi';
import { seal } from '$lib/envelope';
import type { Envelope, Reading } from '$lib/envelope';
import type { Appearance, Arc, Character, Era, Part, Work } from '$lib/types/types';

// ── THE SCENE BREAK, AND WHY IT IS THIS ONE ──────────────────────────────
//
// A scene break has to be a break in BOTH waters, and only one marker is.
//
//   the-pandulipi  SCENE_LINE = /^[ \t]*(?:#|\*[ \t]*\*[ \t]*\*)[ \t]*$/
//                  — `#`, `***` and `* * *` are all scene breaks.
//   the-binder     RULE = /^[ \t]*(-{3,}|\*{3,}|_{3,})[ \t]*$/  → <hr/>
//                  HEAD = /^(#{1,6})[ \t]+/                      → a heading
//                  ITEM = /^([ \t]*)([-*]|\d{1,9}[.)])[ \t]+/    → a list
//
// So a lone `#` is not a heading to the-binder (HEAD wants a space after the
// hashes) and is set as ORDINARY TEXT — a hash on a page of an EPUB. And
// `* * *` matches ITEM: the-binder would set it as a bulleted list whose one
// item is `* *`. Only `***` is a rule to one and a scene break to the other.
//
// It stands on a line of its own with a blank line either side. Neither water
// requires the blank lines — both end a paragraph at a break line — but a
// blank line is markup to both, it costs nothing, and it is what a hand
// opening the .md would expect to see. Proven over a two-scene fixture in
// `.journals/proofs/2026-09-02-the-bind/bind.mjs`.
export const SCENE_BREAK = '***';

/** What separates one part's body from the next inside a chapter file. */
const BETWEEN = '\n\n' + SCENE_BREAK + '\n\n';

// ── names ────────────────────────────────────────────────────────────────

/**
 * A deterministic, characters-only slug — the-binder's own rule, written out
 * here because the water keeps its `slug` private. Lower case; `a-z` and `0-9`
 * survive; every other character becomes a single `-`; leading and trailing
 * separators never appear; an empty result is `untitled`.
 *
 * No clock, no randomness, no locale: `toLowerCase` is the only case table
 * touched and the alphabet kept is ASCII, so the same title slugs the same way
 * on every machine.
 */
export function slug(s: string): string {
	const low = s.toLowerCase();
	let out = '';
	for (let i = 0; i < low.length; i += 1) {
		const c = low.charAt(i);
		if ((c >= 'a' && c <= 'z') || (c >= '0' && c <= '9')) out += c;
		else if (out.length && out.charAt(out.length - 1) !== '-') out += '-';
	}
	while (out.length && out.charAt(out.length - 1) === '-') out = out.slice(0, out.length - 1);
	return out === '' ? 'untitled' : out;
}

/** A number with leading zeros to `width` — never truncated, so a 100th
 *  chapter widens the whole set rather than losing a digit. */
function pad(n: number, width: number): string {
	let s = String(n);
	while (s.length < width) s = '0' + s;
	return s;
}

/**
 * A chapter's file name: `NN-slug.md`.
 *
 * `ord` is the chapter's POSITION, one-based. `width` is two by default,
 * because two digits is what an author expects — and because at two digits
 * NATURAL ORDER AND PLAIN ORDER AGREE, so a folder read by the-binder (which
 * sorts naturally) and a folder read by anything that sorts by name land on
 * the same book. Past 99 chapters, two digits stop agreeing: `100-x.md` sorts
 * before `99-x.md` by name and after it naturally. `manuscriptFolderOf`
 * therefore widens the field to the digit count of the chapter total, and says
 * so out loud when it does.
 */
export function chapterFileName(ord: number, title: string, width = 2): string {
	return pad(ord, width) + '-' + slug(title) + '.md';
}

/**
 * A chapter's title as both waters read it: the first `# ` heading line, or
 * nothing. The-binder's own reader, written out here for the same reason
 * `slug` is. `\r` is trimmed from a line end so a CRLF file reads the same.
 */
export function firstHeading(text: string): string | null {
	for (const raw of text.split('\n')) {
		const l = raw.charAt(raw.length - 1) === '\r' ? raw.slice(0, raw.length - 1) : raw;
		const m = /^#[ \t]+(.*)$/.exec(l);
		if (m) return m[1].replace(/[ \t]+$/, '');
	}
	return null;
}

// ── THE MANUSCRIPT FOLDER ────────────────────────────────────────────────

const byOrd = (a: { ord: number }, b: { ord: number }): number => a.ord - b.ord;

/** Where one part's body landed, in bytes — the editorial law made
 *  checkable. `file.markdown.slice(at, end)` is the part's body, exactly. */
export interface Placed {
	/** the chapter file's name. */
	file: string;
	partId: string;
	at: number;
	end: number;
}

/** What steers a folder. Everything is optional and absent means absent —
 *  the-pandulipi derives a surname and a short title when they are missing and
 *  TELLS that it did, which is better than this file guessing first. */
export interface FolderOptions {
	surname?: string | null;
	shortTitle?: string | null;
	/** the contact block, one line per entry, set verbatim and in this order.
	 *  Nothing is looked up and nothing is invented. */
	contact?: readonly string[] | null;
	language?: string | null;
}

/** A manuscript folder, and everything the making of it derived. */
export interface MadeFolder extends ManuscriptFolder {
	chapters: ChapterFile[];
	/** every body's byte offsets in the file it landed in, in order. */
	placed: Placed[];
	told: string[];
}

/**
 * A work, its parts and a by-line → the-binder's own folder shape.
 *
 * Chapters are the parts with no parent, in `ord`. Each chapter file is:
 *
 *     # <the chapter's title>
 *
 *     <the chapter's own body>
 *
 *     ***
 *
 *     <scene one's body>
 *
 *     ***
 *
 *     <scene two's body>
 *
 * The heading line STAYS in the text — both waters take a chapter's first
 * heading as its title and neither removes it, so removing it here would lose
 * a line the author wrote.
 *
 * A SCENE'S TITLE DOES NOT TRAVEL, and that is a decision rather than an
 * oversight: in a manuscript a scene is a break on the page, not a heading, so
 * the studio's scene titles are the author's own shelf-marks and stay in the
 * studio. It is told, every time.
 *
 * EVERY BODY IS A BYTE-EXACT SLICE of the file it lands in. Nothing is
 * trimmed, normalised, reflowed or re-quoted, and a trailing newline is not
 * stripped. `placed` carries the offsets so the claim is checkable.
 */
export function manuscriptFolderOf(
	work: Work,
	parts: readonly Part[],
	author: string,
	options: FolderOptions = {}
): MadeFolder {
	const told: string[] = [];
	const placed: Placed[] = [];

	const chapters = parts.filter((p) => p.parent_id === null).slice().sort(byOrd);
	const width = Math.max(2, String(chapters.length).length);
	if (width > 2) {
		told.push(
			`${chapters.length} chapters, so the file names carry ${width} digits rather than two — at two digits, name order and natural order would stop agreeing past the ninety-ninth.`
		);
	}

	const files: ChapterFile[] = [];
	let sceneTotal = 0;

	for (let i = 0; i < chapters.length; i += 1) {
		const c = chapters[i];
		const scenes = parts
			.filter((p) => p.parent_id === c.id)
			.slice()
			.sort(byOrd);
		sceneTotal += scenes.length;

		if (c.title.indexOf('\n') !== -1 || c.title.indexOf('\r') !== -1) {
			told.push(
				`the title of chapter ${i + 1} carries a line break, so only its first line becomes the file's heading. The title was NOT altered — the rest of it stands in the file as ordinary text.`
			);
		}

		const name = chapterFileName(i + 1, c.title, width);
		let markdown = '# ' + c.title + '\n\n';

		const bodies: { partId: string; body: string }[] = [{ partId: c.id, body: c.body }];
		for (const s of scenes) bodies.push({ partId: s.id, body: s.body });

		for (let k = 0; k < bodies.length; k += 1) {
			if (k > 0) markdown += BETWEEN;
			const at = markdown.length;
			markdown += bodies[k].body;
			placed.push({ file: name, partId: bodies[k].partId, at, end: markdown.length });
		}

		files.push({ name, markdown });
	}

	told.push(
		`${chapters.length} chapter file${chapters.length === 1 ? '' : 's'}, holding ${sceneTotal} scene${sceneTotal === 1 ? '' : 's'} folded in below their chapters and separated by "${SCENE_BREAK}" on a line of its own — the one marker the-binder sets as a rule AND the-pandulipi sets as a scene break.`
	);
	told.push(
		'a scene’s TITLE does not travel: in a manuscript a scene is a break on the page and not a heading, so the scene titles stay in the studio. Every scene’s TEXT is here, whole.'
	);
	told.push(
		'every body is a byte-exact slice of the file it landed in — nothing trimmed, nothing normalised, no quote curled, no trailing newline dropped.'
	);

	const book: BookJson = {
		title: work.title,
		author,
		language: options.language && options.language.trim() !== '' ? options.language : 'en'
	};
	if (options.surname && options.surname.trim() !== '') book.surname = options.surname;
	if (options.shortTitle && options.shortTitle.trim() !== '') book.shortTitle = options.shortTitle;
	if (options.contact && options.contact.length > 0) {
		book.contact = options.contact.slice();
		told.push(
			`${options.contact.length} contact line${options.contact.length === 1 ? '' : 's'} carried verbatim onto the title page, in the order given. Nothing was looked up and nothing was invented.`
		);
	} else {
		told.push('no contact lines were given — the title page carries none, and none was invented.');
	}

	return { book, chapters: files, placed, told };
}

/** The name of the folder a manuscript export makes — the work's own slug,
 *  as a NEW folder under the one a hand chose. */
export const folderName = (work: Work): string => slug(work.title);

/** Two path pieces, joined with a forward slash. Windows takes `/` in every
 *  path a Tauri plugin is handed, so there is one separator here and no
 *  platform arithmetic to get wrong. */
export const pathIn = (dir: string, name: string): string =>
	dir.replace(/[\\/]+$/, '') + '/' + name;

// ── THE MANUSCRIPT, FOR THE-BINDER ───────────────────────────────────────

/** What a front matter needs beyond the work itself. `modified` is ISO-8601
 *  UTC and is REQUIRED: the-binder refuses a blank one rather than guessing,
 *  and this file has no clock to guess with. */
export interface FrontOptions {
	author: string;
	/** ISO-8601 UTC. THE ROOM READS THE CLOCK. */
	modified: string;
	/** the year on the title page, as the author writes it — blankable. */
	year?: string | null;
	/** a drawn licence's keys, or nothing at all. Nothing is the default and
	 *  the-binder tells that it bound no rights page. */
	rights?: Rights | null;
	language?: string | null;
}

/**
 * The book's front matter.
 *
 * `identifier` is `urn:resonance-scribe:<the work's id>` — STABLE, so binding
 * the same work twice makes the same book rather than two books that a library
 * would file apart. The-binder would otherwise derive one from the title and
 * the author, which changes the moment a work is renamed.
 */
export function frontOf(work: Work, o: FrontOptions): FrontMatter {
	const front: FrontMatter = {
		title: work.title,
		author: o.author,
		language: o.language && o.language.trim() !== '' ? o.language : 'en',
		modified: o.modified,
		identifier: 'urn:resonance-scribe:' + work.id
	};
	if (o.year && o.year.trim() !== '') front.year = o.year;
	if (o.rights) front.rights = o.rights;
	return front;
}

/**
 * A manuscript folder → the-binder's `Manuscript`.
 *
 * A chapter's title is its first `# ` heading, and the heading line stays in
 * the text — the-binder's own folder reader does exactly this, and doing it
 * differently here would bind a different book from the one the folder holds.
 * A chapter with no heading falls back to its file name without `.md`, which
 * is the same fallback the water's door uses.
 */
export function manuscriptOf(folder: ManuscriptFolder, front: FrontMatter): Manuscript {
	return {
		front,
		chapters: folder.chapters.map((c) => {
			const h = firstHeading(c.markdown);
			return { title: h === null ? c.name.replace(/\.md$/i, '') : h, text: c.markdown };
		})
	};
}

// ── THE CONTAINER, STORE-ONLY ────────────────────────────────────────────
//
// The OCF ZIP, written by hand and STORED — method 0 for every entry, no
// deflate anywhere. A store-only EPUB is a valid EPUB: the container rule the
// OCF actually insists on is that `mimetype` comes FIRST and is stored with no
// extra field, and both of those hold here for every entry rather than for one.
//
// The layout is the-binder's own door's, read from
// `resonance-awen/tools/the-binder/src/cli.ts` and written out here rather
// than mirrored: that file is a node door — it imports `node:fs` and
// `node:zlib` and it writes to a disk — and neither belongs in a window whose
// only road to the disk is `src/lib/host.ts`. Little-endian throughout; the
// timestamps are PINNED to the DOS epoch (1980-01-01 00:00) for the same
// reason the door pins them: this water reads no clock, and a book that binds
// to different bytes on Tuesday is not reproducible.

const DOS_TIME = 0x0000;
const DOS_DATE = 0x0021; // 1980-01-01

function u16(out: number[], v: number): void {
	out.push(v & 0xff, (v >>> 8) & 0xff);
}

function u32(out: number[], v: number): void {
	out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
}

/** One file's bytes: its own, or the UTF-8 of its text. The-binder computes
 *  UTF-8 by hand so a consumer need not reach for `TextEncoder`, and this uses
 *  the water's own function rather than a second answer to the same question. */
function bodyBytes(f: BookFile): number[] {
	if (f.bytes) {
		const out: number[] = [];
		for (let i = 0; i < f.bytes.length; i += 1) out.push(f.bytes[i] & 0xff);
		return out;
	}
	return utf8(f.text === null ? '' : f.text);
}

/**
 * The OCF container: local file headers, the central directory, the end
 * record — every entry STORED.
 *
 * The files are written in the order they are handed over and are NEVER
 * reordered: `bind()` already puts `mimetype` first, which is the OCF's own
 * rule, and a container that quietly re-sorted a book's files would be
 * deciding something that is not its to decide.
 */
export function zipStore(files: readonly BookFile[]): Uint8Array {
	const out: number[] = [];
	const packed: {
		nameBytes: number[];
		flag: number;
		crc: number;
		size: number;
		offset: number;
	}[] = [];

	for (const f of files) {
		const nameBytes = utf8(f.path);
		let ascii = true;
		for (const b of nameBytes) if (b >= 0x80) ascii = false;
		const flag = ascii ? 0 : 0x0800; // bit 11: the name is UTF-8

		const raw = bodyBytes(f);
		const crc = crc32(raw);
		const offset = out.length;

		// ── local file header ──
		u32(out, 0x04034b50);
		u16(out, 20); // version needed to extract
		u16(out, flag);
		u16(out, 0); // METHOD 0 — stored, always, for every entry
		u16(out, DOS_TIME);
		u16(out, DOS_DATE);
		u32(out, crc);
		u32(out, raw.length); // compressed size — the same, because nothing is compressed
		u32(out, raw.length);
		u16(out, nameBytes.length);
		u16(out, 0); // extra field length — ZERO, which the OCF requires of mimetype
		for (const b of nameBytes) out.push(b);
		for (const b of raw) out.push(b);

		packed.push({ nameBytes, flag, crc, size: raw.length, offset });
	}

	// ── central directory ──
	const cdStart = out.length;
	for (const p of packed) {
		u32(out, 0x02014b50);
		u16(out, 20); // version made by
		u16(out, 20); // version needed
		u16(out, p.flag);
		u16(out, 0); // stored
		u16(out, DOS_TIME);
		u16(out, DOS_DATE);
		u32(out, p.crc);
		u32(out, p.size);
		u32(out, p.size);
		u16(out, p.nameBytes.length);
		u16(out, 0); // extra
		u16(out, 0); // comment
		u16(out, 0); // disk number start
		u16(out, 0); // internal attributes
		u32(out, 0); // external attributes
		u32(out, p.offset);
		for (const b of p.nameBytes) out.push(b);
	}
	const cdSize = out.length - cdStart;

	// ── end of central directory ──
	u32(out, 0x06054b50);
	u16(out, 0); // this disk
	u16(out, 0); // the disk the central directory is on
	u16(out, packed.length);
	u16(out, packed.length);
	u32(out, cdSize);
	u32(out, cdStart);
	u16(out, 0); // comment length

	return Uint8Array.from(out);
}

// ── THE ENVELOPE ─────────────────────────────────────────────────────────

/** Who saved — the-board-charter's own shape, kin to the signet's identity. */
export interface SavedBy {
	name: string;
	sigil?: string;
	color?: string;
	[key: string]: unknown;
}

/** The work's heart inside the envelope: identity and save provenance,
 *  the-board-charter's `BoardHeart` wearing this studio's nouns. THE ID IS
 *  MINTED ONCE AND NEVER DERIVED FROM THE NAME — a work may be renamed freely
 *  and everything pointing at it must survive that. */
export type WorkHeart = {
	id: string;
	name: string;
	savedAt: string;
	savedBy?: SavedBy;
};

/**
 * WHAT A `.scribe.json` HOLDS — the-board-charter's SHAPE, inside
 * the-envelope's seal.
 *
 * The charter itself is NOT mirrored into this repo and could not be: its
 * `parseBoard` refuses any `format` but `"skapa-board"`, and `snapshotName`,
 * `autosaveName` and `snapshotsFor` all hard-code the `.skapa.json` suffix. Its
 * code cannot serve a `.scribe.json`. What crossed is its LAWS, written out
 * here and kept:
 *
 *   · UNKNOWN KEYS ARE CARRIED AS SACRED — whatever a reader does not
 *     understand, it keeps whole, both ways. (This studio's own honest limit
 *     is that the BASE has no column for one: see `readingToImport`, which
 *     TELLS every unknown key rather than storing it.)
 *   · SNAPSHOTS NEVER OVERWRITE — `snapshotName` below, and `writeNew` in
 *     `src/lib/host.ts`.
 *   · THE ID IS MINTED ONCE and never derived from the name.
 *   · THE VERSION IS NEVER UPGRADED SILENTLY — this reads `scribeVersion` 1
 *     and writes 1, and says so when it meets another.
 */
export type ScribeWork = {
	format: 'scribe-work';
	scribeVersion: number;
	work: WorkHeart;
	kind: string;
	byline: string | null;
	note: string | null;
	parts: Part[];
	eras: Era[];
	characters: Character[];
	arcs: Arc[];
	appearances: Appearance[];
};

/** The format's name on the door. */
export const SCRIBE_FORMAT = 'scribe-work';
/** This studio's telling of the format. Read 1, write 1, never upgraded silently. */
export const SCRIBE_VERSION = 1;
/** The app name the envelope is sealed under, and the only one it opens. */
export const SCRIBE_APP = 'resonance-scribe';

/** The five lists a work is made of. */
export interface WorkRows {
	parts: readonly Part[];
	eras: readonly Era[];
	characters: readonly Character[];
	arcs: readonly Arc[];
	appearances: readonly Appearance[];
}

/** What only a clock and a manifest can say, handed in rather than read. */
export interface SealStamp {
	/** `package.json`'s `version`, passed in by the room. */
	appVersion: string;
	/** ISO-8601, the moment of the save. THE ROOM READS THE CLOCK. */
	at: string;
	savedBy?: SavedBy | null;
}

/**
 * A whole work, sealed.
 *
 * The COUNTS GO ON THE OUTSIDE — one number per list — which is the
 * envelope's first law and the whole reason a hand can look at a file and see
 * that it carries what the studio showed.
 *
 * The one clock read on this road is inside `seal` itself (`exportedAt`), and
 * it is the mirror's, not this file's; the mirror is never edited.
 */
export function envelopeOf(
	work: Work,
	rows: WorkRows,
	stamp: SealStamp
): Envelope<ScribeWork> {
	const heart: WorkHeart = { id: work.id, name: work.title, savedAt: stamp.at };
	if (stamp.savedBy) heart.savedBy = { ...stamp.savedBy };

	const data: ScribeWork = {
		format: SCRIBE_FORMAT,
		scribeVersion: SCRIBE_VERSION,
		work: heart,
		kind: work.kind,
		byline: work.byline,
		note: work.note,
		parts: rows.parts.slice(),
		eras: rows.eras.slice(),
		characters: rows.characters.slice(),
		arcs: rows.arcs.slice(),
		appearances: rows.appearances.slice()
	};

	return seal(SCRIBE_APP, stamp.appVersion, data, {
		parts: rows.parts.length,
		eras: rows.eras.length,
		characters: rows.characters.length,
		arcs: rows.arcs.length,
		appearances: rows.appearances.length
	});
}

// ── THE IMPORT, AS A PLAN ────────────────────────────────────────────────

/** A part to create. `parentIndex` points into THIS array — an index, never an
 *  id, so an id read from a file cannot reach a new row even by accident. */
export interface PlannedPart {
	title: string;
	body: string;
	parentIndex: number | null;
}

export interface PlannedEra {
	name: string;
	note: string | null;
}
export interface PlannedCharacter {
	name: string;
	note: string | null;
	emoji: string;
}
export interface PlannedArc {
	name: string;
	shape: string;
	note: string | null;
}
/** Every hand is an index into the plan's own arrays, or null. */
export interface PlannedAppearance {
	partIndex: number | null;
	eraIndex: number | null;
	characterIndex: number | null;
	arcIndex: number | null;
	note: string | null;
}

/**
 * THE ROWS TO CREATE, in the order to create them.
 *
 * There is no `id` anywhere on this shape. The base mints every id at the
 * moment of the create, and the plan speaks in ARRAY INDICES, so the old→new
 * mapping is already done by the time a room touches it and an id from a file
 * has nowhere to go.
 */
export interface ImportPlan {
	/** one plain sentence, or null. Nothing here throws. */
	refused: string | null;
	work: { kind: string; title: string; byline: string | null; note: string | null } | null;
	/** chapters first in `ord`, then each chapter's scenes in `ord`. The base
	 *  appends, so creating in this order gives back the same ordinals. */
	parts: PlannedPart[];
	eras: PlannedEra[];
	characters: PlannedCharacter[];
	arcs: PlannedArc[];
	appearances: PlannedAppearance[];
	/** what the file said it carried, from the envelope's outside. */
	counts: Record<string, number>;
	/** the title the file carries, for the room to show before importing. */
	title: string | null;
	/** every derivation, every absence, and every key that could not be kept. */
	told: string[];
}

const empty = (why: string | null): ImportPlan => ({
	refused: why,
	work: null,
	parts: [],
	eras: [],
	characters: [],
	arcs: [],
	appearances: [],
	counts: {},
	title: null,
	told: []
});

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && isFinite(v) ? v : fallback);
const rows = (v: unknown): Record<string, unknown>[] =>
	Array.isArray(v) ? v.filter((r) => typeof r === 'object' && r !== null) : [];

/** The keys this studio has a column for, per noun. Anything else is TOLD. */
const KNOWN = {
	top: ['format', 'scribeVersion', 'work', 'kind', 'byline', 'note', 'parts', 'eras', 'characters', 'arcs', 'appearances'],
	work: ['id', 'name', 'savedAt', 'savedBy'],
	part: ['id', 'work_id', 'parent_id', 'ord', 'title', 'body', 'words', 'created_at', 'updated_at'],
	era: ['id', 'work_id', 'ord', 'name', 'note'],
	character: ['id', 'work_id', 'name', 'note', 'emoji'],
	arc: ['id', 'work_id', 'name', 'shape', 'note'],
	appearance: ['id', 'work_id', 'part_id', 'era_id', 'character_id', 'arc_id', 'note']
};

/** Which keys of these rows this studio has no column for — names only, never
 *  values, and never an id. */
function strangers(list: readonly Record<string, unknown>[], known: readonly string[]): string[] {
	const found = new Set<string>();
	for (const r of list) for (const k of Object.keys(r)) if (known.indexOf(k) === -1) found.add(k);
	return Array.from(found).sort();
}

/**
 * An opened `.scribe.json` → the rows to create, as A NEW WORK.
 *
 * NEVER A MERGE. The envelope's third law is that an import is
 * non-destructive, and a work is one thing: there is no key by which two works
 * could be reconciled without one of them losing something. So an import
 * always makes a new work, and the file on disk and the work in the base go on
 * standing side by side.
 *
 * UNKNOWN KEYS ARE READ WHOLE AND TOLD, NOT STORED. The charter's law says a
 * reader keeps what it does not understand; this base has no column to keep it
 * in, and inventing one would be a schema change smuggled in through an import
 * road. So every unrecognised key is named out loud on the screen and in the
 * journal, and the FILE — which still holds them all — is never altered.
 *
 * Nothing throws. Every refusal is one plain sentence.
 */
export function readingToImport(reading: Reading<Record<string, unknown>>): ImportPlan {
	if (!reading) return empty('nothing was handed over to read.');
	if (reading.kind === 'legacy') {
		return empty(
			'this file is a bare list from before the envelope — Scribe has never written one, so there is nothing here it knows how to read.'
		);
	}

	const data = reading.data as Record<string, unknown>;
	if (!data || typeof data !== 'object') {
		return empty('the envelope carries no data — there is nothing inside it to import.');
	}
	if (data.format !== SCRIBE_FORMAT) {
		return empty(
			`this envelope holds ${JSON.stringify(data.format)}, and Scribe reads "${SCRIBE_FORMAT}". The file was not altered.`
		);
	}
	const version = num(data.scribeVersion, 1);
	if (version > SCRIBE_VERSION) {
		return empty(
			`this file was written by a newer Scribe (scribeVersion ${version}; this one reads ${SCRIBE_VERSION}). Nothing was imported and nothing was changed — a version is never upgraded silently, in either direction.`
		);
	}

	const told: string[] = [];
	const plan = empty(null);
	plan.counts = reading.counts ?? {};

	const heart = (typeof data.work === 'object' && data.work !== null ? data.work : {}) as Record<
		string,
		unknown
	>;
	const title = str(heart.name).trim() === '' ? 'an untitled work' : str(heart.name);
	plan.title = title;
	plan.work = {
		kind: str(data.kind, 'other'),
		title,
		byline: strOrNull(data.byline),
		note: strOrNull(data.note)
	};

	told.push(
		'this becomes a NEW work on the shelf. Nothing standing here is touched, nothing is merged and nothing is overwritten — an import is non-destructive by the envelope’s own law, and a work is one thing.'
	);
	told.push(
		'every id is minted fresh by the base. The ids in the file are used to re-hang the rows on each other and are then set down; not one of them is written.'
	);
	if (heart.savedBy) {
		told.push('the file names who saved it — the base has no column for that, so it is read and set down here rather than stored.');
	}

	// ── parts: chapters in ord, then each chapter's scenes in ord ──────────
	const partRows = rows(data.parts);
	const chapters = partRows.filter((p) => p.parent_id === null || p.parent_id === undefined).sort(
		(a, b) => num(a.ord) - num(b.ord)
	);
	const index = new Map<string, number>();
	const orphans: Record<string, unknown>[] = [];

	for (const c of chapters) {
		const id = strOrNull(c.id);
		if (id !== null) index.set(id, plan.parts.length);
		plan.parts.push({ title: str(c.title), body: str(c.body), parentIndex: null });
	}
	for (const c of chapters) {
		const id = strOrNull(c.id);
		if (id === null) continue;
		const parentIndex = index.get(id) ?? null;
		const scenes = partRows
			.filter((p) => strOrNull(p.parent_id) === id)
			.sort((a, b) => num(a.ord) - num(b.ord));
		for (const s of scenes) {
			const sid = strOrNull(s.id);
			if (sid !== null) index.set(sid, plan.parts.length);
			plan.parts.push({ title: str(s.title), body: str(s.body), parentIndex });
		}
	}
	for (const p of partRows) {
		const pid = strOrNull(p.id);
		if (pid === null || !index.has(pid)) orphans.push(p);
	}
	for (const o of orphans) {
		const oid = strOrNull(o.id);
		if (oid !== null) index.set(oid, plan.parts.length);
		plan.parts.push({ title: str(o.title), body: str(o.body), parentIndex: null });
		told.push(
			`"${str(o.title, 'an untitled part')}" names a chapter that is not in this file, so it comes in as a chapter of its own rather than being dropped. Nothing was lost.`
		);
	}

	// ── the other three lists ──────────────────────────────────────────────
	const eraIndex = new Map<string, number>();
	for (const e of rows(data.eras).sort((a, b) => num(a.ord) - num(b.ord))) {
		const id = strOrNull(e.id);
		if (id !== null) eraIndex.set(id, plan.eras.length);
		plan.eras.push({ name: str(e.name), note: strOrNull(e.note) });
	}

	const charIndex = new Map<string, number>();
	for (const c of rows(data.characters)) {
		const id = strOrNull(c.id);
		if (id !== null) charIndex.set(id, plan.characters.length);
		plan.characters.push({ name: str(c.name), note: strOrNull(c.note), emoji: str(c.emoji) });
	}

	const arcIndex = new Map<string, number>();
	for (const a of rows(data.arcs)) {
		const id = strOrNull(a.id);
		if (id !== null) arcIndex.set(id, plan.arcs.length);
		plan.arcs.push({ name: str(a.name), shape: str(a.shape, 'other'), note: strOrNull(a.note) });
	}

	// ── the appearances, all four hands re-mapped ──────────────────────────
	let dangling = 0;
	let empties = 0;
	for (const a of rows(data.appearances)) {
		const hand = (key: string, map: Map<string, number>): number | null => {
			const id = strOrNull(a[key]);
			if (id === null) return null;
			const at = map.get(id);
			if (at === undefined) {
				dangling += 1;
				return null;
			}
			return at;
		};
		const row: PlannedAppearance = {
			partIndex: hand('part_id', index),
			eraIndex: hand('era_id', eraIndex),
			characterIndex: hand('character_id', charIndex),
			arcIndex: hand('arc_id', arcIndex),
			note: strOrNull(a.note)
		};
		if (
			row.partIndex === null &&
			row.eraIndex === null &&
			row.characterIndex === null &&
			row.arcIndex === null
		) {
			empties += 1;
			continue;
		}
		plan.appearances.push(row);
	}
	if (dangling > 0) {
		told.push(
			`${dangling} hand${dangling === 1 ? '' : 's'} on the appearance rows point at something this file does not carry; ${dangling === 1 ? 'it was' : 'they were'} let go rather than guessed at.`
		);
	}
	if (empties > 0) {
		told.push(
			`${empties} appearance row${empties === 1 ? '' : 's'} ended up hanging on nothing at all and ${empties === 1 ? 'was' : 'were'} left out — the base refuses a row that names none of the four, and so does this.`
		);
	}

	// ── the unknown keys, named and not stored ────────────────────────────
	const strange = [
		['the file itself', strangers([data], KNOWN.top)],
		['the work', strangers([heart], KNOWN.work)],
		['the parts', strangers(partRows, KNOWN.part)],
		['the eras', strangers(rows(data.eras), KNOWN.era)],
		['the characters', strangers(rows(data.characters), KNOWN.character)],
		['the arcs', strangers(rows(data.arcs), KNOWN.arc)],
		['the appearances', strangers(rows(data.appearances), KNOWN.appearance)]
	] as const;
	for (const [where, keys] of strange) {
		if (keys.length === 0) continue;
		told.push(
			`${where} carries ${keys.length} key${keys.length === 1 ? '' : 's'} this studio has no column for — ${keys.join(', ')}. ${keys.length === 1 ? 'It is' : 'They are'} read whole and said out loud here, and NOT stored: the file still holds ${keys.length === 1 ? 'it' : 'them'}, and nothing about it was altered.`
		);
	}

	told.push(
		`${plan.parts.length} part${plan.parts.length === 1 ? '' : 's'}, ${plan.eras.length} era${plan.eras.length === 1 ? '' : 's'}, ${plan.characters.length} character${plan.characters.length === 1 ? '' : 's'}, ${plan.arcs.length} arc${plan.arcs.length === 1 ? '' : 's'} and ${plan.appearances.length} appearance${plan.appearances.length === 1 ? '' : 's'} will be created.`
	);

	plan.told = told;
	return plan;
}

// ── THE SNAPSHOT'S NAME ──────────────────────────────────────────────────

/**
 * A filename-safe telling of a work's id — deterministic and REVERSIBLE, and
 * `.` and `..` are guarded so an id can never name a folder above itself.
 * The-board-charter's own `encodeBoardId`, in this studio's words.
 */
export function encodeWorkId(id: string): string {
	let out = '';
	for (const ch of id) {
		if (/[A-Za-z0-9._-]/.test(ch)) out += ch;
		else {
			const enc = encodeURIComponent(ch);
			out += enc !== ch ? enc : '%' + (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(2, '0');
		}
	}
	if (out === '.') return '%2E';
	if (out === '..') return '%2E%2E';
	return out;
}

/** The way back — `encodeWorkId` undone exactly. */
export const decodeWorkId = (name: string): string => decodeURIComponent(name);

/** A moment as a filename-safe UTC stamp: `2026-09-02T064512Z`. The moment is
 *  HANDED IN; nothing here reads a clock. */
export function snapshotStamp(at: number): string {
	const iso = new Date(at).toISOString();
	return iso.slice(0, 10) + 'T' + iso.slice(11, 19).replace(/:/g, '') + 'Z';
}

/**
 * The next snapshot's name, chosen clear of every name it was shown:
 * `<encoded id>.<UTC stamp>.scribe.json`, and the same work in the same second
 * twice takes a `-2`.
 *
 * SAID PLAINLY: this is only HALF of "never overwrite", and it is the weaker
 * half here. `src/lib/host.ts` has no `readDir` — deliberately, because a
 * surface that can list a folder can walk one — so `existing` is not a reading
 * of the disk. It is whatever the caller already knows. The half that actually
 * holds is `writeNew`, which asks `exists` and then writes with `createNew`,
 * and refuses an occupied path in a plain sentence. The room grows `existing`
 * by each name it just tried and asks again, which is how the two halves meet.
 */
export function snapshotName(workId: string, at: number, existing: readonly string[]): string {
	const base = encodeWorkId(workId) + '.' + snapshotStamp(at);
	const taken = new Set(existing);
	let candidate = base + '.scribe.json';
	for (let n = 2; taken.has(candidate); n += 1) candidate = base + '-' + n + '.scribe.json';
	return candidate;
}

/** Where this studio keeps its snapshots — beside the base, in this app's own
 *  data directory. Pure path arithmetic; no disk is touched here. */
export function snapshotFolder(appData: string): string {
	return appData.replace(/[\\/]+$/, '') + '/.scribe/snapshots';
}
