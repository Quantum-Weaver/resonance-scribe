# 2026-09-14 — the papers, written

`README.md` and `docs/RELEASE.md`, and no other file.

## what was written

`README.md`, the WHAT IT IS section: six rooms named where four stood before
— the shelf (opens, begins, deletes behind two steps), the desk, the board,
the cast, the bind, and settings (the author captured at the door and
changed again there, the theme, the whole studio's export and import as one
`.scribe.json`, and a purge that truly purges). The bind's line now reads six
roads rather than five ways and a sixth, naming the manuscript folder, EPUB
3, paged HTML, the screenplay, standard manuscript format, and the whole
work as a `.scribe.json`. The founding line at the foot now reads "all six
rooms stand." No other line in the file was touched.

`docs/RELEASE.md` gained `## v0.2.0 — bumped in the tree` above
`## v0.1.0 — 2026-09-02`, with an italic line stating it is bumped and not
yet built as a release, eleven bullets holding settings, onboarding, the
author and rights columns with `read_all` and `purge_all`, the shelf's
delete, the desk's side-by-side panes and hairline scene break, the cast's
placement in any chapter or scene, the bind's author fallbacks and kept
licence, the whole-studio envelope, the-patakatha in the spring, the four
refreshed mirrors, and the `opener:default` permission removed. The v0.1.0
section and its readings, including the line naming `opener:default` held
and unused, stand exactly as they were read.

## what stands

`README.md` WHAT IT IS now names six rooms and the bind's six roads as they
read in `src/routes/bind/+page.svelte`, against the rail's six doors in
`src/lib/components/Rail.svelte`. `docs/RELEASE.md` carries v0.2.0 above
v0.1.0, in the shape read from `../resonance-echoes/docs/RELEASE.md`.

## verification

- `grep -c -i -w law README.md docs/RELEASE.md`: `README.md:0`,
  `docs/RELEASE.md:0`.
- `git status --short -- README.md docs/RELEASE.md`: ` M README.md`,
  `?? docs/RELEASE.md` — `docs/RELEASE.md` was already untracked before
  this hand touched it, so `git diff --stat -- README.md docs/RELEASE.md`
  names only `README.md` (23 insertions, 16 deletions); the untracked file
  does not appear in a plain `git diff`.
- Rail doors, grepped from `src/lib/components/Rail.svelte`: Shelf, Desk,
  Board, Cast, Bind, Settings — six, matching `src/routes/` (`+page.svelte`,
  `desk/`, `board/`, `cast/`, `bind/`, `settings/`, plus `onboarding/`).
- Bind road labels, grepped as `<h2>`: "1 · A manuscript folder",
  "2 · EPUB 3", "3 · Paged HTML, print-ready", "4 · A screenplay",
  "5 · Standard manuscript format", "6 · The whole work, as a
  `.scribe.json`".
- `src-tauri/src/lib.rs`, `src-tauri/Cargo.toml` and
  `src-tauri/capabilities/default.json` grepped for `opener`: no match in
  any of the three.
