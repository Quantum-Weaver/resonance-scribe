// PROOF — THE SCREENPLAY FORMAT. 2026-09-13.
//
//   node .journals/proofs/2026-09-13-the-screenplay/screenplay.mjs
//
// from the repo root. Prints one TRUE or FALSE per claim and exits non-zero on
// any FALSE.
//
// IT RUNS THE REAL FILE. `src/lib/patakatha/index.ts` is imported here as
// itself — the mirror has no import of any kind, so Node strips the
// annotations and resolves nothing else. No `tsx`, no new dependency.
//
// THE FILE IS A MIRROR. Its truth stands in
// `../resonance-awen/tools/the-patakatha/src/index.ts`, and the last claim
// below is the two files' SHA256.
//
// WHAT IT CANNOT PROVE, said plainly:
//   · IT OPENS NO WINDOW. The desk's second pane and the bind's fourth road
//     are proven by their TEXT — that they call this water and print its
//     lines — not by a rendered room.
//   · IT WRITES NO BYTE. The road out goes through `$lib/host`, which is a
//     Tauri plugin call, and there is no Tauri here.
//   · WHETHER A PAGE TIMES TO A MINUTE ON A SCREEN. The measure is the
//     format's own and the arithmetic is checked below; a stopwatch against a
//     cut is nobody's proof but an editor's.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
	INDENTS,
	US_LETTER,
	asText,
	columns,
	indentOf,
	isRefusal,
	layout,
	linesOf,
	linesPerPage,
	minutesOf,
	patakatha,
	readElements,
	screenplay,
	titlePage,
	widthOf,
	wrap
} from '../../../src/lib/patakatha/index.ts';

let failed = false;
const claim = (name, ok) => {
	console.log(`${ok ? 'TRUE ' : 'FALSE'} — ${name}`);
	if (!ok) failed = true;
};

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
// The waters' own repo, a sibling of this one.
const AWEN = resolve(repo, '..', 'resonance-awen', 'tools');
const read_ = (...p) => readFileSync(join(repo, ...p), 'utf8');
const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// ── the sample ───────────────────────────────────────────────────────────

const SAMPLE = `INT. THE CHAMBER — NIGHT

A drone note has been sustained for a century. The ARCHIVIST stands at the loom.

ARCHIVIST
(quietly)
They always ask the same thing.

A new entity flickers into being.

NEW ENTITY
Where did we come from?

CUT TO:`;

console.log('── the measure ──');

const m = US_LETTER;
console.log(`      ${m.cpi} characters and ${m.lpi} lines to the inch on ${m.pageWidth}in by ${m.pageHeight}in`);
claim(
	`the text block runs ${columns(m)} columns — (${m.pageWidth} − ${m.marginLeft} − ${m.marginRight}) × ${m.cpi}`,
	columns(m) === 60
);
claim(
	`the text block holds ${linesPerPage(m)} lines — (${m.pageHeight} − ${m.marginTop} − ${m.marginBottom}) × ${m.lpi}`,
	linesPerPage(m) === 54
);
claim('one page runs one minute — the measure the format is built on', m.secondsPerPage === 60);
claim(`ten pages run ${minutesOf(10, m)} minutes`, minutesOf(10, m) === 10);

console.log('');
console.log('── the indents, in characters from the text block’s left edge ──');

for (const [kind, want] of [
	['slugline', 0],
	['action', 0],
	['dialogue', 10],
	['parenthetical', 16],
	['character', 22]
]) {
	console.log(`      ${kind} — ${INDENTS[kind].left}in in, ${INDENTS[kind].width}in wide → column ${indentOf(kind, m)}, ${widthOf(kind, m)} across`);
	claim(`${kind} sits at column ${want}`, indentOf(kind, m) === want);
}
claim(
	`a transition is flush to the right edge at column ${columns(m)}`,
	linesOf({ kind: 'transition', from: 'sample', at: 0, end: 7, text: 'CUT TO:', line: 1 }, m)[0] ===
		' '.repeat(columns(m) - 'CUT TO:'.length) + 'CUT TO:'
);

console.log('');
console.log('── the reading ──');

