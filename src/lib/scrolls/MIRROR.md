# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-02 (THE ROOMS - movement S2 of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`, whose desk asks for "the-scrolls'
rendering beside the editor"), the scroll's single editable truth is:

    ../resonance-awen/tools/the-scrolls/the-scrolls.mjs

Do not edit the file in THIS folder - it is a byte-faithful mirror (SHA256
verified at the copy: BF9736BC6587487D), to be refreshed by distribution runs
as the house's delivery pipeline stands up, the same road the cosmic mirror
travels. The desk imports `renderScrollBody` from here; subset changes and
escaping changes happen in the water.

WHY THIS REALM CONSUMES IT: the desk shows an author their own markdown
rendered beside the box they typed it in, and that rendering goes into
`{@html}`. That is only safe because the-scrolls **escapes before
everything** - `&`, `<`, `>`, `"` are replaced first and the five named forms
(headings, bold, italic, bullets, checklists) are applied to text that is
already escaped, so authored text can never smuggle markup. Nothing this
studio holds is more its author's than the body of a chapter, and a renderer
that could be talked into running it would be the one door in a
nothing-leaves-the-device app that let something in.

It is also the only markdown road this realm has, deliberately. No markdown
library is installed and none may be: the-scrolls is one file, framework-free,
zero imports, and its pure renderer imports cleanly in node with no DOM - so
the desk gets a preview and the repo gets no dependency. The custom element
`<the-scroll>` registers itself where `customElements` exists; this realm does
not use it and does not need to, and it is left in place because a copy that
has been trimmed is not a copy.

The subset is five forms and there is no sixth. No tables, no links, no code
fences, no images - "a scroll is a calm reader, not a browser." A body that
uses more than the subset still stores byte for byte (the-binder's law,
carried: "typos are fingerprints unless he says otherwise"); it simply
renders as plain paragraphs in the preview. That is a limit of the preview,
never of the manuscript, and the desk says so in plain words.

A `.mjs` FILE UNDER `checkJs`, and the mend that did not work. `checkJs` is on
in this repo's `tsconfig.json`, so the checker reads this mirror and finds
twelve things that are only errors in a TypeScript project. The plan named a
`tsconfig.json` `exclude` for this one path as the lawful mend; MEASURED, IT
DOES NOTHING - `exclude` filters the `include` globs and never removes a file
that entered the program through an `import`, and all twelve stood. What
works, and touches neither the mirror nor `tsconfig.json`, is a sibling
declaration: `the-scrolls.d.mts`, this realm's own file, which TypeScript
resolves in place of the `.mjs` while Vite - which does not know it exists -
bundles the real mirror. `tsconfig.json` was not changed at all. The folder
therefore holds THREE files: the mirror, this record, and one declaration that
is not part of the mirror and says so in its own head.

Record: RUN-LOG.md, and this realm's .journals/realm/2026-09-02-the-rooms.md
(the rooms, S2); the water's own record is
resonance-awen/tools/the-scrolls/README.md.
