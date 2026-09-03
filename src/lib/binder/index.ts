// THE BINDER — manuscript to book.
//
// Markdown in, a book out: an EPUB 3 as an ordered file map, and a print-ready
// paged HTML. Everything is computed here — the markdown dialect, the XHTML, the
// package document, the two tables of contents, the stylesheet, the paged-media
// rules, and the CRC-32 the container needs. Nothing is fetched, nothing is
// asked of a service, and NOT ONE CHARACTER OF THE AUTHOR'S TEXT IS ALTERED.

// ── THE LAWS, AS DATA ───────────────────────────────────────────────────

/** One law of this water, and the reason beside it. */
export interface Law {
	law: string;
	because: string;
}

/** THE EDITORIAL LAW, quoted whole, with its address. Exported so `verify.mjs`
 *  proves the law rather than a paraphrase of it. */
export const EDITORIAL_LAW =
	'Editorial law: verbatim-vs-light-touch is KP\'s ruling per line; typos are fingerprints unless he says otherwise.';

/** Where that sentence stands. */
export const EDITORIAL_LAW_AT = 'resonance-chamber/desk/POTENTIALITIES.md:31 (P-12, THE PUBLISHING SHELF)';

/** THE COVER RULE, KP's own. */
export const COVER_RULE = 'no art → note it, never block. -yes';
export const COVER_RULE_AT = 'KP ⚛ 2026-08-14 · resonance-awen/tools/the-catalogue-raisonne/README.md:133';

/** Every law this water keeps, with its reason. */
export const THE_LAWS: readonly Law[] = [
	{
		law: 'The binder alters no text.',
		because: EDITORIAL_LAW + ' (' + EDITORIAL_LAW_AT + ')',
	},
	{
		law: 'Every literal run emitted is recorded with its byte offsets and is a byte-exact slice of the source.',
		because: 'A promise that text was not altered is worth nothing; an offset is checkable by anyone.',
	},
	{
		law: 'The characters no run covers are markup and nothing else.',
		because: 'If a word were ever dropped, its letters would show up outside every run — so the loss is visible instead of silent.',
	},
	{
		law: 'A hard line break inside a stanza is kept.',
		because: 'The first consumer is verse. A line break in a poem is the poem.',
	},
	{
		law: 'No cover art blocks a binding.',
		because: COVER_RULE + ' (' + COVER_RULE_AT + ')',
	},
	{
		law: 'No clock, no randomness, no disk, no network.',
		because: 'The same manuscript must bind to a byte-identical book forever, and a book-maker that can write a file can overwrite yours.',
	},
	{
		law: 'Nothing throws. Every failure returns a Refusal carrying one sentence.',
		because: 'A binder that crashes takes the whole run with it, and a half-written book is worse than none.',
	},
	{
		law: 'The consent gates are not this water’s to open.',
		because: 'P-12 names three — Aethelred’s half, the taproot privacy pass, and Jessica’s word on any imagery of hers. A tool consumes a manuscript it is handed; it never goes looking for one.',
	},
	{
		law: 'The ancestor was not read.',
		because: 'The registry row names one — book-group/saga_template.py — and it stands inside mimirs-well, which is sealed to hands absolutely. The row is quoted whole because a row is quoted whole or not at all; the script was never opened, and nothing in this water descends from it.',
	},
];

// ── refusals and the voice ──────────────────────────────────────────────

/** What is wrong, in one plain sentence — or nothing. Nothing here throws. */
export interface Refusal {
	refused: string;
}

export function isRefusal(x: unknown): x is Refusal {
	return typeof x === 'object' && x !== null && typeof (x as Refusal).refused === 'string';
}

/** THE LOGGING SINK, and the whole logging capability: built, and default
 *  silent. Absent, nothing is emitted anywhere; the told lines still land
 *  in `told`, which is always filled. */
export type Endpaper = (line: string) => void;

// ── THE MANUSCRIPT ──────────────────────────────────────────────────────

/** One chapter. `text` is the author's markdown, whole and untouched;
 *  `title` is used for the two tables of contents and nowhere else —
 *  the chapter's body is nothing but the rendering of `text`, so no
 *  heading is ever inserted, duplicated, or removed. */
export interface Chapter {
	title: string;
	text: string;
	[k: string]: unknown; // ridden whole — a realm's own keys travel untouched
}

/** ONE GRANT of the rights block, keyed to the-sphragis' own shape and
 *  READ AS KEYS. `name` is a plain string on purpose: this water never
 *  re-enumerates another tool's enum, because that would be a second copy
 *  of a truth it does not own. */
export interface RightsGrant {
	name: string;
	permits?: string[];
	revocable?: boolean;
	/** The rights page prints whatever it is handed and never invents one. */
	exclusive?: boolean;
	[k: string]: unknown;
}

/** The rights block — the book's rights page, as data. Keyed to
 *  the-sphragis' grant shape (`holder` · `grants` · `split`), consumed as
 *  keys and never imported. A manuscript with no rights block is bound
 *  anyway and told. */
export interface Rights {
	holder: string;
	grants?: RightsGrant[];
	split?: { [party: string]: number };
	/** any further line the rights page should carry, verbatim. */
	notice?: string;
	[k: string]: unknown;
}

/** The cover. `bytes` carried means the art is bound in; `href` alone
 *  means the art was NAMED but not handed over — noted, never blocking. */
export interface Cover {
	/** the file name the art takes inside the book, e.g. "cover.jpg". */
	href: string;
	/** e.g. "image/jpeg". */
	mediaType: string;
	bytes?: readonly number[] | null;
	[k: string]: unknown;
}

/** The front matter. Four fields are required and refused when blank;
 *  everything else is optional and absent means absent, never invented. */
export interface FrontMatter {
	title: string;
	author: string;
	/** BCP-47, e.g. "en". */
	language: string;
	/** ISO-8601 UTC, e.g. "2026-08-23T00:00:00Z". EPUB 3 requires
	 *  `dcterms:modified` and THIS WATER READS NO CLOCK — state it, or
	 *  ask the-now. A blank one is refused rather than guessed. */
	modified: string;
	series?: string;
	/** the year on the title page, as the author writes it. */
	year?: string;
	/** the book's unique identifier. Absent, one is DERIVED from the title
	 *  and author — deterministic, never random — and the derivation is
	 *  told. */
	identifier?: string;
	publisher?: string;
	rights?: Rights;
	cover?: Cover | null;
	dedication?: string;
	epigraph?: string;
	[k: string]: unknown;
}

