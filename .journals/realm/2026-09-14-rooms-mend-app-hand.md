# The rooms mended — five findings

Five readings from a walk of the studio, each mended at its own address.

## 1 · A work can be deleted from the shelf

`src/routes/+page.svelte` calls `deleteWork` from `$lib/base` — the file's own
pattern, which calls the base doors directly. Each shelf row carries `Delete`
beside `Open`. The first press swaps the button for the room's own confirming
line — *Delete "…"? Its parts, eras, characters and arcs go with it, and
nothing on this device keeps a copy.* — with `Yes, delete` and `Keep it`
beside it. No native `confirm()` anywhere. After the delete the list is
re-read, and a deleted work that was the chosen one is forgotten:
`workStore.clear()` (which removes `resonance-scribe-work` from localStorage)
and `studioStore.forget()`.

## 2 · The desk's two panes stand side by side at the window's own size

`src/routes/desk/+page.svelte`: the one media query moved from
`max-width: 62rem` to `max-width: 56rem`. Above it the rail stands left, the
sheet right and `.panes` is `1fr 1fr`; below it the desk stacks and the panes
become one column. Measured in Chrome on the built site:

| viewport | `matchMedia('(max-width: 56rem)')` | `.panes` columns | pane tops | pane lefts | preview top |
|---|---|---|---|---|---|
| 943 × 590 @dpr 1.36 | false | `207.5px 207.5px` | 121, 121 | 492, 716 | 170 (above the fold) |
| 1280 × 800 | false | `376px 376px` | 121, 121 | 492, 884 | 152 (above the fold) |
| 880 × 600 | true | `625px` | 471, 839 | 220, 220 | 869 (stacked, below the fold) |

## 3 · A scene break previews as a break

`SCENE_BREAK` is imported from `$lib/bind` into the desk. `atBreaks()` cuts the
draft body at every line that is exactly `***`; the prose preview draws each
piece through `renderScrollBody` with a `<hr class="scene-break">` — the room's
own hairline, 5rem wide and centred — where the break line stood. The cut is
the preview's alone: the text handed to `savePart` is `draftBody`, whole. The
mirror at `src/lib/scrolls/` is untouched and its SHA256 still equals its
truth's. The pane's note under the preview names the break among the forms it
shows.

Measured: `.preview` holds `<p>The first line of the chapter.</p><hr
class="scene-break">…<p>The line after the break.</p>` and the textarea still
holds a line that is exactly `***`.

## 4 · Accessible names carry their spaces

Every control that read run-together now carries an `aria-label` with the whole
name, and the hidden span that supplied the second half is gone.

- `src/routes/+page.svelte` — `Open the walk · 2026-09-14 at the desk`,
  `Delete the walk · 2026-09-14`
- `src/routes/board/+page.svelte` — `Move The first age earlier`,
  `Move The first age later`, `Rename The first age`, `Delete The first age`,
  `Rename The walking arc`, `Delete The walking arc`
- `src/routes/cast/+page.svelte` — `Edit Wren`, `Delete Wren`

## 5 · A character can be put in a scene

`src/routes/cast/+page.svelte` draws, on each character's row, a `<select>` of
every part of the work in reading order — a chapter by its title, a scene as
`chapter › scene` — and an `Add` beside it, and a `Remove` on each appearance
line. The box offers only the parts the character is not in yet. Both acts go
through `studioStore.toggleHang(partId, 'character_id', id)`, guarded on
`hangId` so the toggle can only add on `Add` and only delete on `Remove`; the
store calls `createAppearance` and `deleteAppearance` in `$lib/base`. The
board's chapter marks are unchanged.

Measured: the options read `a chapter or a scene…`, `Before › The door`,
`After`; `Add` on the scene put `Before · The door — no era yet` in the
appearances; `Remove Wren from The door` took it out again.

## The gate

```
npm run check      318 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS
npm run build      Wrote site to "build"  ✔ done
node .journals/proofs/2026-09-02-the-rooms/rooms.mjs
                   48 TRUE, 0 FALSE — Every claim TRUE.
```

The real-browser measure ran against `npm run preview` on port 4173 with
`../resonance-ziggy/modules/looking-glass`: `chrome.mjs`, then `drive.mjs` with
a visit script kept in the scratchpad, then `chrome.mjs --stop`. The page's
`window.__TAURI_INTERNALS__.invoke` was stubbed in the browser with a small
in-memory studio so the rooms drew rows; the CSS, the markup and the components
are the built site's own, and nothing about the Rust base is proven by it.
`exceptions: [], failedRequests: [], brokenImages: [], alive: true`.

Files changed: `src/routes/+page.svelte`, `src/routes/desk/+page.svelte`,
`src/routes/board/+page.svelte`, `src/routes/cast/+page.svelte`. The studio
store was not changed — every act a room needed already stood.
