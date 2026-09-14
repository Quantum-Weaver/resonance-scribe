// the-epagoge — the leading-in, pure.
//
// Aristotle's word: being led from particulars toward the whole. This
// water owns the WALK — ordered steps, forward flow, skip always
// lawful, progression dots derived, completion honest — and never the
// particulars: what a step offers, how it is dressed, where answers
// are kept are all the consumer's.
//
// THE LAWS, AS THE CORE KEEPS THEM:
//   · THE KEY LAW: a choice is recorded by its KEY, never its shown
//     name — display names drift; keys hold.
//   · ADVICE NEVER GATES: no step refuses passage for an empty
//     answer; skip is lawful wherever the walk stands.
//   · THE DOORWAY LAW: the leading-in never locks a door — every
//     answer is the consumer's to change later; completion says what
//     was given and what was skipped, honestly.
//   · Trouble is told as data, never thrown; "later" stays lawful
//     mid-trouble.
//   · Unknown keys on step definitions ride whole.
//   · Pure absolutely: no disk, no clock, no DOM — every move takes a
//     walk and returns a new one; the given walk is never mutated.

export interface Offer {
	key: string;
	[k: string]: unknown;
}

export interface StepDef {
	id: string;
	kind: 'threshold' | 'entry' | 'task' | 'choose';
	offers?: Offer[]; // choose only
	atMost?: number; // choose only; 1 = single choice, replaces
	preset?: string[]; // choose only; keys selected at the walk's start
	[k: string]: unknown;
}

export interface TaskState {
	phase: 'idle' | 'working' | 'done' | 'trouble';
	trouble: string | null;
}

export interface Walk {
	steps: StepDef[];
	at: number; // index into steps; steps.length means done
	entries: Record<string, string | null>; // entry answers; null = nothing given
	choices: Record<string, string[]>; // choose answers — KEYS only
	tasks: Record<string, TaskState>;
	skipped: string[]; // step ids passed by without an answer
}

export interface BegunWalk {
	walk: Walk | null;
	trouble: string | null;
}

/** Begin a walk — data trouble is told, never thrown. */
export function beginWalk(steps: StepDef[]): BegunWalk {
	if (steps.length === 0) return { walk: null, trouble: 'a walk needs at least one step' };
	const ids = new Set<string>();
	for (const s of steps) {
		if (!s.id) return { walk: null, trouble: 'every step needs an id' };
		if (ids.has(s.id)) return { walk: null, trouble: `step id "${s.id}" appears twice — ids must be unique` };
		ids.add(s.id);
		if (s.kind === 'choose') {
			const offers = s.offers ?? [];
			if (offers.length === 0) return { walk: null, trouble: `choose step "${s.id}" offers nothing` };
			if ((s.atMost ?? 0) < 1) return { walk: null, trouble: `choose step "${s.id}" needs atMost of 1 or more` };
			for (const p of s.preset ?? []) {
				if (!offers.some((o) => o.key === p))
					return { walk: null, trouble: `choose step "${s.id}" presets "${p}", which is not among its offers — keys, never display names` };
			}
		}
	}
	const choices: Record<string, string[]> = {};
	const tasks: Record<string, TaskState> = {};
	for (const s of steps) {
		if (s.kind === 'choose') choices[s.id] = [...(s.preset ?? [])];
		if (s.kind === 'task') tasks[s.id] = { phase: 'idle', trouble: null };
	}
	return { walk: { steps, at: 0, entries: {}, choices, tasks, skipped: [] }, trouble: null };
}

/** True when the walk has passed its last step. */
export function isDone(walk: Walk): boolean {
	return walk.at >= walk.steps.length;
}

/** The step the walk stands at, or null when done. */
export function current(walk: Walk): StepDef | null {
	return isDone(walk) ? null : walk.steps[walk.at];
}

/** One step forward. Past the last step, the walk is done and stays done. */
export function advance(walk: Walk): Walk {
	if (isDone(walk)) return walk;
	return { ...walk, at: walk.at + 1 };
}

/** One step back — answers already given survive the retreat. */
export function retreat(walk: Walk): Walk {
	if (walk.at === 0) return walk;
	return { ...walk, at: Math.min(walk.at, walk.steps.length) - 1 };
}

/** Pass the standing step by without an answer — lawful anywhere. */
export function skip(walk: Walk): Walk {
	const step = current(walk);
	if (step === null) return walk;
	const skipped = walk.skipped.includes(step.id) ? walk.skipped : [...walk.skipped, step.id];
	return { ...advance(walk), skipped };
}

