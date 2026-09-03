// the-envelope — the sovereignty trio as one library, framework-free.
//
// THE THREE LAWS:
//  1. EXPORT: one versioned envelope, schema-versioned, app-namespaced — the
//     counts are written on the envelope so a vessel can see at a glance that
//     the file carries what the app shows.
//  2. PURGE: the export must be complete IN HAND before anything deletes —
//     export-then-purge may never destroy the remainder. Purge clears
//     everything, never a curated list: future keys must not survive a purge
//     by omission.
//  3. IMPORT: non-destructive by law — an existing definition is the vessel's
//     current mind and is never overwritten by an older file. Legacy bare
//     exports stay honored; wrong-app envelopes are refused plainly.

export const ENVELOPE = 'resonance-export';
export const ENVELOPE_VERSION = 1;

export interface Envelope<TData extends Record<string, unknown> = Record<string, unknown>> {
  envelope: typeof ENVELOPE;
  envelopeVersion: number;
  app: string;
  appVersion: string;
  exportedAt: string;
  counts: Record<string, number>;
  data: TData;
}

/** Law 1 — seal an export: counts on the outside, data within. */
export function seal<TData extends Record<string, unknown>>(
  app: string,
  appVersion: string,
  data: TData,
  counts: Record<string, number>
): Envelope<TData> {
  return {
    envelope: ENVELOPE,
    envelopeVersion: ENVELOPE_VERSION,
    app,
    appVersion: appVersion || 'unknown',
    exportedAt: new Date().toISOString(),
    counts,
    data,
  };
}

/** The family's filename shape: `<app>-export-<YYYY-MM-DD>.json`. */
export function filename(app: string, date: Date = new Date()): string {
  return `${app}-export-${date.toISOString().split('T')[0]}.json`;
}

export type Reading<TData extends Record<string, unknown>> =
  | { kind: 'envelope'; data: TData; counts: Record<string, number>; envelope: Envelope<TData> }
  | { kind: 'legacy'; raw: unknown };

/**
 * Law 3 (the reading half) — open a parsed file for one app.
 * Returns the envelope's data, a legacy passthrough for the app's own
 * old-format handling, or throws the law's own refusals.
 */
export function open<TData extends Record<string, unknown>>(
  parsed: unknown,
  expectedApp: string
): Reading<TData> {
  if (Array.isArray(parsed)) {
    // Legacy bare-array export (pre-envelope) — still honored:
    // a vessel's old backup must never be told it's worthless.
    return { kind: 'legacy', raw: parsed };
  }
  const p = parsed as Partial<Envelope<TData>> | null;
  if (p && p.envelope === ENVELOPE && p.data) {
    if (p.app !== expectedApp) {
      throw new Error(
        `This file belongs to ${p.app ?? 'another app'} — ${expectedApp} imports only its own envelopes.`
      );
    }
    return {
      kind: 'envelope',
      data: p.data as TData,
      counts: (p.counts ?? {}) as Record<string, number>,
      envelope: p as Envelope<TData>,
    };
  }
  throw new Error(`Not a ${expectedApp} export file.`);
}

/**
 * Law 3 (the merging half) — non-destructive merge for definition maps:
 * an existing entry is the vessel's current mind, never overwritten.
 * Returns what was added and what was kept as theirs.
 */
export function mergeNonDestructive<V>(
  existing: Record<string, V>,
  incoming: Record<string, V>,
  isValid: (v: V) => boolean = (v) => v !== null && v !== undefined && v !== ('' as unknown as V)
): { merged: Record<string, V>; added: number; kept: number } {
  const merged = { ...existing };
  let added = 0;
  let kept = 0;
  for (const [key, value] of Object.entries(incoming)) {
    if (!isValid(value)) continue;
    if (key in merged) kept++;
    else {
      merged[key] = value;
      added++;
    }
  }
  return { merged, added, kept };
}

/**
 * Law 2 — purge that awaits the export: the export must be complete IN
 * HAND before anything deletes. Runs the purge steps in order; any
 * failure stops the run so the caller can say what failed — a silent
 * purge rejection looks like 'purge never purges'.
 */
