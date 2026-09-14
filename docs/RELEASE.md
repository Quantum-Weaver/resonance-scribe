# Resonance Scribe — Release Notes

## v0.2.0 — bumped in the tree

*Bumped in the tree, not yet built as a release.*

- A sixth room, **settings** — the author, the theme, the studio counted, export, import and purge — stands behind a sixth door on the rail.
- An **onboarding** walk on the epagoge captures the author's name, by-line and a contact block kept verbatim; it shows when no author stands and is reachable again from settings.
- The base carries an **author** row and a work's **rights**, with `read_all` and `purge_all` reaching every table.
- The **shelf** deletes a work behind two steps of confirmation.
- The **desk**'s panes stand side by side above 56rem, and its preview draws a scene break as a hairline.
- The **cast** puts a character in any chapter or scene of the work.
- The **bind**'s by-line and the manuscript's contact block fall back to the author's; a drawn licence is kept on the work.
- The whole studio leaves as one `.scribe.json` envelope and returns as new works, never overwriting.
- The screenplay format lives in the spring as the-patakatha, mirrored at `src/lib/patakatha/MIRROR.md`.
- The four drifted mirrors — binder, cumdach, epagoge, sky — are refreshed.
- The `opener:default` permission is removed.

---

## v0.1.0 — 2026-09-02

*Built and signed 22:15–23:15 (2026-09-02): the setup.exe, the MSI, the AAB,
the APK and its v4 idsig. Stands on the shelf in `release/` and mirrored
whole to `resonance-assets/releases-current/scribe/bundle/` — the shelf
census reads all five artifact slots present and conformant at 0.1.0, no
twins, every name lawful.*

- The **desk**, where a part is written in a plain box and saved to the base
  after a moment's quiet, the word count as the base counted it beside the
  same text rendered.
- The **board**, where the chapters stand as cards across the eras, the arcs
  are drawn through the cards they run through, and a character's emoji
  marks the cards they appear on.
- The **cast**, where a character's appearances are read from those same
  rows rather than kept as a second list.
- The **bind**, where a finished work leaves the studio six ways: a
  manuscript folder of markdown, an EPUB 3, paged HTML for print, a
  screenplay set on the format's own measure of ten characters and six
  lines to the inch, standard manuscript submission format for an editor,
  and a `.scribe.json` envelope that carries the whole work out and opens
  it again on any machine you own.

### The readings

- **Static — identity, cargo config, icons.** 2026-09-14, `guard-gen.py`:
  `gen/android` carries only its own identifier (`com.audhd.resonance-scribe`,
  41 files read); `.cargo/config.toml` stands at both the repo root and
  `src-tauri/`, each carrying the 16 KB page flags; `src-tauri/icons/` is its
  own — 53 files, no sibling's set. Clean, exit 0.
- **Static — dependencies and standards gaps.** 2026-09-14, `assess.py`: no
  vulnerabilities found; 9 gaps — `CLAUDE.md` missing (the per-repo copies
  were cleared house-wide 2026-08-25), seven generated/import-resolution
  false positives in `.svelte-kit/` build output and the `.js`-extension
  imports in `envelope/` and `panti/`, 10 files over 100 KB not fully read
  by the analyzer, no CI/CD configuration, and no test suite present though
  a `jest` framework was detected.
- **Static — permissions.** 2026-09-14, `src-tauri/capabilities/default.json`
  read against every plugin call in `src/lib/host.ts` and `src/lib/base.ts`:
  every verb the app calls is granted by name — `exists`→`fs:allow-exists`,
  `mkdir`→`fs:allow-mkdir`, `readFile`→`fs:allow-read-file`,
  `writeFile`→`fs:allow-write-file`, `writeTextFile`→`fs:allow-write-text-file`,
  `open`→`dialog:allow-open`, `save`→`dialog:allow-save`,
  `invoke`/`appDataDir`→`core:default`. `opener:default` is **held and
  unused** — no `@tauri-apps/plugin-opener` import stands anywhere in `src/`,
  though the plugin is registered at `src-tauri/src/lib.rs:37`. `fs:default`
  and `dialog:default` grant nothing an operation needs, by the capability
  file's own description, and stand beside the explicit allows as scaffolding;
  `fs:allow-appdata-read-recursive` and `fs:allow-appdata-write-recursive`
  carry the `$APPDATA/**` scope the snapshot writes (`.scribe/snapshots`,
  beside the base) reach through, rather than naming a verb of their own. No
  permission used is unheld.
- **Correctness — the Rust build.** 2026-09-14, `cargo check` in
  `src-tauri/`: `` Finished `dev` profile [unoptimized + debuginfo]
  target(s) in 0.80s ``. Exit 0.
- **Release ground — shelf, stow, gen weight.** 2026-09-14,
  `shelf-census.py scribe` (the tool takes the shelf's own short name) /
  `stow-release.py resonance-scribe --dry-run` / `reckon-ground.py
  resonance-scribe`: the assets shelf already holds all five 0.1.0
  artifacts (apk, apk.idsig, aab, msi, setup.exe), no twins, naming lawful
  — exactly what a stow would carry (5 carried, 0 pruned, dry, nothing
  copied). `src-tauri/gen/` weighs 295.6 MB total, 607.7 KB git-tracked,
  292.7 MB of build ground that a signed shelf twin of 0.1.0 lets go — read
  dry, no `--purge` run.
- **Release ground — signing.** 2026-09-14, `sign-release.py resonance-scribe
  --dry-run`: `guard-gen` passed first; APK and AAB read ✅ from the Android
  build outputs still standing on this machine; MSI and EXE read "none
  (desktop build not run)" — `src-tauri/target/release/bundle/` does not
  exist on this machine today, so the dry run found no fresh desktop build
  to place, though both already stand signed in `release/` from the
  2026-09-02 build. Keystore named: `F:\keystores\resonance-scribe.keystore`.
  Stopped before signatures, as designed.
- **Correctness — the five proofs.** 2026-09-14, `node
  .journals/proofs/<folder>/<file>.mjs` for `2026-09-02-the-base-round-trip`,
  `2026-09-02-the-bind`, `2026-09-02-the-rooms`, `2026-09-13-the-atogail-importer`
  and `2026-09-13-the-screenplay`: every claim TRUE in all five, exit 0 each.

### Not yet read

- The stress readings — the monkey, the soak, the pull, the load, the
  conditions, the fresh house.
- The device matrix — a low-end phone, a phone on the oldest supported
  Android, a small screen, a Windows machine that is not the build machine.
- The store's own reports — Google Play's pre-launch report, the Microsoft
  Store's Windows App Certification Kit, Galaxy Store's seller review.
