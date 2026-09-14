# 2026-09-14 — the opener removed whole

## what was removed

- `src-tauri/capabilities/default.json` — the `opener:default` permission
  line. Twelve permissions stand: `core:default`, `fs:default`, the six
  `fs:allow-*` grants, `dialog:default`, `dialog:allow-save`,
  `dialog:allow-open`. The description line names only fs and dialog and
  reads true unchanged.
- `src-tauri/src/lib.rs` — the `.plugin(tauri_plugin_opener::init())`
  registration. The builder registers `tauri_plugin_fs::init()` and
  `tauri_plugin_dialog::init()`.
- `src-tauri/Cargo.toml` — `tauri-plugin-opener = "2"`.
- `src-tauri/Cargo.lock` — `tauri-plugin-opener` and the crates it alone
  pulled, 497 lines.
- `package.json` — `@tauri-apps/plugin-opener`. Five dependencies stand:
  `@tailwindcss/vite`, `@tauri-apps/api`, `@tauri-apps/plugin-dialog`,
  `@tauri-apps/plugin-fs`, `tailwindcss`.
- `package-lock.json` — the `@tauri-apps/plugin-opener` 2.5.4 entry and its
  root-dependency line, 10 lines.

## what stands

- `.journals/proofs/2026-09-02-the-bind/bind.mjs` is untouched. It names no
  opener and counts no permissions: it reads the capability's `permissions`
  array for membership of the seven grants the host's verbs need. All seven
  stand.
- `src/`, the mirrors, `docs/` and the rest of `.journals/` are untouched.
- `docs/RELEASE.md` lines 46–47 still describe `opener:default` as held and
  unused.

## verification

- `grep -rn opener src src-tauri/src src-tauri/capabilities src-tauri/Cargo.toml package.json` — no output, exit 1.
- `cargo check` in `src-tauri/` — `` Finished `dev` profile [unoptimized + debuginfo] target(s) in 32.36s ``. Exit 0.
- `npm run check` — `COMPLETED 318 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`.
- `npm run build` — `✓ built in 4.98s`, `Wrote site to "build"`, `✔ done`.
- `node .journals/proofs/2026-09-02-the-bind/bind.mjs` — `Every claim TRUE.` Exit 0.
- `python ../resonance-ziggy/modules/shipwright/guard-gen.py resonance-scribe` — identity, cargo config and icons clean. Exit 0.
