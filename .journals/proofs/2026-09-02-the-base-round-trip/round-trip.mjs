// PROOF — the six nouns round-trip through the base, and a deleted work
// leaves nothing behind.
//
// THE FOUNDING CUT, 2026-09-02, movement S1 of THE AUTHOR'S STUDIO.
//   node .journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs
// from the repo root. Prints one TRUE or FALSE per claim and exits non-zero
// on any FALSE.
//
// THE SHAPE IS THE MOTHER'S. `resonance-sistrum/.journals/proofs/
// mixdown-two-takes.mjs` drives `studio.rs`'s `bounce_to` through an ignored
// `cargo test` door and judges what it prints; this does the same to
// `base.rs`'s `proof_base_round_trip`. The Rust half is the one that touches
// the base, because THE BASE IS RUST'S in this body — there is no
// `@tauri-apps/plugin-sql` here and no SQL in any .svelte file, so a Node
// script has nothing it could talk to on its own.
//
// WHAT IS PROVEN, against the commands' own functions (`base.rs`, the same
// ones `commands.rs` calls — see the note at the foot of this file):
//   · the migration creates all six tables, and foreign keys are ON
//   · a work with two chapters and one scene under the first
//   · one era, one character, one arc
//   · three appearances, each hanging on a different pair of the four hands
//   · an appearance hanging on NOTHING is refused (the CHECK)
//   · reordering the chapters changes `ord` and no `updated_at`
//   · everything reads back at the counts it was written at
//   · an edit recounts `words` by the base's own hand
//   · deleting the work leaves zero rows in all six tables (the cascade)
//
// This compiles the harness in test mode the first time — the long part.

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

let failed = false;
const claim = (name, ok) => {
	console.log(`${ok ? 'TRUE ' : 'FALSE'} — ${name}`);
	if (!ok) failed = true;
};

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
const manifest = join(repo, 'src-tauri', 'Cargo.toml');

const dir = mkdtempSync(join(tmpdir(), 'scribe-base-proof-'));
try {
	const db = join(dir, 'proof.db');

	const run = spawnSync(
		'cargo',
		[
			'test',
			'--manifest-path',
			manifest,
			'--lib',
			'proof_base_round_trip',
			'--',
			'--ignored',
			'--nocapture'
		],
		{
			env: { ...process.env, SCRIBE_PROOF_DB: db },
			encoding: 'utf8',
			shell: true,
			cwd: repo
		}
	);
	const log = `${run.stdout ?? ''}${run.stderr ?? ''}`;
	claim('the round trip ran through base.rs (cargo test exit 0)', run.status === 0);
	if (run.status !== 0) console.log(log.split('\n').slice(-40).join('\n'));

	/** Read one SCRIBE_PROOF_<KEY>=<value> line out of the test's own output. */
	const said = (key) => {
		const m = log.match(new RegExp(`SCRIBE_PROOF_${key}=(.*)`));
		return m ? m[1].trim() : null;
	};
	const num = (key) => Number(said(key));

	claim('the test reached its end (DONE)', said('DONE') === '1');

	// ── the migration ────────────────────────────────────────────────────
	const tables = (said('TABLES') ?? '').split(',').filter(Boolean);
	const wanted = ['appearances', 'arcs', 'characters', 'eras', 'parts', 'works'];
	claim(
		`the migration creates all six tables (${tables.join(' · ')})`,
		wanted.every((t) => tables.includes(t))
	);
	claim('foreign keys are ON — the cascade is real', said('FOREIGN_KEYS') === '1');

	// ── a work, two chapters, one scene ──────────────────────────────────
	claim('a work is created and carries an id', (said('WORK_ID') ?? '').length > 8);
	claim("the work's kind is the one asked for (book)", said('WORK_KIND') === 'book');
	claim('chapter one takes ord 0', num('CH1_ORD') === 0);
	claim('chapter two takes ord 1 — order is data, not insert time', num('CH2_ORD') === 1);
	claim(
		'the scene hangs under chapter one (parent_id set)',
		(said('SCENE_PARENT') ?? '').length > 8
	);
	claim(`the scene's words are counted by the base (6, got ${said('SCENE_WORDS')})`, num('SCENE_WORDS') === 6);

	// ── the hang-on-either row ───────────────────────────────────────────
	const made = (said('APPEARANCES_MADE') ?? '').split(',').filter(Boolean);
	claim(`three appearances made, each on a different hand (${made.length})`, made.length === 3);
	claim(
		'an appearance hanging on nothing is REFUSED — the CHECK holds',
		said('EMPTY_APPEARANCE_REFUSED') === 'true'
	);

	// ── the reorder ──────────────────────────────────────────────────────
	claim(
		`a reorder moves the chapters (got "${said('ORDER_AFTER')}")`,
		(said('ORDER_AFTER') ?? '').startsWith('Two')
	);
	claim(
		'a reorder writes ord and NOTHING else — every updated_at held',
		said('REORDER_TOUCHED_ONLY_ORD') === 'true'
	);

	// ── read everything back ─────────────────────────────────────────────
	claim(`one work on the shelf (${said('WORKS')})`, num('WORKS') === 1);
	claim(`three parts — two chapters and a scene (${said('PARTS')})`, num('PARTS') === 3);
	claim(`one era (${said('ERAS')})`, num('ERAS') === 1);
	claim(`one character (${said('CHARACTERS')})`, num('CHARACTERS') === 1);
	claim(`one arc (${said('ARCS')})`, num('ARCS') === 1);
	claim(`three appearances read back (${said('APPEARANCES')})`, num('APPEARANCES') === 3);
	claim('get_work returns the title it was given', said('GET_WORK_TITLE') === 'The Salt Road');

	// ── an edit ──────────────────────────────────────────────────────────
	claim(`an edit recounts words (5, got ${said('EDITED_WORDS')})`, num('EDITED_WORDS') === 5);
	claim("an edit moves the part's updated_at", said('EDITED_MOVED') === 'true');

	// ── the cascade ──────────────────────────────────────────────────────
	for (const t of ['WORKS', 'PARTS', 'ERAS', 'CHARACTERS', 'ARCS', 'APPEARANCES']) {
		claim(
			`deleting the work leaves no ${t.toLowerCase()} (${said(`LEFT_${t}`)})`,
			num(`LEFT_${t}`) === 0
		);
	}
} finally {
	rmSync(dir, { recursive: true, force: true });
}

// A NOTE ON WHAT THIS DOES NOT PROVE, owed to the next hand: the round trip
// runs through `base.rs`'s plain functions, which is exactly what every
// `#[tauri::command]` in `commands.rs` calls after taking the mutex — but it
// does not cross the IPC boundary, so a mis-typed argument name in
// `src/lib/base.ts` would still pass here. That crossing is proven by the
// rooms in S2, and by KP's own hands opening the shell.

process.exit(failed ? 1 : 0);
