# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-02 (THE ROOMS - movement S2 of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`, whose gate reads "the-panti
for every list"), the row's single editable truth is:

    ../resonance-awen/tools/the-panti/src/index.ts
    ../resonance-awen/tools/the-panti/src/table.utils.ts

Do not edit either file in THIS folder - they are byte-faithful mirrors
(SHA256 verified at the copy: index.ts BC65D713AC7DE84F ·
table.utils.ts FFD8FBBD30EBE37C), to be refreshed by distribution runs as
the house's delivery pipeline stands up, the same road the cosmic mirror
travels. Every room here imports from `$lib/panti`; sort-cycle, filter-mode
and row-id changes happen in the water.

`index.ts` already carries the host surface the water declares -
`declare global { namespace React { type ReactNode = ... } }`, the-clavis's
law applied to a type: name the surface, supply none of it. Nothing was
added to it here and nothing may be. Scribe has no React; the declaration
is inert and correct, and it is what lets the copy stay a copy.

WHY THIS REALM CONSUMES IT: every list this studio shows is a row of
somebody's work - a work's chapters and the scenes beneath them, its eras,
its cast, its arcs - and how those rows are ordered and narrowed is a
decision with consequences, not an appearance. The base's own order is the
truth for parts and eras (`ord` ascending, written by `reorder_parts` and
`reorder_eras` alone), so the rooms sort by `ord` through `sortData`, which
COPIES and never touches the array it was given - which is exactly what a
runes store needs, because the array it holds is the array the base handed
back. The desk's title box and the cast's name box narrow through
`filterData` in `contains` mode, and a whitespace-only needle is not a
filter: a hand that has typed nothing has asked for nothing.

THE ONE THING THIS REALM HAD TO MOVE, and it was not this file: the six
nouns in `src/lib/types/types.ts` are TYPE ALIASES rather than interfaces,
because TypeScript gives an alias an implicit index signature and an
interface none, and `sortData`/`filterData` are written
`<T extends Record<string, unknown>>`. The alternative was editing the
mirror or casting at every call site. Neither is lawful here. See the
comment on `THE SIX NOUNS` in that file.

Not consumed here: `toggleRowSelection` · `toggleSelectAll` ·
`isRowSelected` · `getCellDisplayValue` · `getColumnAlignment` ·
`isStripedRow` (three Tailwind-flavoured strings and a selection model this
studio has no table for). They travel with the copy because a copy that has
been trimmed is not a copy.

Record: RUN-LOG.md, and this realm's .journals/realm/2026-09-02-the-rooms.md
(the rooms, S2); the water's own record is
resonance-awen/tools/the-panti/README.md and its HARVEST.md.
