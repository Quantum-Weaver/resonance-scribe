// THE PANDULIPI — a manuscript, set for submission.
//
// पाण्डुलिपि (pāṇḍulipi), Sanskrit: a manuscript. The working name is KP's ⚛,
// and it lives in exactly two places — TOOL_NAME below, and the folder — so a
// rename is one edit and one `git mv`.
//
// A manuscript folder in the-binder's shape goes in — `book.json` plus the
// chapters' markdown — and ONE self-contained paged HTML comes out, set in the
// standard manuscript submission format: twelve-point monospace,
// double-spaced, one-inch margins, a running head on every page after the
// first, a title page carrying the contact block and the rounded word count,
// each chapter beginning a third of the way down a fresh page, scene breaks as
// a centred hash.
//
// AND NOT ONE CHARACTER OF THE AUTHOR'S TEXT IS ALTERED. That is the whole
// carefulness of this water, and it is the-binder's law carried over whole:
// every literal run of the source is recorded with its byte offsets and is a
// byte-exact slice of the source, and every character the runs do not cover is
// one of MARKUP_MARKS — so a dropped word would show up as its own letters in
// a gap, and the proof would go FALSE.
//
// KP ⚛, verbatim, the word this water answers (resonance-chamber/desk/
// THE-AUTHORS-STUDIO.md:6-7):
//   "we have a need for it to be repurposed as a book, manuscript, article,
//    all the reasons an author might publish. all types formatting assistance"
//
// Zero cross-tool linkage. No clock, no disk, no network, no host global.
// Nothing throws: a manuscript that cannot be set comes back as a Refusal.

// ── THE LAWS, AS DATA ───────────────────────────────────────────────────

/** One law of this water, and the reason beside it. */
export interface Law {
	law: string;
	because: string;
}

/** THE EDITORIAL LAW, quoted whole, with its address. Exported so the proofs
 *  stand on the law and not on a paraphrase of it. */
export const EDITORIAL_LAW =
	'Editorial law: verbatim-vs-light-touch is KP\'s ruling per line; typos are fingerprints unless he says otherwise.';

/** Where that sentence stands. */
export const EDITORIAL_LAW_AT = 'resonance-chamber/desk/POTENTIALITIES.md:31 (P-12, THE PUBLISHING SHELF)';

/** KP's ⚛ word this water answers, verbatim, with its address. */
export const THE_WORD =
	'we have a need for it to be repurposed as a book, manuscript, article, all the reasons an author might publish. all types formatting assistance';
export const THE_WORD_AT = 'KP ⚛ 2026-09-02 · resonance-chamber/desk/THE-AUTHORS-STUDIO.md:6-7';

/** What the house held before this water, checked by a read-only scout on
 *  2026-09-02: nothing. Kept as data so the claim carries its own reason. */
export const NOTHING_STOOD =
	'The house had no standard manuscript submission format before this water. Swept 2026-09-02 for Shunn, MLA and Chicago across the tools, the papers and the library: no hit, anywhere.';

