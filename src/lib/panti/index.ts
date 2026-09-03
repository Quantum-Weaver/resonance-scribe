// the-panti — THE ROW. A table's own logic as data: how a column's sort
// direction cycles, how a typed filter matches, which rows are selected, and
// what a row's stable id is. No DOM, no framework, no clock, zero imports.
//
// THE COPY IS VERBATIM. `./table.utils.js` is
// `AudHDities/src/lib/utils/components/runes/table.utils.ts`, byte for byte —
// see HARVEST.md for the SHA256 taken at the copy. Nothing in it was edited,
// per KP's ruling on harvests: "without altering the source location", and the
// harvest's own reading of it — a copy that has been edited is not a copy.
//
// ── THE ONE PEER TYPE, DECLARED RATHER THAN EDITED ────────────────────────
// The copy carries exactly two type-position references to a peer type it does
// not import: `React.ReactNode`, at `ColumnConfig.render`'s return and at
// `getCellDisplayValue`'s return. In AudHDities that name resolves through
// `@types/react` — that app is a Next.js body and React is its own ground.
// A spring water may not take React as a dependency (the law of the spring:
// standalone always, zero runtime deps), and it may not edit the copy. So the
// name is DECLARED here as a host surface, the-clavis's law applied to a type
// instead of a machine: name the surface, supply none of it.
//
// It is declared `global` on purpose rather than in a sibling `.d.ts`, because
// tsc does not copy a `.d.ts` into `dist/` — declared here, the built
// `dist/index.d.ts` carries the surface with it and a consumer of the built
// package inherits it whole.
//
// It is deliberately WIDE and deliberately not React's own union: this water
// does not know what a cell renderer returns and has no business narrowing it.
// If a consumer's real React is in scope, React's own `ReactNode` is assignable
// into this one and nothing here contradicts it.
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace React {
		/** THE HOST SURFACE. Whatever the host's renderer accepts as a cell.
		 *  This water neither makes one nor reads one — it only carries it. */
		type ReactNode = string | number | boolean | null | undefined | object;
	}
}

export * from './table.utils.js';

/** The working name, in ONE place. KP names the waters; `paṅkti` is this
 *  hand's reading of the need, not his word. The name lives in exactly two
 *  places — this constant and the folder — so a rename is one edit, one
 *  `git mv`, and one line in the row. */
export const TOOL_NAME = 'the-panti';

/** Logging is OFF, and there is nothing to log: not one path here is an event.
 *  The house's law (KP ⚛, 2026-08-11) is design for logging and default it OFF
 *  where a run is not an event; a sort direction cycling is not an event. */
export const LOGGING = false as const;