/** THE MANUSCRIPT: front matter, and chapters in the order they are read. */
export interface Manuscript {
	front: FrontMatter;
	chapters: Chapter[];
	[k: string]: unknown;
}

// ── CHAPTER ORDER, NATURAL (folder manuscripts only) ────────────────────
//
// A JSON manuscript's chapters array IS the book's order and is never re-sorted.
// A FOLDER manuscript's order is read from filenames in NATURAL order: digit runs
// compare by numeric VALUE, so "2.md" sorts before "10.md" where plain `.sort()`
// would put "10" first. Pure — no disk touched.

interface Segment {
	digit: boolean;
	value: string;
}

/** Split a name into alternating runs of digits and non-digits. */
function segments(s: string): Segment[] {
	const out: Segment[] = [];
	let i = 0;
	while (i < s.length) {
		const isDigit = s.charCodeAt(i) >= 48 && s.charCodeAt(i) <= 57;
		let j = i + 1;
		while (j < s.length) {
			const d = s.charCodeAt(j) >= 48 && s.charCodeAt(j) <= 57;
			if (d !== isDigit) break;
			j += 1;
		}
		out.push({ digit: isDigit, value: s.slice(i, j) });
		i = j;
	}
	return out;
}

/** A digit run's numeric value as a string with no leading zeros (never
 *  emptied — "000" reads as "0"). Comparing these by length then by value
 *  compares the numbers themselves, never their padding. */
function numericValue(run: string): string {
	let k = 0;
	while (k < run.length - 1 && run.charAt(k) === '0') k += 1;
	return run.slice(k);
}

/** Compare two names in NATURAL order: digit runs by numeric value, every
 *  other run by code point. Where two digit runs carry the same value with
 *  different padding, padding alone never decides. Pure. */
function naturalCompare(a: string, b: string): number {
	const A = segments(a);
	const B = segments(b);
	const n = A.length < B.length ? A.length : B.length;
	for (let i = 0; i < n; i += 1) {
		const sa = A[i];
		const sb = B[i];
		if (sa.digit && sb.digit) {
			const na = numericValue(sa.value);
			const nb = numericValue(sb.value);
			if (na.length !== nb.length) return na.length - nb.length;
			if (na !== nb) return na < nb ? -1 : 1;
			// same number, different padding — fall through to the next
			// segment; padding alone is never the tiebreak.
		} else if (sa.digit !== sb.digit) {
			return sa.value < sb.value ? -1 : 1;
		} else if (sa.value !== sb.value) {
			return sa.value < sb.value ? -1 : 1;
		}
	}
	if (A.length !== B.length) return A.length - B.length;
	return a < b ? -1 : a > b ? 1 : 0;
}

/** CHAPTER ORDER — a folder manuscript's `*.md` filenames, in the order the
 *  book binds them: natural order, so zero-padding is never required. A JSON
 *  manuscript states its own chapters array and is never passed through this. */
export function chapterOrder(names: readonly string[]): string[] {
	return names.slice().sort(naturalCompare);
}

// ── THE DIALECT ─────────────────────────────────────────────────────────

/** How a line break inside a stanza is set.
 *
 *  `keep`  — every source line break becomes `<br/>` and the line's own
 *            leading and trailing spaces survive. THE DEFAULT.
 *  `fold`  — lines are trimmed and joined by one space into a flowing
 *            paragraph. */
export type LineBreaks = 'keep' | 'fold';

/** One literal run of the author's text, with its byte offsets in the
 *  source chapter. THE EDITORIAL LAW LIVES HERE: `text` is always exactly
 *  `source.slice(at, end)`.
 *
 *  `text` — prose, set into the page.
 *  `code` — the inside of a code span.
 *  `href` — a link target, carried byte-identical into an attribute. */
export interface Ink {
	at: number;
	end: number;
	text: string;
	kind: 'text' | 'code' | 'href';
}

/** A chapter body, imposed. */
export interface Rendered {
	/** the XHTML body content — well-formed, no wrapper element. */
	xhtml: string;
	/** every literal run, in source order, never overlapping. */
	ink: readonly Ink[];
}

/** THE MARKUP ALPHABET — every character this dialect may consume as
 *  structure. The editorial law's teeth: a character of the source that is
 *  not inside an `Ink` MUST be one of these, and `verify.mjs` proves it on
 *  every fixture. If a word were ever dropped, its letters would appear in
 *  a gap and the proof would go FALSE.
 *
 *  `#` headings · `*` `_` emphasis and rules · backtick code spans ·
 *  `>` blockquote · `-` bullets and rules · `[](` `)` links ·
 *  digits, `.` and `)` for ordered markers · spaces, tabs, CR and LF. */
export const MARKUP_ALPHABET = '#*_' + String.fromCharCode(96) + '>-[]()0123456789. \t\r\n';

// ── the dialect ─────────────────────────────────────────────────────────
//
// Output is XHTML (`<br/>`, `<hr/>`), because an EPUB is parsed as XML and a lone
// `<br>` is a hard error rather than a nicety. The house's `standalone/markdown.ts`
// is not imported: this water keeps zero dependencies.

interface SourceLine {
	at: number;
	text: string;
}

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Split into lines with absolute offsets. A trailing CR is a line
 *  terminator, not text — so a CRLF manuscript is not re-written on the
 *  way in, and the CR lands in a gap where the alphabet expects it. */
function toLines(src: string): SourceLine[] {
	const out: SourceLine[] = [];
	let at = 0;
	for (;;) {
		const nl = src.indexOf('\n', at);
		const stop = nl === -1 ? src.length : nl;
		let e = stop;
		if (e > at && src.charAt(e - 1) === '\r') e -= 1;
		out.push({ at, text: src.slice(at, e) });
		if (nl === -1) break;
		at = nl + 1;
	}
	return out;
}

function trailingBlank(s: string): number {
	let n = 0;
	while (n < s.length) {
		const c = s.charAt(s.length - 1 - n);
		if (c !== ' ' && c !== '\t') break;
		n += 1;
	}
	return n;
}

