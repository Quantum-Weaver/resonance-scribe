# 2026-09-13 — the two proofs repointed, the bible importer, the screenplay

## 2.46 · the two proofs off the C: path

`C:/_superposition` does not stand on this machine. Both proofs crashed at
their mirrors section with `ENOENT`.

- `.journals/proofs/2026-09-02-the-bind/bind.mjs:39` — `AWEN` is now
  `resolve(repo, '..', 'resonance-awen', 'tools')`.
- `.journals/proofs/2026-09-02-the-rooms/rooms.mjs:59` — the same `AWEN`,
  and its three mirror pairs at lines 346, 351, 356 read `join(AWEN, …)`.

Both green. `bind.mjs` 82 TRUE 0 FALSE; `rooms.mjs` 48 TRUE 0 FALSE.

## 2.47 · the bible-to-scribe importer

- `src/lib/atogail.ts` — reads `THE-THREE-DOORS.md` and emits this studio's
  rows. Touches no disk and no clock. Book door: 11 divisions as eras, 55
  chapters as parts. Series door: 7 seasons as eras, 55 episodes as parts.
  Each part hangs on its era and carries `span · …`, `ore · …` and
  `bible · THE-THREE-DOORS.md:<line>` as appearance notes; an episode also
  carries `act · …` and `beats · …`. Every body is empty.
- `tools/atogail-import.mjs` — dry by default; `--write` needs `--out <dir>`;
  a file that already stands is refused by name. Writes
  `atogail-book.scribe.json` and `atogail-series.scribe.json`, sealed by
  `envelopeOf` and opened by `readingToImport`.
- The bible is read at `../resonance-chamber/desk/records/the-atogail/bible/
  THE-THREE-DOORS.md` and is not written to.
- A beat name is a bold run at a beat head, at most 80 characters, carrying no
  quotation mark. 141 beat names across 49 of the 55 episodes.
- `.journals/proofs/2026-09-13-the-atogail-importer/importer.mjs` — 74 TRUE,
  0 FALSE. 55 chapters (2+6+5+7+5+6+7+5+6+3+3), 55 episodes
  (8+10+10+10+10+4+3), 165 and 269 appearances.

## 3.29 · the screenplay format

- `src/lib/screenplay.ts` — slugline, action, character, parenthetical,
  dialogue, transition. US Letter, 12pt Courier: 10 characters and 6 lines to
  the inch, margins 1in/1in/1.5in/1in → 60 columns by 54 lines, one page to
  the minute. Indents: slugline and action 0, dialogue 10, parenthetical 16,
  character 22; a transition is flush right at 60. No import, no dependency.
  No text is upper-cased and no word is broken.
- `src/routes/desk/+page.svelte` — the second pane reads the same text as
  prose or as a screenplay, with the page count and the runtime. The
  screenplay road prints text in a `<pre>`; no `{@html}` on it.
- `src/routes/bind/+page.svelte` — road 4, `Set a screenplay 🎬`, writes a
  `.txt` through `$lib/host`. The manuscript road is now 5 and the envelope 6.
- `README.md:24` — five ways out and a sixth road.
- `.journals/proofs/2026-09-13-the-screenplay/screenplay.mjs` — 53 TRUE,
  0 FALSE. The sample sets 9 elements on 1 page at 0:17; 120 spaced action
  lines set 5 pages at 5 minutes.

## the gate

`npm run check` — 318 files, 0 errors, 0 warnings.
`npm run build` — built, site written to `build`.
All five proofs exit 0: round-trip 29, bind 82, rooms 48, importer 74,
screenplay 53.
