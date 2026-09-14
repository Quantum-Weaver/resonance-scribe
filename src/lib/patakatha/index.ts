// THE PATAKATHA — a script, set on the screen's own measure.
//
// पटकथा (paṭakathā), Sanskrit: a screenplay — literally the screen's story.
// The working name is KP's ⚛, and it lives in exactly two places — TOOL_NAME
// below, and the folder — so a rename is one edit and one `git mv`.
//
// A work and its parts go in — a title, a by-line, and each part's text — and
// out comes the script laid on the measure the format is built on: a title
// card, then pages of sluglines, action, character cues, parentheticals,
// dialogue and transitions, each at its own column, with the page count and
// the runtime.
//
// THE MEASURE IS THE WHOLE POINT. A screenplay page is a FIXED-PITCH page:
// 12-point Courier is ten characters to the inch and six lines to the inch, on
// US Letter with the trade's margins. Every count here is arithmetic on those
// four numbers and nothing is estimated — which is why this water counts pages
// where a paged-HTML water cannot: sixty columns by fifty-four lines, and one
// page runs one minute.
//
// AND NOT ONE CHARACTER OF THE AUTHOR'S TEXT IS ALTERED. Nothing here
// upper-cases a slugline, curls a quote or breaks a word. Upper case is how
// this grammar READS a line; it is never how it SETS one. Wrapping puts a long
// line's words on the next line and never inside one; a word longer than its
// column stands alone and overruns the column rather than being cut. Every
// element carries its byte offsets in the text it was read from and is a
// byte-exact slice of it, and every character no element covers is one of
// SEPARATORS — so a dropped line would show up as its own letters in a gap,
// and the proof would go FALSE.
//
// KP ⚛, verbatim, the word this water answers (resonance-chamber/desk/
// THE-AUTHORS-STUDIO.md:4-6):
//   "we have a need for it to be repurposed as a book, manuscript, article,
//    all the reasons an author might publish. all types formatting assistance"
//
// Zero cross-tool linkage. No clock, no disk, no network, no host global.
// Nothing throws: a script that cannot be set comes back as a Refusal.

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
export const EDITORIAL_LAW_AT =
	'resonance-chamber/constellation/weaver/mimirs-well/design-lineage/constellation/fable/lanes/records/2026-08-23-stretto-deals/GROUND.md:265 (P-12, THE PUBLISHING SHELF; first set down at the desk paper POTENTIALITIES.md:31, since retired)';

/** KP's ⚛ word this water answers, verbatim, with its address. */
export const THE_WORD =
	'we have a need for it to be repurposed as a book, manuscript, article, all the reasons an author might publish. all types formatting assistance';
export const THE_WORD_AT = 'resonance-chamber/desk/THE-AUTHORS-STUDIO.md:4-6';

/** What the spring holds beside this water, swept by name across the tool
 *  folders. Kept as data so the claim carries its own reason. */
export const NOTHING_STOOD =
	'The spring holds no other screenplay format. Swept by name, case-insensitively, across the 87 tool folders beside this one for screenplay, slugline, Fountain, Courier and teleplay: every hit is a code font stack (the-binder, the-pandulipi), a Welsh gloss (the-ffynnon), an emoji name (the-emoji-collector) or a courier (the-procession), and not one of them is a screenplay format.';

