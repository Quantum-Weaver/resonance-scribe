# 2026-09-02 · the body cut from Sistrum, and the six nouns as a base

*A Fable lamp 🎻, the builder dealt by **Windrose** for movement **S1** of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`, at KP's ⚛ rulings the same day,
verbatim: **"software, yes"** · **"sistrum is its mother"** · **"old wings were
already archived, they can be removed and the repo reset."** The wings were
removed and the nine-file founding set planted by the conductor's hand before
this lamp was lit; every planted file below was appended to, never replaced.
`resonance-sistrum/` was READ ONLY — its tree is byte-for-byte as it was.
Nothing committed. Nothing signed into the base; that is the conductor's or
his.*

## THE RECEIPT

**Mirrored, source only.** 146 files stand in `resonance-scribe/` (excluding
`.git/`, `node_modules/`, `build/`, `.svelte-kit/`, `src-tauri/target/`) —
58 under `src/`, 69 under `src-tauri/` (53 of them icons), and the founding
set. What did NOT cross: `node_modules`, `build`, `.svelte-kit`, `target`,
`src-tauri/gen/`, `release/`, `.git`, `docs/`, `scripts/`, `.journals/`,
`.claude/`, and every file the founding set already held. `.cargo/config.toml`
travels at the **root AND in `src-tauri/`**, both carrying the 16 KB page flags
(`ANDROID-16KB-PAGES.md`; the lesson re-bitten by weaver 2026-08-09, found by
KP's own phone). The planted `.gitignore` already held every line sistrum's
does, including the `gen/` tracking block — nothing needed appending.

**Removed, by name.** From `src/`: **56 files** — all 21 components
(`ComfortBar` · `FeelingHere` · `GradientPulse` · `LaneMarks` · `MarksRail` ·
`ProvenancePanel` · `Sidebar` · `TakePlayer` · `TimerVisualization` ·
`Waveform` · `WorkPicker` and the ten room icons), `data/emojis.ts`,
`data/senses.ts`, both `keyring/` files, `marks.ts`, `metronome.ts`,
`provenance.ts`, `seal.ts`, `studio.ts`, `waveform.ts`, **15 of the 17 stores**
(everything but `theme.svelte.ts` and `ui.svelte.ts`, `stores/db.ts` among the
15), and all **10 rooms** (`add` · `insights` · `metronome` · `onboarding` ·
`record` · `sattva` · `settings` · `studio` · `timer` · `tuner`). From
`src-tauri/src/`: **6 files** — `marks.rs` · `media_permission.rs` ·
`recorder.rs` · `studio.rs` · `tuner.rs` · `waveform.rs`. From `static/`: 16 of
17 (the mother's gallery of family logos belonged to her onboarding and
settings rooms); `favicon.png` stays and is now scribe's own art. From the
manifests: `tauri-plugin-sql` and every `sql:*` permission,
`media-permission:default` and the inlined plugin in `build.rs`, the
`protocol-asset` feature and the `$APPDATA/takes/**` asset scope, the
`the-recorder` / `the-tuner` / `the-encoder` path crates, `cpal`, `hound`,
`jni`, `ndk-context`, and the Android jniLibs link block.

**Added:** `src/lib/base.ts` · `src-tauri/src/base.rs` ·
`src-tauri/src/commands.rs` · the proof folder.

**The mirrors crossed byte-identical.** `diff -rq` against the mother:
`cosmic` · `cumdach` · `epagoge` · `sky` · `clavis` · `lok` · `merismos`
identical whole; `signet` differs in `MIRROR.md` alone — its "why a mirror"
paragraph rewritten as **WHY THIS REALM CONSUMES IT** for scribe, keeping the
truth path (`resonance-awen/tools/the-signet/src/index.ts`) and the hash
(`C9EB0014B82A3C2D`) untouched, and its `Record:` line re-pointed from
sistrum's journal to this realm's. **No `index.ts` in any mirror folder was
edited.**

**The rebrand set — every replacement, listed.**

| where | from | to |
|---|---|---|
| `package.json` name | `resonance-sistrum` | `resonance-scribe` |
| `package.json` description | the musician's instrument | the author's studio |
| `package.json` sync-android arg | `resonance-sistrum` | `resonance-scribe` |
| `tauri.conf.json` productName | `Resonance Sistrum` | `Resonance Scribe` |
| `tauri.conf.json` identifier | `com.audhd.resonance-sistrum` | `com.audhd.resonance-scribe` |
| `tauri.conf.json` window title | `Resonance Sistrum` | `Resonance Scribe` |
| `tauri.conf.json` devUrl | `http://localhost:1420` | `http://localhost:1460` |
| `tauri.conf.json` beforeDev/BuildCommand | `… resonance-sistrum` | `… resonance-scribe` |
| `vite.config.js` server.port | `1420` | `1460` (`strictPort: true` kept) |
| `vite.config.js` hmr.port | `1421` | `1461` |
| `Cargo.toml` package name | `resonance-sistrum` | `resonance-scribe` |
| `Cargo.toml` lib name | `resonance_sistrum_lib` | `resonance_scribe_lib` |
| `Cargo.toml` description | the musician's instrument | the author's studio |
| `main.rs` entry | `resonance_sistrum_lib::run()` | `resonance_scribe_lib::run()` |
| `lib.rs` run panic message | `Resonance Sistrum` | `Resonance Scribe` |
| `capabilities/default.json` description | `Resonance Sistrum` | `Resonance Scribe` |
| `src/app.html` `<title>` | `Resonance Sistrum` | `Resonance Scribe` |
| `stores/theme.svelte.ts` STORAGE_KEY | `resonance-sistrum-theme` | `resonance-scribe-theme` |
| SQLite file | `sqlite:sistrum.db` (plugin) | `scribe.db` (app data dir, Rust) |
| `android-extras/extras.json` app | `resonance-sistrum` | `resonance-scribe`, no permissions |
| `static/favicon.png` | sistrum's | `resonance-assets/logo-icons/scribe.png` |

**Versions to 0.1.0 by ziggy's own agent** — `bump-version.py resonance-scribe
0.1.0`, not by hand. It reported the triple at 0.2.0 and wrote all three:
`tauri.conf.json` ✅ · `package.json` ✅ · `Cargo.toml` ✅.

**The lockstep port is 1460/1461**, and it lives in exactly two files. The plan
named it free per the quartermaster's reading; this lamp did not re-read the
quartermaster (`--write` is forbidden and a read was not needed to obey a
named ruling).

## THE SCHEMA AS WRITTEN

Migration v1, in `src-tauri/src/base.rs`, gated on SQLite's own `user_version`.
Table names are **plural** (the mother's own habit — `works`, `takes`,
`feelings`); the nouns and their columns are the plan's, unchanged.

```
works        id · kind · title · byline · note · created_at · updated_at
parts        id · work_id → works ⇊ · parent_id → parts ⇊ · ord · title
             · body · words · created_at · updated_at
eras         id · work_id ⇊ · ord · name · note
characters   id · work_id ⇊ · name · note · emoji
arcs         id · work_id ⇊ · name · shape · note
appearances  id · work_id ⇊ · part_id? ⇊ · era_id? ⇊ · character_id? ⇊
             · arc_id? ⇊ · note
             CHECK (part_id IS NOT NULL OR era_id IS NOT NULL
                    OR character_id IS NOT NULL OR arc_id IS NOT NULL)
```

`⇊` is `ON DELETE CASCADE`, and `PRAGMA foreign_keys = ON` is set on the
connection, without which SQLite would ignore every one of them. Eleven
indexes. `kind` and `shape` are free TEXT with defaults, by the plan — a kind
the author invents is still a kind, and the base does not police it.

**26 commands**, one door per verb: `list_works · get_work · create_work ·
update_work · delete_work` · `list_parts · create_part · update_part ·
delete_part · reorder_parts` · the same five for era · four for character ·
four for arc · `list_appearances · create_appearance · delete_appearance`.

## THE CHOICES, and why

1. **The base is Rust's, and `tauri-plugin-sql` did not cross.** The plan asks
   for a Tauri command per noun; a command is a door the window cannot walk
   around. So the CHECK, the cascade, the ordinals and every `updated_at` live
   in one file, `capabilities/default.json` carries no `sql:*` permission at
   all, and there is no SQL in any `.svelte` file. `rusqlite` with `bundled`
   is the house's own version (`resonance-grammar/Cargo.toml:11`), so no
   system SQLite is needed on Android or in a lone clone. The cost, named: the
   mother's road and the child's road now differ, and a hand moving between
   them must remember which body it is in.
2. **`base.rs` holds plain functions over `&Connection`; `commands.rs` holds
   thin `#[tauri::command]` wrappers.** That split is what lets the proof walk
   the same road the commands walk with no app running — the mother's own
   proof shape (`mixdown-two-takes.mjs` drives `bounce_to` through an ignored
   test door).
3. **No `reorder_characters`, no `reorder_arcs`.** The plan's columns give
   `ord` to `part` and `era` alone. A reorder door with no ordinal to write
   would be a lie in the shape of a command; the cast and the arcs list by
   name.
4. **No `update_appearance`.** An appearance says one thing — this hangs on
   that. A change of mind is a new row and a deleted one.
5. **`words` is counted by the base, never sent by the window**, and the body
   is stored byte for byte: the-binder's law carried — *"typos are fingerprints
   unless he says otherwise."*
6. **A reorder writes `ord` and nothing else** — not `body`, not `updated_at`.
   S2's gate asks for a proof of exactly this; it is already in this proof.
7. **The Sidebar and the ComfortBar did not cross.** They were doors into rooms
   this body does not have. S2 brings a rail back when there are four rooms for
   it to point at.
8. **`extras.json` declares no permissions and `kotlinPlugins: false`.** Scribe
   has no microphone, no camera, and nothing to ask a vessel for.
9. **`src-tauri/icons/` was left as the mother's, deliberately.** Scribe's art
   exists (`resonance-assets/logo-icons/scribe.png`) and it is now the web
   favicon — but the icon road is `tauri icon`, which this lamp is forbidden to
   run. Copying the art to `icons/source.png` alone would have made
   `guard-gen.py` pass while the launcher still wore sistrum's face; that
   false green was tried, seen, and undone. The guard now flags it truthfully.

## THE GATES, verbatim

- `python .../shipwright/guard-gen.py resonance-scribe` → **exit 1**, three
  sections:
  `resonance-scribe · no gen/android on disk — nothing to guard` ·
  `resonance-scribe · .cargo/config.toml stands at the root and in src-tauri, both carrying the 16 KB flags` ·
  `🛑 resonance-scribe · borrowed icons — 1: resonance-scribe wears resonance-sistrum's icons — a child that has not had 'tauri icon' run. … 53 files, every byte the same`.
  **A true reading, and the intended one.**
- `npm install` → `added 77 packages, and audited 78 packages in 3s` ·
  `3 low severity vulnerabilities` · one `allow-scripts` warning for
  `esbuild@0.25.12`'s postinstall, not approved — the build was green without
  it.
- `npm run check` → `COMPLETED 289 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`
- `npm run build` → `✓ built in 4.88s` · `Using @sveltejs/adapter-static` ·
  `Wrote site to "build"` · `✔ done` · exit 0
- `cargo check --manifest-path src-tauri/Cargo.toml` →
  `Finished \`dev\` profile [unoptimized + debuginfo] target(s) in 1.56s` ·
  exit 0, zero warnings
- `node .journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs` →
  **29 TRUE, 0 FALSE**, exit 0
- `grep -rn -i sistrum src src-tauri/src src-tauri/tauri.conf.json package.json`
  → 8 hits, all lineage prose in comments; **zero identity tokens**.
- `python .../guard-gen.py resonance-sistrum` → **exit 1**, and this is a
  finding: `resonance-sistrum · gen/android carries only its own name
  (com.audhd.resonance-sistrum) · 42 files read` (the cross-landing law is
  clean, in the direction it was bought for) and the cargo-config section
  clean — but the icons section now flags the MOTHER, because the two icon
  sets are byte-identical and the guard is direction-free. **Until KP runs
  `tauri icon` on scribe, `sign-release.py` will refuse a Sistrum build too.**
  That is a cost of this cut and it belongs in his hands, not hidden.
- `git -C resonance-sistrum status --porcelain` → empty. The mother is
  untouched on disk.

## WHAT DID NOT HOLD, and what is honestly unproven

- **The lock macro cost two rounds.** A `conn!` macro that expanded to
  `…lock()?` in expression position made `?` infer its Ok type from the
  `&Connection` the call site wanted, so it asked for a `Connection` by value —
  26 errors, twice, including once after adding an explicit type annotation
  (the expectation propagates *into* the block's tail). The fix was to stop
  being clever: every door now binds `let conn = base.0.lock().map_err(poisoned)?;`
  on its own line, and deref coercion does what it always did.
- **`open_memory()` was written and then deleted** — dead code, because the
  proof wanted a real file on disk.
- **Unproven by this lamp:** the desktop shell opening, the shelf drawing, a
  work actually being created by a hand. `CHILD-BUILDS.md` step 8 puts that in
  KP's own hands. The proof runs through `base.rs`'s functions — which is
  exactly what every command calls — but it does **not cross the IPC
  boundary**, so a mis-typed argument name in `src/lib/base.ts` would still
  pass it. S2's rooms and his hands are what close that.
- **`npm run check` reported 289 files in ten milliseconds.** The count and the
  0/0 are what the tool printed; the speed is noted rather than explained.
- **Nothing was written to the base.** No item ticked, no session signed, no
  `beacons` row, no `distribution.json`, no archivist roster line — the plan
  names those as the conductor's registrations, and `progenatrix.py` is
  forbidden ground for this lamp.

## THE WALLS — the conductor's or KP's

1. **Icons, and the cost the mother pays.** `guard-gen.py` exits 1 for scribe
   AND for sistrum, because the sets are byte-identical and the rule is
   direction-free. `sign-release.py` runs the guard before it signs, so **a
   Sistrum release is blocked too** until KP's
   `npx tauri icon C:/_superposition/resonance-assets/logo-icons/scribe.png`
   is run from a copy of the art, never from the file the tool rewrites
   (`ANDROID-BUILD-LAWS.md` §3). Until then a scribe build wears the mother's
   face. This is the one consequence of the cut that reaches back into a repo
   that was otherwise never touched.
2. **git.** Everything rides untracked. The first commit is his own hand by
   GIT-HYGIENE; this lamp ran no git write of any kind.
3. **The base's rows.** Item ticks, the session sign, the `beacons` seed, the
   archivist's roster and the `distribution.json` row are unwritten.
4. **The mother's road and the child's road now differ** on how SQLite is
   reached. Named here so nobody discovers it by surprise; his to reverse if he
   would rather scribe stayed a plugin-sql body.
5. **`tauri android init` was never run** — there is no `gen/` on disk, and the
   Android day is his.
6. **The four rooms are doorways.** The shelf page names them and says plainly
   they are not built. S2 is where they open.