export const THE_LAWS: readonly Law[] = [
	{
		law: 'The text is never altered.',
		because: EDITORIAL_LAW + ' (' + EDITORIAL_LAW_AT + ')',
	},
	{
		law: 'Every literal run set into the page is recorded with its byte offsets and is a byte-exact slice of the chapter it came from.',
		because: 'A promise that text was not altered is worth nothing; an offset is checkable by anybody.',
	},
	{
		law: 'The characters no run covers are markup and nothing else — MARKUP_MARKS, exported as data.',
		because: 'If a word were ever dropped, its letters would stand in a gap and the proof would go FALSE. The loss is made visible instead of silent.',
	},
	{
		law: 'Markdown this dialect does not set is left as its own characters, never dropped and never mended.',
		because: 'An unpaired asterisk is a fingerprint too. A formatter that quietly tidies is a formatter that quietly edits.',
	},
	{
		law: 'The output is PAGED HTML. A PDF engine is not in this house.',
		because: 'the-binder ruled it first and the ruling holds: paged HTML with @page CSS is honest about what stands here, and it composes with whatever engine his hand chooses.',
	},
	{
		law: 'The page count is the print engine’s to count. `pages` is declared on the result and is always absent.',
		because: 'This water does not typeset glyphs, does not hyphenate and does not kern, so it does not know where a page ends. A number invented here would be a lie with a type on it.',
	},
	{
		law: 'The running head is placed by CSS, never computed per page.',
		because: 'The head is one @page margin box with a counter in it; the engine counts. No page of body text carries a head this water wrote into it.',
	},
	{
		law: 'No clock, no randomness, no disk, no network, no host global, and nothing brought in from anywhere.',
		because: 'The same manuscript sets to a byte-identical page forever, and a formatter that can write a file can overwrite yours.',
	},
	{
		law: 'Nothing throws. Every refusal is one plain sentence.',
		because: 'A formatter that crashes takes the run with it, and half a manuscript is worse than none.',
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

/** The telling sink. Absent, nothing is emitted anywhere; the told lines still
 *  land on the result, which is always filled. */
export type Telling = (line: string) => void;

// ── THE MANUSCRIPT, IN THE-BINDER'S SHAPE ───────────────────────────────

/** `book.json` — the front matter of a manuscript folder. Four fields are
 *  read here; every other key rides whole and untouched. */
export interface BookJson {
	title: string;
	/** the name the author writes under — the by-line beneath the title. */
	author: string;
	/** the running head's surname. Absent, it is taken as the last
	 *  whitespace-separated word of `author`, and that is TOLD. */
	surname?: string;
	/** the running head's short title. Absent, it is taken from `title` —
	 *  a leading article dropped, up to three words kept — and that is TOLD.
	 *  It is upper-cased BY CSS and never in the text. */
	shortTitle?: string;
	/** the contact block, top-left of the title page: one line per entry,
	 *  set verbatim, in the order given. Nothing is looked up and nothing is
	 *  invented — an address this water was not handed does not appear. */
	contact?: readonly string[];
	/** BCP-47, e.g. "en". Absent, "en". */
	language?: string;
	[k: string]: unknown;
}

/** One chapter file of the folder: its name as it stands on disk, and its
 *  markdown, whole and untouched. */
export interface ChapterFile {
	name: string;
	markdown: string;
	[k: string]: unknown;
}

/** A manuscript folder, read: `book.json` and the chapters in the order the
 *  reader resolved. This water never sorts them — order is the caller's. */
export interface ManuscriptFolder {
	book: BookJson;
	chapters: readonly ChapterFile[];
}

/** One literal run of the author's text, with its byte offsets in the chapter
 *  it came from. THE EDITORIAL LAW LIVES HERE: `text` is always exactly
 *  `chapter.markdown.slice(at, end)`. */
export interface SourceRun {
	/** the chapter file's name. */
	from: string;
	at: number;
	end: number;
	text: string;
	/** `body` — prose set into the page. `title` — a chapter's own heading,
	 *  set as its title block. Both are the author's characters. */
	kind: 'body' | 'title';
}

/** THE MARKUP MARKS — every character this dialect may consume as structure.
 *  The editorial law's teeth: a character of a chapter that is not inside a
 *  SourceRun MUST be one of these.
 *
 *  `#` heading and scene break · `*` `_` emphasis and scene break ·
 *  `>` block quote · space, tab, CR and LF.
 *
 *  There is deliberately nothing else in it. This dialect sets no links, no
 *  code spans, no lists, no tables and no images — so their characters are
 *  never consumed, and a line carrying them is set as ordinary text, whole. */
export const MARKUP_MARKS = '#*_> \t\r\n';

// ── THE FORMAT ──────────────────────────────────────────────────────────

/** The two page sizes, as the `@page size` value each takes. Adding a third
 *  is one entry; nothing else in the sheet knows about paper. */
export const PAPER: Readonly<Record<'us-letter' | 'a4', string>> = {
	'us-letter': '8.5in 11in',
	a4: '210mm 297mm',
};

export type Paper = 'us-letter' | 'a4';

/** Where an author's line breaks go. `fold` — a paragraph's source lines are
 *  joined by ONE space, which is the prose reading and the default. `keep` —
 *  every source line break becomes a break on the page, which is the reading
 *  verse needs. Neither touches a run: a newline is markup either way. */
export type LineBreaks = 'fold' | 'keep';

export interface PandulipiOptions {
	/** 'us-letter' (default) or 'a4'. It switches the `@page size` VALUE and
	 *  nothing else in the whole sheet. */
	paper?: Paper;
	/** the font stack, Courier named first. It is DATA and a consumer may
	 *  override it whole — the format asks for monospace, not for one foundry. */
	fontFamily?: string;
	/** the type size. Twelve points is the format. */
	fontSize?: string;
	/** the page margin, all four sides. One inch is the format. */
	margin?: string;
	/** the line height. Two is double-spaced, and that is the format. */
	lineHeight?: string;
	/** the paragraph's first-line indent. Half an inch is the format. */
	indent?: string;
	/** how far down a fresh page a chapter's title sits. */
	chapterDrop?: string;
	/** how far down the title page the title sits. */
	titleDrop?: string;
	/** 'italic' (default, the modern convention) or 'underline' (what an
	 *  editor's copy once needed). It switches ONE CSS rule; the HTML is
	 *  the same either way. */
	emphasis?: 'italic' | 'underline';
	/** what a scene break is set as. A hash is the format. */
	sceneBreak?: string;
	/** the running head, on every page after the first. Default true. */
	runningHead?: boolean;
	/** the title page. Default true. */
	titlePage?: boolean;
	/** what the rounded word count is rounded to. A hundred is the
	 *  convention; a long novel is often rounded to a thousand. */
	roundWordsTo?: number;
	lineBreaks?: LineBreaks;
}

/** Every default, exported so they can be read rather than guessed. */
export const FORMAT_DEFAULT: Readonly<{
	paper: Paper;
	fontFamily: string;
	fontSize: string;
	margin: string;
	lineHeight: string;
	indent: string;
	chapterDrop: string;
	titleDrop: string;
	emphasis: 'italic' | 'underline';
	sceneBreak: string;
	runningHead: boolean;
	titlePage: boolean;
	roundWordsTo: number;
	lineBreaks: LineBreaks;
}> = {
	paper: 'us-letter',
	fontFamily: 'Courier, "Courier New", "Courier Prime", "Nimbus Mono PS", monospace',
	fontSize: '12pt',
	margin: '1in',
	lineHeight: '2',
	indent: '0.5in',
	chapterDrop: '33%',
	titleDrop: '33%',
	emphasis: 'italic',
	sceneBreak: '#',
	runningHead: true,
	titlePage: true,
	roundWordsTo: 100,
	lineBreaks: 'fold',
};

/** A manuscript, set. `pages` is declared and ALWAYS ABSENT — see the law. */
export interface Submission {
	/** one self-contained paged HTML. */
	html: string;
	/** whitespace-split tokens across every literal run: the exact count. */
	wordCount: number;
	/** the same count rounded to the nearest hundred (half up) — what the
	 *  title page carries, because that is the convention. */
	roundedWordCount: number;
	/** the running head as one readable string, the page number as the word
	 *  `page` where the CSS counter stands. */
	head: string;
	/** every literal run, chapter by chapter, in source order. */
	runs: readonly SourceRun[];
	/** every chapter's resolved title, in order. */
	titles: readonly string[];
	/** every derivation and every honest absence, said out loud. */
	told: readonly string[];
	/** THE PAGE COUNT IS THE PRINT ENGINE'S. Declared so a reader sees the
	 *  absence is deliberate; never set, by any path. */
	pages?: undefined;
}

// ── the small helpers ───────────────────────────────────────────────────

function blank(s: unknown): boolean {
	return typeof s !== 'string' || s.trim() === '';
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function attr(s: string): string {
	return esc(s).replace(/"/g, '&quot;');
}

/** A letter or a digit, for the underscore guard. ASCII plus anything the
 *  case tables move — enough to keep `snake_case_name` out of italics. */
function wordish(ch: string): boolean {
	if (ch === '') return false;
	if (ch >= '0' && ch <= '9') return true;
	return ch.toLowerCase() !== ch.toUpperCase();
}

/** Round half up to the nearest `to`, by integer arithmetic — no Math, so
 *  there is no host global anywhere in this file. */
function roundTo(n: number, to: number): number {
	if (!to || to < 1) return n;
	const neg = n < 0;
	const m = neg ? -n : n;
	const rem = m % to;
	const up = rem * 2 >= to;
	const r = m - rem + (up ? to : 0);
	return neg ? -r : r;
}

/** 1200 → "1,200". Written out because a locale-aware formatter is a clock
 *  by another name: it reads a setting this water may not see. */
function grouped(n: number): string {
	const neg = n < 0;
	const digits = String(neg ? -n : n);
	let out = '';
	for (let i = 0; i < digits.length; i += 1) {
		const fromEnd = digits.length - i;
		out += digits.charAt(i);
		if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += ',';
	}
	return (neg ? '-' : '') + out;
}

// ── the dialect ─────────────────────────────────────────────────────────
//
// Paragraphs · *italic* and _italic_ · **bold** · a scene break as a line
// of its own (`#`, `***`, `* * *`) · a heading as the chapter's title, and
// only when it is the chapter's first non-blank line · consecutive `>` lines
// as one indented block. NOTHING ELSE IS INVENTED, and a line the dialect does
// not know is set as ordinary text, whole and byte-preserved.

interface Line {
	/** the offset of the line's first character in the chapter. */
	at: number;
	/** the line without its trailing carriage return. */
	text: string;
}

function toLines(src: string): Line[] {
	const out: Line[] = [];
	let at = 0;
	while (at <= src.length) {
		let nl = src.indexOf('\n', at);
		if (nl === -1) nl = src.length;
		let end = nl;
		if (end > at && src.charAt(end - 1) === '\r') end -= 1;
		out.push({ at, text: src.slice(at, end) });
		if (nl === src.length) break;
		at = nl + 1;
	}
	return out;
}

const SCENE_LINE = /^[ \t]*(?:#|\*[ \t]*\*[ \t]*\*)[ \t]*$/;
const HEADING_LINE = /^[ \t]*#{1,6}[ \t]+\S/;
const QUOTE_LINE = /^[ \t]*>/;

/** The inline scanner. Emits HTML into `out` and pushes every literal run,
 *  in source order, into `runs`. `base` is where `s` begins in the chapter. */
function inline(
	s: string,
	base: number,
	from: string,
	kind: 'body' | 'title',
	runs: SourceRun[],
	out: string[]
): void {
	let i = 0;
	let runStart = 0;
	const flush = (to: number): void => {
		if (to <= runStart) return;
		const text = s.slice(runStart, to);
		runs.push({ from, at: base + runStart, end: base + to, text, kind });
		out.push(esc(text));
	};
	while (i < s.length) {
		const c = s.charAt(i);
		if (c === '*' && s.charAt(i + 1) === '*') {
			const j = s.indexOf('**', i + 2);
			if (j > i + 2) {
				flush(i);
				out.push('<strong>');
				inline(s.slice(i + 2, j), base + i + 2, from, kind, runs, out);
				out.push('</strong>');
				i = j + 2;
				runStart = i;
				continue;
			}
		}
		if (c === '*' || c === '_') {
			// The underscore carries a guard so `snake_case_name` is a name and
			// not an emphasis. The asterisk needs none: nobody writes a*b*c and
			// means multiplication in prose.
			const okOpen = c === '*' || !wordish(i === 0 ? '' : s.charAt(i - 1));
			const j = okOpen ? s.indexOf(c, i + 1) : -1;
			const okClose = j > i + 1 && (c === '*' || !wordish(s.charAt(j + 1)));
			if (j > i + 1 && okClose) {
				flush(i);
				out.push('<em>');
				inline(s.slice(i + 1, j), base + i + 1, from, kind, runs, out);
				out.push('</em>');
				i = j + 1;
				runStart = i;
				continue;
			}
		}
		i += 1;
	}
	flush(s.length);
}

/** One paragraph's lines, set. `fold` joins them with a single space; `keep`
 *  breaks them. Either way no run is touched — a newline is markup. */
function setLines(lines: Line[], from: string, mode: LineBreaks, runs: SourceRun[]): string {
	const out: string[] = [];
	for (let i = 0; i < lines.length; i += 1) {
		if (i > 0) out.push(mode === 'keep' ? '<br/>' : ' ');
		inline(lines[i].text, lines[i].at, from, 'body', runs, out);
	}
	return out.join('');
}

interface SetChapter {
	html: string;
	title: string;
	titleFromName: boolean;
}

function setChapter(
	ch: ChapterFile,
	sceneBreak: string,
	mode: LineBreaks,
	runs: SourceRun[]
): SetChapter {
	const src = typeof ch.markdown === 'string' ? ch.markdown : '';
	const from = typeof ch.name === 'string' ? ch.name : '';
	const lines = toLines(src);
	const body: string[] = [];

	let i = 0;
	let title = '';
	let titleFromName = true;

	// The chapter's title: the first heading line, and ONLY when it is the
	// chapter's first non-blank line. It is consumed into the title block —
	// which is printed — so no character is lost. A heading anywhere else is
	// set as ordinary text with its hashes intact.
	let firstContent = 0;
	while (firstContent < lines.length && lines[firstContent].text.trim() === '') firstContent += 1;
	if (firstContent < lines.length && HEADING_LINE.test(lines[firstContent].text)) {
		const raw = lines[firstContent].text;
		const cut = /^[ \t]*#{1,6}[ \t]+/.exec(raw);
		const off = cut ? cut[0].length : 0;
		let end = raw.length;
		while (end > off && (raw.charAt(end - 1) === ' ' || raw.charAt(end - 1) === '\t')) end -= 1;
		const bits: string[] = [];
		inline(raw.slice(off, end), lines[firstContent].at + off, from, 'title', runs, bits);
		title = bits.join('');
		titleFromName = false;
		i = firstContent + 1;
	}

	let para: Line[] = [];
	const flushPara = (): void => {
		if (para.length === 0) return;
		body.push('<p>' + setLines(para, from, mode, runs) + '</p>');
		para = [];
	};

	while (i < lines.length) {
		const ln = lines[i];
		if (ln.text.trim() === '') {
			flushPara();
			i += 1;
			continue;
		}
		if (SCENE_LINE.test(ln.text)) {
			flushPara();
			body.push('<p class="scene-break">' + esc(sceneBreak) + '</p>');
			i += 1;
			continue;
		}
		if (QUOTE_LINE.test(ln.text)) {
			flushPara();
			const inner: Line[] = [];
			while (i < lines.length && QUOTE_LINE.test(lines[i].text)) {
				const raw = lines[i].text;
				const cut = /^[ \t]*>[ \t]?/.exec(raw);
				const off = cut ? cut[0].length : 0;
				inner.push({ at: lines[i].at + off, text: raw.slice(off) });
				i += 1;
			}
			body.push('<blockquote><p>' + setLines(inner, from, mode, runs) + '</p></blockquote>');
			continue;
		}
		para.push(ln);
		i += 1;
	}
	flushPara();

	if (titleFromName) title = esc(from.replace(/\.md$/i, ''));

	return { html: body.join('\n'), title, titleFromName };
}

// ── the derivations, each of them told ──────────────────────────────────

const ARTICLES = ['a', 'an', 'the'];

function deriveSurname(author: string): string {
	const bits = author.trim().split(/\s+/);
	return bits.length === 0 ? author.trim() : bits[bits.length - 1];
}

function deriveShortTitle(title: string): string {
	let bits = title.trim().split(/\s+/);
	if (bits.length > 1 && ARTICLES.indexOf(bits[0].toLowerCase()) !== -1) bits = bits.slice(1);
	return bits.slice(0, 3).join(' ');
}

/** THE AUTHOR'S TEXT, AND NOTHING ELSE — a chapter's literal runs put back
 *  together in source order. Two runs are joined by ONE space when the markup
 *  between them held any whitespace, and by nothing when it did not: so
 *  `**decided**,` comes back as `decided,` — one word, the way an author
 *  counts it — while two paragraphs stay two words apart. */
export function plain(source: string, runs: readonly SourceRun[]): string {
	let out = '';
	let prevEnd = -1;
	for (const r of runs) {
		if (prevEnd >= 0 && /\s/.test(source.slice(prevEnd, r.at))) out += ' ';
		out += r.text;
		prevEnd = r.end;
	}
	return out;
}

/** THE COUNTING RULE, said once and used everywhere: a WORD is a maximal run
 *  of non-whitespace characters in the author's own text — that is, in
 *  `plain()` of a chapter. Markup this dialect consumed is not a word; a
 *  chapter's own heading IS, because it is set on the page; a title taken from
 *  a FILE NAME is not, because the author did not write it. */
export function countWords(source: string, runs: readonly SourceRun[]): number {
	let n = 0;
	for (const b of plain(source, runs).split(/\s+/)) if (b !== '') n += 1;
	return n;
}

// ── THE SHEET ───────────────────────────────────────────────────────────

function sheet(
	paper: Paper,
	fontFamily: string,
	fontSize: string,
	margin: string,
	lineHeight: string,
	indent: string,
	chapterDrop: string,
	titleDrop: string,
	emphasis: 'italic' | 'underline',
	head: string,
	runningHead: boolean
): string[] {
	// THE ONE LINE PAPER TOUCHES. Everything below is identical on either
	// sheet — proven, and it is why the paper option is honest.
	const lines: string[] = [
		'@page {',
		'  size: ' + PAPER[paper] + ';',
		'  margin: ' + margin + ';',
	];
	if (runningHead) {
		lines.push(
			'  @top-right {',
			'    content: "' + attr(head) + ' " counter(page);',
			'    font-family: ' + fontFamily + ';',
			'    font-size: ' + fontSize + ';',
			'    text-transform: uppercase;',
			'  }'
		);
	}
	lines.push('}');
	if (runningHead) {
		// The first page of a manuscript carries no head. That is the format.
		lines.push('@page :first { @top-right { content: none; } }');
	}
	lines.push(
		'html { font-family: ' + fontFamily + '; font-size: ' + fontSize + '; }',
		'body { margin: 0; line-height: ' + lineHeight + '; text-align: left; hyphens: none; -webkit-hyphens: none; }',
		'p { margin: 0; text-indent: ' + indent + '; }',
		'section.title-page { break-after: page; page-break-after: always; }',
		'section.title-page p { text-indent: 0; }',
		'.contact { float: left; text-align: left; line-height: 1; white-space: pre-line; }',
		'.word-count { float: right; text-align: right; line-height: 1; }',
		'.title-block { clear: both; padding-top: ' + titleDrop + '; text-align: center; }',
		'.title-block .byline { margin-top: ' + lineHeight + 'em; }',
		'section.chapter { break-before: page; page-break-before: always; }',
		'.chapter-title { padding-top: ' + chapterDrop + '; text-align: center; text-indent: 0; font-size: ' + fontSize + '; font-weight: normal; margin: 0; }',
		'.scene-break { text-align: center; text-indent: 0; }',
		'blockquote { margin: 0 0 0 ' + indent + '; }',
		'blockquote p { text-indent: 0; }',
		emphasis === 'underline'
			? 'em { font-style: normal; text-decoration: underline; }'
			: 'em { font-style: italic; }',
		'strong { font-weight: bold; }'
	);
	return lines;
}

// ── THE DOOR ────────────────────────────────────────────────────────────

/** PANDULIPI — a manuscript folder in, one paged HTML out, set in the
 *  standard manuscript submission format.
 *
 *  Pure: it reads no clock, touches no disk, brings in nothing, and holds no
 *  filesystem surface at all — there is no path here by which a file of yours
 *  could be written. Nothing throws; what cannot be set comes back as a
 *  Refusal carrying one plain sentence. */
export function pandulipi(
	manuscript: ManuscriptFolder,
	options?: PandulipiOptions,
	telling?: Telling
): Submission | Refusal {
	const told: string[] = [];
	const tell = (line: string): void => {
		told.push(line);
		if (telling) telling(line);
	};

	if (!manuscript || typeof manuscript !== 'object' || !manuscript.book) {
		return { refused: 'setting a manuscript needs { book, chapters } — the-binder’s own folder shape' };
	}
	const book = manuscript.book;
	if (blank(book.title)) return { refused: 'a manuscript needs a title on its title page — book.title is empty' };
	if (blank(book.author)) return { refused: 'a manuscript needs an author — book.author is empty' };
	const chapters = manuscript.chapters;
	if (!chapters || !chapters.length) {
		return { refused: 'a manuscript needs at least one chapter — the folder carries none' };
	}

	const o = options || {};
	const paper: Paper = o.paper === 'a4' ? 'a4' : FORMAT_DEFAULT.paper;
	const fontFamily = blank(o.fontFamily) ? FORMAT_DEFAULT.fontFamily : (o.fontFamily as string);
	const fontSize = blank(o.fontSize) ? FORMAT_DEFAULT.fontSize : (o.fontSize as string);
	const margin = blank(o.margin) ? FORMAT_DEFAULT.margin : (o.margin as string);
	const lineHeight = blank(o.lineHeight) ? FORMAT_DEFAULT.lineHeight : (o.lineHeight as string);
	const indent = blank(o.indent) ? FORMAT_DEFAULT.indent : (o.indent as string);
	const chapterDrop = blank(o.chapterDrop) ? FORMAT_DEFAULT.chapterDrop : (o.chapterDrop as string);
	const titleDrop = blank(o.titleDrop) ? FORMAT_DEFAULT.titleDrop : (o.titleDrop as string);
	const emphasis = o.emphasis === 'underline' ? 'underline' : FORMAT_DEFAULT.emphasis;
	const sceneBreak = typeof o.sceneBreak === 'string' && o.sceneBreak !== '' ? o.sceneBreak : FORMAT_DEFAULT.sceneBreak;
	const runningHead = o.runningHead === undefined ? FORMAT_DEFAULT.runningHead : !!o.runningHead;
	const titlePage = o.titlePage === undefined ? FORMAT_DEFAULT.titlePage : !!o.titlePage;
	const roundWordsTo =
		typeof o.roundWordsTo === 'number' && o.roundWordsTo >= 1 ? o.roundWordsTo : FORMAT_DEFAULT.roundWordsTo;
	const mode: LineBreaks = o.lineBreaks === 'keep' ? 'keep' : FORMAT_DEFAULT.lineBreaks;

	tell(
		'set on ' + paper + ' (' + PAPER[paper] + '), ' + fontSize + ' monospace, line-height ' + lineHeight +
			', ' + margin + ' margins, first-line indent ' + indent + '. Paper switches the @page size VALUE and nothing else.'
	);

	// the running head
	const surname = blank(book.surname) ? deriveSurname(book.author) : (book.surname as string);
	if (blank(book.surname)) {
		tell('surname taken as the last word of the by-line — "' + surname + '". State book.surname to carry your own.');
	}
	const shortTitle = blank(book.shortTitle) ? deriveShortTitle(book.title) : (book.shortTitle as string);
	if (blank(book.shortTitle)) {
		tell(
			'short title taken from the title — "' + shortTitle +
				'" (a leading article dropped, three words kept). State book.shortTitle to carry your own.'
		);
	}
	const head = surname + ' / ' + shortTitle + ' /';
	if (runningHead) {
		tell(
			'the running head is "' + head + ' page", placed by ONE @page margin box with a CSS counter and upper-cased by CSS, ' +
				'never written into the body and never counted here — the engine counts the pages.'
		);
	} else {
		tell('no running head — asked for, and said.');
	}

	// the chapters
	const runs: SourceRun[] = [];
	const bodies: string[] = [];
	const titles: string[] = [];
	let wordCount = 0;
	for (const ch of chapters) {
		const local: SourceRun[] = [];
		const set = setChapter(ch, sceneBreak, mode, local);
		wordCount += countWords(typeof ch.markdown === 'string' ? ch.markdown : '', local);
		for (const r of local) runs.push(r);
		titles.push(set.title);
		if (set.titleFromName) {
			tell('"' + ch.name + '" opens with no heading — its title is the file’s own name, "' + set.title + '".');
		}
		bodies.push(
			'<section class="chapter">\n<h1 class="chapter-title">' + set.title + '</h1>\n' + set.html + '\n</section>'
		);
	}

	const roundedWordCount = roundTo(wordCount, roundWordsTo);
	tell(
		'word count ' + grouped(wordCount) + ' — whitespace-split tokens across the author’s literal runs, markup excluded. ' +
			'The title page carries it rounded to the nearest ' + grouped(roundWordsTo) + ': ' + grouped(roundedWordCount) + '.'
	);
	tell('the page count is the print engine’s — `pages` is declared on the result and is never set. A PDF engine is not in this house.');

	// the page
	const b: string[] = [];
	b.push('<!DOCTYPE html>');
	b.push('<html lang="' + attr(blank(book.language) ? 'en' : (book.language as string)) + '">');
	b.push('<head>');
	b.push('<meta charset="utf-8"/>');
	b.push('<title>' + esc(book.title) + '</title>');
	b.push('<style>');
	b.push(
		sheet(paper, fontFamily, fontSize, margin, lineHeight, indent, chapterDrop, titleDrop, emphasis, head, runningHead).join('\n')
	);
	b.push('</style>');
	b.push('</head>');
	b.push('<body>');

	if (titlePage) {
		b.push('<section class="title-page">');
		const contact = book.contact && book.contact.length ? book.contact : null;
		if (contact) {
			b.push('<div class="contact">' + contact.map((l) => esc(String(l))).join('<br/>') + '</div>');
		} else {
			b.push('<div class="contact"></div>');
			tell('no contact block — the title page carries an empty one, and nothing was looked up or invented. Noted, never blocking.');
		}
		b.push('<div class="word-count">about ' + grouped(roundedWordCount) + ' words</div>');
		b.push('<div class="title-block">');
		b.push('<p class="title">' + esc(book.title) + '</p>');
		b.push('<p class="byline">by ' + esc(book.author) + '</p>');
		b.push('</div>');
		b.push('</section>');
	} else {
		tell('no title page — asked for, and said.');
	}

	for (const body of bodies) b.push(body);

	b.push('</body>');
	b.push('</html>');
	b.push('');

	return {
		html: b.join('\n'),
		wordCount,
		roundedWordCount,
		head: head + ' page',
		runs,
		titles,
		told,
	};
}

/** The working name, in one constant. The folder is the other place it
 *  stands, and no behaviour here depends on either. */
export const TOOL_NAME = 'the-pandulipi';
