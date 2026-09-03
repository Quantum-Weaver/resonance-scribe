// THE HOST SURFACE — declared here, implemented nowhere in this water.
//
// The envelope seals bytes. It does not land them anywhere, it opens nothing
// on a disk, and there is no path through `src/index.ts` by which a file of
// yours could be written or read: the vessel decides where the export lands
// and which file comes back, and the vessel is the host. Six repos each
// re-implemented the landing (realms · sirens · compass · nemeton · echoes ·
// bubbles) and five more re-implemented the chooser (sceal · ardan · khoros ·
// lantern · tarocchi), and the Android leg was never proven once, because
// every one of them wrote the mechanism into the app instead of naming the
// surface. This is the naming.
//
// NON-AMBIENT BY LAW. This file is a module — it exports types and declares
// no globals. An ambient declaration here would collide with the repo-root
// `@types/node` the moment a hand added one, and the water would break in a
// place nobody was looking. (the-ffynnon's `src/host-surface.d.ts:1-6`
// learned this first.)
//
// THREE VERBS AND NO FOURTH:
//   suggest — CHOOSE THE DESTINATION. A dialog, a fixed Downloads path, a
//             browser's own filename. `null` is the vessel declining, and
//             declining is an answer, not a failure.
//   write   — LAND THE BYTES at the destination `suggest` returned.
//   pick    — THE DOOR THE OTHER WAY. Ask the vessel for one file and hand
//             back its name and its bytes. `null` is the vessel declining
//             again — the same answer, never an error.
// There is no `list`, no `remove`, no `readAt(path)`: a surface that could
// walk the disk on its own is a surface that will one day be asked to. `pick`
// can only ever return what a vessel deliberately chose, one file at a time.
//
// WHY THE THREE ARE ONE HOST. The two doors of a sovereignty page are the
// same door on the same platform: whatever knows how to save on this machine
// knows how to open on it. `resonance-cruthu/src/lib/ground.ts` (160 lines)
// is the proof by existence — one seam, two backends, chosen at runtime. A
// vessel that only exports may type its host as `DeliveryHost` below and owe
// no chooser.

/** What a chooser hands back: one file the vessel deliberately chose. */
export interface PickedFile {
	/** The file's own name — a basename on desktop, the chooser's name in a browser. */
	name: string;
	bytes: Uint8Array;
}

export interface EnvelopeHost {
	/** Choose where the export lands. `null` = the vessel declined; nothing is written. */
	suggest(name: string): Promise<string | null>;
	/** Land the bytes. Throwing is allowed and is carried back as a sentence — never as a crash. */
	write(destination: string, bytes: Uint8Array): Promise<void>;
	/** Ask for one file. `null` = the vessel declined; nothing is opened. Throwing is carried back as a sentence. */
	pick(): Promise<PickedFile | null>;
}

/**
 * The two verbs `deliver` needs, and no more. A vessel whose page only
 * exports implements these and is a whole host for that road; the day it
 * grows an import it grows a `pick` and becomes an `EnvelopeHost`.
 */
export type DeliveryHost = Pick<EnvelopeHost, 'suggest' | 'write'>;
