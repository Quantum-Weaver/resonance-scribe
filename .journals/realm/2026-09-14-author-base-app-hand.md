# 2026-09-14 — the author, the rights, and the whole studio

The base gains a seventh table, the work gains a column, and two doors take
the studio whole. The rooms that will use them are another hand's.

## the migration

`src-tauri/src/base.rs` carries `MIGRATION_V2` beside `MIGRATION_V1`, and
`migrate` runs each step only on a base that has not had it, writing its own
`user_version` as it goes. A base at version 1 reaches version 2 with every
row it already held.

- `author` — `id TEXT PRIMARY KEY CHECK (id = 'author')` · `name TEXT NOT
  NULL` · `byline TEXT NOT NULL` · `contact TEXT NOT NULL` · `created_at
  INTEGER NOT NULL` · `updated_at INTEGER NOT NULL`. One row at most; the
  CHECK is what says so.
- `works.rights TEXT` — added by `ALTER TABLE`, and only when
  `has_column(conn, "works", "rights")` says it is absent. A row written
  before the column reads NULL.

## the commands

`src-tauri/src/base.rs` holds the functions, `src-tauri/src/commands.rs` the
`#[tauri::command]` doors, `src-tauri/src/lib.rs` the registrations in
`generate_handler!`, and `src/lib/base.ts` the window's side.

- `get_author() -> Option<Author>` · `getAuthor()`
- `set_author(name, byline, contact) -> Author` · `setAuthor(...)` — INSERT
  with `ON CONFLICT(id) DO UPDATE`: the first write sets `created_at`, every
  write moves `updated_at`, and there is never a second row.
- `set_work_rights(id, rights: Option<String>) -> Work` · `setWorkRights(id,
  rights)` — the JSON text is stored whole and never parsed in Rust; `None`
  clears it. `update_work` does not name the column, so editing a title
  cannot lose a licence.
- `read_all() -> StudioDump` · `readAll()` — `{ author, works, parts, eras,
  characters, arcs, appearances }`, the works in `list_works` order and each
  work's rows in the order its own `list_*` gives.
- `purge_all() -> u64` · `purgeAll()` — one transaction over all seven
  tables, children before parents, each counted immediately before it is
  emptied, then `VACUUM`. The schema, the `user_version` and the file stand.

## the shapes

`src/lib/types/types.ts` gains `Author` (`id: 'author'`, `name`, `byline`,
`contact`, `created_at`, `updated_at`) and `StudioDump`, both type aliases
like the six before them, and `Work` gains `rights: string | null`.
`src/lib/atogail.ts` carries `rights: null` on the work it mints, the one
line the new required field asked of a file outside this hand's scope.

## the proof

`.journals/proofs/2026-09-02-the-base-round-trip/round-trip.mjs` and the
`proof_base_round_trip` door in `base.rs` grew: the Node half now hands the
test a second scratch path in `SCRIBE_PROOF_OLD_DB`, and the test writes a
base there from `OLD_SCHEMA` — the pre-`author`, pre-`rights` `CREATE TABLE`
statements, frozen in the test module — with a work and a part in it, then
opens it through `open` and reads both back.

## verification

```
cargo check                     Finished `dev` profile ... in 1.51s
cargo check --tests             Finished `dev` profile ... in 0.41s
npm run check                   COMPLETED 318 FILES 0 ERRORS 0 WARNINGS
                                0 FILES_WITH_PROBLEMS
npm run build                   ✓ built in 6.04s · Wrote site to "build" · ✔ done
round-trip.mjs                  85 TRUE, 0 FALSE, exit 0
bind.mjs                        82 TRUE, 0 FALSE, exit 0
rooms.mjs                       48 TRUE, 0 FALSE, exit 0
importer.mjs                    74 TRUE, 0 FALSE, exit 0
screenplay.mjs                  54 TRUE, 0 FALSE, exit 0
```

Claims added to the round trip, each its own line: the migration creates
`author` and `works.rights` and stands at `user_version` 2; an old base at
version 1 has neither, reaches version 2 on opening, keeps its work
(`The Old Road`, `created_at` 1) and its part, reads NULL in the new column,
and a second opening asks nothing of it twice; `get_author` is null before
the first `set_author` and one row after, a second `set_author` leaves one
row and changes the byline while `created_at` holds and `updated_at` moves,
a two-line contact keeps its lines and an empty one stays empty; a new work
is born with no rights page, `set_work_rights` carries
`{"holder":"KP","grants":[{"name":"read"}],"exclusive":false}` out and back,
`update_work` leaves it standing, null clears it; `read_all` returns 1 work,
3 parts, 1 era, 1 character, 1 arc, 3 appearances and the author, every list
equal to its table count and the parts in `list_parts` order
(`Two,One,The pier`); deleting a work leaves the author row; seven rows
stand before the purge, `purge_all` returns 7, all seven tables read 0, the
seven tables are still in `sqlite_master`, the file is still there, the base
is still at `user_version` 2 and takes a new row at once.

No room, store, route, rail, mirror or manifest was touched. The base at
`%APPDATA%\com.audhd.resonance-scribe\scribe.db` was not opened; the proof
runs in its own scratch directory and removes it.
