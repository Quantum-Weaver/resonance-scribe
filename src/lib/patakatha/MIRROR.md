# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-14, the screenplay format's single editable truth is:

    ../resonance-awen/tools/the-patakatha/src/index.ts

Do not edit index.ts in THIS folder - it is a byte-faithful mirror
(SHA256 verified at the copy: 9C00BA6C0DF13011), to be refreshed by
distribution runs as the house's delivery pipeline stands up, the same road
cosmic, the-binder, the-pandulipi, the-cumdach, the-epagoge and the-panti
already travel. Format changes - the measure, the six elements, the indents,
the spacing, the widow rules, the runtime - happen in the water.

WHAT CROSSED, AND WHAT DID NOT. `src/index.ts` alone. The water's
`verify.mjs` did NOT cross: it is a node proof runner - it imports `node:fs`
and the water's own `dist`, and it reads a folder from disk. Its `fixture/`
(a `work.json` and one text file per part, on disk) did not cross either, nor
did `dist/`: this app builds its own TypeScript and reaches the disk through
`src/lib/host.ts` and nowhere else. The mirror itself has zero imports of any
kind, reads no clock, and holds no filesystem surface.

WHY THIS REALM CONSUMES IT: two rooms of the studio set a screenplay. The
desk's second pane reads the part in hand as a script - the `Screenplay 🎬`
shape beside `Prose`, which shows the laid pages, the page count and the
runtime while the author types. The bind room's fourth road writes one - a
whole work, every part in order, title card and pages, out as plain text with
a form feed between pages. A screenplay format is a format any realm might
set, so it is the spring's and not this room's, and the arithmetic that feeds
both rooms is one arithmetic.

THE PAGE COUNT IS MEASURED HERE, WHICH IS WHERE THIS WATER PARTS FROM
THE-PANDULIPI. That water sets paged HTML and its `pages` is declared and
always absent, because only a print engine can measure it. This one is
fixed-pitch: ten characters and six lines to the inch on US Letter with the
trade's margins is sixty columns by fifty-four lines, exactly, so the pages
are counted and the runtime follows at one page to the minute. The same
author, the other destination; they share a ruling and not a line of code.

THE NAME MAP - this format's first standing in this realm is
`src/lib/screenplay.ts`, whose arithmetic the water carries unchanged and
whose names it does not:

| `src/lib/screenplay.ts` | `src/lib/patakatha/index.ts` |
|---|---|
| `format(body, m)` | `screenplay(body, from, m)` - one body, and it names its source |
| `bindScreenplay(work, parts, m)` | `patakatha({ work, parts }, options?, telling?)` - the whole work, and the door |
| `render(sp)` | `asText(pages)` - takes the pages, not the Screenplay |
| `read(body, m)` | `readElements(body, from, m)` |
| `Bound` | `Script`, whose `title` is `Page \| null` |
| `Leaf { title, body }` | `PartFile { name, title?, body }` - `name` is the part as it stands on disk |
| `Element.at` (the 1-based line) | `Element.line`; `at` and `end` are byte offsets and `from` names the source |
| `Screenplay` | `Screenplay`, with `sources` added |
| `SPACE_BEFORE` (local) | `SPACE_BEFORE` (exported) |
| `SCENE_OPENERS`, `TRANSITION_TAILS`, `TRANSITIONS_WHOLE`, `isSlugline`, `isTransition`, `isCharacter`, `isParenthetical` (local) | all exported |
| - | `SEPARATORS`, the alphabet: a space, a tab, a carriage return, a newline, and nothing else |
| - | `Measure` as data: `PAGE_PLAN`, `planFor`, `FORMAT_DEFAULT`, `PatakathaOptions` |
| - | `Refusal` and `isRefusal` - an empty manuscript comes back as one plain sentence, never a throw |
| - | `THE_LAWS`, `THE_WORD`, `EDITORIAL_LAW`, `NOTHING_STOOD`, `TOOL_NAME` |

Same name, same thing: `ElementKind`, `Element`'s `kind` and `text`, `Measure`,
`US_LETTER`, `INDENTS`, `linesPerPage`, `columns`, `widthOf`, `indentOf`,
`minutesOf`, `wrap`, `linesOf`, `layout`, `titlePage`, `Page`, `Screenplay`.

FOUR THINGS THE WATER DOES THAT `screenplay.ts` DOES NOT. Every element
carries byte offsets into a named source and is a byte-exact slice of it, and
every character no element covers is one of `SEPARATORS`. Parts are read one
source at a time rather than joined into a single string with a blank line
between them. The title card is optional (`{ titleCard: false }`) and its
turning-off is told. A work with no title, no parts, or no line of text in any
part comes back as a `Refusal` instead of an empty script.

Record: this realm's .journals/realm/2026-09-14-patakatha-mirror-design-hand.md;
the water's own record is resonance-awen/tools/the-patakatha/README.md.