export const THE_LAWS: readonly Law[] = [
	{
		law: 'The text is never altered: no word is upper-cased, no word is broken, no line is respelled.',
		because: EDITORIAL_LAW + ' (' + EDITORIAL_LAW_AT + ')',
	},
	{
		law: 'Every element is a byte-exact slice of the source it was read from, at the offsets it carries.',
		because: 'A promise that text was not altered is worth nothing; an offset is checkable by anybody.',
	},
	{
		law: 'The characters no element covers are the blanks that part one element from the next — SEPARATORS, exported as data, and it is exactly a space, a tab, a carriage return and a newline.',
		because: 'If a line were ever dropped, its letters would stand in a gap and the proof would go FALSE. The loss is made visible instead of silent. The cut is SEPARATORS and nothing wider than it: a line ending in U+00A0, U+000B, U+000C, U+2028 or U+FEFF carries that character inside its element — a transition so ended reads as action — and a line of one of them alone is an element rather than a blank.',
	},
	{
		law: 'A word longer than its column stands alone on its line and overruns the column.',
		because: 'Breaking a word to fit a column is altering the text. The word is the author\'s and the column is the format\'s, and the author wins.',
	},
	{
		law: 'Upper case is how this grammar READS a slugline, a cue and a transition; it is never how it SETS one.',
		because: 'A lower-case line stays lower-case and is simply not a slugline. A formatter that shouts a line has edited it.',
	},
	{
		law: 'THE PAGE COUNT IS THE FORMAT\'S OWN and is counted here, and one page runs one minute.',
		because: 'A screenplay page is fixed-pitch: ten characters and six lines to the inch is arithmetic, not typesetting. Nothing is estimated and no engine is asked.',
	},
	{
		law: 'No (MORE) and no (CONT\'D) is written; a speech that crosses a page runs on.',
		because: 'Neither mark adds a line this count does not already hold, and a mark this water invents is a word the author did not write.',
	},
	{
		law: 'A part\'s title is not a screenplay element unless it is itself a scene heading, and every title left out is named rather than dropped in silence.',
		because: 'A chapter title has no place on a screenplay page, and a thing this water declines to set is said out loud so nobody has to go looking for the absence.',
	},
	{
		law: 'No clock, no randomness, no disk, no network, no host global, and nothing brought in from anywhere.',
		because: 'The same script sets to a byte-identical page forever, and a formatter that can write a file can overwrite yours.',
	},
	{
		law: 'Nothing throws. Every refusal is one plain sentence.',
		because: 'A formatter that crashes takes the run with it, and half a script is worse than none.',
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

// ── THE PAPER AND THE TYPE ──────────────────────────────────────────────

/** The six elements this format carries. */
export type ElementKind =
	| 'slugline'
	| 'action'
	| 'character'
	| 'parenthetical'
	| 'dialogue'
	| 'transition';

/** The paper and the type, in inches and in characters. Every count on a
 *  screenplay is arithmetic on these. */
export interface Measure {
	/** characters to the inch — 12-point Courier is 10. */
	cpi: number;
	/** lines to the inch — 12-point single-spaced is 6. */
	lpi: number;
	pageWidth: number;
	pageHeight: number;
	marginTop: number;
	marginBottom: number;
	marginLeft: number;
	marginRight: number;
	/** seconds one page runs. The format's own measure is one minute. */
	secondsPerPage: number;
}

/** US Letter, 12-point Courier, the trade's margins. */
export const US_LETTER: Readonly<Measure> = {
	cpi: 10,
	lpi: 6,
	pageWidth: 8.5,
	pageHeight: 11,
	marginTop: 1,
	marginBottom: 1,
	marginLeft: 1.5,
	marginRight: 1,
	secondsPerPage: 60,
};

/** Where each element sits, in inches from the paper's left edge, and how wide
 *  it runs. A transition is flush to the text block's right edge. */
export const INDENTS: Readonly<Record<ElementKind, { left: number; width: number }>> = {
	slugline: { left: 1.5, width: 6.0 },
	action: { left: 1.5, width: 6.0 },
	character: { left: 3.7, width: 3.3 },
	parenthetical: { left: 3.1, width: 2.0 },
	dialogue: { left: 2.5, width: 3.5 },
	transition: { left: 1.5, width: 6.0 },
};

/** Blank lines the format puts before each element when it does not open a
 *  page. A parenthetical and a line of dialogue sit against the name above. */
export const SPACE_BEFORE: Readonly<Record<ElementKind, number>> = {
	slugline: 2,
	action: 1,
	character: 1,
	parenthetical: 0,
	dialogue: 0,
	transition: 1,
};

/** The characters this format reads as structure and nothing else: the blank
 *  that parts one element from the next, and the space at either end of a line.
 *
 *  The dialect's teeth: a character of a source that is not inside an Element
 *  MUST be one of these. There is deliberately nothing else in it — this format
 *  consumes no mark of any kind, so every mark an author typed rides into an
 *  element whole. */
export const SEPARATORS = ' \t\r\n';

/** What parts one page from the next in the plain text out. */
export const PAGE_BREAK = '\f';

// ── the arithmetic, and no host global in it ────────────────────────────

/** Floor, by integer arithmetic. */
function floorOf(n: number): number {
	const whole = n - (n % 1);
	return n < 0 && whole !== n ? whole - 1 : whole;
}

/** Round half up, by the same arithmetic. */
function roundOf(n: number): number {
	return floorOf(n + 0.5);
}

/** Lines the text block holds: the paper less its margins, at the type's lines
 *  to the inch. */
export const linesPerPage = (m: Measure): number =>
	floorOf((m.pageHeight - m.marginTop - m.marginBottom) * m.lpi);

/** Characters the text block holds across. */
export const columns = (m: Measure): number =>
	floorOf((m.pageWidth - m.marginLeft - m.marginRight) * m.cpi);

/** Characters one element runs across. */
export const widthOf = (kind: ElementKind, m: Measure): number =>
	floorOf(INDENTS[kind].width * m.cpi);

/** Characters one element sits in from the text block's left edge. */
export const indentOf = (kind: ElementKind, m: Measure): number =>
	roundOf((INDENTS[kind].left - m.marginLeft) * m.cpi);

/** How many minutes a page count runs, at the measure. */
export const minutesOf = (pages: number, m: Measure = US_LETTER): number =>
	(pages * m.secondsPerPage) / 60;

// ── THE PAGE PLAN, AS DATA ──────────────────────────────────────────────

/** One element's place on the page, in inches and in characters. */
export interface ElementPlan {
	kind: ElementKind;
	/** inches from the paper's left edge, and inches across. */
	left: number;
	width: number;
	/** characters in from the text block's left edge, and characters across. */
	column: number;
	across: number;
	/** blank lines before it when it does not open a page. */
	spaceBefore: number;
}

/** The whole plan a page is set on, derived from one measure. */
export interface PagePlan {
	measure: Measure;
	/** characters across the text block. */
	columns: number;
	/** lines down the text block. */
	lines: number;
	secondsPerPage: number;
	elements: readonly ElementPlan[];
}

const KINDS: readonly ElementKind[] = [
	'slugline',
	'action',
	'character',
	'parenthetical',
	'dialogue',
	'transition',
];

/** The page plan for one measure: the same arithmetic the functions above run,
 *  handed over as data so it can be read rather than recomputed. */
export function planFor(m: Measure = US_LETTER): PagePlan {
	const elements: ElementPlan[] = [];
	for (const kind of KINDS) {
		elements.push({
			kind,
			left: INDENTS[kind].left,
			width: INDENTS[kind].width,
			column: indentOf(kind, m),
			across: widthOf(kind, m),
			spaceBefore: SPACE_BEFORE[kind],
		});
	}
	return {
		measure: m,
		columns: columns(m),
		lines: linesPerPage(m),
		secondsPerPage: m.secondsPerPage,
		elements,
	};
}

/** US Letter's plan: sixty columns by fifty-four lines, one page to the
 *  minute, and every element's column and width. */
export const PAGE_PLAN: Readonly<PagePlan> = planFor(US_LETTER);

// ── THE SOURCE, AND THE ELEMENTS CUT FROM IT ────────────────────────────

/** One text this water read, by the name it was handed under. Every element
 *  names the source it came from and carries its offsets into it. */
export interface TextSource {
	from: string;
	text: string;
}

/** One element of the script, and the byte-exact slice of the source it was
 *  read from. THE EDITORIAL LAW LIVES HERE: `text` is always exactly
 *  `source.text.slice(at, end)`. The elements ARE the runs — this water keeps
 *  no second bookkeeping of the author's characters. */
export interface Element {
	kind: ElementKind;
	/** the source's name. */
	from: string;
	at: number;
	end: number;
	text: string;
	/** 1-based, into that source's own lines. */
	line: number;
}

// ── THE READING ─────────────────────────────────────────────────────────

/** A scene heading opens with one of these and nothing else does. */
export const SCENE_OPENERS: readonly string[] = [
	'INT./EXT.',
	'EXT./INT.',
	'INT.',
	'EXT.',
	'EST.',
	'I/E.',
	'INT ',
	'EXT ',
];

/** A transition ends in one of these, or is one of these whole. */
export const TRANSITION_TAILS: readonly string[] = ['TO:', 'IN:', 'OUT:'];
export const TRANSITIONS_WHOLE: readonly string[] = ['FADE OUT.', 'FADE TO BLACK.', 'THE END'];

/** A line with no lower-case letter in it. A line of digits and punctuation
 *  alone is not a name and does not pass. The comparison is a READING: the
 *  upper-cased string is never written anywhere. */
const shouted = (s: string): boolean => /[A-Z]/.test(s) && s === s.toUpperCase();

/** A shouted line opening INT., EXT., EST. or I/E. */
export const isSlugline = (s: string): boolean =>
	SCENE_OPENERS.some((o) => s.toUpperCase().startsWith(o)) && shouted(s);

/** A shouted line ending TO:, IN: or OUT:, or reading FADE OUT. whole. */
export const isTransition = (s: string): boolean =>
	shouted(s) && (TRANSITION_TAILS.some((t) => s.endsWith(t)) || TRANSITIONS_WHOLE.indexOf(s) !== -1);

/** A character cue: shouted, short enough for its column, and answered by a
 *  line beneath it. `(V.O.)`, `(O.S.)` and `(CONT'D)` ride with the name. */
export const isCharacter = (s: string, next: string, m: Measure): boolean =>
	shouted(s) &&
	s.length <= widthOf('character', m) &&
	!s.endsWith(':') &&
	next.trim() !== '' &&
	!isSlugline(s);

/** A line wrapped in brackets. */
export const isParenthetical = (s: string): boolean => s.startsWith('(') && s.endsWith(')');

interface Line {
	/** the offset of the line's first character in the source. */
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

/** A line's own text, with the blank at either end cut away and the offsets
 *  kept true. Nothing but a SEPARATORS character is ever cut. */
function tighten(ln: Line): Line {
	let a = 0;
	let b = ln.text.length;
	while (a < b && SEPARATORS.indexOf(ln.text.charAt(a)) !== -1) a += 1;
	while (b > a && SEPARATORS.indexOf(ln.text.charAt(b - 1)) !== -1) b -= 1;
	return { at: ln.at + a, text: ln.text.slice(a, b) };
}

/**
 * A source → its elements, each carrying its byte offsets.
 *
 * THE GRAMMAR, stated rather than assumed:
 *   · a shouted line opening `INT.`, `EXT.`, `EST.` or `I/E.` is a SLUGLINE;
 *   · a shouted line ending `TO:`, `IN:` or `OUT:`, or reading `FADE OUT.`,
 *     is a TRANSITION;
 *   · a shouted line short enough for the name column with a non-blank line
 *     under it is a CHARACTER, and what follows it is DIALOGUE until a blank
 *     line ends the speech;
 *   · a line inside that speech wrapped in parentheses is a PARENTHETICAL;
 *   · everything else is ACTION.
 *
 * Blank lines separate; they are not elements. Nothing is thrown and nothing
 * is rewritten — a line this grammar does not recognise comes through as
 * action, whole.
 */
export function readElements(body: string, from: string, measure: Measure = US_LETTER): Element[] {
	const src = typeof body === 'string' ? body : '';
	const name = typeof from === 'string' ? from : '';
	const lines = toLines(src);
	const out: Element[] = [];
	let speaking = false;

	for (let i = 0; i < lines.length; i += 1) {
		const cut = tighten(lines[i]);
		const text = cut.text;
		if (text === '') {
			speaking = false;
			continue;
		}
		const next = i + 1 < lines.length ? lines[i + 1].text : '';
		const make = (kind: ElementKind): Element => ({
			kind,
			from: name,
			at: cut.at,
			end: cut.at + text.length,
			text,
			line: i + 1,
		});

		if (speaking) {
			out.push(make(isParenthetical(text) ? 'parenthetical' : 'dialogue'));
			continue;
		}
		if (isSlugline(text)) {
			out.push(make('slugline'));
			continue;
		}
		if (isTransition(text)) {
			out.push(make('transition'));
			continue;
		}
		if (isCharacter(text, next, measure)) {
			out.push(make('character'));
			speaking = true;
			continue;
		}
		out.push(make('action'));
	}
	return out;
}

// ── THE LAYOUT ──────────────────────────────────────────────────────────

/** Words onto lines of one column, breaking only at spaces. A word longer than
 *  the column stands alone and overruns it rather than being cut. */
export function wrap(text: string, width: number): string[] {
	if (width < 1) return [text];
	const out: string[] = [];
	let line = '';
	for (const word of text.split(/\s+/).filter((w) => w !== '')) {
		if (line === '') line = word;
		else if (line.length + 1 + word.length <= width) line += ' ' + word;
		else {
			out.push(line);
			line = word;
		}
	}
	if (line !== '') out.push(line);
	return out.length > 0 ? out : [''];
}

function spaces(n: number): string {
	return n > 0 ? ' '.repeat(n) : '';
}

/** One element's lines, indented and — for a transition — flush right. */
export function linesOf(el: Element, m: Measure = US_LETTER): string[] {
	const width = widthOf(el.kind, m);
	const rows = wrap(el.text, width);
	if (el.kind === 'transition') {
		const across = columns(m);
		return rows.map((r) => spaces(across - r.length) + r);
	}
	const pad = spaces(indentOf(el.kind, m));
	return rows.map((r) => pad + r);
}

/** One page: its lines, already indented. A page is never longer than the
 *  measure allows. The title card is page 0. */
export interface Page {
	number: number;
	lines: string[];
}

/**
 * Elements → pages.
 *
 * The rules, all of them:
 *   · a page holds exactly the lines the measure allows;
 *   · a blank line never opens a page — spacing at a page top is dropped;
 *   · a slugline never stands as a page's last line, and a character cue never
 *     stands as a page's last two lines: both move whole to the next.
 *
 * WHAT IT DOES NOT DO, said rather than discovered: it writes no `(MORE)` and
 * no `(CONT'D)`. A speech that runs past a page bottom simply runs on, and the
 * page count is right either way because neither mark adds a line this count
 * does not already hold.
 */
export function layout(elements: readonly Element[], m: Measure = US_LETTER): Page[] {
	const hold = linesPerPage(m);
	const pages: Page[] = [];
	let lines: string[] = [];
	const close = (): void => {
		pages.push({ number: pages.length + 1, lines });
		lines = [];
	};

	for (const el of elements) {
		const body = linesOf(el, m);
		const gap = lines.length === 0 ? 0 : SPACE_BEFORE[el.kind];
		// A slugline wants a line under it; a cue wants its first line of speech.
		const widow = el.kind === 'slugline' ? 1 : el.kind === 'character' ? 2 : 0;
		const want = body.length + widow < hold ? body.length + widow : hold;
		if (lines.length + gap + want > hold && lines.length > 0) {
			close();
		} else {
			for (let i = 0; i < gap; i += 1) lines.push('');
		}
		for (const row of body) {
			if (lines.length >= hold) close();
			lines.push(row);
		}
	}
	if (lines.length > 0) close();
	return pages;
}

/** The pages as plain text: each page's lines, pages parted by a form feed,
 *  which is the plain-text page break a printer already honours. */
export function asText(pages: readonly Page[]): string {
	return pages.map((p) => p.lines.join('\n')).join('\n' + PAGE_BREAK + '\n') + '\n';
}

// ── A BODY, SET AND COUNTED ─────────────────────────────────────────────

/** A body set on the measure: its elements, its pages, and its runtime. */
export interface Screenplay {
	elements: readonly Element[];
	pages: readonly Page[];
	/** every text the elements were read from, by name. */
	sources: readonly TextSource[];
	measure: Measure;
	/** every line of every page, blanks included. */
	lines: number;
	/** seconds the whole runs, at the measure's seconds to the page. */
	seconds: number;
	/** `m:ss`, from the same seconds. */
	runtime: string;
	/** what the layout did that a reader should know. */
	told: string[];
}

const mmss = (seconds: number): string => {
	const whole = roundOf(seconds);
	return floorOf(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
};

const many = (n: number): string => (n === 1 ? '' : 's');

/** Elements and their sources → the pages, the line count and the runtime. */
function compose(
	elements: readonly Element[],
	sources: readonly TextSource[],
	m: Measure
): Screenplay {
	const pages = layout(elements, m);
	const lines = pages.reduce((n, p) => n + p.lines.length, 0);
	const hold = linesPerPage(m);
	const seconds =
		pages.length === 0
			? 0
			: (pages.length - 1) * m.secondsPerPage +
				(pages[pages.length - 1].lines.length / hold) * m.secondsPerPage;

	const told: string[] = [
		'the measure: ' + m.cpi + ' characters and ' + m.lpi + ' lines to the inch on ' + m.pageWidth +
			'in by ' + m.pageHeight + 'in — ' + columns(m) + ' columns by ' + hold +
			' lines to the page, and one page runs ' + m.secondsPerPage + ' seconds.',
		elements.length + ' element' + many(elements.length) + ' over ' + pages.length +
			' page' + many(pages.length) + '.',
	];
	const long = elements.filter((el) =>
		el.text.split(/\s+/).some((w) => w.length > widthOf(el.kind, m))
	);
	if (long.length > 0) {
		told.push(
			long.length + ' element' + (long.length === 1 ? ' carries a word' : 's carry a word') +
				' longer than its column; ' + (long.length === 1 ? 'it stands' : 'they stand') +
				' alone on a line and overrun it. A word is never broken — the text is not altered to fit a page.'
		);
	}
	told.push('no (MORE) and no (CONT’D) is written; a speech that crosses a page runs on.');

	return { elements, pages, sources, measure: m, lines, seconds, runtime: mmss(seconds), told };
}

/** One body, read and set on the measure. */
export function screenplay(body: string, from: string, m: Measure = US_LETTER): Screenplay {
	const text = typeof body === 'string' ? body : '';
	const name = typeof from === 'string' ? from : '';
	return compose(readElements(text, name, m), [{ from: name, text }], m);
}

// ── THE TITLE CARD ──────────────────────────────────────────────────────

/** The title card: the title centred a third of the way down, the by-line
 *  under it. Nothing is invented — a work with no by-line gets no by-line, and
 *  no word is upper-cased or broken to fit the column. */
export function titlePage(title: string, byline: string | null, m: Measure = US_LETTER): Page {
	const hold = linesPerPage(m);
	const across = columns(m);
	const centre = (row: string): string => spaces(floorOf((across - row.length) / 2)) + row;
	const lines: string[] = [];
	for (let i = 0; i < floorOf(hold / 3); i += 1) lines.push('');
	for (const row of wrap(title, across)) lines.push(centre(row));
	if (byline !== null && typeof byline === 'string' && byline.trim() !== '') {
		lines.push('');
		lines.push('');
		lines.push(centre('written by'));
		lines.push('');
		for (const row of wrap(byline, across)) lines.push(centre(row));
	}
	return { number: 0, lines };
}

// ── A WHOLE WORK, AS A SCRIPT ───────────────────────────────────────────

/** The work's front matter: what the title card carries. Every other key rides
 *  whole and untouched. */
export interface WorkJson {
	title: string;
	/** the by-line under `written by`. Absent or null, there is no by-line and
	 *  none is invented. */
	byline?: string | null;
	[k: string]: unknown;
}

/** One part of the work: its name as it stands on disk, its own title, and its
 *  text, whole and untouched. */
export interface PartFile {
	name: string;
	/** the part's own title. A title that is itself a scene heading stands as
	 *  one; any other is not written into the pages, and that is TOLD. */
	title?: string;
	body: string;
	[k: string]: unknown;
}

/** A work and its parts, in the order the reader resolved. This water never
 *  sorts them — order is the caller's. */
export interface ScriptFolder {
	work: WorkJson;
	parts: readonly PartFile[];
}

export interface PatakathaOptions {
	/** the paper and the type. US Letter at 12-point Courier is the format; a
	 *  Measure is DATA and a consumer may hand another whole. */
	measure?: Measure;
	/** the title card. Default true. */
	titleCard?: boolean;
}

/** Every default, exported so they can be read rather than guessed. */
export const FORMAT_DEFAULT: Readonly<{ measure: Measure; titleCard: boolean }> = {
	measure: US_LETTER,
	titleCard: true,
};

/** A work bound as a script. The title card is the format's own and is NOT
 *  counted in the runtime — it carries no screen time. */
export interface Script {
	/** the title card, page 0. Null when it was not asked for. */
	title: Page | null;
	screenplay: Screenplay;
	/** the title card and every page, parted by form feeds. */
	text: string;
	/** every derivation and every honest absence, said out loud. */
	told: string[];
}

/**
 * PATAKATHA — a work and its parts in, a script on the format's own measure
 * out.
 *
 * A PART TITLE IS NOT A SCREENPLAY ELEMENT and is not written into the pages —
 * unless the title is itself a slugline, in which case it stands as one. Every
 * title left out is named in `told` rather than dropped in silence. A part with
 * an empty body contributes nothing.
 *
 * Pure: it reads no clock, touches no disk, brings in nothing, and holds no
 * filesystem surface at all — there is no path here by which a file of yours
 * could be written. Nothing throws; what cannot be set comes back as a Refusal
 * carrying one plain sentence.
 */
export function patakatha(
	folder: ScriptFolder,
	options?: PatakathaOptions,
	telling?: Telling
): Script | Refusal {
	const told: string[] = [];
	const tell = (line: string): void => {
		told.push(line);
		if (telling) telling(line);
	};

	if (!folder || typeof folder !== 'object' || !folder.work) {
		return { refused: 'setting a script needs { work, parts } — a title, a by-line and the parts to lay out' };
	}
	const work = folder.work;
	if (typeof work.title !== 'string' || work.title.trim() === '') {
		return { refused: 'a script needs a title on its title card — work.title is empty' };
	}
	const parts = folder.parts;
	if (!parts || !parts.length) {
		return { refused: 'a script needs at least one part — the folder carries none' };
	}

	const o = options || {};
	const m: Measure = o.measure && typeof o.measure === 'object' ? o.measure : FORMAT_DEFAULT.measure;
	const wantCard = o.titleCard === undefined ? FORMAT_DEFAULT.titleCard : !!o.titleCard;

	const elements: Element[] = [];
	const sources: TextSource[] = [];
	let skipped = 0;
	let empty = 0;

	for (const p of parts) {
		const name = typeof p.name === 'string' && p.name !== '' ? p.name : '(unnamed part)';
		const heading = typeof p.title === 'string' ? p.title : '';
		const body = typeof p.body === 'string' ? p.body : '';
		if (heading.trim() !== '') {
			if (isSlugline(heading.trim())) {
				const from = name + ' · title';
				sources.push({ from, text: heading });
				for (const el of readElements(heading, from, m)) elements.push(el);
			} else {
				skipped += 1;
			}
		}
		if (body.trim() === '') {
			empty += 1;
			continue;
		}
		sources.push({ from: name, text: body });
		for (const el of readElements(body, name, m)) elements.push(el);
	}

	if (elements.length === 0) {
		return { refused: 'a script needs at least one line of text — every part carries an empty body' };
	}

	const set = compose(elements, sources, m);
	const card = wantCard
		? titlePage(work.title, typeof work.byline === 'string' ? work.byline : null, m)
		: null;

	if (skipped > 0) {
		tell(
			skipped + ' part title' + (skipped === 1 ? ' is' : 's are') +
				' not written into the pages — a chapter title is not a screenplay element. A title that is itself a scene heading stands as one; these were not.'
		);
	}
	if (empty > 0) {
		tell(empty + ' part' + (empty === 1 ? ' has' : 's have') + ' no text and contributed nothing.');
	}
	if (card) {
		tell('the title page carries no screen time and is not counted in the runtime; it is written ahead of page 1.');
	} else {
		tell('no title card — asked for, and said.');
	}
	for (const line of set.told) tell(line);
	tell(
		set.pages.length + ' page' + many(set.pages.length) + ', running ' + set.runtime +
			' at one page to the minute.'
	);
	tell(
		'every element carries its byte offsets in the source it was read from and is a byte-exact slice of it; nothing is upper-cased and no word is broken.'
	);

	const body = asText(set.pages);
	return {
		title: card,
		screenplay: set,
		text: card ? card.lines.join('\n') + '\n' + PAGE_BREAK + '\n' + body : body,
		told,
	};
}

/** The working name, in one constant. The folder is the other place it stands,
 *  and no behaviour here depends on either. */
export const TOOL_NAME = 'the-patakatha';
