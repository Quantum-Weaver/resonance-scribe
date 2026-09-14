# 2026-09-14 — the author's rooms: the door in, settings, and the studio envelope

The base's author row, rights column and whole-studio doors now have rooms.
Seven pieces: a store, the leading-in, the gate, settings, the rail's sixth
door, three changes in the bind room, and the studio envelope in `bind.ts`.

## the store

`src/lib/stores/author.svelte.ts` — the runes pattern: module-level `$state`,
one exported object of getters and methods, every act through `$lib/base.ts`.

- `load()` reads `getAuthor()`; `save(name, byline, contact)` writes
  `setAuthor(...)`. Both catch, neither throws.
- `reached` is true once the base has answered at all; `absent` is true only
  when it answered and there is no row. A base that will not answer leaves
  `absent` false, which is what keeps the gate quiet outside the Tauri window.
- `refusal` carries one plain sentence from the last act, `forget()` sets down
  what the store holds without touching the base.

## the door in

`src/routes/onboarding/+page.svelte` — six steps on the-epagoge:
`welcome` (threshold) · `name` · `byline` · `contact` (entries) · `theme`
(choose, `atMost: 1`, preset `dark`, offers from `PRESET_THEMES` by KEY) ·
`keep` (task).

- `beginWalk` · `enter` · `toggleChoice` · `skip` · `advance` · `dots` ·
  `completion` · `taskBegun` · `taskDone` · `taskTrouble`. The room keeps no
  second copy of where the walk stands.
- Every step carries `Next` and `Skip`; the dots are drawn from `dots(walk)`
  with `role="progressbar"` and the water's own `Step n of N`.
- The contact block is a textarea, may be left empty, and the room says the
  manuscript road notes an absent block rather than inventing one.
- `keep` writes the one row through the store and goes to the shelf. A base
  that will not answer becomes `taskTrouble` — one sentence on the screen,
  the walk standing where it is, the typed answers still in the boxes, and the
  button reading `Try again`.
- An author already standing fills the boxes on mount, so the door walked
  again shows what stands.

## the gate

`src/routes/+layout.svelte` — `onMount` calls `authorStore.load()` once for
the shell, not once per room. When the base answered and the row is absent and
the path is not `/onboarding`, `goto('/onboarding')`. When the base did not
answer, nothing is said and every room stands.

## settings

`src/routes/settings/+page.svelte`, six sections in order.

- **The author** — name, by-line, contact, `Save`, and `Walk the door again`
  to `/onboarding`. The boxes follow the stored row the first time it arrives
  and never again.
- **Theme** — `PRESET_THEMES` cards, display mode, background tint, type size,
  each group labelled.
- **The studio** — works, parts, eras, characters and arcs counted from
  `readAll()`.
- **Export** — `readAll()`, `studioEnvelopeOf(dump, { appVersion, at })` with
  the clock read in the room, `deliver(scribeHost(), envelope)`. The counts on
  the outside and the sealing moment are said in the room.
- **Import** — `openFrom(scribeHost(), 'resonance-scribe')`. A `scribe-studio`
  envelope is read by `readingToStudioImport`, a `scribe-work` envelope by
  `readingToImport`; either way the room shows what the file holds before
  anything is created, and `Create them` creates each work as a NEW work with
  every id minted by the base. The author in a studio file is written only
  when none stands; otherwise the room says so and offers `Replace` behind one
  confirmation.
- **Purge** — `Export, then purge` and `Purge without export`, each behind two
  confirmations drawn in the room. The export is awaited and a failed export
  stops the purge; then `purgeAll()`, `localStorage.clear()`, the stores set
  down, and `/onboarding`. There is no native `confirm()` anywhere.

## the rail

`src/lib/components/Rail.svelte` — a sixth door, `⚙️ Settings`, in the same
shape as the five, coloured `void.light`.

## the bind room

`src/routes/bind/+page.svelte`:

- the by-line box falls back to `authorStore.byline` when the work carries
  none of its own;
- the contact block fills from `authorStore.contact` until a hand types over
  it, and goes on to the-pandulipi as `FolderOptions.contact`, one line per
  line, verbatim;
- a drawn licence is written to the work with `setWorkRights(w.id,
  JSON.stringify(drawn))`, set aside writes `null`, and a work whose `rights`
  is not null re-opens the drawer with the licence, its holder, its permitted
  words and its shares restored. `licenceOf` refuses a rights column it cannot
  read and opens empty rather than half-filled.

## the studio envelope

`src/lib/bind.ts`, beside the work envelope and pure:

- `STUDIO_FORMAT = 'scribe-studio'` · `STUDIO_VERSION = 1` · `StudioAuthor` ·
  `ScribeStudio` · `rowsOfWork(dump, workId)` · `studioEnvelopeOf(dump,
  stamp)` · `StudioImportPlan` · `readingToStudioImport(reading)`.
- Each entry of `works` is exactly what `envelopeOf` seals for that work.
- The counts on the outside are counted from the inside, the author as 1 or 0.
- `readingToImport`'s body is now `planOfWork(data, outsideCounts)`, called by
  both readers, so a work inside a studio file gets the reading a lone
  `.scribe.json` gets.
- Both readers refuse the other's format in one plain sentence, refuse a newer
  version rather than upgrading silently, and name every unknown key without
  storing it. A work inside a studio file that cannot be read is named and
  left out; the rest still come in.

## verification

- `npm run check` — 323 files, 0 errors, 0 warnings.
- `npm run build` — clean, written to `build`.
- `.journals/proofs/2026-09-02-the-bind/bind.mjs` — 107 claims TRUE, exit 0.
  New: the studio envelope sealed and read back over a two-work fixture with
  an author (the seal, the author riding whole, each work byte-identical to
  its own `envelopeOf`, no row crossing between works, the counts, the round
  trip, both works planned, no file id anywhere on the plan, unknown keys told
  and not stored, each format refusing the other, a newer version refused, a
  bad work named and left out), and `setWorkRights` standing in exactly two
  files — `src/lib/base.ts` and the bind room.
- `.journals/proofs/2026-09-02-the-rooms/rooms.mjs` — 48 claims TRUE, exit 0.
  Its "the-panti orders or narrows every list a room shows" filter now names
  onboarding and settings beside the bind and the layout: none of them shows a
  list of the author's rows.
- `.journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs` — 85 TRUE,
  exit 0. `.journals/proofs/2026-09-13-the-atogail-importer/importer.mjs` — 74
  TRUE, exit 0. `.journals/proofs/2026-09-13-the-screenplay/screenplay.mjs` —
  54 TRUE, exit 0.
- The looking glass over the built site (`chrome.mjs`, `vite preview` on 4173,
  `drive.mjs`, `chrome.mjs --stop`): `/` stays at `/` outside the window;
  `/onboarding` walks all six steps with `Step 1 of 6` through `Step 6 of 6`,
  the entries reaching the closing panel (`Wren Halloway`, `W. Halloway`,
  `3 line(s)`, `ocean`); the save says *"Nothing was written, and everything
  you have typed is still here — Cannot read properties of undefined (reading
  'invoke')"* and stays on the room; `/settings` draws its six sections, the
  six-door rail with `aria-current` on Settings, 27 controls with an
  accessible name each and none without, the three labelled groups, and the
  purge's two confirmations and cancel; the export road answers with a
  sentence. Every room — `/`, `/desk`, `/board`, `/cast`, `/bind`,
  `/settings`, `/onboarding` — reports `alive: true`, no exceptions, no failed
  requests, no broken images.
