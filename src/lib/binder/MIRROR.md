# DISTRIBUTED MIRROR - the source of truth lives in resonance-awen

As of 2026-09-02 (THE BIND ROOM - movement S3 of
`resonance-chamber/desk/THE-AUTHORS-STUDIO.md`, whose plan names the-binder as
the water behind two of the four ways out), the binding's single editable
truth is:

    C:\_superposition\resonance-awen\tools\the-binder\src\index.ts

Do not edit index.ts in THIS folder - it is a byte-faithful mirror
(SHA256 verified at the copy: 556E08E073BFA12F), to be refreshed by
distribution runs as the house's delivery pipeline stands up, the same road
cosmic, the-cumdach, the-epagoge and the-panti already travel. Dialect
changes, container changes and page-plan changes happen in the water.

WHAT CROSSED, AND WHAT DID NOT. `src/index.ts` alone. The water's `src/cli.ts`
did NOT cross and is not a mirror here: it is a node door - it imports
`node:fs` and `node:zlib`, it writes files, and it deflates. This app reaches
the disk through `src/lib/host.ts` and nowhere else, and its container is
written store-only in `src/lib/bind.ts` (`zipStore`), by hand, from the same
byte layout the door uses - local file headers, the central directory, the end
record, the DOS-epoch timestamps - with the mirror's own `crc32` and `utf8`
doing the arithmetic. `src/host-surface.d.ts` is the door's module surface and
did not cross either, for the same reason. Reading the door to learn the
layout is not mirroring it; nothing of it stands in this repo.

WHY THIS REALM CONSUMES IT: the bind room is where a finished work leaves this
studio, and the-binder is what makes a book out of it - an EPUB 3 as an ordered
file map, and one self-contained paged HTML for print. Two things in it are
the reason it is this water and not another:

1. **It alters no text.** `EDITORIAL_LAW` is exported as data with its address
   (`resonance-chamber/desk/POTENTIALITIES.md:31`), and every literal run it
   emits carries the byte offsets it was cut from. That is the same law the
   desk keeps at the other end of the studio - `updatePart` stores a body byte
   for byte - so a work can cross this whole app from the keystroke to the
   EPUB without one character being improved.
2. **It reads no clock and touches no disk.** `front.modified` is REFUSED when
   blank rather than guessed, so the room reads the clock and states it; the
   container's timestamps are pinned to the DOS epoch, so the same work binds
   to the same bytes forever.

`lineBreaks` defaults to `'keep'` (the verse reading) and the room offers both
by name, with the-pandulipi's own `'fold'` default named honestly beside it.
`PAGE_DEFAULT` is exported, so the print plan's trim size and margins are read
rather than guessed, and every one of its fields is a field in the room.

THE SPHRAGIS IS CONSUMED AS KEYS, NOT AS AN IMPORT - by this water and by this
room. `front.rights` is `{ holder, grants[{ name, permits, revocable,
exclusive }], split, notice }`, and the-binder prints what it is handed and
interprets no term. This repo also mirrors the-sphragis itself
(`src/lib/sphragis/`), so the rights drawer DRAWS a licence with `draw()` and
then hands the-binder the keys - two waters, side by side, neither importing
the other.

Record: RUN-LOG.md, and this realm's .journals/realm/2026-09-02-the-bind.md
(the bind room, S3); the water's own record is
resonance-awen/tools/the-binder/README.md.
