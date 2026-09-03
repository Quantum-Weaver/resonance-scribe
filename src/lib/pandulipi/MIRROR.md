# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-02 (THE BIND ROOM - movement S3 of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`), the submission format's single
editable truth is:

    C:\_superposition\resonance-awen\tools\the-pandulipi\src\index.ts

Do not edit index.ts in THIS folder - it is a byte-faithful mirror
(SHA256 verified at the copy: 1A29CB00007D6BF7), to be refreshed by
distribution runs as the house's delivery pipeline stands up. Format changes -
the running head, the drop, the scene break, the counting rule - happen in the
water.

THIS WATER IS S3'S OWN, AND IT WAS BORN FOR THIS ROOM. The plan
(`THE-AUTHORS-STUDIO.md` §S3) names it as a new water in the spring, built
beside this movement rather than found in it, and its own `THE_WORD` constant
carries KP's ⚛ sentence with its address:

    "we have a need for it to be repurposed as a book, manuscript, article,
     all the reasons an author might publish. all types formatting assistance"
    KP ⚛ 2026-09-02 · resonance-chamber/desk/THE-AUTHORS-STUDIO.md:6-7

`NOTHING_STOOD` is exported beside it: the house held no standard manuscript
submission format before this water, swept 2026-09-02 for Shunn, MLA and
Chicago across the tools, the papers and the library. The working name is his;
`TOOL_NAME` and the folder are the only two places it stands.

WHY THIS REALM CONSUMES IT: the fourth way out of the bind room is a
submission, and a submission has a shape an editor expects - twelve-point
monospace, double-spaced, one-inch margins, the surname-and-short-title
running head with the page number, the title page carrying the rounded word
count, each chapter a third of the way down a fresh page, scene breaks
centred. None of that is a matter of taste and none of it was this room's to
invent. It takes the-binder's own folder shape (`{ book, chapters }`), which
is exactly what `manuscriptFolderOf` in `src/lib/bind.ts` already builds for
the other three ways out, so one arithmetic feeds all four.

WHAT THE ROOM SHOWS FROM IT, and why each: `wordCount` (the exact count, over
the author's literal runs, markup excluded), `roundedWordCount` (what the
title page carries), `head` (the running head as one readable string), and
every line of `told` in plain words - because `told` is where this water says
out loud what it derived: a surname taken as the last word of a by-line, a
short title cut from the title, an absent contact block noted and never
invented. `pages` is declared on the result and is ALWAYS absent; the page
count is the print engine's, and this room does not put a number where the
water refused to.

THE SCENE BREAK, AND THE ONE MARKER THAT SERVES BOTH WATERS. This water
honours `#`, `***` and `* * *` on a line of their own (`SCENE_LINE`). The
studio writes `***`, because that is the only one of the three that the-binder
ALSO sets as a break (its `RULE`, `-{3,}|\*{3,}|_{3,}`, gives `<hr/>`): a bare
`#` is not a heading to the-binder (its `HEAD` wants a space after the hashes)
and would be set as ordinary text, and `* * *` is a bullet list item to it.
One marker, a break in both. Proven over a two-scene fixture in
`.journals/proofs/2026-09-02-the-bind/bind.mjs`.

Record: RUN-LOG.md, and this realm's .journals/realm/2026-09-02-the-bind.md
(the bind room, S3); the water's own record is
resonance-awen/tools/the-pandulipi/README.md.
