# 2026-09-14 — the readings before the public mark, and `docs/RELEASE.md`

## what was read

- `guard-gen.py resonance-scribe` — identity clean
  (`com.audhd.resonance-scribe`, 41 files), `.cargo/config.toml` at root and
  `src-tauri/` both carrying the 16 KB page flags, icons its own (53 files,
  no sibling's set). Exit 0.
- `assess.py resonance-scribe` — report at
  `reports/2026-09-14-assessment.md`. No vulnerabilities. 9 gaps: `CLAUDE.md`
  missing, seven `.js`-extension/generated-output import-resolution false
  positives, 10 files over 100 KB not fully read, no CI/CD, no test suite
  (jest detected).
- `src-tauri/capabilities/default.json` read line by line against every
  `@tauri-apps/*` call in `src/lib/host.ts` and `src/lib/base.ts` (confirmed
  the only two doors: no other file under `src/` imports `@tauri-apps/*`).
  Every plugin verb called is granted by name. `opener:default` is held and
  called by no JS in `src/` and no Rust command in `src-tauri/src/` — the
  `tauri_plugin_opener::init()` registration at `lib.rs:37` stands unused
  from the window's side. `fs:default` and `dialog:default` grant nothing an
  operation needs by the capability file's own description line. The two
  `fs:allow-appdata-*-recursive` permissions carry the `$APPDATA/**` scope
  the snapshot writes reach through rather than naming a verb of their own.
  Nothing used is unheld.
- `cargo check` in `src-tauri/` — `` Finished `dev` profile
  [unoptimized + debuginfo] target(s) in 0.80s ``. Exit 0.
- `shelf-census.py` takes the shelf's short name, not the project name —
  `shelf-census.py resonance-scribe` refuses with "No shelf named
  resonance-scribe"; `shelf-census.py scribe` reads it: all five 0.1.0
  artifacts stand, no twins, naming lawful.
- `stow-release.py resonance-scribe --dry-run` — would carry 5 (apk, aab,
  apk.idsig, msi, setup.exe), prune 0, matching what the shelf already
  holds.
- `reckon-ground.py resonance-scribe` — `gen/` 295.6 MB total, 607.7 KB
  tracked, 292.7 MB purgeable build ground behind a signed 0.1.0 shelf twin.
  Read dry; no `--purge` run.
- `sign-release.py resonance-scribe --dry-run` — guard-gen passed first; APK
  and AAB ✅ from standing Android build outputs; MSI and EXE read "none
  (desktop build not run)" because `src-tauri/target/release/bundle/` does
  not exist on this machine today — both already stand signed in `release/`
  from the prior build. Keystore named: `F:\keystores\resonance-scribe.keystore`.
  Stopped before signatures.
- The five proofs — `round-trip.mjs`, `bind.mjs`, `rooms.mjs`,
  `importer.mjs`, `screenplay.mjs` — every claim TRUE in all five, exit 0
  each.

## what stands

`docs/RELEASE.md` written new: `## v0.1.0` with an italic line on what was
built, signed and where it stands, bullets on the four rooms and the bind's
six roads, `### The readings` (the seven above, one line each), and
`### Not yet read` naming the stress readings, the device matrix and the
store's own reports as not run.

## what was short

- The release artifacts in `release/` are dated 2026-09-02 (`setup.exe` and
  `.msi` 22:15, `.aab`/`.apk`/`.apk.idsig` 23:15) — the mtimes read, not
  2026-09-13. `docs/RELEASE.md` carries `## v0.1.0 — 2026-09-02` on that
  reading.
- `opener:default` is held in `src-tauri/capabilities/default.json` and
  called by no code in this repo.
- None of the stress readings, the device matrix or the store's own reports
  (Play pre-launch, WACK, Galaxy Store seller review) have been run; named
  as not read in `docs/RELEASE.md`.

## verification

`node .journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs`,
`.../2026-09-02-the-bind/bind.mjs`, `.../2026-09-02-the-rooms/rooms.mjs`,
`.../2026-09-13-the-atogail-importer/importer.mjs`,
`.../2026-09-13-the-screenplay/screenplay.mjs` — all exit 0, every claim
TRUE. `cargo check` in `src-tauri/` exit 0. `guard-gen.py resonance-scribe`
exit 0. `shelf-census.py scribe` exit 0. A second `shelf-census.py scribe`
and `reckon-ground.py resonance-scribe` read confirm no state changed —
everything run today was read-only; nothing was signed, stowed, purged or
installed.
