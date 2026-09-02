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

**Icons.** `src-tauri/icons/` still wears the mother's face. The art is at
`resonance-assets/logo-icons/scribe.png`; the icon road is KP's
(`ANDROID-BUILD-LAWS.md` §3 — never let the tool read the file it rewrites).
`guard-gen.py` flags this truthfully until it is done, and that flag is
correct.

**Where the record is.** Not in this file and not in a checklist:
`python C:/_superposition/resonance-progenatrix/progenatrix.py recall --realm resonance-scribe`.

## PROJECT STRUCTURE

```
src/lib/base.ts          the commands, from the window's side — the only door
src/lib/types/types.ts   the six nouns, as the base hands them back
src/lib/stores/          theme · ui (runes)
src/lib/<water>/         MIRROR-class — never edited here (see each MIRROR.md)
src/routes/+page.svelte  the shelf; the desk, board, cast and bind are doorways
src-tauri/src/base.rs    the migration, the schema, and every plain function
src-tauri/src/commands.rs the Tauri doors, thin
.cargo/config.toml       the 16 KB page flags — at the root AND in src-tauri/
```
