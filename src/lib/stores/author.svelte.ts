// THE AUTHOR — the one row the studio keeps about the person writing.
//
// The runes pattern (`ui.svelte.ts`): module-level `$state`, one exported
// object of getters and methods. Every act goes through `$lib/base.ts`, which
// is the only door to the base.
//
// A BASE THAT WILL NOT ANSWER IS NOT AN ABSENT AUTHOR. `reached` says whether
// the base answered at all; `absent` is true only when it answered and there
// was no row. Outside the Tauri window `invoke` rejects, `reached` stays false,
// and nothing here throws.

import { getAuthor, setAuthor } from '$lib/base';
import type { Author } from '$lib/types/types';

let author = $state<Author | null>(null);
let reached = $state(false);
let loading = $state(false);
let saving = $state(false);
let refusal = $state<string | null>(null);

const said = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export const authorStore = {
	get author() {
		return author;
	},
	get name() {
		return author?.name ?? '';
	},
	get byline() {
		return author?.byline ?? '';
	},
	get contact() {
		return author?.contact ?? '';
	},
	/** True once the base has answered, whatever it answered. */
	get reached() {
		return reached;
	},
	/** True only when the base answered and carries no author row. */
	get absent() {
		return reached && author === null;
	},
	get loading() {
		return loading;
	},
	get saving() {
		return saving;
	},
	/** One plain sentence when the last act could not be done, or null. */
	get refusal() {
		return refusal;
	},

	clearRefusal() {
		refusal = null;
	},

	/** Read the one row. Returns the row, or null for both an absent row and a
	 *  base that would not answer — `reached` tells the two apart. */
	async load(): Promise<Author | null> {
		loading = true;
		try {
			author = await getAuthor();
			reached = true;
			refusal = null;
			return author;
		} catch (e) {
			refusal = said(e);
			return null;
		} finally {
			loading = false;
		}
	},

	/** Write the one row. `contact` is a multi-line block kept verbatim and may
	 *  be empty. Returns null when the base refused, with `refusal` set. */
	async save(name: string, byline: string, contact: string): Promise<Author | null> {
		saving = true;
		try {
			author = await setAuthor(name, byline, contact);
			reached = true;
			refusal = null;
			return author;
		} catch (e) {
			refusal = said(e);
			return null;
		} finally {
			saving = false;
		}
	},

	/** Set down what this store holds, without touching the base. */
	forget() {
		author = null;
		reached = false;
		refusal = null;
	}
};