/** Give a free answer at an entry step — trimmed; nothing given is an honest null, never "". */
export function enter(walk: Walk, text: string): Walk {
	const step = current(walk);
	if (step === null || step.kind !== 'entry') return walk;
	const value = text.trim() === '' ? null : text.trim();
	return { ...walk, entries: { ...walk.entries, [step.id]: value } };
}

/** Toggle a choice BY KEY at a choose step. atMost 1 replaces; at
 *  capacity, an unselected key leaves the walk unchanged — the calm no. */
export function toggleChoice(walk: Walk, key: string): Walk {
	const step = current(walk);
	if (step === null || step.kind !== 'choose') return walk;
	if (!(step.offers ?? []).some((o) => o.key === key)) return walk;
	const held = walk.choices[step.id] ?? [];
	const atMost = step.atMost ?? 1;
	let next: string[];
	if (held.includes(key)) next = held.filter((k) => k !== key);
	else if (atMost === 1) next = [key];
	else if (held.length < atMost) next = [...held, key];
	else return walk;
	return { ...walk, choices: { ...walk.choices, [step.id]: next } };
}

/** The standing task begins its doing. */
export function taskBegun(walk: Walk): Walk {
	return setTask(walk, { phase: 'working', trouble: null });
}

/** The standing task finished true. */
export function taskDone(walk: Walk): Walk {
	return setTask(walk, { phase: 'done', trouble: null });
}

/** The standing task met trouble — told as data, with its reason; "later" stays lawful. */
export function taskTrouble(walk: Walk, reason: string): Walk {
	return setTask(walk, { phase: 'trouble', trouble: reason });
}

function setTask(walk: Walk, state: TaskState): Walk {
	const step = current(walk);
	if (step === null || step.kind !== 'task') return walk;
	return { ...walk, tasks: { ...walk.tasks, [step.id]: state } };
}

export interface Dots {
	states: ('past' | 'active' | 'ahead')[];
	label: string; // "Step n of N" — the walk's own accessibility words
	valuenow: number;
	valuemin: number;
	valuemax: number;
}

/** The progression, derived — the consumer draws it, the walk knows it. */
export function dots(walk: Walk): Dots {
	const n = walk.steps.length;
	const shown = Math.min(walk.at, n - 1);
	const states = walk.steps.map((_, i): 'past' | 'active' | 'ahead' => {
		if (isDone(walk)) return 'past';
		if (i < shown) return 'past';
		if (i === shown) return 'active';
		return 'ahead';
	});
	const now = isDone(walk) ? n : walk.at + 1;
	return { states, label: `Step ${now} of ${n}`, valuenow: now, valuemin: 1, valuemax: n };
}

export interface Completion {
	entries: Record<string, string | null>;
	choices: Record<string, string[]>; // keys only, always
	skipped: string[];
	tasks: Record<string, TaskState>;
}

/** What the walk gathered — the consumer stores it under its own roof.
 *  Every choice is keys; every absence is named, never papered over. */
export function completion(walk: Walk): Completion {
	return { entries: walk.entries, choices: walk.choices, skipped: walk.skipped, tasks: walk.tasks };
}

// ────────────────────────────────────────────────────────────────────
// THE SECOND-DAY LAW — the steady-state empty room, as a doorway
// ────────────────────────────────────────────────────────────────────
//
// The walk above is day one. This is day two: the room the consumer
// stands in AFTER the leading-in, on a morning when it holds nothing.
//
// The law is house-wide and was written three different ways before it
// was ever written as code — KP's ⚛ own note in Compass ("the empty
// state should INVITE — 'play a song to create a fragment from' — a
// doorway, not a dead end"), Skapa's root page ("every door not yet
// built is a doorway, never a dead end") and Lantern ("no dead air").
// This is the code the three of them were describing.
//
//	 · AN EMPTY ROOM ALWAYS CARRIES AN INVITATION when it has any door
//	   at all — a built door that leads somewhere first, and failing
//	   that the first door NOT YET BUILT, named as a doorway.
//	 · A ROOM THAT HOLDS SOMETHING carries no invitation — it does not
//	   need one — but it still lists its doorways, so day two is never
//	   a surprise on day three.
//	 · A ROOM WITH NO DOORS AT ALL is an honest absence, never a throw:
//	   `invitation: null` and `absent` naming the lack out loud.
//	 · ADVICE NEVER GATES holds here too — nothing this returns can
//	   lock anything. There is no field on the shape that could.
//	 · THE KEY LAW holds here too — every string this returns is a KEY.
//	   Display copy goes in and never comes out.

