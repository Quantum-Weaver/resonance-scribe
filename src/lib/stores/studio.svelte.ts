// THE STUDIO — the chosen work's five lists, and every act that changes them.
//
// The runes pattern (`ui.svelte.ts`): module-level `$state`, one exported
// object of getters and methods. The rooms read the getters and call the
// methods; they never hold a copy of a list of their own, so the desk, the
// board and the cast cannot disagree about what the base says.
//
// EVERY ACT GOES THROUGH `$lib/base.ts` — there is no SQL in this file, in any
// room, or anywhere else in this repo's TypeScript. `base.ts` is the whole of
// what the window may ask for; a room that needs a shape the commands lack is
// a reason to change a COMMAND (Rust), not a reason to write a query here.
//
// EVERY ACT REFRESHES WHAT IT TOUCHED, and nothing more. A save replaces the
// one row the base handed back — so `words` on the screen is the base's count
// and never the window's — while a create, a delete or a reorder re-reads the
// list whose ordinals just moved. A delete of an era, a character or an arc
// also re-reads the appearances, because the base's cascade has just removed
// rows this window would otherwise still be drawing.

import {
	createAppearance,
	createArc,
	createCharacter,
	createEra,
	createPart,
	deleteAppearance,
	deleteArc,
	deleteCharacter,
	deleteEra,
	deletePart,
	listAppearances,
	listArcs,
	listCharacters,
	listEras,
	listParts,
	reorderEras,
	reorderParts,
	updateArc,
	updateCharacter,
	updateEra,
	updatePart
} from '$lib/base';
import { hangId, moveToEra } from '$lib/board';
import type { Appearance, Arc, ArcShape, Character, Era, Part } from '$lib/types/types';

let workId = $state<string | null>(null);
let parts = $state<Part[]>([]);
let eras = $state<Era[]>([]);
let characters = $state<Character[]>([]);
let arcs = $state<Arc[]>([]);
let appearances = $state<Appearance[]>([]);
let loading = $state(false);
let error = $state<string | null>(null);

const said = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** One place where a refusal becomes a sentence on the screen. Nothing here
 *  swallows an error silently and nothing re-throws into a room. */
async function run<T>(act: () => Promise<T>): Promise<T | null> {
	try {
		const out = await act();
		error = null;
		return out;
	} catch (e) {
		error = said(e);
		return null;
	}
}

const refreshParts = async (id: string) => {
	parts = await listParts(id);
};
const refreshEras = async (id: string) => {
	eras = await listEras(id);
};
const refreshCharacters = async (id: string) => {
	characters = await listCharacters(id);
};
const refreshArcs = async (id: string) => {
	arcs = await listArcs(id);
};
const refreshAppearances = async (id: string) => {
	appearances = await listAppearances(id);
};

