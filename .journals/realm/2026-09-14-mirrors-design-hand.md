# 2026-09-14 — four mirrors refreshed from their waters

## The four refreshes

Each mirror is now byte-identical to its home in `../resonance-awen/tools/`.
Each `MIRROR.md` carries the new hash on its own copy line; no other line moved.

| mirror | home | lines changed | SHA256 (both) | recorded |
|---|---|---|---|---|
| `src/lib/binder/index.ts` | `the-binder/src/index.ts` | 382 | `11c0c7e48a74eb2ffe30aa53270b14c68e3e0d9060eea1eeeb16202fd6e2db45` | `11C0C7E48A74EB2F` |
| `src/lib/cumdach/index.ts` | `the-cumdach/src/index.ts` | 52 | `79cc7a1f9795dfd4dcf8ac22c3c11fcfe010fed98c4b56cfca5c9f07a6605f9f` | `79CC7A1F9795DFD4` |
| `src/lib/epagoge/index.ts` | `the-epagoge/src/index.ts` | 167 | `f7ff2197ea80e70fe3a2d288da6597baf1c81795f9efab4ec3b9e0257642300e` | `F7FF2197EA80E70F` |
| `src/lib/sky/index.ts` | `the-sky/src/index.ts` | 14 | `46f45240c238bbc3ec965df2083e9ca74d1f13a2c20208213e9c558bcf5f89ba` | `46F45240C238BBC3` |

Each recorded value is the first 16 of the digest, uppercase.

## What the refreshed waters carry

- the-binder: `DelimiterRow`, `DELIMITER_ALPHABET`, `Figures`, `figureSources`,
  `base64` are new exports; `impose(text, mode, figures?)` takes an optional
  third argument; `MARKUP_ALPHABET` gains `!` and `|`. Figures are read from
  `Manuscript.assets?`, an optional field; an absent figure is told and blocks
  nothing.
- the-epagoge: `Door`, `RoomState`, `InvitationWhy`, `Invitation`, `DoorState`,
  `Doorway`, `doorway()` are new exports.
- the-cumdach and the-sky: the drift is header comment blocks only; no
  declaration differs.

## What stands

`src/lib/cosmic/` is ziggy's to carry and was not touched. Census against
`../resonance-ziggy/modules/cosmic/`, read-only: 11 constants files identical,
0 drifted, 0 missing, none extra; the manifest's 21 stylesheets identical at
`src/lib/styles/generated/`. Scribe's manifest row names `stylesDir`
`src/lib/styles/generated` and `constantsMirror` `src/lib/cosmic`, and no
`tailwindConfig`.

`src/lib/binder/cli.ts` does not exist here and did not cross; the disk is
reached through `src/lib/host.ts`.

## What is short

- `src/routes/bind/+page.svelte:410` calls `typeset(ms, …)` with no `assets` on
  the manuscript, so body images are told-absent at bind time. The water can
  pack them; the room does not hand them over.
- The cumdach and sky header blocks that arrived with the refresh are the
  home's own. Four realms carried a one-line header for cumdach
  (hearth, sceal, scribe, sistrum) and six carried no header at all
  (bubbles, echoes, sirens, skapa, standards, weaver); the homes carry the
  block.
- `../resonance-ziggy/modules/cosmic/distribute.ts` has `--dry-run` but no
  per-app verb, and every run appends a row to `modules/cosmic/logs/RUN-LOG.md`.
  It was not run; the census above is a hash comparison only.
- `src/lib/envelope/MIRROR.md` and `src/lib/panti/MIRROR.md` record hashes for
  more than one file each; both mirrors are identical to their homes.
- `src/lib/sky/MIRROR.md:9` says the copy is "identical to the Hearth's own
  mirror - one truth, three homes". `resonance-hearth/src/lib/sky/index.ts` is
  `188094d8e8fa6a77`, the copy this mirror stood on before the refresh.
- `src/lib/epagoge/MIRROR.md:10` says the copy is "the same truth Compass's and
  Bubbles' mirrors carry". Compass is `fcd7545bf2fc24e0`, Bubbles is
  `c6d8b7cf88a23218`; neither equals the home.
- The cumdach, epagoge and sky `MIRROR.md` files are worded for Echoes
  ("the mirror keeps Echoes sovereign") and name `docs/CHECKLIST.md` as their
  record; this realm has no `docs/CHECKLIST.md`.
- `docs/RELEASE.md` and `reports/` stand untracked in the tree and are not part
  of this work.

## Verification

    npm run check
    COMPLETED 318 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS

    npm run build
    ✓ built in 4.87s · Using @sveltejs/adapter-static · Wrote site to "build" · ✔ done

    node .journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs   29 TRUE  0 FALSE
    node .journals/proofs/2026-09-02-the-bind/bind.mjs                    82 TRUE  0 FALSE  Every claim TRUE.
    node .journals/proofs/2026-09-02-the-rooms/rooms.mjs                  48 TRUE  0 FALSE  Every claim TRUE.
    node .journals/proofs/2026-09-13-the-atogail-importer/importer.mjs    74 TRUE  0 FALSE  Every claim TRUE.
    node .journals/proofs/2026-09-13-the-screenplay/screenplay.mjs        53 TRUE  0 FALSE  Every claim TRUE.

Before the refresh `bind.mjs` read 81 TRUE 1 FALSE, at
`the-binder/src/index.ts — the mirror's SHA256 equals its truth's`.
