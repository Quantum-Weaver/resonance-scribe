# The purge ends in a choice

One address: `src/routes/settings/+page.svelte`.

## What stands

`runPurge` no longer calls `goto('/onboarding')`. After `purgeAll()` answers,
the road runs `localStorage.clear()`, sets down `authorStore` and `workStore`,
empties the three author boxes and drops `filled`, returns `purgeState` to
`idle`, and sets the closing sentence — `N rows went. The studio is empty.` —
with a new `purgeDone` flag. Then it reads the room back: `countStudio()` and
`authorStore.load()`, so the counts show zero and the author section reads
*No author stands here yet.* — what a fresh load of a purged base shows.

Beneath the sentence, while `purgeDone` stands, two buttons:

- `To the door` — `goto('/onboarding')`.
- `Stay` — clears `purgeDone`; the sentence and the emptied room remain.

No timer. `purgeDone` is cleared at the head of `runPurge` and in `startPurge`,
so a refused purge carries no doors and its sentence is unchanged.

## The gate

```
npm run check      COMPLETED 323 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS
npm run build      Wrote site to "build"  ✔ done
node .journals/proofs/2026-09-02-the-rooms/rooms.mjs   48 TRUE, 0 FALSE — Every claim TRUE.
node .journals/proofs/2026-09-02-the-bind/bind.mjs    107 TRUE, 0 FALSE — Every claim TRUE.
```

## The looking glass

`../resonance-ziggy/modules/looking-glass`: `chrome.mjs`, `npm run preview` on
port 4173, `drive.mjs --url http://localhost:4173/settings` with a visit script
kept in the scratchpad, `chrome.mjs --stop`. The page's
`window.__TAURI_INTERNALS__.invoke` was stubbed in the browser — one work, two
parts, an era, a character, an arc and an author until `purge_all`, which
answers 7 and leaves `read_all` empty with a null author and `get_author` null.
`Purge without export` → `Continue` → `Purge everything`:

| reading | before | after the purge | after `Stay` | after `To the door` |
|---|---|---|---|---|
| sentence | — | `7 rows went. The studio is empty.` (tone `done`) | same | — |
| buttons under it | — | `To the door` · `Stay` | `Export, then purge` · `Purge without export` | — |
| counts | works 1 · parts 2 · eras 1 · characters 1 · arcs 1 | all 0 | all 0 | — |
| author section | boxes filled | `No author stands here yet.`, boxes empty | same | — |
| `localStorage.length` | 3 | 0 | 0 | — |
| `location.pathname` | `/settings` | `/settings` | `/settings` | `/onboarding` |

Reloaded and walked again, `To the door` lands on `/onboarding`, heading
*Welcome to the studio ✍️*.

`exceptions: [], failedRequests: [], brokenImages: [], alive: true`.
