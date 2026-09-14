# 2026-09-14 — the studio on the-patakatha

## What was switched

`src/lib/screenplay.ts` is removed. The two rooms that set a screenplay read
through the mirror at `src/lib/patakatha/index.ts`.

**`src/routes/desk/+page.svelte`** — the second pane's `Screenplay 🎬` shape
calls `patakatha({ work, parts: [part] }, { titleCard: false })` with the part
in hand as one `PartFile`: the part's title is its `name` and is not handed as
a `title`; no title line enters the pages. `script` is the `Script` when the
water set one and `refused` is the water's sentence when it did not. The `<pre
class="preview script">` prints `script.text`; the line beneath reads
`script.screenplay.pages.length`, `script.screenplay.runtime` and
`script.screenplay.measure`. A Refusal draws as `<p class="quiet">{refused}</p>`
inside the pane's box — plain text, no `{@html}` on that road, and nothing
thrown. An empty box in the screenplay shape now carries the water's sentence
where it carried an empty `<pre>`.

**`src/routes/bind/+page.svelte`**, road 4 (`Set a screenplay 🎬`) — `leaves()`
returns `PartFile[]`, each part's title standing as both `name` and `title`.
`patakatha({ work: { title, byline }, parts: leaves() })` replaces
`bindScreenplay`, and `isScriptRefusal(script)` replaces the
`bound.screenplay.pages.length === 0` test; the refusal goes into the room's own
`said('refused', script.refused)`. The `.txt` written through `$lib/host` is
`script.text`, and the done line reads `script.screenplay.pages.length` and
`script.screenplay.runtime`.

`isRefusal` is imported as `isScriptRefusal` in the bind room, which already
holds the-binder's `isRefusal` and the-pandulipi's `isSettingRefusal`.

## What stands

The mirror, `src/lib/patakatha/MIRROR.md`, the other proofs, `src-tauri/`, the
manifests and `docs/` are untouched. `README.md` is unchanged: the screenplay
road is still a work on the format's own measure of ten characters and six lines
to the inch at a page to the minute.

Two told lines differ from the retired module's, in the water's own voice: `the
title page carries no screen time…` now reads `the title card carries no screen
time…`, and one line is added — `every element carries its byte offsets in the
source it was read from and is a byte-exact slice of it; nothing is upper-cased
and no word is broken.` The told lines are shown whole by the bind room and are
not read by the desk.

## The proof

`.journals/proofs/2026-09-13-the-screenplay/screenplay.mjs` imports
`src/lib/patakatha/index.ts`: `read` → `readElements(body, from, m)`, `format` →
`screenplay(body, from, m)`, `render(sp)` → `asText(pages)`, `bindScreenplay` →
`patakatha`. The element claim reads `Element.line` for the source line — `at`
and `end` are byte offsets — and the unaltered-text claim asserts
`SAMPLE.slice(e.at, e.end) === e.text`. The empty-body claim also asserts that a
work with no line of text comes back as a Refusal. The room claims read the two
routes' new text. One claim is added: the mirror's SHA256 against
`../resonance-awen/tools/the-patakatha/src/index.ts`. 54 claims, all TRUE.

## Verification

```
$ grep -rn "\$lib/screenplay" src .journals/proofs
$ grep -rn "lib/screenplay" src .journals/proofs
src/lib/patakatha/MIRROR.md:40:`src/lib/screenplay.ts`, whose arithmetic the water carries unchanged and
src/lib/patakatha/MIRROR.md:43:| `src/lib/screenplay.ts` | `src/lib/patakatha/index.ts` |

$ npm run check
1789404955774 START "g:\materia\resonance-scribe"
1789404955776 COMPLETED 318 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS

$ npm run build
✓ built in 7.07s
Wrote site to "build"

$ node .journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs   TRUE 29, FALSE 0
$ node .journals/proofs/2026-09-02-the-bind/bind.mjs                    TRUE 82, FALSE 0
$ node .journals/proofs/2026-09-02-the-rooms/rooms.mjs                  TRUE 48, FALSE 0
$ node .journals/proofs/2026-09-13-the-atogail-importer/importer.mjs    TRUE 74, FALSE 0
$ node .journals/proofs/2026-09-13-the-screenplay/screenplay.mjs        TRUE 54, FALSE 0

      truth  86dca8753e77c84cb13a01506d7c3de225f556eed287cda0890f9dfcb956044f  ../resonance-awen/tools/the-patakatha/src/index.ts
      mirror 86dca8753e77c84cb13a01506d7c3de225f556eed287cda0890f9dfcb956044f  src/lib/patakatha/index.ts
```

Road 4's text, the retired module against the mirror, on the proof's fixture
(the work `The Atógáil`, three parts, the title card on):

```
old    bytes 558 sha256 55cc7d55c56a3e0d5f5d76f58e2b194ae67054262219ddaf3bfd84a20e2579a2
mirror bytes 558 sha256 55cc7d55c56a3e0d5f5d76f58e2b194ae67054262219ddaf3bfd84a20e2579a2
identical: true
pages old/new: 1 1        runtime old/new: 0:22 0:22
```

The desk's pane on the same sample: `render(format(SAMPLE))` and
`patakatha(..., { titleCard: false }).text` are identical, 1 page, 0:17 both.