export const studioStore = {
	get workId() {
		return workId;
	},
	get parts() {
		return parts;
	},
	get eras() {
		return eras;
	},
	get characters() {
		return characters;
	},
	get arcs() {
		return arcs;
	},
	get appearances() {
		return appearances;
	},
	get loading() {
		return loading;
	},
	get error() {
		return error;
	},

	/** One row by id, from the list this store already holds. */
	part(id: string): Part | null {
		return parts.find((p) => p.id === id) ?? null;
	},

	clearError() {
		error = null;
	},

	/** Empty the studio — used when the chosen work is cleared, so no room is
	 *  left drawing another work's chapters for a frame. */
	forget() {
		workId = null;
		parts = [];
		eras = [];
		characters = [];
		arcs = [];
		appearances = [];
		error = null;
	},

	/** The five lists for one work. Called by every room at mount; a room
	 *  re-entered for the work already loaded pays nothing. */
	async load(id: string, force = false): Promise<void> {
		if (workId === id && !force) return;
		workId = id;
		loading = true;
		await run(async () => {
			const [p, e, c, a, ap] = await Promise.all([
				listParts(id),
				listEras(id),
				listCharacters(id),
				listArcs(id),
				listAppearances(id)
			]);
			parts = p;
			eras = e;
			characters = c;
			arcs = a;
			appearances = ap;
		});
		loading = false;
	},

	// ── parts ──────────────────────────────────────────────────────────────

	/** A chapter — a part with no parent. */
	async addChapter(title: string): Promise<Part | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const made = await createPart(id, null, title, '');
			await refreshParts(id);
			return made;
		});
	},

	/** A scene under one chapter. */
	async addScene(chapterId: string, title: string): Promise<Part | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const made = await createPart(id, chapterId, title, '');
			await refreshParts(id);
			return made;
		});
	},

	/**
	 * THE ONLY WRITE OF A PART'S TEXT IN THIS APP. The desk's autosave calls
	 * this and nothing else does. The body goes out exactly as it was typed —
	 * no trim, no normalisation, no reflow, no smart quotes (the-binder's law:
	 * "typos are fingerprints unless he says otherwise") — and the row that
	 * comes back, `words` and all, replaces the one this store held. The count
	 * on the screen is therefore the base's, never the window's.
	 */
	async savePart(id: string, title: string, body: string): Promise<Part | null> {
		return run(async () => {
			const saved = await updatePart(id, title, body);
			parts = parts.map((p) => (p.id === saved.id ? saved : p));
			return saved;
		});
	},

	/** Deleting a chapter takes its scenes and every appearance hanging on any
	 *  of them — the base's own cascade, not this call. */
	async removePart(partId: string): Promise<boolean> {
		const id = workId;
		if (!id) return false;
		const out = await run(async () => {
			await deletePart(partId);
			await refreshParts(id);
			await refreshAppearances(id);
			return true;
		});
		return out === true;
	},

	/** Order is data. This sends IDS and nothing else. */
	async orderParts(ids: string[]): Promise<void> {
		const id = workId;
		if (!id) return;
		await run(async () => {
			await reorderParts(id, ids);
			await refreshParts(id);
		});
	},

	// ── eras ───────────────────────────────────────────────────────────────

	async addEra(name: string, note: string | null = null): Promise<Era | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const made = await createEra(id, name, note);
			await refreshEras(id);
			return made;
		});
	},

	async editEra(eraId: string, name: string, note: string | null = null): Promise<Era | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const saved = await updateEra(eraId, name, note);
			eras = eras.map((e) => (e.id === saved.id ? saved : e));
			return saved;
		});
	},

	async removeEra(eraId: string): Promise<void> {
		const id = workId;
		if (!id) return;
		await run(async () => {
			await deleteEra(eraId);
			await refreshEras(id);
			await refreshAppearances(id);
		});
	},

	async orderEras(ids: string[]): Promise<void> {
		const id = workId;
		if (!id) return;
		await run(async () => {
			await reorderEras(id, ids);
			await refreshEras(id);
		});
	},

	// ── characters ─────────────────────────────────────────────────────────

	async addCharacter(name: string, emoji: string, note: string | null): Promise<Character | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const made = await createCharacter(id, name, note, emoji);
			await refreshCharacters(id);
			return made;
		});
	},

	async editCharacter(
		characterId: string,
		name: string,
		emoji: string,
		note: string | null
	): Promise<Character | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const saved = await updateCharacter(characterId, name, note, emoji);
			characters = characters.map((c) => (c.id === saved.id ? saved : c));
			return saved;
		});
	},

	async removeCharacter(characterId: string): Promise<void> {
		const id = workId;
		if (!id) return;
		await run(async () => {
			await deleteCharacter(characterId);
			await refreshCharacters(id);
			await refreshAppearances(id);
		});
	},

	// ── arcs ───────────────────────────────────────────────────────────────

	async addArc(name: string, shape: ArcShape, note: string | null = null): Promise<Arc | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const made = await createArc(id, name, shape, note);
			await refreshArcs(id);
			return made;
		});
	},

	async editArc(
		arcId: string,
		name: string,
		shape: ArcShape,
		note: string | null = null
	): Promise<Arc | null> {
		const id = workId;
		if (!id) return null;
		return run(async () => {
			const saved = await updateArc(arcId, name, shape, note);
			arcs = arcs.map((a) => (a.id === saved.id ? saved : a));
			return saved;
		});
	},

	async removeArc(arcId: string): Promise<void> {
		const id = workId;
		if (!id) return;
		await run(async () => {
			await deleteArc(arcId);
			await refreshArcs(id);
			await refreshAppearances(id);
		});
	},

	// ── appearances — the hang-on-either row ───────────────────────────────

	/**
	 * Move a part to an era, or take it off the board with `null`.
	 *
	 * `moveToEra` in `$lib/board.ts` decides what that costs — which rows die
	 * and whether one is born — and this only carries it out. There is no
	 * `update_appearance` in this body by S1's design, so a move IS a delete
	 * and a create; a "move" to the era the part is already in is neither.
	 * NO BODY, NO TITLE AND NO ORDINAL CROSSES HERE: a placement is an
	 * appearance row and nothing about the part itself changes.
	 */
	async place(partId: string, eraId: string | null): Promise<void> {
		const id = workId;
		if (!id) return;
		const move = moveToEra(appearances, partId, eraId);
		if (move.deleteIds.length === 0 && move.create === null) return;
		await run(async () => {
			for (const dead of move.deleteIds) await deleteAppearance(dead);
			if (move.create) await createAppearance(id, { partId, eraId: move.create.eraId });
			await refreshAppearances(id);
		});
	},

	/** A character's mark on a part, or an arc's thread through it — on if it
	 *  is off, off if it is on. One row either way, never a second list. */
	async toggleHang(
		partId: string,
		hand: 'character_id' | 'arc_id',
		otherId: string
	): Promise<void> {
		const id = workId;
		if (!id) return;
		const standing = hangId(appearances, partId, hand, otherId);
		await run(async () => {
			if (standing) await deleteAppearance(standing);
			else if (hand === 'character_id')
				await createAppearance(id, { partId, characterId: otherId });
			else await createAppearance(id, { partId, arcId: otherId });
			await refreshAppearances(id);
		});
	}
};