function leadingBlank(s: string): number {
	let n = 0;
	while (n < s.length) {
		const c = s.charAt(n);
		if (c !== ' ' && c !== '\t') break;
		n += 1;
	}
	return n;
}

interface Piece {
	html: string;
	ink: Ink[];
}

/** Inline forms over the span [from, to) of `src`. Escaping happens on the
 *  exact slice at emit time, so an `Ink` is always the raw source. */
function inlineSpan(src: string, from: number, to: number): Piece {
	const ink: Ink[] = [];
	let html = '';
	let runStart = -1;
	let i = from;

	function flush(end: number): void {
		if (runStart >= 0 && end > runStart) {
			const t = src.slice(runStart, end);
			ink.push({ at: runStart, end, text: t, kind: 'text' });
			html += esc(t);
		}
		runStart = -1;
	}

	const TICK = String.fromCharCode(96);

	while (i < to) {
		const c = src.charAt(i);

		// Code spans first — they are protected from every other rule.
		if (c === TICK) {
			const close = src.indexOf(TICK, i + 1);
			if (close > i + 1 && close < to) {
				flush(i);
				const inner = src.slice(i + 1, close);
				ink.push({ at: i + 1, end: close, text: inner, kind: 'code' });
				html += '<code>' + esc(inner) + '</code>';
				i = close + 1;
				continue;
			}
		}

		// Links: [text](href). An unclosed one is ordinary text.
		if (c === '[') {
			const rb = src.indexOf(']', i + 1);
			if (rb > i && rb + 1 < to && src.charAt(rb + 1) === '(') {
				const rp = src.indexOf(')', rb + 2);
				if (rp > rb + 1 && rp < to) {
					flush(i);
					const inner = inlineSpan(src, i + 1, rb);
					const href = src.slice(rb + 2, rp);
					for (const k of inner.ink) ink.push(k);
					ink.push({ at: rb + 2, end: rp, text: href, kind: 'href' });
					html += '<a href="' + esc(href) + '">' + inner.html + '</a>';
					i = rp + 1;
					continue;
				}
			}
		}

		// Strong before emphasis, so ** wins over *.
		if (c === '*') {
			const strong = src.charAt(i + 1) === '*';
			const mark = strong ? '**' : '*';
			const close = src.indexOf(mark, i + mark.length);
			if (close > i + mark.length && close + mark.length <= to) {
				flush(i);
				const inner = inlineSpan(src, i + mark.length, close);
				for (const k of inner.ink) ink.push(k);
				html += (strong ? '<strong>' : '<em>') + inner.html + (strong ? '</strong>' : '</em>');
				i = close + mark.length;
				continue;
			}
		}

		if (runStart < 0) runStart = i;
		i += 1;
	}
	flush(to);
	return { html, ink };
}

const HEAD = /^(#{1,6})[ \t]+/;
const RULE = /^[ \t]*(-{3,}|\*{3,}|_{3,})[ \t]*$/;
const QUOTE = /^[ \t]*>[ \t]?/;
const ITEM = /^([ \t]*)([-*]|\d{1,9}[.)])[ \t]+/;

function isBlank(l: SourceLine): boolean {
	return leadingBlank(l.text) === l.text.length;
}

function blockOpens(l: SourceLine): boolean {
	return HEAD.test(l.text) || RULE.test(l.text) || QUOTE.test(l.text) || ITEM.test(l.text);
}

interface ListEntry {
	deep: boolean;
	ordered: boolean;
	piece: Piece;
}

function renderItems(entries: readonly ListEntry[]): string {
	let html = '';
	let openOuter = '';
	let openInner = '';
	let liOpen = false;
	for (const e of entries) {
		if (!e.deep) {
			if (openInner) {
				html += '</' + openInner + '>';
				openInner = '';
			}
			if (liOpen) {
				html += '</li>';
				liOpen = false;
			}
			if (!openOuter) {
				openOuter = e.ordered ? 'ol' : 'ul';
				html += '<' + openOuter + '>';
			}
			html += '<li>' + e.piece.html;
			liOpen = true;
		} else {
			if (!openOuter) {
				openOuter = e.ordered ? 'ol' : 'ul';
				html += '<' + openOuter + '><li>';
				liOpen = true;
			}
			if (!liOpen) {
				html += '<li>';
				liOpen = true;
			}
			if (!openInner) {
				openInner = e.ordered ? 'ol' : 'ul';
				html += '<' + openInner + '>';
			}
			html += '<li>' + e.piece.html + '</li>';
		}
	}
	if (openInner) html += '</' + openInner + '>';
	if (liOpen) html += '</li>';
	if (openOuter) html += '</' + openOuter + '>';
	return html;
}

function renderLines(src: string, ls: readonly SourceLine[], mode: LineBreaks): Piece {
	const out: string[] = [];
	const ink: Ink[] = [];
	let j = 0;

	while (j < ls.length) {
		const l = ls[j];

		if (isBlank(l)) {
			j += 1;
			continue;
		}

		const h = HEAD.exec(l.text);
		if (h) {
			const from = l.at + h[0].length;
			const to = l.at + l.text.length - trailingBlank(l.text);
			const p = inlineSpan(src, from, to);
			const level = h[1].length;
			out.push('<h' + level + '>' + p.html + '</h' + level + '>');
			for (const k of p.ink) ink.push(k);
			j += 1;
			continue;
		}

		if (RULE.test(l.text)) {
			out.push('<hr/>');
			j += 1;
			continue;
		}

		if (QUOTE.test(l.text)) {
			const inner: SourceLine[] = [];
			while (j < ls.length && QUOTE.test(ls[j].text)) {
				const m = QUOTE.exec(ls[j].text) as RegExpExecArray;
				inner.push({ at: ls[j].at + m[0].length, text: ls[j].text.slice(m[0].length) });
				j += 1;
			}
			const p = renderLines(src, inner, mode);
			out.push('<blockquote>' + p.html + '</blockquote>');
			for (const k of p.ink) ink.push(k);
			continue;
		}

		if (ITEM.test(l.text)) {
			const entries: ListEntry[] = [];
			while (j < ls.length && ITEM.test(ls[j].text)) {
				const m = ITEM.exec(ls[j].text) as RegExpExecArray;
				const from = ls[j].at + m[0].length;
				const to = ls[j].at + ls[j].text.length - trailingBlank(ls[j].text);
				entries.push({
					deep: m[1].length >= 2,
					ordered: /^\d/.test(m[2]),
					piece: inlineSpan(src, from, to),
				});
				j += 1;
			}
			out.push(renderItems(entries));
			for (const e of entries) for (const k of e.piece.ink) ink.push(k);
			continue;
		}

		// A stanza: consecutive lines that open no other block.
		const parts: string[] = [];
		while (j < ls.length && !isBlank(ls[j]) && !blockOpens(ls[j])) {
			const line = ls[j];
			let from = line.at;
			let to = line.at + line.text.length;
			if (mode === 'fold') {
				from += leadingBlank(line.text);
				to -= trailingBlank(line.text);
			}
			const p = inlineSpan(src, from, to);
			parts.push(p.html);
			for (const k of p.ink) ink.push(k);
			j += 1;
		}
		out.push('<p>' + parts.join(mode === 'keep' ? '<br/>' : ' ') + '</p>');
	}

	return { html: out.join('\n'), ink };
}

