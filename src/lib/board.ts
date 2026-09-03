// THE BOARD'S ARITHMETIC — framework-free, and it imports nothing but types.
//
// Everything here is a pure function over ids and numbers. No Svelte, no DOM,
// no `invoke`, no clock, no randomness: hand it the same arguments and it
// hands back the same answer, which is what lets
// `.journals/proofs/2026-09-02-the-rooms/rooms.mjs` run THIS FILE in node
// rather than a twin of it. (Node ≥ 23.6 strips the types; every import below
// is `import type`, so nothing here has to resolve at runtime.)
//
// TWO LAWS LIVE IN THIS FILE, and they are why it exists at all:
//
//   1. A MOVE IS IDS AND NOTHING ELSE. `reorderWithin` returns `string[]`.
//      There is no place in this file to put a body, a title or a timestamp,
//      so `reorderParts(workId, ids)` is the only call a drag can lead to and
//      a move on the board can never read as an edit of the author's text.
//      (`src-tauri/src/base.rs` `reorder_parts` writes `ord` alone; S1's proof
//      says so of the base, this file says so of the window.)
//
//   2. THE ARRAY YOU GIVE IS THE ARRAY YOU KEEP. Every function here copies
//      before it changes anything, so a runes store holding the array the base
//      handed back is never rewritten underneath it. The-panti's `sortData`
//      holds the same law and for the same reason.

import type { Appearance, ArcShape } from '$lib/types/types';

// ── order ────────────────────────────────────────────────────────────────

/**
 * `ids` with `movedId` lifted out and put back at `toIndex`.
 *
 * Returns a NEW array; the one handed in is byte-untouched. `toIndex` is
 * clamped to the list, so a drop past either end lands at that end rather
 * than throwing. An id that is not in the list is not a move: the same order
 * comes back (as a copy), because refusing loudly would only turn a stale
 * card into an error the author did not cause.
 */
export function reorderWithin(ids: string[], movedId: string, toIndex: number): string[] {
	const from = ids.indexOf(movedId);
	if (from === -1) return [...ids];
	const rest = ids.filter((id) => id !== movedId);
	const at = Math.max(0, Math.min(toIndex, rest.length));
	return [...rest.slice(0, at), movedId, ...rest.slice(at)];
}

/**
 * The keyboard twin of a drag: `movedId` one place up (`-1`) or down (`+1`).
 * Every drag on the board has one of these behind a button, because a drag
 * that only a mouse can perform is a door only a mouse can open.
 */
export function nudge(ids: string[], movedId: string, delta: number): string[] {
	const from = ids.indexOf(movedId);
	if (from === -1) return [...ids];
	return reorderWithin(ids, movedId, from + delta);
}

// ── where a part hangs ───────────────────────────────────────────────────

/**
 * An appearance row is single-purpose in this studio: a part in an era is
 * `{ part_id, era_id }`, a character on a part is `{ part_id, character_id }`,
 * an arc through a part is `{ part_id, arc_id }`. So an ERA PLACEMENT is the
 * row that names a part and an era and nothing else — checking for the
 * absence of the other two hands is what keeps a character's mark from being
 * mistaken for a placement and deleted by a move.
 */
export const isPlacement = (a: Appearance, partId?: string): boolean =>
	a.part_id !== null &&
	a.era_id !== null &&
	a.character_id === null &&
	a.arc_id === null &&
	(partId === undefined || a.part_id === partId);

/** The era ids a part hangs on. Data is truth: a part placed in two eras
 *  returns two, and the board draws it in both columns. */
export const erasOfPart = (appearances: Appearance[], partId: string): string[] =>
	appearances.filter((a) => isPlacement(a, partId)).map((a) => a.era_id as string);

/** The part ids placed in one era. */
export const partsInEra = (appearances: Appearance[], eraId: string): string[] =>
	appearances.filter((a) => isPlacement(a) && a.era_id === eraId).map((a) => a.part_id as string);

/** The part ids placed in no era at all — the board's first column. */
export const unplacedParts = (appearances: Appearance[], partIds: string[]): string[] => {
	const placed = new Set(appearances.filter((a) => isPlacement(a)).map((a) => a.part_id as string));
	return partIds.filter((id) => !placed.has(id));
};

