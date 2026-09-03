# CLAUDE.md — resonance-scribe

**Stack:** *unstated at the founding — declared when the body takes shape*

**Authors:** see [HANDS.md](HANDS.md) — the voices are named there, each
in their own words, per the Hands Standard.

---

## SESSION PROTOCOL

1. Ask the base where this realm stands — the record is progenatrix.db:
   `python C:/_superposition/resonance-progenatrix/progenatrix.py recall --realm resonance-scribe`
2. One phase at a time — complete, verify, row it into the base, move on.
3. **The base updates in the same sitting as the work it records.**
4. Zero errors before commit.

## Essential rules

*This repo's own laws land here as they are ruled — identity, not
settings. Nothing is invented at the founding.*

## Project structure

*Drawn when the first structure stands.*

## Standards

This repo follows the
[Sanctuary Standards](https://github.com/Quantum-Weaver/resonance-standards).
`.gitignore`, this file, and `HANDOFF.md` are **SEED-class** —
planted once from the standards and this repo's own from then on. No
agent overwrites them (DOC-CLASSES law). The record of what was done is
the base, asked as the session protocol says.

---

## THE LINEAGE

**Cut from Resonance Sistrum v0.2.0 (the attested lineage); Sistrum itself is
never altered.** The cut was made 2026-09-02 by a Fable lamp dealt by
Windrose 🎻, movement S1 of `resonance-chamber/desk/THE-AUTHORS-STUDIO.md`,
at KP's ⚛ rulings the same day: *"software, yes"* · *"sistrum is its mother"*
· *"old wings were already archived, they can be removed and the repo reset."*

Sistrum is the mother because she already held what this studio needs and no
sibling did: a local SQLite base whose `feelings` row hangs on a work **or** a
take — the hang-on-either shape an era, a character and an arc all want — the
whole rights layer as mirrors, "nothing leaves the device", the Tauri
plumbing, `.cargo/`, and the family's tokens. What crossed is source only.
What did not cross: her rooms, her recorder, her tuner, her studio, her takes
shelf, her `works → takes → feelings` migration, her sound. The mirrors
(`cosmic · cumdach · epagoge · sky · clavis · lok · merismos · signet`) crossed
byte-identical and their `index.ts` files are never edited here — the truth
lives in `resonance-awen` and `resonance-ziggy`, and each folder's `MIRROR.md`
carries the path and the hash.

The road is `resonance-standards/docs/CHILD-BUILDS.md`.

## ESSENTIAL RULES — bought here

**Stack.** Tauri v2 · SvelteKit 5 (runes) · adapter-static in SPA mode ·
Tailwind v4 · SQLite through `rusqlite`, bundled.

**The port is 1460**, and it stands in lockstep in exactly two places:
`vite.config.js` (`port: 1460`, `strictPort: true`, hmr 1461) and
`src-tauri/tauri.conf.json` (`devUrl: http://localhost:1460`). Change one and
you have changed nothing.

**The identifier is `com.audhd.resonance-scribe`** — `tauri.conf.json`, and
`build.gradle.kts` namespace + applicationId, the manifest theme, both
`themes.xml` styles and MainActivity's `package` line on the day
`gen/android` exists.

**Nothing leaves the device.** No network crate, no upload, no cloud, no
telemetry, ever. The base is one SQLite file in this app's own data directory
(`scribe.db`); `.gitignore` refuses `*.db` and `*.sqlite` besides.

**THE BASE IS RUST'S.** There is no `@tauri-apps/plugin-sql` here and no
`sql:*` permission in `capabilities/default.json`. Every row goes through a
named Tauri command (`src-tauri/src/commands.rs` → `src-tauri/src/base.rs`),
and `src/lib/base.ts` is the whole of what the window may ask for. No SQL in
any `.svelte` file. If a room needs a shape the commands do not have, the
command is what changes.

**Order is data.** `reorder_parts` and `reorder_eras` write `ord` and nothing
else — not `body`, not `updated_at` — so a move on the board can never read as
an edit of the author's text. Proven:
`.journals/proofs/2026-09-02-the-base-round-trip/`.

**The studio never alters a manuscript's text** — the-binder's law, carried:
*"typos are fingerprints unless he says otherwise."* `words` is counted from
the body and the body is stored byte for byte.

**gen/android, and the law bought 2026-08-13.** `src-tauri/gen/` is NOT
carried and NOT ignored. Run
`python C:/_superposition/resonance-ziggy/modules/shipwright/guard-gen.py resonance-scribe`
**before any build in this line, mother or child** — the rule is direction-free
(KP's ⚛ word, 2026-08-30). `tauri android init` is KP's own hand on his build
day; `src-tauri/android-extras/extras.json` is this body's declaration and it
asks for **no permissions at all**, because scribe has no microphone, no
camera and nothing to grant.

**Icons.** `src-tauri/icons/` is scribe's own face since 2026-09-02, at KP's
word: `npx tauri icon` was run on a scratch COPY of
`resonance-assets/logo-icons/scribe.png` — never on the master, never on a
file inside `icons/` (`ANDROID-BUILD-LAWS.md` §3 — the tool overwrites its
own input) — and the master's copy stands at `icons/source.png`.
`guard-gen.py` reads the set as its own, for scribe and for sistrum alike.
`gen/android` regenerates on `tauri android init` and can silently revert the
launcher icons; re-run the same road from the same master if it does.

**The autosave writes through `updatePart` and nothing else.** It is the only
write of a part's text in this app: the desk calls `studioStore.savePart`, the
store calls `updatePart`, and no other room and no other function touches a
body. Proven: `.journals/proofs/2026-09-02-the-rooms/`.

**A move never carries a body.** `reorderWithin` in `src/lib/board.ts` returns
`string[]`; a drag can reach no call but `reorderParts(workId, ids)` /
`reorderEras(workId, ids)`. Moving a part between eras is a delete of its
placement row and a create of one — there is no `update_appearance` — and no
title, body or ordinal crosses either call.

**The six nouns in `src/lib/types/types.ts` are TYPE ALIASES, not
interfaces.** TypeScript gives an object alias an implicit index signature and
an interface none, and the-panti's `sortData`/`filterData` are written
`<T extends Record<string, unknown>>`. Turn one back into an interface and
every list in every room stops compiling. Never mend that by editing the
mirror or by casting at a call site.

**Every list a room shows passes through the-panti** (`$lib/panti`) — `ord`
ascending where the base's order is the truth, name where there is no ordinal.
`sortData` copies, which is why a runes store can hold the array the base
handed back and hand the same one to a room.

**A mirror is never edited to please a checker.** `the-scrolls.mjs` is
JavaScript and `checkJs` is on; the answer is `src/lib/scrolls/the-scrolls.d.mts`,
this realm's own declaration file, which TypeScript resolves in place of the
`.mjs` while Vite bundles the real thing. A `tsconfig.json` `exclude` does NOT
work for this — `exclude` filters the include globs and never removes a file
that entered the program through an import. Measured 2026-09-02.

**THE DISK IS REACHED THROUGH `src/lib/host.ts` ALONE.** Every
`@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` call, and `appDataDir`
from `@tauri-apps/api/path`, stands in that one file. No room, no store and no
mirror imports a plugin — the waters carry no Tauri dependency at all, which is
why they could be mirrored here. It is the twin of `base.ts`, which holds the
only `invoke`: between them, everything this window can reach outside itself
stands in two files. The surface is `save · open · writeFile · writeTextFile ·
readFile · mkdir · exists` and NOTHING ELSE — no `remove`, no `readDir`, no
listing, because a surface that could walk the disk is one that will one day be
asked to. Nothing in it throws: a declined dialog, an occupied path and a
plugin that failed are three ordinary answers. Proven:
`.journals/proofs/2026-09-02-the-bind/`.
**And every verb it imports is granted BY NAME in
`src-tauri/capabilities/default.json`.** A plugin command is refused at the
ACL before any scope is consulted, and no gate here — check, build, cargo
check, a node proof — can see the ACL. `writeTextFile` is its own command
(`plugin:fs|write_text_file`) with its own grant, `fs:allow-write-text-file`;
`allow-write-file` covers `write_file · open · write` and nothing else. The S3
verifier found that grant missing on 2026-09-02, with three of the five ways
out unable to write; the bind proof now reads the capability against
`host.ts`'s import list, verb by verb. A new verb needs its grant in both
places, and the proof names the one that is missing.

**NOTHING IS EVER OVERWRITTEN.** `writeNew` asks `exists` first — so a refusal
is a sentence with no byte moved — and then writes with `createNew: true`, so
the platform closes the gap between the asking and the writing. A folder export
checks EVERY path it means to write before it writes any of them, and refuses
the whole export rather than half-writing one. `snapshotName` chooses a name
clear of every name it was shown; because there is no `readDir`, that half
cannot see the disk and the half that actually holds is `writeNew`. Said in the
function's own comment, not only here.

**AN IMPORT IS A NEW WORK.** An opened `.scribe.json` never merges into a
standing work: the envelope's third law is that an import is non-destructive,
and a work is one thing. `readingToImport` in `src/lib/bind.ts` returns a plan
that speaks in ARRAY INDICES and carries no `id` key at any depth, so an id
read from a file cannot reach a new row even by accident — the base mints every
one. Unknown keys are READ WHOLE AND TOLD, NOT STORED: this base has no column
for one, and inventing one would be a schema change smuggled in through an
import road. The file is never altered.

**The scene break is `***`, and it is the only marker that could be.**
The-pandulipi honours `#`, `***` and `* * *`; the-binder makes `***` an `<hr/>`,
sets a lone `#` as ordinary text (its `HEAD` wants a space after the hashes) and
sets `* * *` as a bullet list. One marker is a break in both waters. Do not
change it without re-running both halves of the proof.

**The container is store-only.** `zipStore` writes method 0 for every entry,
`mimetype` first with no extra field, timestamps pinned to the DOS epoch. A
store-only EPUB is a valid EPUB, and no deflate means no `node:zlib` and no
node door in this window.

**THE ROOM READS THE CLOCK; `bind.ts` NEVER DOES.** The-binder refuses a blank
`dcterms:modified` rather than guessing one. Every moment `src/lib/bind.ts`
needs is an argument. The one exception is named: `seal` stamps `exportedAt`
inside the-envelope's own mirror, and a mirror is not edited to please a law of
this repo's.

**Every drag has a keyboard twin, and they call the same function.** Nothing
on the board can be done only with a mouse.

**Where the record is.** Not in this file and not in a checklist:
`python C:/_superposition/resonance-progenatrix/progenatrix.py recall --realm resonance-scribe`.

## PROJECT STRUCTURE

```
src/lib/base.ts             the commands, from the window's side — the only `invoke`
src/lib/host.ts             the only plugin calls — dialog · fs · appDataDir, and no more
src/lib/board.ts            the board's arithmetic — pure, types-only imports
src/lib/bind.ts             the bind's arithmetic — the folder, the front matter,
                            the store-only ZIP, the envelope, the import plan,
                            the snapshot's name. Framework-free; three runtime
                            imports, all from mirrors (crc32 · utf8 · seal)
src/lib/types/types.ts      the six nouns, as the base hands them back
src/lib/stores/             theme · ui · work · studio (runes)
src/lib/components/Rail.svelte   five doors and the chosen work
src/lib/<water>/            MIRROR-class — never edited here (see each MIRROR.md)
src/lib/scrolls/the-scrolls.d.mts  NOT the mirror — this realm's declaration for it
src/routes/+layout.svelte   the shell and the rail
src/routes/+page.svelte     the shelf — the works, and Open
src/routes/desk/            the parts rail, the editor, the autosave, the preview
src/routes/board/           the eras as columns, the cards, the threads, the marks
src/routes/cast/            the characters, and their appearances derived
src/routes/bind/            five ways out: a manuscript folder · EPUB 3 · paged
                            HTML · standard manuscript format · the whole work
                            as a .scribe.json, with a rights drawer beside them
src-tauri/src/base.rs       the migration, the schema, and every plain function
src-tauri/src/commands.rs   the Tauri doors, thin
.cargo/config.toml          the 16 KB page flags — at the root AND in src-tauri/
```

The waters mirrored here: `cosmic · cumdach · epagoge · sky · clavis · lok ·
merismos · signet` (S1) · `panti · scrolls` (S2) · `binder · pandulipi ·
envelope · sphragis` (S3). **The-board-charter is NOT mirrored and cannot be:**
its naming functions hard-code the `.skapa.json` suffix and `parseBoard`
refuses any format but `skapa-board`. Its LAWS crossed instead and are written
out in `src/lib/bind.ts`.