/** IMPOSE — a chapter's markdown, set into XHTML, with every literal run
 *  of the author's text recorded at its own byte offsets.
 *
 *  @param text   the author's markdown, whole and untouched
 *  @param mode   'keep' (default, verse) or 'fold' (prose) */
export function impose(text: string, mode: LineBreaks = 'keep'): Rendered {
	const p = renderLines(text, toLines(text), mode);
	return { xhtml: p.html, ink: p.ink };
}

// ── CRC-32, pure ────────────────────────────────────────────────────────
//
// The ordinary reflected CRC-32 (polynomial 0xEDB88320, init and final xor
// 0xFFFFFFFF) — the one ZIP, PNG and gzip all use. Its published check value:
// the CRC-32 of the nine ASCII bytes "123456789" is 0xCBF43926.

const CRC_TABLE: readonly number[] = (function build(): number[] {
	const t: number[] = [];
	for (let n = 0; n < 256; n += 1) {
		let c = n;
		for (let k = 0; k < 8; k += 1) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		t.push(c >>> 0);
	}
	return t;
})();

/** The standard's own check value, exported so the proof cites a number
 *  rather than trusting a comment. */
export const CRC32_CHECK = 0xcbf43926;

/** CRC-32 of a byte sequence, as an unsigned 32-bit number. */
export function crc32(bytes: readonly number[]): number {
	let c = 0xffffffff;
	for (let i = 0; i < bytes.length; i += 1) {
		c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
	}
	return (c ^ 0xffffffff) >>> 0;
}

/** UTF-8 bytes of a string, computed here because the charter touches no
 *  host global and `TextEncoder` is one. */
export function utf8(s: string): number[] {
	const out: number[] = [];
	for (let i = 0; i < s.length; i += 1) {
		let cp = s.charCodeAt(i);
		if (cp >= 0xd800 && cp <= 0xdbff && i + 1 < s.length) {
			const lo = s.charCodeAt(i + 1);
			if (lo >= 0xdc00 && lo <= 0xdfff) {
				cp = 0x10000 + ((cp - 0xd800) << 10) + (lo - 0xdc00);
				i += 1;
			}
		}
		if (cp < 0x80) out.push(cp);
		else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
		else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
		else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
	}
	return out;
}

// ── THE BOOK, AS DATA ───────────────────────────────────────────────────

/** One file of the book. Exactly one of `text` and `bytes` is filled.
 *
 *  `stored` is the OCF's own rule wearing its data form: the `mimetype`
 *  entry MUST be the first entry of the ZIP and MUST be stored
 *  uncompressed (method 0). Every other entry may be deflated. The door
 *  honours this flag; it does not decide it. */
export interface BookFile {
	path: string;
	text: string | null;
	bytes: readonly number[] | null;
	stored: boolean;
	mediaType: string;
}

/** THE BOUND BOOK: an ordered file map, and everything the binder told. */
export interface Book {
	files: BookFile[];
	/** every line told — absences, derivations, refused-nothing notes. */
	told: string[];
	/** the reading order, by manifest id, exactly as the spine carries it. */
	readingOrder: string[];
	/** the chapters' XHTML paths, in the manuscript's own order. */
	chapterPaths: string[];
}

/** What a binding may be steered by. Everything here has an honest
 *  default and every default is named in the README. */
export interface BindOptions {
	lineBreaks?: LineBreaks;
	/** the folder inside the container. Default "OEBPS". */
	root?: string;
}

const OCF_MIMETYPE = 'application/epub+zip';

function blank(s: string | undefined): boolean {
	return s === undefined || s === null || s.replace(/[ \t\r\n]/g, '') === '';
}

function pad3(n: number): string {
	const s = String(n);
	return s.length >= 3 ? s : '000'.slice(s.length) + s;
}

