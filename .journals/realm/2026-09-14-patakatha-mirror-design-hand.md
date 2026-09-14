# 2026-09-14 — the-patakatha mirrored

## What was mirrored

`src/lib/patakatha/index.ts` is a byte-faithful copy of
`../resonance-awen/tools/the-patakatha/src/index.ts`, 805 lines, the water that
carries the screenplay format.

| file | home | SHA256 (both) | recorded |
|---|---|---|---|
| `src/lib/patakatha/index.ts` | `the-patakatha/src/index.ts` | `86dca8753e77c84cb13a01506d7c3de225f556eed287cda0890f9dfcb956044f` | `86DCA8753E77C84C` |

The recorded value is the first 16 of the digest, uppercase, on the copy line of
`src/lib/patakatha/MIRROR.md`.

`index.ts` alone crossed. `verify.mjs` did not: it imports `node:fs` and the
water's `dist`, and reads a folder from disk. The `fixture/` folder and `dist/`
did not cross. The mirror has zero imports of any kind.

## What the mirror carries

The door is `patakatha({ work, parts }, options?, telling?)`; one body goes
through `screenplay(body, from, m)`; the text comes out of `asText(pages)`; the
reading is `readElements(body, from, m)`; the whole result is `Script`, a part
is `PartFile { name, title?, body }`. Every element carries byte offsets into a
named source and is a byte-exact slice of it; the characters no element covers
are `SEPARATORS`. `Measure` is data, with `PAGE_PLAN`, `planFor` and
`FORMAT_DEFAULT` exported. An empty manuscript comes back as a `Refusal` in one
plain sentence. `MIRROR.md` carries the full name map against
`src/lib/screenplay.ts`.

The arithmetic is `src/lib/screenplay.ts`'s: the measure, the six elements, the
indents, the spacing, the widow rules, the runtime.

## What stands

`src/lib/screenplay.ts` is untouched and is still what `src/routes/desk/` and
`src/routes/bind/` import. The mirror is not yet imported anywhere. The routes,
the proofs and `src/lib/cosmic/` were not touched.

## Verification

```
$ sha256sum src/lib/patakatha/index.ts ../resonance-awen/tools/the-patakatha/src/index.ts
86dca8753e77c84cb13a01506d7c3de225f556eed287cda0890f9dfcb956044f *src/lib/patakatha/index.ts
86dca8753e77c84cb13a01506d7c3de225f556eed287cda0890f9dfcb956044f *../resonance-awen/tools/the-patakatha/src/index.ts

$ npm run check
> resonance-scribe@0.2.0 check
> svelte-kit sync && svelte-check --tsconfig ./tsconfig.json

1789404361088 START "g:\materia\resonance-scribe"
1789404361091 COMPLETED 319 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS
```