/** What a move between eras costs the base, as data. */
export interface EraMove {
	/** The placement rows to delete — every era this part currently hangs on. */
	deleteIds: string[];
	/** The row to create, or null when the part is being taken off the board. */
	create: { partId: string; eraId: string } | null;
}

/**
 * Moving a part to an era, as the two calls it actually is.
 *
 * There is no `update_appearance` in this body, by S1's design: an appearance
 * says one thing — this hangs on that — and a change of mind is a new row and
 * a deleted one. So a move is `deleteAppearance` for every placement the part
 * already had, then one `createAppearance`.
 *
 *   already in era A, moving to B  → one delete, one create
 *   in no era, placed into B       → no delete, one create
 *   in era A, taken off the board  → one delete, no create
 *   already in B, "moved" to B     → nothing at all
 *
 * The last line is not an optimisation — re-writing a row that already says
 * the right thing would move a work's `updated_at` for a move that did not
 * happen.
 */
export function moveToEra(
	appearances: Appearance[],
	partId: string,
	toEraId: string | null
): EraMove {
	const current = appearances.filter((a) => isPlacement(a, partId));
	if (toEraId !== null && current.length === 1 && current[0].era_id === toEraId) {
		return { deleteIds: [], create: null };
	}
	return {
		deleteIds: current.map((a) => a.id),
		create: toEraId === null ? null : { partId, eraId: toEraId }
	};
}

// ── the marks and the threads ────────────────────────────────────────────

/** The character ids marked on a part. */
export const charactersOfPart = (appearances: Appearance[], partId: string): string[] =>
	appearances
		.filter((a) => a.part_id === partId && a.character_id !== null)
		.map((a) => a.character_id as string);

/** The arc ids threaded through a part. */
export const arcsOfPart = (appearances: Appearance[], partId: string): string[] =>
	appearances
		.filter((a) => a.part_id === partId && a.arc_id !== null)
		.map((a) => a.arc_id as string);

/** Is there already a row saying this? Asked before every create, so a second
 *  click on the same toggle removes rather than duplicates. */
export const hangId = (
	appearances: Appearance[],
	partId: string,
	hand: 'character_id' | 'arc_id',
	otherId: string
): string | null => appearances.find((a) => a.part_id === partId && a[hand] === otherId)?.id ?? null;

/** Anything the board lays out that stands for a part. */
export interface Carded {
	partId: string;
}

/**
 * An arc's thread: the cards it runs through, IN BOARD ORDER.
 *
 * `cards` is the order they are actually laid out in — column by column, card
 * by card — so the polyline follows the reader's eye and not the order the
 * appearance rows happened to be written in. It takes CARDS rather than part
 * ids because a part placed in two eras has two cards, and the thread visits
 * both: data is truth, and a thread that skipped one would be drawing a
 * different board from the one on the screen.
 */
export function threadThrough<T extends Carded>(
	appearances: Appearance[],
	arcId: string,
	cards: T[]
): T[] {
	const on = new Set(
		appearances
			.filter((a) => a.arc_id === arcId && a.part_id !== null)
			.map((a) => a.part_id as string)
	);
	return cards.filter((c) => on.has(c.partId));
}

// ── the thread's geometry, as numbers ────────────────────────────────────

export interface Point {
	x: number;
	y: number;
}

/** The four corners a browser hands back, without the browser. */
export interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** A box's middle, in the overlay's own coordinates. */
export const centerOf = (box: Box, origin: { left: number; top: number }): Point => ({
	x: box.left - origin.left + box.width / 2,
	y: box.top - origin.top + box.height / 2
});

/**
 * The `points` attribute of an SVG polyline, rounded to a tenth of a pixel so
 * a resize that moves nothing produces the same string and the browser has
 * nothing to repaint.
 */
export const polylinePoints = (points: Point[]): string =>
	points.map((p) => `${round(p.x)},${round(p.y)}`).join(' ');

const round = (n: number): number => Math.round(n * 10) / 10;

/**
 * Which of the four thread colours an arc wears. The colours themselves live
 * in the room (they are `QUANTUM_COLORS`, the family's own), because this file
 * imports types and nothing else; what belongs here is the RULE — four named
 * shapes, four ranks, and every shape the author invents lands on `other`'s.
 */
export const shapeRank = (shape: ArcShape): number => {
	switch (shape) {
		case 'rising':
			return 0;
		case 'turning':
			return 1;
		case 'resolving':
			return 2;
		default:
			return 3;
	}
};