const els = readElements(SAMPLE, 'the sample', m);
console.log(`      ${els.map((e) => e.kind).join(' · ')}`);
claim(`the sample reads as ${els.length} elements`, els.length === 9);
claim(
	'every one of the six kinds is read, and in the order the sample stands',
	JSON.stringify(els.map((e) => e.kind)) ===
		JSON.stringify([
			'slugline',
			'action',
			'character',
			'parenthetical',
			'dialogue',
			'action',
			'character',
			'dialogue',
			'transition'
		])
);
claim('the slugline is the line that opens INT.', els[0].text.startsWith('INT.'));
claim('the parenthetical is the line inside the speech wrapped in brackets', els[3].text === '(quietly)');
claim(
	'a shouted line with a blank line under it is action, not a cue',
	readElements('LOUD LINE\n\nsomething else', 'a shout', m)[0].kind === 'action'
);
claim(
	'a line this grammar does not know comes through as action, whole',
	readElements('a plain line nobody claimed', 'a line', m)[0].text ===
		'a plain line nobody claimed'
);
claim(
	'every element names the source it was read from and the line it stood on',
	els.every((e) => e.from === 'the sample' && SAMPLE.split('\n')[e.line - 1].trim() === e.text)
);

console.log('');
console.log('── the text is never altered ──');

claim(
	'no element’s text differs from the line it was read from — nothing is upper-cased, nothing is trimmed into shape',
	els.every((e) => SAMPLE.slice(e.at, e.end) === e.text)
);
claim(
	'a lower-case slugline stays lower-case and is simply not a slugline',
	readElements('int. a room — day', 'a room', m)[0].kind === 'action' &&
		readElements('int. a room — day', 'a room', m)[0].text === 'int. a room — day'
);
claim(
	'wrapping breaks only at spaces — a word longer than the column stands alone',
	JSON.stringify(wrap('aaaa bbbbbbbbbbbb cc', 6)) === JSON.stringify(['aaaa', 'bbbbbbbbbbbb', 'cc'])
);
claim(
	'every wrapped line carries the same words, in the same order',
	wrap('one two three four five six seven', 11).join(' ') === 'one two three four five six seven'
);

console.log('');
console.log('── the pages ──');

const one = screenplay(SAMPLE, 'the sample', m);
console.log(`      the sample — ${one.pages.length} page, ${one.lines} lines, running ${one.runtime}`);
claim('the sample sets on one page', one.pages.length === 1);
claim(
	`it runs ${one.runtime} — ${one.lines} lines over ${linesPerPage(m)}, at a minute a page`,
	one.seconds === (one.lines / linesPerPage(m)) * m.secondsPerPage
);
claim(
	'the six kinds all landed where the indents say — the page reads as a screenplay',
	asText(one.pages).split('\n')[5] === ' '.repeat(22) + 'ARCHIVIST' &&
		asText(one.pages).split('\n')[6] === ' '.repeat(16) + '(quietly)' &&
		asText(one.pages).split('\n')[7] === ' '.repeat(10) + 'They always ask the same thing.'
);
claim('no page holds more lines than the measure allows', one.pages.every((p) => p.lines.length <= linesPerPage(m)));
claim('no page opens with a blank line', one.pages.every((p) => p.lines[0] !== ''));

// A body long enough to need pages: one action line, many times over.
const long = Array.from({ length: 120 }, (_, i) => `Action line number ${i + 1}.`).join('\n\n');
const many = screenplay(long, '120 action lines', m);
console.log(`      120 action lines — ${many.pages.length} pages, ${many.lines} lines, running ${many.runtime}`);
claim('120 spaced action lines set on 5 pages', many.pages.length === 5);
claim('no page of them holds more than the measure allows', many.pages.every((p) => p.lines.length <= linesPerPage(m)));
claim('none of them opens with a blank line', many.pages.every((p) => p.lines[0] !== ''));
claim(
	'every element of them landed on a page — 120 of 120',
	many.pages.flatMap((p) => p.lines).filter((l) => l.trim() !== '').length === 120
);
claim(`5 pages run ${minutesOf(5, m)} minutes by the measure`, minutesOf(many.pages.length, m) === 5);

const widowed = screenplay('Filler.\n\n'.repeat(26) + 'INT. A ROOM — DAY\n\nSomething happens.', 'a widow', m);
claim(
	'a slugline never stands as a page’s last line',
	widowed.pages.every((p) => !/^INT\./.test(p.lines[p.lines.length - 1] ?? ''))
);

claim('the rendered text parts its pages with a form feed', asText(many.pages).split('\f').length === many.pages.length);
claim(
	'an empty body sets no pages at all, and a whole work with no line of text in it comes back as one plain sentence rather than an empty script',
	screenplay('', 'nothing', m).pages.length === 0 &&
		isRefusal(patakatha({ work: { title: 'A Title' }, parts: [{ name: 'one', body: '   ' }] }))
);

