# 2026-09-14 — the studio walked in its own window

The four rooms driven in the Tauri window over WebView2's DevTools protocol,
`WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9222` on the
process that launched it, `npm run tauri dev`, the looking-glass driver
attached to the page target. Every reading taken off the DOM; 30 screenshots.
No source file changed.

## the window

- 1280 × 800 in the config; 943 × 590 CSS pixels at this display's 1.36
  device pixel ratio. The rail is 200px of that.
- Opens on `/`, the shelf. Theme: `--bg #14152d`, `--accent #6C5CE7`,
  `--text #E0E0E0`, `--bg-surface #222547`, root font-size 16px, no theme in
  `localStorage`.
- The rail carries five doors — Shelf 📚, Desk ✒️, Board 🧵, Cast 🎭,
  Bind 📖 — the current one with `aria-current="page"`, and the chosen work
  at its foot.

## what stood

- **The shelf.** `Begin a work` writes through `create_work`; the row lists
  with kind, title, byline and `touched 9/14/2026`. `Open` chooses the work
  and walks to `/desk`. The choice survives a window restart: the id is in
  `localStorage` as `resonance-scribe-work` and the row is re-read from the
  base.
- **The desk.** Two chapters and one scene under the first, through the two
  boxes at the foot of the rail. A paragraph, a `***` line and a line of
  dialogue typed into the scene: state reads `unsaved`, and `28 words` after
  the quiet, the count the base wrote. The rail carries the same 28 on the
  scene. Delete on a part asks first and names what goes with it.
  The screenplay shape reads `1 page, running 0:08 at one page to the minute
  — 10 characters and 6 lines to the inch on 8.5in by 11in`, set at 60
  columns; Prose comes back unchanged. Away to the board and back, the part
  re-opens with the same body, title and count.
- **The board.** Two eras become two columns beside `not yet placed in an
  era`. A card's own panel moves it to an era; `Earlier`/`Later` move it in
  the work's order and the desk's rail shows that order after a reload.
  An arc added in the threads drawer draws one `<polyline>` through the two
  cards it hangs on — `points="120,125.7 627.2,104.3"`, stroke `#E17055` for
  `rising` — and the legend counts `2 cards`. A character's emoji marks the
  card it is hung on. A drag dispatched as `dragstart`/`dragover`/`drop`
  DragEvents with a real `DataTransfer` carried the card into another era's
  column; `dragover` and `drop` both returned false, the handlers having
  taken them.
- **The cast.** `2 appearances`, each line naming the part and the era from
  that part's own placement rows, in the work's order — the order the board's
  move had just written.
- **The bind.** Lede: `2 chapters, 1 scene`. Six roads: `1 · A manuscript
  folder`, `2 · EPUB 3`, `3 · Paged HTML, print-ready`, `4 · A screenplay`,
  `5 · Standard manuscript format`, `6 · The whole work, as a .scribe.json`.
  The chapter line names the files in the board's order —
  `01-chapter-two.md, 02-chapter-one.md`. The rights drawer draws a licence:
  three grants, the split `artist 90 · platform 10`, `unsealed`, the lawyer
  gate welded to the text, and three flagged lines under
  `3 things the licence flagged`. No road was pressed: every one of the six
  opens a native dialog.

## what was short

- **No door deletes a work.** `deleteWork` stands in `src/lib/base.ts:42` and
  no room calls it. The shelf row (`src/routes/+page.svelte`) carries one
  button, `Open`. Parts, eras, arcs and characters each have a delete with a
  confirm; a work has none. The walk's work stands in the base:
  `the walk · 2026-09-14`.
- **The desk is one column at the window's own size.** `@media (max-width:
  62rem)` at `src/routes/desk/+page.svelte:869` is 992px; the window is 943
  CSS px, so the parts rail sits above the sheet and the second pane begins
  at y=835 in a 590px viewport — 245px below the fold, and the room scrolls
  1211px.
- **`***` reads as three asterisks in the preview.** `renderScrollBody`
  (`src/lib/scrolls/the-scrolls.mjs`) has no rule form, so the scene break
  the bind sets as `SCENE_BREAK` renders `<p>***</p>` beside the text box.
- **Accessible names run together.** `Delete<span class="visually-hidden">
  {name}</span>` loses its leading space through Svelte's whitespace
  handling: the shelf's button names itself `Openthe walk · 2026-09-14 at the
  desk`, the board's `DeleteBefore`, `RenameThe walking arc`, `◀move Before
  earlier`, the cast's `DeleteWren`. `src/routes/+page.svelte`,
  `src/routes/board/+page.svelte`, `src/routes/cast/+page.svelte`.
- **No door puts a character in a scene.** The board's cards are chapters;
  a card lists its scenes as plain `<li>` with no control
  (`src/routes/board/+page.svelte`, `.card-scenes`), while the cast's
  `whereAppears` renders `chapter · scene` for a scene-hung row
  (`src/routes/cast/+page.svelte`).
- **A drawn licence does not survive leaving the room.** `drawn` is the bind
  room's own state; walking to another room and back leaves no `pre.licence`
  standing and the drawer closed.

## verification

- `npm run check` — `COMPLETED 318 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS`.
- The driver's health after every room: `{"exceptions":[],"failedRequests":[],"brokenImages":[],"alive":true}` — eighteen readings, one per attachment, each counting what was thrown while it held the socket. No exception, no failed request and no broken image in the whole walk.
- Ports: 9222, 1460 and 1461 answered nothing before the start and hold no
  listener after the close; only TIME_WAIT entries remain.
- Processes: no `resonance-scribe.exe`, `node.exe`, `cargo.exe` or
  `msedgewebview2.exe` of the run remains — 4 node and 2 cargo during, 0
  after; 12 WebView2 during, 6 after, the 6 that stood before.
- The base was copied before the walk and never opened outside the studio; no
  SQL was run against it.
