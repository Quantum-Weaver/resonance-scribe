// THE SCREENPLAY — a part's text read as sluglines, action, dialogue and
// transitions, laid out on the measure the format is built on.
//
// THE MEASURE IS THE WHOLE POINT. A screenplay page is a FIXED-PITCH page:
// 12pt Courier is ten characters to the inch and six lines to the inch, on
// US Letter with the trade's margins. Every count below is arithmetic on
// those four numbers and nothing is estimated — which is why this file may
// count pages where `the-pandulipi` declares it cannot. Its `pages` is
// always absent because paged HTML is measured by a print engine; a
// screenplay is measured by the format itself, and one page runs one minute.
//
// THE TEXT IS NEVER ALTERED. Nothing here upper-cases a slugline, curls a
// quote, trims a line or breaks a word. Wrapping puts a long line's words on
// the next line and never inside one; a word longer than its column stands
// alone and overruns the column rather than being cut. Text is never
// upper-cased or respelled. No Fountain parser is used; the measure is
// written out below.

/** The six elements this format carries. */
export type ElementKind =
	| 'slugline'
	| 'action'
	| 'character'
	| 'parenthetical'
	| 'dialogue'
	| 'transition';

/** One element, with the line of the source it was read from. */
export interface Element {
	kind: ElementKind;
	text: string;
	/** 1-based, into the body this was read from. */
	at: number;
}

/** The paper and the type, in inches and in characters. Every count on a
 *  screenplay is arithmetic on these. */