console.log('');
console.log('── a whole work, bound ──');

const set = patakatha(
	{
		work: { title: 'The Atógáil', byline: 'KP, the Quantum Weaver' },
		parts: [
			{ name: 'one', title: 'INT. THE CHAMBER — NIGHT', body: 'A drone note.' },
			{ name: 'two', title: 'The Boy and the Door', body: SAMPLE },
			{ name: 'three', title: 'Nothing Written Yet', body: '' }
		]
	},
	{ measure: m }
);
if (isRefusal(set)) {
	console.log(`FALSE — the fixture sets as a script: ${set.refused}`);
	process.exit(1);
}
const bound = set;
console.log(`      ${bound.screenplay.pages.length} page after a title page, running ${bound.screenplay.runtime}`);
for (const line of bound.told) console.log(`      told: ${line}`);
claim('a part title that is itself a scene heading stands as one', bound.screenplay.elements[0].text === 'INT. THE CHAMBER — NIGHT');
claim('a part title that is not a scene heading is not written into the pages', !bound.text.includes('The Boy and the Door'));
claim('and it is named out loud rather than dropped in silence', bound.told.some((t) => t.includes('not written into the pages')));
claim('a part with no text is counted and told', bound.told.some((t) => t.includes('no text')));
claim('the title page carries the title', bound.title?.lines.join('\n').includes('The Atógáil'));
claim('the title page carries the by-line', bound.title?.lines.join('\n').includes('KP, the Quantum Weaver'));
claim('the title page is page 0 — no screen time, not counted in the runtime', bound.title?.number === 0);
claim('a work with no by-line gets no by-line', !titlePage('A Title', null, m).lines.join('\n').includes('written by'));
claim('the bound text opens with the title page and parts it with a form feed', bound.text.split('\f').length === bound.screenplay.pages.length + 1);

console.log('');
console.log('── where it is reached from ──');

const desk = read_('src', 'routes', 'desk', '+page.svelte');
claim('the drafting room calls this water', /\$lib\/patakatha/.test(desk));
claim('it offers the shape as a choice beside the prose preview', /shape === 'screenplay'/.test(desk));
claim('and it prints the laid-out lines as TEXT — no {@html} on that road', /<pre class="preview script">/.test(desk));
claim(
	'it shows the page count and the runtime, and says a refusal as the one plain sentence it is',
	/script\.screenplay\.pages\.length/.test(desk) &&
		/script\.screenplay\.runtime/.test(desk) &&
		/isRefusal\(reading\)/.test(desk) &&
		/<p class="quiet">\{refused\}<\/p>/.test(desk)
);

const bindRoom = read_('src', 'routes', 'bind', '+page.svelte');
claim(
	'the bind room carries the screenplay as a road of its own, and tests the refusal rather than an empty page count',
	/patakatha\(\{/.test(bindRoom) && /isScriptRefusal\(script\)/.test(bindRoom)
);
claim('the road stands beside the five that were already there — six ways out', /six ways/i.test(bindRoom));
claim('it reaches the disk through $lib/host like every other road', /writeNew\(chose\.path, script\.text\)/.test(bindRoom));
claim('it imports no plugin of its own', !/@tauri-apps\/plugin/.test(bindRoom));

const water = read_('src', 'lib', 'patakatha', 'index.ts');
claim('the water imports nothing at all — no dependency was added for it', !/^import /m.test(water));
claim(
	'the water stands at src/lib/patakatha/index.ts, and the room it was cut from does not',
	existsSync(join(repo, 'src', 'lib', 'patakatha', 'index.ts')) &&
		!existsSync(join(repo, 'src', 'lib', 'screenplay.ts'))
);

{
	const truth = join(AWEN, 'the-patakatha', 'src', 'index.ts');
	const mirror = join(repo, 'src', 'lib', 'patakatha', 'index.ts');
	const a = sha(truth);
	const b = sha(mirror);
	console.log(`      truth  ${a}  ../resonance-awen/tools/the-patakatha/src/index.ts`);
	console.log(`      mirror ${b}  src/lib/patakatha/index.ts`);
	claim("the-patakatha/src/index.ts — the mirror's SHA256 equals its truth's", a === b);
}

console.log('');
console.log(failed ? 'A CLAIM IS FALSE.' : 'Every claim TRUE.');
process.exit(failed ? 1 : 0);
