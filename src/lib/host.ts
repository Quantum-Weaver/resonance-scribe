// THE ONE DOOR TO THE DISK.
//
// A LAW BOUGHT AT S3, and it is this file's whole reason to exist: EVERY
// Tauri plugin call in this app lives here. `save` and `open` from
// `@tauri-apps/plugin-dialog`; `writeFile`, `writeTextFile`, `readFile`,
// `mkdir` and `exists` from `@tauri-apps/plugin-fs`; `appDataDir` from
// `@tauri-apps/api/path`. No room, no store and no water imports a plugin
// directly, and `.journals/proofs/2026-09-02-the-bind/bind.mjs` asserts it by
// reading every file in `src/` and printing the ones it searched.
//
// (Its twin at the other end of the app is `src/lib/base.ts`, which holds the
// only `invoke` in the repo. Between them, everything this window can reach
// outside itself stands in two files.)
//
// THE SURFACE IS SMALL ON PURPOSE. There is no `remove`, no `readDir`, no
// listing of any kind — the-envelope's own host surface says why in as many
// words: *"a surface that could walk the disk on its own is a surface that
// will one day be asked to."* `occupied()` is the one shape that touches more
// than a single path, and it can only ever answer about paths the caller
// already named; it cannot discover a file.
//
// NOTHING HERE OVERWRITES. `writeNew` asks whether the path stands, refuses it
// in a plain sentence if it does, and then writes with `createNew: true` so
// the operating system refuses it a second time in the gap between the asking
// and the writing. The-binder's door keeps the same law with the `wx` flag,
// and the-board-charter keeps it as *"snapshots never overwrite"*. An author's
// standing file is never this app's to replace.
//
// NOTHING HERE THROWS. A declined dialog, an occupied path and a plugin that
// failed are three ordinary answers, and a room that must wrap its export road
// in try/catch to survive them has been handed a machine rather than a door.

import { appDataDir } from '@tauri-apps/api/path';
import { open, save } from '@tauri-apps/plugin-dialog';
import { exists, mkdir, readFile, writeFile, writeTextFile } from '@tauri-apps/plugin-fs';

import { tauriHost } from '$lib/envelope/hosts/tauri';
import type { EnvelopeHost } from '$lib/envelope/host-surface';

/** A dialog's answer. `path` is what was chosen; `null` with no `why` is the
 *  hand declining, which is an answer and never a failure. */
export interface Chose {
	path: string | null;
	why: string | null;
}

/** A write's answer. `why` carries one plain sentence when nothing was
 *  written — including the refusal of an occupied path. */
export interface Wrote {
	written: boolean;
	why: string | null;
}

/** One filter offered in a dialog. Extensions carry no leading dot. */
export interface Filter {
	name: string;
	extensions: string[];
}

const SCRIBE_FILTERS: Filter[] = [{ name: 'Scribe work', extensions: ['scribe.json', 'json'] }];

/** The one sentence a failure is allowed to be — the-envelope's own rule,
 *  kept on this side of the seam too. Never a stack, never `[object Object]`. */
function sentenceOf(thrown: unknown): string {
	if (thrown instanceof Error && thrown.message) return thrown.message;
	if (typeof thrown === 'string' && thrown) return thrown;
	return 'the platform failed without saying why.';
}

/**
 * THE ENVELOPE'S HOST, for this vessel.
 *
 * The four plugin functions are INJECTED — `src/lib/envelope/hosts/tauri.ts`
 * imports nothing from `@tauri-apps/*` and never will, which is exactly why it
 * could be mirrored here at all. `suggest` · `write` · `pick`: three verbs and
 * no fourth.
 */
export const scribeHost = (): EnvelopeHost =>
	tauriHost(
		{ save, writeFile, open, readFile },
		{
			title: 'Save this work as a .scribe.json — yours, always',
			openTitle: 'Open a .scribe.json — yours, wherever you kept it',
			filters: SCRIBE_FILTERS
		}
	);

/** A folder, chosen by a hand. `null` with no `why` is a hand that declined.
 *  Only one, never many, and never a file. */
export async function chooseFolder(title: string): Promise<Chose> {
	try {
		const chosen = await open({ title, directory: true, multiple: false });
		if (typeof chosen !== 'string' || chosen === '') return { path: null, why: null };
		return { path: chosen, why: null };
	} catch (e) {
		return { path: null, why: sentenceOf(e) };
	}
}

/** A destination, chosen by a hand. `null` with no `why` is a hand that
 *  declined. The dialog SUGGESTS `defaultName`; what comes back is theirs. */
export async function saveAs(defaultName: string, filters: Filter[], title?: string): Promise<Chose> {
	try {
		const chosen = await save({
			title: title ?? 'Choose where this lands — yours, always',
			defaultPath: defaultName,
			filters
		});
		if (typeof chosen !== 'string' || chosen === '') return { path: null, why: null };
		return { path: chosen, why: null };
	} catch (e) {
		return { path: null, why: sentenceOf(e) };
	}
}

/**
 * Which of these paths already stand.
 *
 * The one door here that takes more than one path, and it still cannot
 * discover a file: it answers only about paths the caller already named. The
 * bind room asks it before a folder export so that an occupied path refuses
 * the WHOLE export before a byte is written, rather than half-way through.
 *
 * A path this cannot answer for is reported as standing, because the safe
 * reading of "I could not tell" is "do not write here".
 */
export async function occupied(paths: string[]): Promise<string[]> {
	const taken: string[] = [];
	for (const path of paths) {
		try {
			if (await exists(path)) taken.push(path);
		} catch {
			taken.push(path);
		}
	}
	return taken;
}

/**
 * Write a file that does not exist yet, and REFUSE one that does.
 *
 * Two guards, deliberately: `exists` first, so the refusal is a sentence a
 * hand can read and no byte moved; then `createNew: true`, so the platform
 * itself refuses in the moment between the two. The-binder's own rule, carried
 * word for word: *"an occupied path is REFUSED and kept — this water never
 * overwrites."*
 */
export async function writeNew(path: string, data: string | Uint8Array): Promise<Wrote> {
	try {
		if (await exists(path)) {
			return {
				written: false,
				why: `A file already stands at ${path}. Nothing was written — this studio never overwrites what is already there.`
			};
		}
	} catch (e) {
		return { written: false, why: sentenceOf(e) };
	}
	try {
		if (typeof data === 'string') await writeTextFile(path, data, { createNew: true });
		else await writeFile(path, data, { createNew: true });
		return { written: true, why: null };
	} catch (e) {
		return { written: false, why: sentenceOf(e) };
	}
}

/** A folder, and every folder above it that is missing. Making a folder that
 *  already stands is not an overwrite and is not refused. */
export async function makeFolder(path: string): Promise<Wrote> {
	try {
		await mkdir(path, { recursive: true });
		return { written: true, why: null };
	} catch (e) {
		return { written: false, why: sentenceOf(e) };
	}
}

/** This app's own data directory — where the base already lives, and where the
 *  envelope's snapshots land beside it. The one path in this app that is not
 *  chosen by a hand, and it is the platform's own answer, never a guess. */
export async function appDataFolder(): Promise<Chose> {
	try {
		const dir = await appDataDir();
		return { path: dir, why: null };
	} catch (e) {
		return { path: null, why: sentenceOf(e) };
	}
}
