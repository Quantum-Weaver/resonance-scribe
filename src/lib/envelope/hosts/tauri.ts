// A SECOND REFERENCE HOST, on a different mechanism — the Tauri road: a real
// save dialog, then a real write to a real path; a real open dialog, then a
// real read. This is the road resonance-lantern already walks
// (`src/routes/settings/+page.svelte:10-11, 49-55`: `save` from
// `@tauri-apps/plugin-dialog`, then the file plugin's write) and the road
// `resonance-ardan/src/lib/boards.ts:274,289` walks the other way (`open`,
// then the file plugin's read), both lifted out of their pages so they can be
// proven. `resonance-cruthu/src/lib/ground.ts` is the file that already held
// both halves as one seam, and it is the pattern this host follows.
//
// AND THIS IS WHERE ANDROID LIVES. Android is the Tauri host's business, not
// the envelope's: the same `save` dialog resolves to a content URI on Android
// and to a path on desktop, and the water above neither knows nor cares. The
// Android leg has never been proven in any of the six repos that wrote this
// hand-off by hand; it is proven here against injected stand-ins, and the
// remaining half — that the real plugin behaves as the stand-ins do on a real
// device — is a device's to say, and is named as unproven in the README.
//
// THE WATER CARRIES NO TAURI DEPENDENCY. Nothing is imported from
// `@tauri-apps/*` — the four functions are INJECTED by the vessel that has
// them. Their parameters are typed loosely (`any` on the options bags, method
// syntax so the check stays bivariant) for one reason, said rather than
// hidden: the real plugin signatures must be assignable to these without this
// water ever seeing their types. A stricter declaration here would be a
// dependency in everything but name.

import type { EnvelopeHost } from '../host-surface.js';

/** The four functions the vessel hands in. Shape only — no import, no version, no plugin. */
export interface TauriDoors {
	/** `@tauri-apps/plugin-dialog`'s `save` — resolves to a path, or `null` when the vessel cancels. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	save(options?: any): Promise<string | null>;
	/** `@tauri-apps/plugin-fs`'s byte write. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	writeFile(path: any, data: Uint8Array, options?: any): Promise<unknown>;
	/**
	 * `@tauri-apps/plugin-dialog`'s `open` — resolves to a path, to a list when
	 * asked for many (this host never asks), or to `null` when the vessel
	 * cancels. Typed loosely for the same reason as the others: the real
	 * plugin's own return type has changed shape between versions and must
	 * stay assignable to this without the water ever seeing it.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	open(options?: any): Promise<any>;
	/** `@tauri-apps/plugin-fs`'s byte read. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	readFile(path: any, options?: any): Promise<Uint8Array>;
}

/** The name this interface was born under, when it held two doors instead of four. */
export type TauriSaveAndWrite = TauriDoors;

export interface TauriHostOptions {
	/** The save dialog's title. The vessel is being asked for a destination; say so in their words. */
	title?: string;
	/** The open dialog's title. The vessel is being asked for a file; say so in their words. */
	openTitle?: string;
	/** Filters offered in both dialogs. Defaults to one JSON filter. */
	filters?: Array<{ name: string; extensions: string[] }>;
}

/**
 * The Tauri road: `save()` for the destination, then the byte write.
 *
 * A cancelled dialog returns `null` — the vessel declined, which `deliver`
 * carries back as `{ delivered: false }` and never as an error.
 */
export function tauriHost(injected: TauriDoors, options: TauriHostOptions = {}): EnvelopeHost {
	const filters = options.filters ?? [{ name: 'JSON', extensions: ['json'] }];
	return {
		async suggest(name: string): Promise<string | null> {
			const chosen = await injected.save({
				title: options.title ?? 'Export your data — yours, always',
				defaultPath: name,
				filters,
			});
			return chosen ?? null;
		},

		async write(destination: string, bytes: Uint8Array): Promise<void> {
			await injected.writeFile(destination, bytes);
		},

		/**
		 * The Tauri chooser: `open()` for one file, then the byte read. A
		 * cancelled dialog resolves `null` — the vessel declined, and
		 * `openFrom` carries that back as `{ opened: false }`, never an error.
		 *
		 * The dialog's answer is taken ONLY when it is a string. `multiple` is
		 * false and `directory` is false, so a list or a folder handle coming
		 * back means the platform answered a question this host did not ask,
		 * and the honest reading of that is "nothing was chosen" — the same
		 * line `resonance-cruthu/src/lib/ground.ts:39` already draws.
		 */
		async pick(): Promise<{ name: string; bytes: Uint8Array } | null> {
			const picked = await injected.open({
				title: options.openTitle ?? 'Open an export — yours, wherever you kept it',
				multiple: false,
				directory: false,
				filters,
			});
			if (typeof picked !== 'string' || !picked) return null;
			const bytes = await injected.readFile(picked);
			return { name: basename(picked), bytes };
		},
	};
}

/**
 * The file's own name out of a path the platform chose the separator for.
 * Carried from `resonance-cruthu/src/lib/ground.ts:151-154`, where it does the
 * same job for the same reason: what comes back from a desktop dialog is a
 * path, and what a vessel is shown is a name.
 */
function basename(path: string): string {
	const cut = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
	return cut >= 0 ? path.slice(cut + 1) : path;
}