export interface Measure {
	/** characters to the inch — 12pt Courier is 10. */
	cpi: number;
	/** lines to the inch — 12pt single-spaced is 6. */
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

/** US Letter, 12pt Courier, the trade's margins. */
export const US_LETTER: Readonly<Measure> = {
	cpi: 10,
	lpi: 6,
	pageWidth: 8.5,
	pageHeight: 11,
	marginTop: 1,
	marginBottom: 1,
	marginLeft: 1.5,
	marginRight: 1,
	secondsPerPage: 60
};

/** Where each element sits, in inches from the paper's left edge, and how
 *  wide it runs. A transition is flush to the text block's right edge. */
export const INDENTS: Readonly<Record<ElementKind, { left: number; width: number }>> = {
	slugline: { left: 1.5, width: 6.0 },
	action: { left: 1.5, width: 6.0 },
	character: { left: 3.7, width: 3.3 },
	parenthetical: { left: 3.1, width: 2.0 },
	dialogue: { left: 2.5, width: 3.5 },
	transition: { left: 1.5, width: 6.0 }
};

/** Blank lines the format puts before each element when it does not open a
 *  page. A parenthetical and a line of dialogue sit against the name above. */
const SPACE_BEFORE: Readonly<Record<ElementKind, number>> = {
	slugline: 2,
	action: 1,
	character: 1,
	parenthetical: 0,
	dialogue: 0,
	transition: 1
};

/** Lines the text block holds: the paper less its margins, at the type's
 *  lines to the inch. */
export const linesPerPage = (m: Measure): number =>
	Math.floor((m.pageHeight - m.marginTop - m.marginBottom) * m.lpi);

/** Characters the text block holds across. */
export const columns = (m: Measure): number =>
	Math.floor((m.pageWidth - m.marginLeft - m.marginRight) * m.cpi);

/** Characters one element runs across. */
export const widthOf = (kind: ElementKind, m: Measure): number =>
	Math.floor(INDENTS[kind].width * m.cpi);

/** Characters one element sits in from the text block's left edge. */
export const indentOf = (kind: ElementKind, m: Measure): number =>
	Math.round((INDENTS[kind].left - m.marginLeft) * m.cpi);

// ── THE READING ──────────────────────────────────────────────────────────

/** A scene heading opens with one of these and nothing else does. */
const SCENE_OPENERS = ['INT./EXT.', 'EXT./INT.', 'INT.', 'EXT.', 'EST.', 'I/E.', 'INT ', 'EXT '];

/** A transition ends in one of these, or is one of these whole. */
const TRANSITION_TAILS = ['TO:', 'IN:', 'OUT:'];
const TRANSITIONS_WHOLE = ['FADE OUT.', 'FADE TO BLACK.', 'THE END'];

/** A line with no lower-case letter in it. A line of digits and punctuation
 *  alone is not a name and does not pass. */
const shouted = (s: string): boolean => /[A-Z]/.test(s) && s === s.toUpperCase();

const isSlugline = (s: string): boolean =>
	SCENE_OPENERS.some((o) => s.toUpperCase().startsWith(o)) && shouted(s);

const isTransition = (s: string): boolean =>
	shouted(s) && (TRANSITION_TAILS.some((t) => s.endsWith(t)) || TRANSITIONS_WHOLE.includes(s));

/** A character cue: shouted, short enough for its column, and answered by a
 *  line beneath it. `(V.O.)`, `(O.S.)` and `(CONT'D)` ride with the name. */
const isCharacter = (s: string, next: string, m: Measure): boolean =>
	shouted(s) &&
	s.length <= widthOf('character', m) &&
	!s.endsWith(':') &&
	next.trim() !== '' &&
	!isSlugline(s);

const isParenthetical = (s: string): boolean => s.startsWith('(') && s.endsWith(')');

/**
 * A body → its elements.
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
export function read(body: string, measure: Measure = US_LETTER): Element[] {
	const lines = body.replace(/\r\n/g, '\n').split('\n');
	const out: Element[] = [];
	let speaking = false;

	for (let i = 0; i < lines.length; i += 1) {
		const raw = lines[i];
		const text = raw.trim();
		if (text === '') {
			speaking = false;
			continue;
		}
		const next = i + 1 < lines.length ? lines[i + 1] : '';

		if (speaking) {
			out.push({ kind: isParenthetical(text) ? 'parenthetical' : 'dialogue', text, at: i + 1 });
			continue;
		}
		if (isSlugline(text)) {
			out.push({ kind: 'slugline', text, at: i + 1 });
			continue;
		}
		if (isTransition(text)) {
			out.push({ kind: 'transition', text, at: i + 1 });
			continue;
		}
		if (isCharacter(text, next, measure)) {
			out.push({ kind: 'character', text, at: i + 1 });
			speaking = true;
			continue;
		}
		out.push({ kind: 'action', text, at: i + 1 });
	}
	return out;
}

// ── THE LAYOUT ───────────────────────────────────────────────────────────

/** Words onto lines of one column, breaking only at spaces. A word longer
 *  than the column stands alone and overruns it rather than being cut. */
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

/** One element's lines, indented and — for a transition — flush right. */
export function linesOf(el: Element, m: Measure): string[] {
	const width = widthOf(el.kind, m);
	const rows = wrap(el.text, width);
	if (el.kind === 'transition') {
		const across = columns(m);
		return rows.map((r) => ' '.repeat(Math.max(0, across - r.length)) + r);
	}
	const pad = ' '.repeat(indentOf(el.kind, m));
	return rows.map((r) => pad + r);
}

/** One page: its lines, already indented, and the elements that landed on
 *  it. A page is never longer than the measure allows. */
export interface Page {
	number: number;
	lines: string[];
}

export interface Screenplay {
	elements: Element[];
	pages: Page[];
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
	const whole = Math.round(seconds);
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

/**
 * Elements → pages.
 *
 * The rules, all of them:
 *   · a page holds exactly the lines the measure allows;
 *   · a blank line never opens a page — spacing at a page top is dropped;
 *   · a slugline never stands as a page's last line, and a character cue
 *     never stands as a page's last two lines: both move whole to the next.
 *
 * WHAT IT DOES NOT DO, said rather than discovered: it writes no `(MORE)`
 * and no `(CONT'D)`. A speech that runs past a page bottom simply runs on,
 * and the page count is right either way because neither mark adds a line
 * this count does not already hold.
 */
export function layout(elements: readonly Element[], m: Measure = US_LETTER): Page[] {
	const hold = linesPerPage(m);
	const pages: Page[] = [];
	let lines: string[] = [];
	const close = () => {
		pages.push({ number: pages.length + 1, lines });
		lines = [];
	};

	for (const el of elements) {
		const body = linesOf(el, m);
		const gap = lines.length === 0 ? 0 : SPACE_BEFORE[el.kind];
		// A slugline wants a line under it; a cue wants its first line of speech.
		const widow = el.kind === 'slugline' ? 1 : el.kind === 'character' ? 2 : 0;
		if (lines.length + gap + Math.min(body.length + widow, hold) > hold && lines.length > 0) {
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

/** A body, formatted and counted. */
export function format(body: string, m: Measure = US_LETTER): Screenplay {
	const elements = read(body, m);
	const pages = layout(elements, m);
	const lines = pages.reduce((n, p) => n + p.lines.length, 0);
	const hold = linesPerPage(m);
	const seconds =
		pages.length === 0
			? 0
			: (pages.length - 1) * m.secondsPerPage +
				(pages[pages.length - 1].lines.length / hold) * m.secondsPerPage;

	const told: string[] = [
		`the measure: ${m.cpi} characters and ${m.lpi} lines to the inch on ${m.pageWidth}in by ${m.pageHeight}in — ${columns(m)} columns by ${hold} lines to the page, and one page runs ${m.secondsPerPage} seconds.`,
		`${elements.length} element${elements.length === 1 ? '' : 's'} over ${pages.length} page${pages.length === 1 ? '' : 's'}.`
	];
	const long = elements.filter((el) =>
		el.text.split(/\s+/).some((w) => w.length > widthOf(el.kind, m))
	);
	if (long.length > 0) {
		told.push(
			`${long.length} element${long.length === 1 ? ' carries a word' : 's carry a word'} longer than its column; ${long.length === 1 ? 'it stands' : 'they stand'} alone on a line and overrun it. A word is never broken — the text is not altered to fit a page.`
		);
	}
	told.push('no (MORE) and no (CONT’D) is written; a speech that crosses a page runs on.');

	return { elements, pages, measure: m, lines, seconds, runtime: mmss(seconds), told };
}

/** The pages as plain text: each page's lines, pages parted by a form feed,
 *  which is the plain-text page break a printer already honours. */
export function render(sp: Screenplay): string {
	return sp.pages.map((p) => p.lines.join('\n')).join('\n\f\n') + '\n';
}

/** How many minutes a page count runs, at the measure. */
export const minutesOf = (pages: number, m: Measure = US_LETTER): number =>
	(pages * m.secondsPerPage) / 60;

// ── A WHOLE WORK, AS A SCREENPLAY ────────────────────────────────────────

/** One part on the way out: its title and its body, as the base holds them. */
export interface Leaf {
	title: string;
	body: string;
}

/** A work bound as a screenplay. The title page is the format's own and is
 *  NOT counted in the runtime — it carries no screen time. */
export interface Bound {
	title: Page;
	screenplay: Screenplay;
	text: string;
	told: string[];
}

/** The title page: the title centred a third of the way down, the by-line
 *  under it. Nothing is invented — a work with no by-line gets no by-line. */
export function titlePage(title: string, byline: string | null, m: Measure = US_LETTER): Page {
	const hold = linesPerPage(m);
	const across = columns(m);
	const centre = (s: string): string =>
		' '.repeat(Math.max(0, Math.floor((across - s.length) / 2))) + s;
	const lines: string[] = [];
	for (let i = 0; i < Math.floor(hold / 3); i += 1) lines.push('');
	for (const row of wrap(title, across)) lines.push(centre(row));
	if (byline !== null && byline.trim() !== '') {
		lines.push('');
		lines.push('');
		lines.push(centre('written by'));
		lines.push('');
		for (const row of wrap(byline, across)) lines.push(centre(row));
	}
	return { number: 0, lines };
}

/**
 * Every part's body, in the order given, as one screenplay.
 *
 * A PART TITLE IS NOT A SCREENPLAY ELEMENT and is not written into the
 * pages — unless the title is itself a slugline, in which case it stands as
 * one. Every title left out is named in `told` rather than dropped in
 * silence. A part with an empty body contributes nothing.
 */
export function bindScreenplay(
	work: { title: string; byline: string | null },
	parts: readonly Leaf[],
	m: Measure = US_LETTER
): Bound {
	const told: string[] = [];
	const pieces: string[] = [];
	let skipped = 0;
	let empty = 0;

	for (const p of parts) {
		const title = p.title.trim();
		if (title !== '' && isSlugline(title)) pieces.push(title);
		else if (title !== '') skipped += 1;
		if (p.body.trim() === '') {
			empty += 1;
			continue;
		}
		pieces.push(p.body);
	}

	const screenplay = format(pieces.join('\n\n'), m);
	const title = titlePage(work.title, work.byline, m);

	if (skipped > 0) {
		told.push(
			`${skipped} part title${skipped === 1 ? ' is' : 's are'} not written into the pages — a chapter title is not a screenplay element. A title that is itself a scene heading stands as one; these were not.`
		);
	}
	if (empty > 0) {
		told.push(`${empty} part${empty === 1 ? ' has' : 's have'} no text and contributed nothing.`);
	}
	told.push(
		'the title page carries no screen time and is not counted in the runtime; it is written ahead of page 1.'
	);
	for (const line of screenplay.told) told.push(line);
	told.push(
		`${screenplay.pages.length} page${screenplay.pages.length === 1 ? '' : 's'}, running ${screenplay.runtime} at one page to the minute.`
	);

	return {
		title,
		screenplay,
		text: title.lines.join('\n') + '\n\f\n' + render(screenplay),
		told
	};
}
