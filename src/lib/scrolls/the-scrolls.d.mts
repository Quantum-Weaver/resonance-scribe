// THE SURFACE OF THE MIRROR, and this realm's own file — not part of it.
//
// `the-scrolls.mjs` beside this is a BYTE-IDENTICAL MIRROR and may never be
// edited (see MIRROR.md). It is JavaScript with prose JSDoc, written for a
// browser and for node, and `checkJs` is on in this repo's `tsconfig.json`,
// so the checker reads it and finds twelve things that are only errors in a
// TypeScript project: four implicit `any` parameters, one index of a literal
// object by a `string`, and seven properties of `HTMLElement` missing from a
// class that extends it conditionally (`typeof HTMLElement !== 'undefined'
// ? HTMLElement : class {}` — the line that lets the pure renderer import
// cleanly in node, which is the whole reason this water can be proven).
//
// THE MEND THE PLAN NAMED DID NOT WORK, and that is recorded rather than
// worked around: a `tsconfig.json` `exclude` for this one path leaves all
// twelve standing, because `exclude` filters the `include` GLOBS and never
// removes a file that entered the program through an `import`. Measured, both
// ways, 2026-09-02 — see `.journals/realm/2026-09-02-the-rooms.md`.
//
// What does work, and touches neither the mirror nor `tsconfig.json`: a
// sibling declaration. TypeScript resolves `./the-scrolls.mjs` to
// `./the-scrolls.d.mts` when one stands beside it and reads the `.mjs` no
// further — while Vite, which does not know this file exists, bundles the
// real mirror. The types below are what the water's own README documents; the
// only consumer here is the desk, and it calls `renderScrollBody` alone.

/** Escape first — always, before any shaping. `&`, `<`, `>` and `"`. */
export declare function escapeText(text: string): string;

/** The pure renderer: markdown subset in, honest HTML out. Headings (# ## ###),
 *  bold, italic, bullets, checklists — the five named forms. Anything else is
 *  a plain paragraph. Escapes before everything, which is what makes its output
 *  safe to put in `{@html}`. */
export declare function renderScrollBody(markdown: string): string;

/** The `<the-scroll>` custom element. It registers itself on import where
 *  `customElements` exists; this realm does not use it. */
export declare const TheScroll: new () => HTMLElement;
