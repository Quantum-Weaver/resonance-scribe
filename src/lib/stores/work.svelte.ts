// THE CHOSEN WORK — one work held across the rooms.
//
// The runes pattern the mother uses and this body kept: module-level `$state`,
// one exported object of getters and methods, no class and no store contract.
// See `ui.svelte.ts` for the smallest example of the same shape.
//
// Only the ID is remembered between sittings. The ROW is never cached: on a
// restore the id is handed back to the base and whatever the base says now is
// what the rooms show. A work deleted from the shelf — or a base opened on
// another machine — clears the choice instead of drawing a title that is no
// longer there.

import { getWork } from '$lib/base';
import type { Work } from '$lib/types/types';

const KEY = 'resonance-scribe-work';

let work = $state<Work | null>(null);
let restoring = $state(false);

const remember = (id: string | null) => {
	if (typeof localStorage === 'undefined') return;
	if (id === null) localStorage.removeItem(KEY);
	else localStorage.setItem(KEY, id);
};

const remembered = (): string | null =>
	typeof localStorage === 'undefined' ? null : localStorage.getItem(KEY);

export const workStore = {
	get work() {
		return work;
	},
	get id() {
		return work?.id ?? null;
	},
	/** True only while `restore()` is asking the base. A room that draws "no
	 *  work chosen" during it would be telling the truth a beat too early. */
	get restoring() {
		return restoring;
	},

	choose(w: Work) {
		work = w;
		remember(w.id);
	},

	clear() {
		work = null;
		remember(null);
	},

	/** The row this store holds, replaced with the row the base just handed
	 *  back — after a rename, say. Does not touch what is remembered. */
	refresh(w: Work) {
		if (work && work.id === w.id) work = w;
	},

	/**
	 * Re-read the remembered work by id. Called by the layout at every mount,
	 * so a room opened directly (or reloaded) finds the work already chosen.
	 * A work that is gone clears the choice; a base that will not answer
	 * leaves the choice alone, because a locked file is not a deleted work.
	 */
	async restore(): Promise<Work | null> {
		if (work) return work;
		const id = remembered();
		if (!id) return null;
		restoring = true;
		try {
			const found = await getWork(id);
			if (found) work = found;
			else {
				work = null;
				remember(null);
			}
			return work;
		} catch {
			return null;
		} finally {
			restoring = false;
		}
	}
};
