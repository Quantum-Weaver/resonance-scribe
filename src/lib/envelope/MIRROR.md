# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-02 (THE BIND ROOM - movement S3 of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`), the sovereignty trio's single
editable truth is:

    ../resonance-awen/tools/the-envelope/src/index.ts
    ../resonance-awen/tools/the-envelope/src/host-surface.ts
    ../resonance-awen/tools/the-envelope/src/hosts/tauri.ts

Do not edit any of the three in THIS folder - they are byte-faithful mirrors
(SHA256 verified at the copy: index.ts B52F553E8CBDECEA · host-surface.ts
EBE4334CFB2782AF · hosts/tauri.ts F64F24EFCF922A9E), to be refreshed by
distribution runs as the house's delivery pipeline stands up. The law changes
in the water; this repo's own particular - which lists, which counts, what a
`.scribe.json` holds - stays scribe's.

`src/hosts/browser.ts` did NOT cross: this body is a Tauri desktop app and has
no browser road to keep honest. A mirror is not trimmed to please a checker,
but a FILE that was never taken is not a trim - the three above are whole.

THE `.js` SPECIFIERS RESOLVE, AND THAT WAS MEASURED. `index.ts` re-exports
types from `'./host-surface.js'` and `hosts/tauri.ts` imports types from
`'../host-surface.js'`. Under this repo's `moduleResolution: "bundler"`,
TypeScript resolves those to the `.ts` files standing beside them, and
`npm run check` reports 0 errors over all three. Both are TYPE-ONLY forms
(`export type` / `import type`), so nothing has to resolve at runtime either -
esbuild erases them and Vite is never asked. No sibling declaration was needed
and none was written.

WHY THIS REALM CONSUMES IT

The three laws, and the reason a work can be carried off this device and back:

1. **EXPORT** - one versioned envelope, app-namespaced (`resonance-scribe`),
   with the COUNTS WRITTEN ON THE OUTSIDE, so a hand can see at a glance that
   the file carries what the studio showed. `deliver` never throws: a declined
   dialog is `{ delivered: false }` with a plain why, because an export road
   that crashes on a cancelled dialog is how "export is broken" enters a
   support inbox.
2. **PURGE** - not consumed here, and said out loud rather than left as a
   silence: this studio has no purge. Deleting a work is the base's own
   cascade through one Tauri command, and there is no second store, no
   `localStorage` of rows, nothing that could survive a delete by omission.
   `provePurge` and `purgeAfter` travel with the copy because a copy that has
   been trimmed is not a copy.
3. **IMPORT** - non-destructive BY LAW, and this room takes that at its word:
   an opened `.scribe.json` becomes A NEW WORK, never a merge into a standing
   one. A work is one thing; there is no key by which two of them could be
   reconciled without one of them losing. `open()`'s refusals are shown WORD
   FOR WORD - a foreign envelope is refused in the water's own sentence, and
   this room adds no second wording.

THE HOST SURFACE IS WHY THE PLATFORM DOOR IS NOT WRITTEN HERE. `host-surface.ts`
names three verbs - `suggest` · `write` · `pick` - and no fourth. There is no
`list`, no `remove`, no `readAt(path)`, because a surface that could walk the
disk on its own is a surface that will one day be asked to. Six repos each
re-implemented the landing and five more the chooser; this app implements
neither. `hosts/tauri.ts` takes the four plugin functions INJECTED - the water
imports nothing from `@tauri-apps/*` - and `src/lib/host.ts` is the one file in
this repo that holds them, which is this realm's own law bought at S3.

Record: RUN-LOG.md, and this realm's .journals/realm/2026-09-02-the-bind.md
(the bind room, S3); the water's own record is
resonance-awen/tools/the-envelope/README.md.