export async function purgeAfter(
  exportFn: (() => Promise<void>) | null,
  ...purgeSteps: Array<() => Promise<void> | void>
): Promise<void> {
  if (exportFn) await exportFn();
  for (const step of purgeSteps) {
    await step();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// LAW 1, THE OTHER HALF — DELIVERY.
//
// Sealing is not delivering. Six repos each re-implemented the hand-off in
// their own settings page and the Android leg was never proven in any of
// them, because the mechanism lived in the app where no proof could reach
// it. `EnvelopeHost` (src/host-surface.ts) names the machine that lands
// bytes; this water supplies none — the reference hosts under src/hosts/
// are the ONLY place in this tool where a file is written, and Android is
// the Tauri host's business, not the envelope's.
//
// THE PLATFORM PRIMITIVE, DECLARED NARROWLY. `TextEncoder` is a global
// wherever this water runs (browsers, workers, Node 11+, Deno, Bun). It is
// declared module-scoped rather than pulled in as a lib, so this file needs
// neither the DOM lib nor @types/node and cannot accidentally reach a
// global it did not name.
declare const TextEncoder: { new (): { encode(text: string): Uint8Array } };
declare const TextDecoder: { new (label?: string): { decode(bytes: Uint8Array): string } };

import type { DeliveryHost, EnvelopeHost, PickedFile } from './host-surface.js';
export type { DeliveryHost, EnvelopeHost, PickedFile } from './host-surface.js';

/** The one sentence a failure is allowed to be. Never a stack, never `[object Object]`. */
function sentenceOf(thrown: unknown): string {
	if (thrown instanceof Error && thrown.message) return thrown.message;
	if (typeof thrown === 'string' && thrown) return thrown;
	return 'the host failed without saying why.';
}

export type Delivery =
	| { delivered: true; destination: string; bytes: Uint8Array; suggested: string }
	| { delivered: false; why: string; suggested: string };

/**
 * Law 1 (the landing half) — hand a sealed envelope to a host.
 *
 * The bytes are the UTF-8 of `JSON.stringify(envelope)` — one form, so that
 * what a proof checks and what a vessel receives are the same thing.
 *
 * NOTHING THROWS. A vessel that declined the dialog gets
 * `{ delivered: false }` with a plain why; a host that threw gets its own
 * sentence carried back. An export road that crashes on a cancelled dialog
 * is how "export is broken" enters a support inbox.
 */
export async function deliver<TData extends Record<string, unknown>>(
	host: DeliveryHost,
	envelope: Envelope<TData>,
	appName: string = envelope?.app,
	date?: Date
): Promise<Delivery> {
	const app = appName || (envelope && envelope.app) || 'export';
	const suggested = date ? filename(app, date) : filename(app);
	if (!host || typeof host.suggest !== 'function' || typeof host.write !== 'function') {
		return { delivered: false, why: 'No host was given — this water lands nothing on its own.', suggested };
	}
	let destination: string | null;
	try {
		destination = await host.suggest(suggested);
	} catch (e) {
		return { delivered: false, why: sentenceOf(e), suggested };
	}
	if (destination === null || destination === undefined || destination === '') {
		return { delivered: false, why: 'The vessel declined — no destination was chosen, and nothing was written.', suggested };
	}
	const bytes = new TextEncoder().encode(JSON.stringify(envelope));
	try {
		await host.write(destination, bytes);
	} catch (e) {
		return { delivered: false, why: sentenceOf(e), suggested };
	}
	return { delivered: true, destination, bytes, suggested };
}

// ─────────────────────────────────────────────────────────────────────────
// LAW 3, THE OTHER HALF — THE PLATFORM DOOR.
//
// `open` reads a file somebody already handed it. Getting the file HANDED to
// it is the half that five more repos each wrote for themselves — sceal,
// ardan, khoros, lantern and tarocchi — the same twenty lines, once per
// realm, none of them provable from where they sat.
//
// `pick` is the third verb of the host surface and this water implements it
// exactly as much as it implements the other two: not at all. `openFrom` asks
// the host for a file, decodes the bytes as UTF-8, parses them, and hands the
// result to `open` under the app's own name. Every refusal `open` already
// knows how to say is carried through WORD FOR WORD — a foreign envelope is
// still refused in the same sentence a vessel would have seen before, because
// two different wordings for one refusal is how a vessel learns to distrust
// both.
//
// NOTHING THROWS, on the same reasoning as `deliver`: a declined chooser, a
// host that crashed, bytes that are not JSON and an envelope belonging to
// another app are four ordinary answers, and an app that must wrap its own
// import road in try/catch to survive them has been handed a machine, not a
// door.

export type Opening<TData extends Record<string, unknown> = Record<string, unknown>> =
	| { opened: true; name: string; reading: Reading<TData> }
	| { opened: false; why: string; name: string | null };

/**
 * Law 3 (the door half) — ask the host for a file and read it as this app's.
 *
 * `expectedApp` is the name THE READER uses, exactly as in `open`: the
 * Standards defect was a writer and a reader disagreeing about it, and this
 * road inherits that refusal rather than softening it.
 */
export async function openFrom<TData extends Record<string, unknown>>(
	host: EnvelopeHost,
	expectedApp: string
): Promise<Opening<TData>> {
	if (!host || typeof host.pick !== 'function') {
		return {
			opened: false,
			name: null,
			why: 'This host offers no chooser — it can land an export but cannot ask for one, and this water asks for nothing on its own.',
		};
	}
	let chosen: PickedFile | null;
	try {
		chosen = await host.pick();
	} catch (e) {
		return { opened: false, name: null, why: sentenceOf(e) };
	}
	if (chosen === null || chosen === undefined) {
		return { opened: false, name: null, why: 'The vessel declined — no file was chosen, and nothing was opened.' };
	}
	const name = typeof chosen.name === 'string' && chosen.name ? chosen.name : 'the chosen file';
	if (!chosen.bytes || typeof (chosen.bytes as { length?: unknown }).length !== 'number') {
		return { opened: false, name, why: `The host returned no bytes for ${name} — a chooser that answers with nothing has not declined and has not opened.` };
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(new TextDecoder().decode(chosen.bytes as Uint8Array));
	} catch (e) {
		return { opened: false, name, why: `${name} is not readable as JSON — ${sentenceOf(e)}` };
	}
	try {
		return { opened: true, name, reading: open<TData>(parsed, expectedApp) };
	} catch (e) {
		// `open`'s own refusal, verbatim. This water adds no second wording.
		return { opened: false, name, why: sentenceOf(e) };
	}
}

// ─────────────────────────────────────────────────────────────────────────
// LAW 2, MADE EXECUTABLE — THE PURGE PROVER.
//
// `purgeAfter` above enforces the ordering and the fail-stop, and knows
// NOTHING about what an app writes. That is correct, and it is also the gap:
// Hearth named its own — "purge omits protocols + settings + localStorage —
// the license promise rests on this one" — and no library could have caught
// it, because no library was ever told those stores existed.
//
// `provePurge` is told. The app DECLARES every store it writes; the steps
// declare which stores they claim to clear; a store nobody claims comes
// back UNREACHED, by name. That is the whole trick, and it is law 2's
// second sentence made into an answer rather than a promise.

/** Law 2, verbatim, from the origin the family inherited. */
export const EXPORT_IN_HAND = 'the export must be complete IN HAND before anything deletes';
/** Law 2's second sentence, verbatim — the one this prover exists to enforce. */
export const NO_PURGE_BY_OMISSION = 'future keys must not survive a purge by omission.';

/** One store the app admits it writes. `read` is how the prover looks afterwards. */
export interface PurgeStore {
	name: string;
	read(): Promise<unknown> | unknown;
	isEmpty(value: unknown): boolean;
}

/** One purge closure, and the store names it CLAIMS to clear. The claim is the coverage. */
export interface PurgeStep {
	name?: string;
	clears: string[];
	run(): Promise<void> | void;
}

export interface PurgeProof {
	/** The app name THE READER will use on import — not the writer's. That disagreement is what this catches. */
	app?: string;
	stores: PurgeStore[];
	steps: PurgeStep[];
	exportFn?: (() => Promise<unknown> | unknown) | null;
}

export interface PurgeCoverage { store: string; claimedBy: string[]; reached: boolean }
export interface PurgeAfterward { store: string; empty: boolean; survived: boolean; why: string | null }
export interface PurgeOrdering {
	exportDeclared: boolean;
	exportFailed: boolean;
	exportResolvedAt: number | null;
	firstStepBeganAt: number | null;
	inHandBeforeDelete: boolean;
	why: string | null;
}
export interface PurgeFailStop {
	failed: boolean;
	step: string | null;
	why: string | null;
	stepsRun: string[];
	stepsNotRun: string[];
}
export interface PurgeRoundTrip {
	attempted: boolean;
	ok: boolean;
	app: string | null;
	writtenBy: string | null;
	kind: 'envelope' | 'legacy' | null;
	why: string | null;
}
export interface PurgeReport {
	ok: boolean;
	coverage: PurgeCoverage[];
	unreached: string[];
	undeclared: string[];
	ordering: PurgeOrdering;
	failStop: PurgeFailStop;
	afterwards: PurgeAfterward[];
	survived: string[];
	omission: { unreached: string[]; law: string; told: string };
	roundTrip: PurgeRoundTrip | null;
	told: string[];
}

function stepLabel(step: PurgeStep | null | undefined, index: number): string {
	if (step && typeof step.name === 'string' && step.name) return step.name;
	const claims = step && Array.isArray(step.clears) ? step.clears.filter((c) => typeof c === 'string') : [];
	return claims.length ? `step ${index + 1} (${claims.join(' · ')})` : `step ${index + 1}`;
}

/**
 * Does the purge actually reach every store this app writes?
 *
 * Runs the real steps against the real stores, then reads every declared
 * store back, and answers as DATA. It never throws: a prover that crashes
 * on the app it is proving has told the app nothing.
 */
export async function provePurge(asked: PurgeProof): Promise<PurgeReport> {
	const told: string[] = [];
	const given = (asked ?? {}) as Partial<PurgeProof>;
	const stores: PurgeStore[] = (Array.isArray(given.stores) ? given.stores : []).filter(
		(s): s is PurgeStore => !!s && typeof s.name === 'string' && typeof s.read === 'function'
	);
	const steps: PurgeStep[] = (Array.isArray(given.steps) ? given.steps : []).filter(
		(s): s is PurgeStep => !!s && typeof s.run === 'function'
	);
	const labels = steps.map((s, i) => stepLabel(s, i));

	// ── coverage: the claim is the whole of it ──────────────────────────
	const claims = new Map<string, string[]>();
	steps.forEach((step, i) => {
		const wants = Array.isArray(step.clears) ? step.clears : [];
		for (const c of wants) {
			if (typeof c !== 'string' || !c) continue;
			const held = claims.get(c) ?? [];
			held.push(labels[i]);
			claims.set(c, held);
		}
	});
	const coverage: PurgeCoverage[] = stores.map((s) => {
		const claimedBy = claims.get(s.name) ?? [];
		return { store: s.name, claimedBy, reached: claimedBy.length > 0 };
	});
	const unreached = coverage.filter((c) => !c.reached).map((c) => c.store);
	const undeclared = [...claims.keys()].filter((k) => !stores.some((s) => s.name === k));

	if (unreached.length) {
		told.push(
			`UNREACHED — no step claims ${unreached.join(' · ')}. ${NO_PURGE_BY_OMISSION} A store the app writes and the purge never names survives every purge, silently, forever.`
		);
	} else {
		told.push(`Every declared store is claimed by a step (${stores.length} declared).`);
	}
	if (undeclared.length) {
		told.push(
			`A step claims ${undeclared.join(' · ')}, which no store declares — a renamed store, a removed one, or a claim nobody can check. Told, and not counted against the run.`
		);
	}
	if (!stores.length) {
		told.push('No store was declared. A purge prover told about nothing proves nothing — the declared list IS the proof.');
	}

	// ── the run: a monotonic counter, never a clock ─────────────────────
	let tick = 0;
	const stamp = () => (tick += 1);
	const ordering: PurgeOrdering = {
		exportDeclared: typeof given.exportFn === 'function',
		exportFailed: false,
		exportResolvedAt: null,
		firstStepBeganAt: null,
		inHandBeforeDelete: true,
		why: null,
	};
	const failStop: PurgeFailStop = { failed: false, step: null, why: null, stepsRun: [], stepsNotRun: [] };

	let exported: unknown = undefined;
	if (ordering.exportDeclared) {
		try {
			exported = await (given.exportFn as () => Promise<unknown> | unknown)();
			ordering.exportResolvedAt = stamp();
		} catch (e) {
			ordering.exportFailed = true;
			ordering.why = sentenceOf(e);
		}
	} else {
		told.push('No export was declared — there was nothing to hold in hand, and law 2 has nothing to hold here.');
	}

	if (ordering.exportFailed) {
		failStop.stepsNotRun = labels.slice();
		told.push(
			`The export did not complete (${ordering.why}) — so NOTHING was run. ${EXPORT_IN_HAND}: an export that failed is not in hand, and a purge that proceeds anyway is the loss the law was written against.`
		);
	} else {
		for (let i = 0; i < steps.length; i += 1) {
			if (ordering.firstStepBeganAt === null) ordering.firstStepBeganAt = stamp();
			try {
				await steps[i].run();
				failStop.stepsRun.push(labels[i]);
			} catch (e) {
				failStop.failed = true;
				failStop.step = labels[i];
				failStop.why = sentenceOf(e);
				failStop.stepsNotRun = labels.slice(i + 1);
				told.push(
					`FAIL-STOP at ${labels[i]} — ${failStop.why} The run halted there and ${failStop.stepsNotRun.length} later step(s) never ran; a silent purge rejection reads to a vessel as "purge never purges".`
				);
				break;
			}
		}
	}
	if (ordering.exportDeclared && !ordering.exportFailed) {
		ordering.inHandBeforeDelete =
			ordering.exportResolvedAt !== null &&
			(ordering.firstStepBeganAt === null || ordering.exportResolvedAt < ordering.firstStepBeganAt);
		told.push(
			ordering.inHandBeforeDelete
				? `The export resolved at ${ordering.exportResolvedAt} and the first step began at ${ordering.firstStepBeganAt ?? '—'} — ${EXPORT_IN_HAND}. Counted, not timed: a clock would make this proof read differently on two runs.`
				: `ORDERING BROKEN — a step began before the export was in hand. ${EXPORT_IN_HAND}.`
		);
	} else if (ordering.exportFailed) {
		ordering.inHandBeforeDelete = false;
	}

	// ── afterwards: read every declared store back ──────────────────────
	const afterwards: PurgeAfterward[] = [];
	for (const store of stores) {
		try {
			const value = await store.read();
			const empty = typeof store.isEmpty === 'function' ? store.isEmpty(value) === true : false;
			afterwards.push({
				store: store.name,
				empty,
				survived: !empty,
				why: empty
					? null
					: typeof store.isEmpty === 'function'
						? 'read back with content still in it.'
						: 'the store declared no isEmpty, so nothing here can call it clear.',
			});
		} catch (e) {
			afterwards.push({ store: store.name, empty: false, survived: true, why: sentenceOf(e) });
		}
	}
	const survived = afterwards.filter((a) => a.survived).map((a) => a.store);
	told.push(
		survived.length
			? `SURVIVED — ${survived.join(' · ')} still held content after the run.`
			: stores.length
				? 'Every declared store read back empty after the run.'
				: 'No store was read back, because none was declared.'
	);

	// ── the round trip: whose envelope is this, really? ─────────────────
	let roundTrip: PurgeRoundTrip | null = null;
	if (
		ordering.exportDeclared &&
		!ordering.exportFailed &&
		exported !== null &&
		exported !== undefined &&
		typeof exported === 'object'
	) {
		const writtenBy = (exported as { app?: unknown }).app;
		const reader =
			typeof given.app === 'string' && given.app ? given.app : typeof writtenBy === 'string' ? writtenBy : null;
		roundTrip = {
			attempted: true,
			ok: false,
			app: reader,
			writtenBy: typeof writtenBy === 'string' ? writtenBy : null,
			kind: null,
			why: null,
		};
		if (!reader) {
			roundTrip.why = 'No app name was given and the export named none — there is nothing to open it as.';
		} else {
			try {
				const reading = open(exported as Record<string, unknown>, reader);
				roundTrip.ok = true;
				roundTrip.kind = reading.kind;
			} catch (e) {
				roundTrip.why = sentenceOf(e);
			}
		}
		told.push(
			roundTrip.ok
				? `The export re-opened as ${reader} (${roundTrip.kind}) — the file the vessel keeps is a file this app can read back.`
				: `THE ROUND TRIP FAILED — ${roundTrip.why} The purge may have run perfectly and the vessel still holds a file its own app refuses.`
		);
	} else if (ordering.exportDeclared && !ordering.exportFailed) {
		told.push('The export returned no envelope, so there was nothing to re-open. An export that returns nothing cannot be proven readable.');
	}

	const ok =
		unreached.length === 0 &&
		!failStop.failed &&
		!ordering.exportFailed &&
		ordering.inHandBeforeDelete &&
		survived.length === 0 &&
		(roundTrip === null || roundTrip.ok === true);

	return {
		ok,
		coverage,
		unreached,
		undeclared,
		ordering,
		failStop,
		afterwards,
		survived,
		omission: {
			unreached,
			law: NO_PURGE_BY_OMISSION,
			told: unreached.length
				? `${unreached.length} declared store(s) are reached by no step: ${unreached.join(' · ')}.`
				: 'No declared store survives by omission.',
		},
		roundTrip,
		told,
	};
}