/** A deterministic, characters-only slug. No clock, no randomness. */
function slug(s: string): string {
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

function xmlHead(): string {
	return '<?xml version="1.0" encoding="utf-8"?>\n';
}

function page(lang: string, title: string, body: string, cls: string): string {
	return xmlHead() +
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="' +
		esc(lang) + '" lang="' + esc(lang) + '">\n' +
		'<head>\n<title>' + esc(title) + '</title>\n' +
		'<link rel="stylesheet" type="text/css" href="styles.css"/>\n</head>\n' +
		'<body class="' + esc(cls) + '">\n' + body + '\n</body>\n</html>\n';
}

function styles(mode: LineBreaks): string {
	// `pre-wrap` is what keeps an indented line indented. Under 'fold' the
	// dialect has already folded, so normal wrapping is correct there.
	const ws = mode === 'keep' ? 'pre-wrap' : 'normal';
	return [
		'/* the-binder — the book’s own stylesheet. Nothing is fetched. */',
		'html { font-size: 100%; }',
		'body { margin: 0 5%; line-height: 1.5; text-align: left; }',
		'h1, h2, h3, h4, h5, h6 { line-height: 1.25; page-break-after: avoid; break-after: avoid; }',
		'h1 { font-size: 1.6em; margin: 2em 0 1em; }',
		'h2 { font-size: 1.3em; margin: 1.6em 0 0.8em; }',
		'h3 { font-size: 1.1em; margin: 1.4em 0 0.7em; }',
		'p { margin: 0 0 1em; white-space: ' + ws + '; }',
		'blockquote { margin: 1em 2em; font-style: italic; }',
		'blockquote p { white-space: ' + ws + '; }',
		'ul, ol { margin: 0 0 1em 1.5em; }',
		'li { white-space: ' + ws + '; margin: 0 0 0.25em; }',
		'code { font-family: monospace; font-size: 0.95em; }',
		'hr { border: 0; border-top: 1px solid currentColor; width: 30%; margin: 2em auto; }',
		'a { color: inherit; }',
		'.title-page { text-align: center; }',
		'.title-page .book-title { font-size: 2em; margin-top: 25%; }',
		'.title-page .book-author { font-size: 1.2em; margin-top: 1em; }',
		'.title-page .book-series, .title-page .book-year { margin-top: 2em; }',
		'.rights-page { font-size: 0.9em; }',
		'.rights-page p { white-space: normal; }',
		'.cover-page { margin: 0; padding: 0; text-align: center; }',
		'.cover-page img { max-width: 100%; max-height: 100%; }',
		'',
	].join('\n');
}

function titlePage(f: FrontMatter, mode: LineBreaks): string {
	const b: string[] = ['<section class="title-page" epub:type="titlepage">'];
	b.push('<p class="book-title">' + esc(f.title) + '</p>');
	if (!blank(f.series)) b.push('<p class="book-series">' + esc(f.series as string) + '</p>');
	b.push('<p class="book-author">' + esc(f.author) + '</p>');
	if (!blank(f.publisher)) b.push('<p class="book-publisher">' + esc(f.publisher as string) + '</p>');
	if (!blank(f.year)) b.push('<p class="book-year">' + esc(f.year as string) + '</p>');
	if (!blank(f.epigraph)) b.push('<blockquote class="book-epigraph">' + impose(f.epigraph as string, mode).xhtml + '</blockquote>');
	if (!blank(f.dedication)) b.push('<div class="book-dedication">' + impose(f.dedication as string, mode).xhtml + '</div>');
	b.push('</section>');
	return b.join('\n');
}

function rightsBody(r: Rights, holderYear: string | undefined): string {
	const b: string[] = ['<section class="rights-page" epub:type="copyright-page">'];
	b.push('<p>&#169; ' + (blank(holderYear) ? '' : esc(holderYear as string) + ' ') + esc(r.holder) + '</p>');
	if (r.grants && r.grants.length) {
		b.push('<ul>');
		for (const g of r.grants) {
			const bits: string[] = [esc(g.name)];
			if (g.permits && g.permits.length) bits.push('permits ' + esc(g.permits.join(', ')));
			if (g.revocable === true) bits.push('revocable');
			if (g.revocable === false) bits.push('not revocable');
			if (g.exclusive === false) bits.push('non-exclusive');
			if (g.exclusive === true) bits.push('exclusive');
			b.push('<li>' + bits.join(' &#183; ') + '</li>');
		}
		b.push('</ul>');
	}
	if (r.split) {
		const parties: string[] = [];
		for (const k in r.split) parties.push(esc(k) + ' ' + String(r.split[k]));
		if (parties.length) b.push('<p>' + parties.join(' &#183; ') + '</p>');
	}
	if (!blank(r.notice)) b.push('<p>' + esc(r.notice as string) + '</p>');
	b.push('</section>');
	return b.join('\n');
}

function opf(
	f: FrontMatter,
	identifier: string,
	manifest: readonly { id: string; href: string; media: string; props: string }[],
	order: readonly string[],
	coverId: string | null
): string {
	const m: string[] = [];
	m.push(xmlHead());
	m.push('<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="' + esc(f.language) + '">\n');
	m.push('<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n');
	m.push('<dc:identifier id="book-id">' + esc(identifier) + '</dc:identifier>\n');
	m.push('<dc:title id="t">' + esc(f.title) + '</dc:title>\n');
	m.push('<dc:creator id="a">' + esc(f.author) + '</dc:creator>\n');
	m.push('<meta refines="#a" property="role" scheme="marc:relators">aut</meta>\n');
	m.push('<dc:language>' + esc(f.language) + '</dc:language>\n');
	if (!blank(f.publisher)) m.push('<dc:publisher>' + esc(f.publisher as string) + '</dc:publisher>\n');
	if (!blank(f.year)) m.push('<dc:date>' + esc(f.year as string) + '</dc:date>\n');
	if (f.rights && !blank(f.rights.holder)) m.push('<dc:rights>' + esc(f.rights.holder) + '</dc:rights>\n');
	if (!blank(f.series)) {
		m.push('<meta property="belongs-to-collection" id="c">' + esc(f.series as string) + '</meta>\n');
		m.push('<meta refines="#c" property="collection-type">series</meta>\n');
	}
	m.push('<meta property="dcterms:modified">' + esc(f.modified) + '</meta>\n');
	if (coverId) m.push('<meta name="cover" content="' + esc(coverId) + '"/>\n');
	m.push('</metadata>\n<manifest>\n');
	for (const it of manifest) {
		m.push('<item id="' + esc(it.id) + '" href="' + esc(it.href) + '" media-type="' + esc(it.media) + '"' +
			(it.props ? ' properties="' + esc(it.props) + '"' : '') + '/>\n');
	}
	m.push('</manifest>\n<spine toc="ncx">\n');
	for (const id of order) m.push('<itemref idref="' + esc(id) + '"/>\n');
	m.push('</spine>\n</package>\n');
	return m.join('');
}

function nav(lang: string, title: string, points: readonly { label: string; href: string }[]): string {
	const b: string[] = ['<nav epub:type="toc" id="toc"><h1>' + esc(title) + '</h1><ol>'];
	for (const p of points) b.push('<li><a href="' + esc(p.href) + '">' + esc(p.label) + '</a></li>');
	b.push('</ol></nav>');
	b.push('<nav epub:type="landmarks" id="landmarks" hidden="hidden"><ol>');
	if (points.length) b.push('<li><a epub:type="bodymatter" href="' + esc(points[0].href) + '">Begin reading</a></li>');
	b.push('</ol></nav>');
	return page(lang, title, b.join('\n'), 'nav-page');
}

function ncx(identifier: string, title: string, points: readonly { label: string; href: string }[]): string {
	const b: string[] = [];
	b.push(xmlHead());
	b.push('<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n');
	b.push('<head>\n<meta name="dtb:uid" content="' + esc(identifier) + '"/>\n');
	b.push('<meta name="dtb:depth" content="1"/>\n');
	b.push('<meta name="dtb:totalPageCount" content="0"/>\n');
	b.push('<meta name="dtb:maxPageNumber" content="0"/>\n</head>\n');
	b.push('<docTitle><text>' + esc(title) + '</text></docTitle>\n<navMap>\n');
	for (let i = 0; i < points.length; i += 1) {
		b.push('<navPoint id="np-' + pad3(i + 1) + '" playOrder="' + String(i + 1) + '">');
		b.push('<navLabel><text>' + esc(points[i].label) + '</text></navLabel>');
		b.push('<content src="' + esc(points[i].href) + '"/></navPoint>\n');
	}
	b.push('</navMap>\n</ncx>\n');
	return b.join('');
}

/** BIND — a manuscript, made into a book.
 *
 *  The return is an ORDERED FILE MAP, not a file: `mimetype` first and
 *  stored, then `META-INF/container.xml`, the package document, the EPUB 3
 *  nav, the NCX for older readers, the title page, the rights page, the
 *  chapters in the manuscript's own order, and the stylesheet last. The
 *  door writes it into a ZIP; this charter never touches a disk.
 *
 *  Nothing throws. A manuscript that cannot be bound comes back as a
 *  `Refusal` carrying one sentence.
 *
 *  @param ms         the manuscript
 *  @param options    the dialect and the container root
 *  @param endpaper   optional: hears each told line. Absent = silent. */
export function bind(ms: Manuscript, options?: BindOptions, endpaper?: Endpaper): Book | Refusal {
	const told: string[] = [];
	const tell = (line: string): void => {
		told.push(line);
		if (endpaper) endpaper(line);
	};

	if (!ms || !ms.front) return { refused: 'a binding needs a manuscript with front matter' };
	const f = ms.front;
	if (blank(f.title)) return { refused: 'a book needs a title on its title page — front.title is empty' };
	if (blank(f.author)) return { refused: 'a book needs an author — front.author is empty' };
	if (blank(f.language)) return { refused: 'a book needs a language tag (BCP-47, e.g. "en") — front.language is empty' };
	if (blank(f.modified)) {
		return {
			refused: 'EPUB 3 requires dcterms:modified and THIS WATER READS NO CLOCK — state front.modified as an ISO-8601 UTC stamp (the-now tells it). A guessed timestamp is a lie in a book’s own metadata.',
		};
	}
	if (!ms.chapters || ms.chapters.length === 0) {
		return { refused: 'a book needs at least one chapter — the manuscript carries none' };
	}
	for (let i = 0; i < ms.chapters.length; i += 1) {
		const c = ms.chapters[i];
		if (!c || typeof c.text !== 'string') {
			return { refused: 'chapter ' + String(i + 1) + ' carries no text — a chapter without text is not a chapter' };
		}
		if (blank(c.title)) {
			return { refused: 'chapter ' + String(i + 1) + ' has no title — the two tables of contents need one, and this water will not invent it from the text' };
		}
	}

	const mode: LineBreaks = options && options.lineBreaks ? options.lineBreaks : 'keep';
	const root = options && options.root ? options.root : 'OEBPS';

	let identifier: string;
	if (blank(f.identifier)) {
		identifier = 'urn:x-the-binder:' + slug(f.title) + ':' + slug(f.author);
		tell('no identifier stated — one was DERIVED from the title and the author, deterministically and with no randomness: ' + identifier + '. State front.identifier to carry your own.');
	} else {
		identifier = f.identifier as string;
	}

	if (mode === 'keep') {
		tell('line breaks KEPT — every source line break is set as <br/> and every line’s own spacing survives, because the first consumer is verse. Pass lineBreaks: "fold" for flowing prose.');
	} else {
		tell('line breaks FOLDED — lines are trimmed and joined by one space, the origin shelf’s own prose behaviour (standalone/markdown.ts). A stanza bound this way loses its line breaks.');
	}

	const files: BookFile[] = [];
	const manifest: { id: string; href: string; media: string; props: string }[] = [];
	const order: string[] = [];
	const points: { label: string; href: string }[] = [];

	// 1 · mimetype — FIRST, and STORED. The OCF's own rule.
	files.push({ path: 'mimetype', text: OCF_MIMETYPE, bytes: null, stored: true, mediaType: 'text/plain' });

	// 2 · META-INF/container.xml — the OCF's fixed address.
	files.push({
		path: 'META-INF/container.xml',
		text: xmlHead() +
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
			'<rootfiles>\n<rootfile full-path="' + esc(root) + '/content.opf" media-type="application/oebps-package+xml"/>\n' +
			'</rootfiles>\n</container>\n',
		bytes: null,
		stored: false,
		mediaType: 'application/xml',
	});

	// The cover — noted when absent, NEVER blocking.
	let coverId: string | null = null;
	const cover = f.cover;
	if (!cover) {
		tell('this manuscript carries no cover art — noted, and NOTHING is blocked by it (KP ⚛: "' + COVER_RULE + '")');
	} else if (!cover.bytes || cover.bytes.length === 0) {
		tell('cover art is NAMED (' + cover.href + ') but its bytes were not handed over — noted, the book binds without it, and nothing is blocked (KP ⚛: "' + COVER_RULE + '"). Any imagery of Jessica’s is her word alone (P-12, consent gate 3).');
	} else {
		coverId = 'cover-image';
		manifest.push({ id: coverId, href: cover.href, media: cover.mediaType, props: 'cover-image' });
		manifest.push({ id: 'cover', href: 'cover.xhtml', media: 'application/xhtml+xml', props: '' });
		order.push('cover');
		tell('cover art bound in: ' + cover.href + ' (' + String(cover.bytes.length) + ' bytes, ' + cover.mediaType + ')');
	}

	manifest.push({ id: 'nav', href: 'nav.xhtml', media: 'application/xhtml+xml', props: 'nav' });
	manifest.push({ id: 'ncx', href: 'toc.ncx', media: 'application/x-dtbncx+xml', props: '' });
	manifest.push({ id: 'css', href: 'styles.css', media: 'text/css', props: '' });
	manifest.push({ id: 'titlepage', href: 'title.xhtml', media: 'application/xhtml+xml', props: '' });
	order.push('titlepage');

	if (f.rights && !blank(f.rights.holder)) {
		manifest.push({ id: 'rightspage', href: 'rights.xhtml', media: 'application/xhtml+xml', props: '' });
		order.push('rightspage');
		const grants = f.rights.grants ? f.rights.grants.length : 0;
		tell('rights page bound from a block keyed to the-sphragis’ grant shape — holder "' + f.rights.holder + '", ' + String(grants) + ' grant(s). The shape was read as keys; nothing was imported, and no term was interpreted.');
	} else {
		tell('this manuscript carries no rights block — noted, and nothing is blocked. The book binds with no rights page at all rather than with a licence nobody declared.');
	}

	const chapterPaths: string[] = [];
	for (let i = 0; i < ms.chapters.length; i += 1) {
		const id = 'chap-' + pad3(i + 1);
		const href = 'chapter-' + pad3(i + 1) + '.xhtml';
		manifest.push({ id, href, media: 'application/xhtml+xml', props: '' });
		order.push(id);
		points.push({ label: ms.chapters[i].title, href });
		chapterPaths.push(root + '/' + href);
	}

	// 3 · the package document.
	files.push({
		path: root + '/content.opf',
		text: opf(f, identifier, manifest, order, coverId),
		bytes: null,
		stored: false,
		mediaType: 'application/oebps-package+xml',
	});

	// 4 · the EPUB 3 nav, and 5 · the NCX for older readers.
	files.push({
		path: root + '/nav.xhtml',
		text: nav(f.language, f.title, points),
		bytes: null,
		stored: false,
		mediaType: 'application/xhtml+xml',
	});
	files.push({
		path: root + '/toc.ncx',
		text: ncx(identifier, f.title, points),
		bytes: null,
		stored: false,
		mediaType: 'application/x-dtbncx+xml',
	});

	// 6 · the cover page and its art, if any.
	if (coverId && cover && cover.bytes) {
		files.push({
			path: root + '/cover.xhtml',
			text: page(f.language, f.title, '<section class="cover-page" epub:type="cover"><img src="' + esc(cover.href) + '" alt="' + esc(f.title) + '"/></section>', 'cover-page'),
			bytes: null,
			stored: false,
			mediaType: 'application/xhtml+xml',
		});
		files.push({ path: root + '/' + cover.href, text: null, bytes: cover.bytes, stored: false, mediaType: cover.mediaType });
	}

	// 7 · the title page and the rights page.
	files.push({
		path: root + '/title.xhtml',
		text: page(f.language, f.title, titlePage(f, mode), 'title-page'),
		bytes: null,
		stored: false,
		mediaType: 'application/xhtml+xml',
	});
	if (f.rights && !blank(f.rights.holder)) {
		files.push({
			path: root + '/rights.xhtml',
			text: page(f.language, f.title, rightsBody(f.rights, f.year), 'rights-page'),
			bytes: null,
			stored: false,
			mediaType: 'application/xhtml+xml',
		});
	}

	// 8 · the chapters, in the manuscript's own order.
	for (let i = 0; i < ms.chapters.length; i += 1) {
		const c = ms.chapters[i];
		const body = impose(c.text, mode);
		files.push({
			path: root + '/chapter-' + pad3(i + 1) + '.xhtml',
			text: page(f.language, c.title, '<section epub:type="chapter">\n' + body.xhtml + '\n</section>', 'chapter'),
			bytes: null,
			stored: false,
			mediaType: 'application/xhtml+xml',
		});
	}

	// 9 · the stylesheet.
	files.push({ path: root + '/styles.css', text: styles(mode), bytes: null, stored: false, mediaType: 'text/css' });

	tell('bound: ' + String(files.length) + ' files, ' + String(ms.chapters.length) + ' chapters, spine of ' + String(order.length) + ' — and not one character of the text was altered.');

	return { files, told, readingOrder: order, chapterPaths };
}

// ── PRINT-READY ─────────────────────────────────────────────────────────

/** The page, as a plan. Every number here is a DEFAULT this build chose
 *  and named — the trim size is the ordinary trade paperback, 6in by 9in,
 *  and the margins are the ordinary ones for it. His to re-rule; all of it
 *  is an input. */
export interface PagePlan {
	/** any CSS length pair, e.g. "6in 9in" or "148mm 210mm". */
	size?: string;
	marginTop?: string;
	marginBottom?: string;
	marginInner?: string;
	marginOuter?: string;
	/** running heads: the book title verso, the chapter title recto. */
	runningHeads?: boolean;
	pageNumbers?: boolean;
	/** the base type size for print. */
	fontSize?: string;
	fontFamily?: string;
}

export const PAGE_DEFAULT: Readonly<Required<PagePlan>> = {
	size: '6in 9in',
	marginTop: '0.875in',
	marginBottom: '0.875in',
	marginInner: '0.875in',
	marginOuter: '0.625in',
	runningHeads: true,
	pageNumbers: true,
	fontSize: '11pt',
	fontFamily: 'Georgia, "Times New Roman", serif',
};

export interface TypesetOptions {
	lineBreaks?: LineBreaks;
	page?: PagePlan;
}

/** TYPESET — a manuscript, made print-ready.
 *
 *  ONE self-contained HTML file carrying `@page` paged-media CSS: trim
 *  size, margins, running heads, page numbers, and a page break before
 *  every chapter. Honest about what that is: **a PDF engine is not in this
 *  house**, so print-ready here means paged HTML for whatever engine his
 *  hand chooses. This water does not make a PDF and does not pretend to.
 *
 *  Nothing throws; a manuscript that cannot be typeset comes back as a
 *  `Refusal`. */
export function typeset(ms: Manuscript, options?: TypesetOptions, endpaper?: Endpaper): string | Refusal {
	const tell = (line: string): void => {
		if (endpaper) endpaper(line);
	};
	if (!ms || !ms.front) return { refused: 'typesetting needs a manuscript with front matter' };
	const f = ms.front;
	if (blank(f.title)) return { refused: 'a book needs a title on its title page — front.title is empty' };
	if (blank(f.author)) return { refused: 'a book needs an author — front.author is empty' };
	if (!ms.chapters || ms.chapters.length === 0) {
		return { refused: 'a book needs at least one chapter — the manuscript carries none' };
	}

	const mode: LineBreaks = options && options.lineBreaks ? options.lineBreaks : 'keep';
	const p: Required<PagePlan> = {
		size: (options && options.page && options.page.size) || PAGE_DEFAULT.size,
		marginTop: (options && options.page && options.page.marginTop) || PAGE_DEFAULT.marginTop,
		marginBottom: (options && options.page && options.page.marginBottom) || PAGE_DEFAULT.marginBottom,
		marginInner: (options && options.page && options.page.marginInner) || PAGE_DEFAULT.marginInner,
		marginOuter: (options && options.page && options.page.marginOuter) || PAGE_DEFAULT.marginOuter,
		runningHeads: options && options.page && options.page.runningHeads !== undefined
			? options.page.runningHeads : PAGE_DEFAULT.runningHeads,
		pageNumbers: options && options.page && options.page.pageNumbers !== undefined
			? options.page.pageNumbers : PAGE_DEFAULT.pageNumbers,
		fontSize: (options && options.page && options.page.fontSize) || PAGE_DEFAULT.fontSize,
		fontFamily: (options && options.page && options.page.fontFamily) || PAGE_DEFAULT.fontFamily,
	};

	tell('typeset as PAGED HTML — ' + p.size + ', margins ' + p.marginTop + '/' + p.marginOuter +
		'/' + p.marginBottom + '/' + p.marginInner + '. A PDF engine is not in this house; this file is print-READY, not printed.');

	const heads = p.runningHeads;
	const nums = p.pageNumbers;
	const css: string[] = [
		'@page {',
		'  size: ' + p.size + ';',
		'  margin: ' + p.marginTop + ' ' + p.marginOuter + ' ' + p.marginBottom + ' ' + p.marginInner + ';',
		nums ? '  @bottom-center { content: counter(page); font-size: 9pt; }' : '',
		'}',
		'@page :left {',
		'  margin: ' + p.marginTop + ' ' + p.marginInner + ' ' + p.marginBottom + ' ' + p.marginOuter + ';',
		heads ? '  @top-center { content: string(book-title); font-size: 9pt; font-variant: small-caps; }' : '',
		'}',
		'@page :right {',
		heads ? '  @top-center { content: string(chapter-title); font-size: 9pt; font-variant: small-caps; }' : '',
		'}',
		'@page :first { @top-center { content: none; } @bottom-center { content: none; } }',
		'html { font-family: ' + p.fontFamily + '; font-size: ' + p.fontSize + '; }',
		'body { margin: 0; line-height: 1.4; text-align: justify; hyphens: none; }',
		// The running heads read their text from two off-page strings, so
		// NOTHING is inserted into the body: the chapter's printed pages
		// carry the author's text and nothing else, exactly as `bind` does.
		'.head-string { position: absolute; width: 0; height: 0; overflow: hidden; font-size: 0; }',
		'.book-title-string { string-set: book-title content(text); }',
		'.chapter-title-string { string-set: chapter-title content(text); }',
		'section.chapter { break-before: page; page-break-before: always; }',
		'h1, h2, h3, h4, h5, h6 { break-after: avoid; page-break-after: avoid; }',
		'p { margin: 0 0 0.9em; orphans: 2; widows: 2; white-space: ' + (mode === 'keep' ? 'pre-wrap' : 'normal') + '; }',
		'blockquote { margin: 1em 2em; font-style: italic; }',
		'ul, ol { margin: 0 0 1em 1.5em; }',
		'code { font-family: "Courier New", monospace; font-size: 0.95em; }',
		'hr { border: 0; border-top: 1px solid currentColor; width: 25%; margin: 1.6em auto; }',
		'a { color: inherit; text-decoration: none; }',
		'.title-page { text-align: center; break-after: page; page-break-after: always; }',
		'.title-page .book-title { font-size: 2.2em; margin-top: 30%; }',
		'.title-page .book-author { font-size: 1.2em; margin-top: 1.5em; }',
		'.rights-page { font-size: 0.85em; break-after: page; page-break-after: always; }',
		'.rights-page p, .title-page p { white-space: normal; }',
		'',
	];

	const b: string[] = [];
	b.push('<!DOCTYPE html>');
	b.push('<html lang="' + esc(blank(f.language) ? 'en' : f.language) + '">');
	b.push('<head>');
	b.push('<meta charset="utf-8"/>');
	b.push('<title>' + esc(f.title) + '</title>');
	b.push('<style>');
	b.push(css.filter((l) => l !== '').join('\n'));
	b.push('</style>');
	b.push('</head>');
	b.push('<body>');
	b.push('<span class="head-string book-title-string">' + esc(f.title) + '</span>');
	b.push('<section class="title-page">');
	b.push('<p class="book-title">' + esc(f.title) + '</p>');
	if (!blank(f.series)) b.push('<p class="book-series">' + esc(f.series as string) + '</p>');
	b.push('<p class="book-author">' + esc(f.author) + '</p>');
	if (!blank(f.publisher)) b.push('<p class="book-publisher">' + esc(f.publisher as string) + '</p>');
	if (!blank(f.year)) b.push('<p class="book-year">' + esc(f.year as string) + '</p>');
	if (!blank(f.epigraph)) b.push('<blockquote class="book-epigraph">' + impose(f.epigraph as string, mode).xhtml + '</blockquote>');
	if (!blank(f.dedication)) b.push('<div class="book-dedication">' + impose(f.dedication as string, mode).xhtml + '</div>');
	b.push('</section>');

	if (f.rights && !blank(f.rights.holder)) {
		b.push(rightsBody(f.rights, f.year));
	} else {
		tell('no rights block — the printed pages carry no rights page. Noted, never blocking.');
	}
	if (!f.cover) {
		tell('no cover art — noted, and NOTHING is blocked by it (KP ⚛: "' + COVER_RULE + '")');
	}

	for (const c of ms.chapters) {
		b.push('<section class="chapter">');
		b.push('<span class="head-string chapter-title-string">' + esc(c.title) + '</span>');
		b.push(impose(c.text, mode).xhtml);
		b.push('</section>');
	}
	b.push('</body>');
	b.push('</html>');
	b.push('');
	return b.join('\n');
}
