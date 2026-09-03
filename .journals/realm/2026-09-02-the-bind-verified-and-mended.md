# 2026-09-02 · the bind room verified, and one grant mended

*Sley 🎻, Fable (Claude), truly `claude-fable-5-1`, the conductor's chair,
picking up handoff 43 at KP's word ("please continue on with 43"). S3 was built
by an Opus hand and verified by a Sonnet hand that did not build it; this entry
is the conductor's, for the one thing the verifier found and the one line that
mended it. Nothing committed; the sync word is KP's.*

## What the verifier did

Every gate re-run from a clean shell — `guard-gen` (exit 1 on the icons alone,
the standing true reading), `npm run check` 316 files 0/0, `npm run build`
green, `cargo check` clean, the bind proof 81/81, S2's rooms proof 48/48, S1's
round-trip 29/29 — with the six mirror hashes recomputed rather than read off
the proof, `host.ts`, `bind.ts` and the whole 1335-line bind room read, the
scene-break claim checked against the two waters' own regexes, the `movement`
column confirmed absent, the snapshot retry loop confirmed bounded and unable
to overwrite, and every `as`/`@ts-` in `src/` accounted for (none in S3's
files; one in a byte-identical mirror, pre-existing in its truth).

## What did not hold — and could not have been seen by any gate

**`src-tauri/capabilities/default.json` did not grant `fs:allow-write-text-file`.**
`host.ts` writes every string through `writeTextFile`, which invokes
`plugin:fs|write_text_file` — its own command, with its own grant.
`fs:allow-write-file` grants `write_file · open · write` and nothing else; the
plugin's own manifest (`src-tauri/gen/schemas/acl-manifests.json`) says so, and
I read it. Tauri refuses a command at the ACL before any scope is consulted, so
in a real window three of the five ways out — the manuscript folder, the paged
HTML, the standard manuscript — and the envelope's snapshot copy would have
refused every write with the platform's own sentence. The EPUB (bytes through
`writeFile`) and the envelope's primary save (bytes through the injected
`writeFile`) were the only two that would have landed.

The builder's journal said, in as many words, that no capability needed adding.
That was wrong, and it was wrong in a way no gate here can see: `svelte-check`,
`vite build`, `cargo check` and a node proof never touch the ACL. It survived
every green gate for exactly that reason.

## The mend

One line: `"fs:allow-write-text-file"` added to the capability, beside
`allow-write-file`. `cargo check` recompiled and finished with zero warnings —
the capability is re-read and validated at that step, so an unknown grant name
would have failed there.

And one claim, so it stays mended: the bind proof now reads
`capabilities/default.json` and checks every verb `host.ts` imports against a
map of its grant (`exists → fs:allow-exists · mkdir → fs:allow-mkdir ·
readFile → fs:allow-read-file · writeFile → fs:allow-write-file ·
writeTextFile → fs:allow-write-text-file · open → dialog:allow-open ·
save → dialog:allow-save · appDataDir → core:default`), and goes FALSE naming
any verb that is ungranted or unmapped. **82 TRUE, 0 FALSE**, re-run after the
mend. A new verb in `host.ts` must now add its grant in two places, and the
proof says which.

## What is still honestly unproven

Unchanged from the builder's account, and the verifier added nothing to it and
took nothing from it: no dialog has opened, no byte has been written, the fs
SCOPE on a folder the dialog granted has not been exercised (this mend was the
ACL, one layer before scope), no reader has been handed the EPUB, no room has
been seen. CHILD-BUILDS step 8: KP's own hands.

## The rows

Item 593 ticked. Plan 91's three movements have all run, each verified by a
hand that did not build it; what remains on it is KP's — the sync word, his
eyes on the four rooms, `tauri icon`, the water's name, the Android day. The
realm's handoff re-cut into the base.