/** A door out of a room. `invites` is the KEY of what stands through it. */
export interface Door {
	key: string;
	/** Whether what stands through the door is built yet. */
	built: boolean;
	/** The key of what the door leads toward — never its shown name. */
	invites: string;
	[k: string]: unknown;
}

/** A room on a later day, as the consumer describes it. */
export interface RoomState {
	/** The room's key, never its shown name. */
	room: string;
	/** What stands in the room: a count, or counts by key. Absent is none. */
	holds?: number | Record<string, number>;
	doors?: Door[];
	/** Keys the consumer did give — a key given is never named absent. */
	given?: string[];
	/** Keys the consumer knows it did NOT give. Named, never papered over. */
	notGiven?: string[];
	[k: string]: unknown;
}

/** Why the room invites what it invites — a reason KEY, from a closed set. */
export type InvitationWhy = 'first-built-door' | 'first-doorway' | 'the-one-door-there-is';

export interface Invitation {
	/** The key of what is invited — never its shown name. */
	key: string;
	why: InvitationWhy;
}

/** A door as the room reports it: open, or a doorway not yet built. */
export interface DoorState {
	key: string;
	state: 'open' | 'doorway';
}

export interface Doorway {
	room: string;
	empty: boolean;
	invitation: Invitation | null;
	doors: DoorState[];
	/** Every lack this room knows about, by key — `room`, `doors`, and
	 *	whatever the consumer declared it did not give. */
	absent: string[];
}

/** A held key, trimmed; anything that is not a real key is the empty string. */
function heldKey(v: unknown): string {
	return typeof v === 'string' && v.trim() !== '' ? v.trim() : '';
}

/** How much the room holds. A count, a sum of counts, or none. */
function counted(holds: RoomState['holds']): number {
	if (typeof holds === 'number') return Number.isFinite(holds) ? holds : 0;
	if (holds !== null && typeof holds === 'object') {
		let total = 0;
		for (const v of Object.values(holds)) if (typeof v === 'number' && Number.isFinite(v)) total += v;
		return total;
	}
	return 0;
}

/**
 * THE DOORWAY — a room on a later day, read as data.
 *
 * Pure, deterministic and replayable: same room in, byte-identical
 * reading out, and the given room is never touched. Nothing is thrown;
 * a room that describes nothing gets an honest, empty reading with its
 * lack named.
 */
export function doorway(state: RoomState): Doorway {
	const s: RoomState = state !== null && typeof state === 'object' ? state : { room: '' };

	const room = heldKey(s.room);
	const raw = Array.isArray(s.doors) ? s.doors : [];
	// A door without a key is not a door — a key is how a door is named.
	const kept = raw.filter((d) => d !== null && typeof d === 'object' && heldKey(d.key) !== '');
	const doors: DoorState[] = kept.map((d) => ({
		key: heldKey(d.key),
		state: d.built === true ? 'open' : 'doorway',
	}));

	const empty = counted(s.holds) <= 0;

	// AN EMPTY ROOM ALWAYS INVITES, while it has a door to invite through.
	let invitation: Invitation | null = null;
	if (empty && kept.length > 0) {
		const leads = kept.find((d) => d.built === true && heldKey(d.invites) !== '');
		if (leads !== undefined) {
			invitation = { key: heldKey(leads.invites), why: 'first-built-door' };
		} else {
			const notYet = kept.find((d) => d.built !== true);
			if (notYet !== undefined) {
				// "every door not yet built is a doorway, never a dead end"
				invitation = { key: heldKey(notYet.invites) || heldKey(notYet.key), why: 'first-doorway' };
			} else {
				// Every door is built and not one of them says where it goes.
				// Still not a dead end: the room offers the door it has.
				invitation = { key: heldKey(kept[0].key), why: 'the-one-door-there-is' };
			}
		}
	}

	const absent: string[] = [];
	const wasGiven = new Set((Array.isArray(s.given) ? s.given : []).map(heldKey));
	const name = (k: string): void => {
		if (k !== '' && !wasGiven.has(k) && !absent.includes(k)) absent.push(k);
	};
	if (room === '') name('room');
	if (kept.length === 0) name('doors');
	for (const k of Array.isArray(s.notGiven) ? s.notGiven : []) name(heldKey(k));

	return { room, empty, invitation, doors, absent };
}
