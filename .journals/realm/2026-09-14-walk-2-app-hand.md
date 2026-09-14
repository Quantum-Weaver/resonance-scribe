# 2026-09-14 — the studio walked again: the door in, the settings room, the ending

Twelve steps driven in the Tauri window over WebView2's DevTools protocol,
`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222` on the
process that launched `npm run tauri dev`, the looking-glass driver attached to
the page target. Every reading taken off the DOM; 47 screenshots. No source
file changed. The base was copied before the walk and never opened outside the
studio.

## the window

- 943 × 590 CSS pixels at this display's 1.36 device pixel ratio. The shell
  rail is 200px of that.
- The rail carries six doors — Shelf 📚, Desk ✒️, Board 🧵, Cast 🎭, Bind 📖,
  Settings ⚙️ — the current one with `aria-current="page"`.

## the guard

The shelf listed exactly one work, `the walk · 2026-09-14`, and the gate landed
on `/onboarding`, so no author stood. The ending applied.

Base before: 98,304 bytes, mtime 12:13:23. Base after: 106,496 bytes, mtime
13:15:39, at `%APPDATA%\com.audhd.resonance-scribe\scribe.db`. The file is not
shrunk by the purge; the pages stand and the schema is empty.

## what stood

- **The gate.** With no author the studio lands on `/onboarding` from `/`, at
  Step 1 of 6. With an author standing it lands on `/`, the shelf. The shell
  asks once on mount.
- **The door in.** Six steps walked as `the walk`, by-line `A hand of the
  house`, a three-line contact block, Dark. The dots read `Step n of 6` with
  `aria-valuenow` n, `aria-valuemin` 1, `aria-valuemax` 6 and states
  past/active/ahead. The keep step listed `the walk`, `A hand of the house`,
  `3 line(s)`, `dark`, with no passed-by line. `Save and enter the studio`
  landed on `/`, the rail showing six doors with Shelf current.
- **Settings.** Six sections: The author · Theme · The studio · Export ·
  Import · Purge. The author's boxes carried the name, the by-line and the
  three contact lines. A changed by-line saved with
  `Saved. “the walk”, with a contact block of 3 line(s), kept verbatim.`
  (`data-tone="done"`, `role="status"`) and read back whole after a room
  change. Picking Ocean moved the shell's tokens from
  `--bg #14152d --accent #6C5CE7 --bg-surface #222547` to
  `--bg #0c182d --accent #0984E3 --bg-surface #182946`, the rail's wordmark to
  `rgb(9, 132, 227)`, and wrote the config to `localStorage`. Display mode,
  tint and type size held at Dark · Subtle · Medium across the change. The
  studio counted `1 work, 3 parts, 2 eras, 1 character, 1 arc`.
- **The shelf's delete door.** `Delete` asks
  `Delete “the walk · 2026-09-14”? Its parts, eras, characters and arcs go with
  it, and nothing on this device keeps a copy.` `Keep it` leaves the row
  standing; `Delete` then `Yes, delete` removes it. The shelf then reads
  `Nothing here yet. The first work is one line above.`,
  `localStorage['resonance-scribe-work']` is null and the rail reads
  `no work chosen`.
- **The desk at the window's own size.** With `the second walk · 2026-09-14`
  and one chapter, the panes share a row: `grid-template-columns:
  207.341px 207.341px`, both tops 120, lefts 492 and 715, `.desk`
  `flex-direction: row`. The room does not scroll — `scrollHeight` 590 equals
  `clientHeight` 590.
- **The scene break as a hairline.** The preview's children read
  `p`, `hr.scene-break`, `p`. The rule is 80.0px wide, 0.735px high, border
  `0.735294px solid rgba(99, 110, 114, 0.3)`, centred by `margin: 22.4px
  47.7367px`. The text box still holds `***` on its own line, and the part
  saved at `16 words`.
- **The cast's door into a chapter.** A named character reads
  `0 appearances` with `Named, and in no scene yet. The box below puts them in
  a chapter or a scene.` The select offers `a chapter or a scene…` and
  `Chapter one`; `Add` makes the row and the count reads `1 appearance` with
  `Chapter one · no era yet`. `Remove` takes it out and the count returns to
  `0 appearances`. Marking the same character on the board's card writes the
  same row: the cast then reads `Chapter one` with the era `Before`.
