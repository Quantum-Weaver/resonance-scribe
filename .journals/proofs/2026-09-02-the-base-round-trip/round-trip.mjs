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
//   · the migration creates `author` and the `rights` column on `works`
//   · a base written by the OLD schema migrates and keeps every row it held
//   · `get_author` is null before `set_author` and a row after it, and a
//     second `set_author` updates the one row rather than adding a second
//   · `set_work_rights` carries a JSON text out and back, and null clears it
//   · `read_all` hands back every row at the counts the tables hold
//   · `purge_all` returns the true count and leaves every table empty, the
//     schema standing and the file present
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
	const oldDb = join(dir, 'old-schema.db');

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
			env: { ...process.env, SCRIBE_PROOF_DB: db, SCRIBE_PROOF_OLD_DB: oldDb },
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
	claim(`the migration creates \`author\` (${tables.join(' · ')})`, tables.includes('author'));
	claim('the migration adds the `rights` column to `works`', said('WORKS_HAS_RIGHTS') === 'true');
	claim(`the base stands at user_version 2 (${said('USER_VERSION')})`, said('USER_VERSION') === '2');

	// ── an old base, migrated forward ──────────────────────
	claim('the old base was written at user_version 1', said('OLD_VERSION_BEFORE') === '1');
	claim(
		'the old base had no `author` table and no `rights` column',
		said('OLD_HAS_AUTHOR_BEFORE') === 'false' && said('OLD_HAS_RIGHTS_BEFORE') === 'false'
	);
	claim('opening it moves it to user_version 2', said('OLD_VERSION_AFTER') === '2');
	claim('the migration gave it `author`', said('OLD_HAS_AUTHOR_AFTER') === 'true');
	claim('the migration gave it `works.rights`', said('OLD_HAS_RIGHTS_AFTER') === 'true');
	claim(`its work survived the migration (${said('OLD_WORKS')})`, num('OLD_WORKS') === 1);
	claim(`its part survived the migration (${said('OLD_PARTS')})`, num('OLD_PARTS') === 1);
	claim(
		'the work is the same work, unaltered',
		said('OLD_WORK_TITLE') === 'The Old Road' && said('OLD_WORK_CREATED_AT') === '1'
	);
	claim(
		'the new column reads NULL on a row written before it',
		said('OLD_WORK_RIGHTS_NULL') === 'true'
	);
	claim(
		'opening the migrated base again asks nothing of it twice',
		said('OLD_REOPEN_VERSION') === '2' && num('OLD_REOPEN_WORKS') === 1
	);

	// ── the author, one row ─────────────────────────────
	claim('get_author is null before anything is written', said('AUTHOR_BEFORE') === 'true');
	claim("the author's id is the string 'author'", said('AUTHOR_ID') === 'author');
	claim('set_author writes the name it was given', said('AUTHOR_NAME') === 'KP');
	claim(
		`contact keeps its lines verbatim (2, got ${said('AUTHOR_CONTACT_LINES')})`,
		num('AUTHOR_CONTACT_LINES') === 2
	);
	claim(
		`one author row after the first write (${said('AUTHOR_ROWS_AFTER_FIRST')})`,
		num('AUTHOR_ROWS_AFTER_FIRST') === 1
	);
	claim(
		`one author row after the second write — it UPDATES, never duplicates (${said('AUTHOR_ROWS_AFTER_SECOND')})`,
		num('AUTHOR_ROWS_AFTER_SECOND') === 1
	);
	claim('the second write changed the byline', said('AUTHOR_BYLINE_AFTER_SECOND') === 'KP, weaver');
	claim('an empty contact block is kept as empty', said('AUTHOR_CONTACT_EMPTY') === 'true');
	claim('created_at is held across the second write', said('AUTHOR_CREATED_HELD') === 'true');
	claim('updated_at moves on the second write', said('AUTHOR_UPDATED_MOVED') === 'true');
	claim('get_author reads back the row that was written', said('AUTHOR_READ_BACK') === 'KP, weaver');

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

	// ── the rights page ───────────────────────────────
	const drawn = '{"holder":"KP","grants":[{"name":"read"}],"exclusive":false}';
	claim('a new work is born with no rights page', said('RIGHTS_AT_BIRTH_NULL') === 'true');
	claim('set_work_rights returns the JSON text it was handed', said('RIGHTS_SET') === drawn);
	claim('the same JSON text reads back from the base', said('RIGHTS_READ_BACK') === drawn);
	claim('update_work leaves the rights page standing', said('RIGHTS_HELD_THROUGH_UPDATE') === 'true');
	claim('null clears the rights page', said('RIGHTS_CLEARED') === 'true');
	claim('the cleared rights page reads back null', said('RIGHTS_CLEARED_READ_BACK') === 'true');

	// ── everything, in one call ────────────────────────
	claim('read_all carries the author', said('DUMP_AUTHOR') === 'true');
	claim(`read_all carries one work (${said('DUMP_WORKS')})`, num('DUMP_WORKS') === 1);
	claim(`read_all carries three parts (${said('DUMP_PARTS')})`, num('DUMP_PARTS') === 3);
	claim(`read_all carries one era (${said('DUMP_ERAS')})`, num('DUMP_ERAS') === 1);
	claim(`read_all carries one character (${said('DUMP_CHARACTERS')})`, num('DUMP_CHARACTERS') === 1);
	claim(`read_all carries one arc (${said('DUMP_ARCS')})`, num('DUMP_ARCS') === 1);
	claim(
		`read_all carries three appearances (${said('DUMP_APPEARANCES')})`,
		num('DUMP_APPEARANCES') === 3
	);
	claim('every read_all list equals its table count', said('DUMP_COUNTS_MATCH_TABLES') === 'true');
	claim(
		`read_all keeps the lists' own order (got "${said('DUMP_PART_ORDER')}")`,
		said('DUMP_PART_ORDER') === 'Two,One,The pier' && said('DUMP_PARTS_IN_LIST_ORDER') === 'true'
	);
	claim('read_all carries the rights page on the work', said('DUMP_WORK_RIGHTS') === 'true');
	claim('read_all carries the author row itself', said('DUMP_AUTHOR_BYLINE') === 'KP, weaver');

	// ── the cascade ──────────────────────────────────────────────────────
	for (const t of ['WORKS', 'PARTS', 'ERAS', 'CHARACTERS', 'ARCS', 'APPEARANCES']) {
		claim(
			`deleting the work leaves no ${t.toLowerCase()} (${said(`LEFT_${t}`)})`,
			num(`LEFT_${t}`) === 0
		);
	}
	claim(
		`deleting a work does not touch the author (${said('LEFT_AUTHOR')})`,
		num('LEFT_AUTHOR') === 1
	);

	// ── the purge ──────────────────────────────────
	claim(
		`seven rows stood before the purge (${said('PURGE_ROWS_STANDING')})`,
		num('PURGE_ROWS_STANDING') === 7
	);
	claim(`purge_all returns the count it deleted (${said('PURGED')})`, num('PURGED') === 7);
	claim('the count returned is the true count of rows that stood', said('PURGE_COUNT_TRUE') === 'true');
	for (const t of ['WORKS', 'PARTS', 'ERAS', 'CHARACTERS', 'ARCS', 'APPEARANCES', 'AUTHOR']) {
		claim(
			`the purge leaves no ${t.toLowerCase()} (${said(`AFTER_PURGE_${t}`)})`,
			num(`AFTER_PURGE_${t}`) === 0
		);
	}
	const after = (said('AFTER_PURGE_TABLES') ?? '').split(',').filter(Boolean);
	claim(
		`the schema stands after the purge (${after.join(' · ')})`,
		[...wanted, 'author'].every((t) => after.includes(t))
	);
	claim('the base file is still there after the purge', said('AFTER_PURGE_FILE') === 'true');
	claim('the purged base is still at user_version 2', said('AFTER_PURGE_VERSION') === '2');
	claim('the purged base takes a new row at once', said('AFTER_PURGE_WRITES') === 'true');
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
