# HANDOFF — resonance-scribe

*Where this realm stands, right now. **Regenerated whole** at each close that
worked here — never appended to. Git holds every prior day.*

*This is not the ledger. What was **done** is the base's record — progenatrix.db,
asked with `python C:/_superposition/resonance-progenatrix/progenatrix.py recall --realm resonance-scribe`;
this sheet is the state of what **stands**. It cites the base and never
restates it. **Ceiling 8 KB** — a sheet past it is over-written and re-cut,
never rolled. The law:
[THE-ROLL](https://github.com/Quantum-Weaver/resonance-standards/blob/main/docs/THE-ROLL.md).*

```
LEGEND   state  ● done · ◐ drifted/partial · ⏸ his hold · — not yet
         hand   ⚛ his word · ✋ his hands · 🕯️ a lamp's
         proof  ✔ gates green · ✗ failing · ? unproven
```

**resonance-scribe** · 2026-09-02 · S1, S2 and S3 done — the base, the shell,
the rail and all four rooms · branch main, even with origin at 9a091a8 ·
working tree: S2, S3 and the icons uncommitted — forty-five files modified,
twenty-two paths untracked · *the sync word is KP's*

## Where it stands

| what | state | hand | proof |
|---|---|---|---|
| Founded to the Sanctuary standards by the-founding-ritual | ● | 🕯️ | ✔ 2026-09-02 |
| S1 · the cut from Resonance Sistrum v0.2.0, source only | ● | 🕯️ | ✔ mirrors byte-identical to the mother |
| S1 · rebrand: name · productName · identifier · title · port 1460/1461 · crate | ● | 🕯️ | ✔ grep clean of every identity token |
| S1 · versions to 0.1.0 by shipwright/bump-version.py | ● | 🕯️ | ✔ the triple agrees |
| S1 · the base: six nouns, migration v1, cascade, the CHECK | ● | 🕯️ | ✔ 29/29 TRUE, re-run at S3's close |
| S1 · 26 Tauri commands, one door per verb; no SQL in the window | ● | 🕯️ | ✔ `cargo check` clean, no `sql:*` capability |
| S2 · one shell, one rail, five routes; the chosen work in a runes store | ● | 🕯️ | ✔ `npm run check` 0/0 · `npm run build` green |
| S2 · the desk · the board · the cast | ● | 🕯️ | ✔ `.journals/proofs/2026-09-02-the-rooms/` 48/48, re-run at S3's close |
| S2 · the mirrors: the-panti · the-scrolls | ● | 🕯️ | ✔ SHA256 both sides |
| S3 · the mirrors: binder · pandulipi · envelope (3 files) · sphragis | ● | 🕯️ | ✔ SHA256 both sides, printed by the proof |
| S3 · `src/lib/host.ts` — the one door to the disk, seven verbs and no more | ● | 🕯️ | ✔ every plugin import in one file, the proof prints what it searched |
| S3 · `src/lib/bind.ts` — the folder, the front matter, the store-only ZIP, the envelope, the import plan | ● | 🕯️ | ✔ `.journals/proofs/2026-09-02-the-bind/` 81/81 TRUE |
| S3 · the bind room — five ways out, every `told` line shown, a rights drawer | ● | 🕯️ | ✔ check 316 files 0/0 · build green · cargo clean |
| S3 · the shelf: all four rooms named as rooms, no doorway left | ● | 🕯️ | ✔ same proof |
| Icons — scribe's own face, `tauri icon` run on a copy of `scribe.png`; the master at `icons/source.png` | ● | ⚛ | ✔ `guard-gen.py` exit 0 for scribe AND sistrum, 2026-09-02 |
| The desktop shell opened, the rooms read by his eyes | ● | ⚛ | ✔ KP, 2026-09-02, verbatim: "scribe rooms look good" |
| The dialogs, the fs scope, the writes, and whether the EPUB opens | — | ✋ | ? no lamp can see these without a window |
| `tauri android init` and the first Android build | — | ✋ | ? his build day |
| git's first breath — the re-founding and S1 (4be0dc6), the hooks (9a091a8), pushed | ● | ⚛ | ✔ at KP's sync word 2026-09-02 |

## What waits, and whose

| what waits | whose | source |
|---|---|---|
| S2 and S3's commit and push — seven modified, twenty untracked | ⚛ | KP's sync word; the base's rows are the conductor's |
| The bind's doors under his hand: does a save dialog land, does a folder export write, does the EPUB open in a reader? | ✋ | CHILD-BUILDS.md step 8; the rooms themselves he has read |
| `tauri android init` (no `gen/` exists yet) | ✋ | CHILD-BUILDS.md; the build day is his |
| The name of the new water (the-pandulipi is a working name) | ⚛ | THE-AUTHORS-STUDIO.md §Who decided what |
| A distribution refresh of `src/lib/epagoge/` — this repo's mirror is the 2026-08-06 truth and predates `doorway()` | 🕯️ | `src/lib/epagoge/MIRROR.md`; not S2's or S3's to run |

*An unwritten end state prints **unwritten — his to rule**. Inventing one is this
sheet's one unforgivable defect. No urgency language: dates are bookmarks.*

## Read before you touch this repo

*Only laws bought **in this repo**. House laws are cited, never restated here —
a law written in two rooms is two laws waiting to drift.*

- **THE BASE IS RUST'S.** No `@tauri-apps/plugin-sql`, no `sql:*` permission,
  no SQL in any `.svelte` file. Every row crosses a named Tauri command, and
  `src/lib/base.ts` holds the only `invoke` in the repo.
- **THE DISK IS `src/lib/host.ts`'S.** Every `@tauri-apps/plugin-*` call and
  `appDataDir` stands there and nowhere else — `save · open · writeFile ·
  writeTextFile · readFile · mkdir · exists`, and no `remove`, no `readDir`, no
  listing. Nothing in it throws. **Every verb it imports is granted by name in
  `capabilities/default.json`** (`writeTextFile` needs `fs:allow-write-text-file`;
  the S3 verifier found it missing; the bind proof now checks the grants).
- **Nothing is ever overwritten.** `writeNew` asks `exists` and then writes
  with `createNew`; a folder export checks every path before it writes any.
- **An import is a NEW work**, never a merge, and every id is minted by the
  base — the import plan speaks in array indices and carries no `id` at any
  depth. Unknown keys are told, not stored: this base has no column for one.
- **The scene break is `***`** — the only marker the-binder sets as a rule AND
  the-pandulipi sets as a scene break. Both halves are proven; change it and
  re-run both.
- **The container is store-only**, `mimetype` first, timestamps at the DOS
  epoch, so a work binds to the same bytes forever.
- **The port is 1460**, in lockstep in `vite.config.js` and `tauri.conf.json`
  (hmr 1461).
- **Order is data, and a reorder writes `ord` alone** — never `body`, never
  `updated_at`.
- **`updatePart` is the only write of a part's text**, reached from
  `studioStore.savePart` alone, opened by the desk alone. The body is stored
  byte for byte — and it leaves the studio the same way: every part's body is a
  byte-exact slice of the file it lands in, offsets and all.
- **The six nouns in `src/lib/types/types.ts` are TYPE ALIASES, not
  interfaces** — the-panti's `sortData`/`filterData` need the implicit index
  signature an alias carries and an interface does not.
- **A mirror is never edited to please a checker.** `the-scrolls.mjs` is
  answered by a sibling `the-scrolls.d.mts`; a `tsconfig.json` `exclude` was
  tried and does nothing. The-envelope's `./host-surface.js` specifiers needed
  no mend at all — `moduleResolution: "bundler"` resolves them, measured.
- **The-board-charter is not mirrored and cannot be** — its naming hard-codes
  `.skapa.json` and `parseBoard` refuses any format but `skapa-board`. Its laws
  are written out in `src/lib/bind.ts`.
- **`src-tauri/gen/` is not carried and not ignored**, and `guard-gen.py` runs
  before any build in this line, mother or child.
- **`android-extras/extras.json` asks for no permissions at all.**

---

*This sheet holds no truth of its own. The ledger is the base
(`python C:/_superposition/resonance-progenatrix/progenatrix.py recall --realm resonance-scribe`);
the voices are [HANDS.md](HANDS.md); the telling is [docs/STORY-BLOCK.md](docs/STORY-BLOCK.md).
Where this sheet and the ground disagree, **the ground is right** — regenerate it.*