- **Accessible names whole.** `Open the walk · 2026-09-14 at the desk`,
  `Delete the walk · 2026-09-14`, `Edit Wren`, `Delete Wren`,
  `Remove Wren from Chapter one`, `Add an appearance for Wren`,
  `A chapter or a scene for Wren`, `Move Before earlier`, `Move Before later`,
  `Rename Before`, `Delete Before`, `A new era's name`.
- **The board.** An era becomes a column beside `not yet placed in an era`. The
  card's own panel carries `Its era`, `Its place in the order`, `Who appears`
  and `Which arcs run through`; the era select moves the card and the chip
  hangs the character, whose emoji then marks the card with `Wren` in a
  visually-hidden span and in `title`.
- **The bind.** Six roads listed, none pressed. The Author field reads the
  work's own by-line when it has one and the author's when it has none — a
  work created with no by-line showed `A hand of the house, second walk`, and
  the `.ask` refusal did not appear. The contact block read the author's three
  lines verbatim. A drawn licence: three grants, the split `artist 90 ·
  platform 10`, the lawyer gate welded to the text, `3 things the licence
  flagged`, and `Kept on this work. It stands in this drawer again the next
  time this room opens.` Walking to the board and back, the drawer stands open
  with the same licence and the same three flagged lines.
- **The ending.** `Purge without export` →
  `Everything here is deleted, and nothing is written out first.` →
  `Continue` →
  `Last word: nothing is written out, and nothing can be recovered.` →
  `Purge everything`. The studio lands on `/onboarding` at Step 1 of 6,
  `localStorage` is empty (length 0), the shelf lists nothing, the counts read
  `0 works, 0 parts, 0 eras, 0 characters, 0 arcs`, the author boxes are empty
  and the room says `No author stands here yet.`

## what was short

- **The export's native dialog cannot be dismissed through the protocol.**
  `Export the studio` opens a save dialog; the button stands at `sealing…`,
  the page still answers `Runtime.evaluate`, and `Input.dispatchKeyEvent` with
  `Escape` (`rawKeyDown` + `keyUp`, `windowsVirtualKeyCode` 27) does not reach
  it. The window was closed and relaunched. The room's sentence after an
  export is not readable this way, and the room holds no sentence across a
  relaunch.
- **The purge's own sentence is not readable.** `runPurge`
  (`src/routes/settings/+page.svelte`) sets
  `N rows went. The studio is empty.` and then `goto('/onboarding')` in the
  same act, so the room is gone before the line is drawn.
- **The two confirmations' buttons name nothing.** The shelf's `Yes, delete`
  and `Keep it` (`src/routes/+page.svelte`) carry no work name in their
  accessible names, while `Open` and `Delete` beside them carry the whole one.
  The cast's `Yes, delete` and `Keep them` are the same
  (`src/routes/cast/+page.svelte`).
- **Picking the standing theme un-picks it silently.** `toggleChoice`
  (`src/lib/epagoge/index.ts`) removes a key already held, and the onboarding
  room's `chosenTheme` falls back to `'dark'`
  (`src/routes/onboarding/+page.svelte`), so pressing the already-pressed Dark
  card leaves `aria-pressed="true"` while the walk carries no choice at all.
- **The desk's panes are 207px each at this window.** Above 56rem the row
  holds, and each pane is a third of the sheet: the shell rail takes 200px and
  the desk's own parts rail 272px of 943.
- **The base file grows through a purge.** 98,304 bytes before, 106,496 after;
  `purgeAll` empties the tables and no `VACUUM` follows.

## verification

- `npm run check` — `COMPLETED 323 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`.
- The driver's health after every room:
  `{"exceptions":[],"failedRequests":[],"brokenImages":[],"alive":true}` —
  twenty readings, one per attachment. No exception, no failed request and
  no broken image in the whole walk.
- Ports: 9222, 1460 and 1461 held no listener before the start and hold none
  after the close; only TIME_WAIT entries remain.
- Processes: 1 `resonance-scribe.exe`, 4 `node.exe`, 2 `cargo.exe` and 12
  `msedgewebview2.exe` during; 0, 0, 0 and 6 after — the 6 that stood before.
- Concurrent edits to `README.md`, `HANDS.md` and `docs/RELEASE.md` during the
  walk drove Vite full page reloads into the window, which reset the door-in
  walk twice. Each phase was re-run whole, with the expected heading asserted
  before every act.
