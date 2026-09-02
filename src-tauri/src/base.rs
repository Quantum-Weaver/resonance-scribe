// THE BASE — the six nouns of THE AUTHOR'S STUDIO, and the only door to them.
//
// `resonance-chamber/desk/THE-AUTHORS-STUDIO.md` §"The nouns, as a base" is
// the brief, and its columns are written here unchanged:
//
//   work        — id · kind · title · byline · note · created_at · updated_at
//   part        — id · work_id · parent_id · ord · title · body · words · …
//   era         — id · work_id · ord · name · note
//   character   — id · work_id · name · note · emoji
//   arc         — id · work_id · name · shape · note
//   appearance  — id · work_id · part_id? · era_id? · character_id? · arc_id? · note
//
// THE HANG-ON-EITHER ROW is `appearance`, and it is the whole reason sistrum
// is the mother: her `feelings` table hangs a row on a work OR a take, and an
// era, a character and an arc all want that same shape. A character in a
// scene, a scene in an era, an arc through a part — each is ONE row here,
// never a second list. The CHECK below is what makes "at least one of them"
// a law of the base rather than a habit of the window.
//
// WHY THE BASE IS RUST'S. The mother reaches SQLite from the window through
// `tauri-plugin-sql` and writes her SQL in Svelte. This body does not: the
// plan asks for a Tauri command per noun, and a command is a door the window
// cannot walk around. So the CHECK, the cascade, the ordinals and every
// `updated_at` live in exactly one place, and the round-trip can be proven by
// `cargo test` with no app running (`.journals/proofs/`).
//
// Every function here that does real work takes `&Connection` and is public.
// The `#[tauri::command]` doors are thin wrappers in `commands.rs`, and the
// proof calls the same functions the commands call — the mother's own proof
// shape (`resonance-sistrum/.journals/proofs/mixdown-two-takes.mjs`, the
// ignored test door).

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

/// The managed handle. One connection, one writer, a mutex in front of it —
/// a single author on a single device is the whole concurrency story.
pub struct Base(pub Mutex<Connection>);

pub type Res<T> = Result<T, String>;

fn err<E: std::fmt::Display>(e: E) -> String {
    e.to_string()
}

pub fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn new_id() -> String {
    uuid::Uuid::new_v4().to_string()
}

/// Words, counted the only honest way a studio may count them: whitespace-
/// separated runs of the author's own text. Nothing is altered to count it —
/// "typos are fingerprints unless he says otherwise" (the-binder's law).
pub fn count_words(body: &str) -> i64 {
    body.split_whitespace().count() as i64
}

// ── The migration ────────────────────────────────────────────────────────
//
// Sistrum's `works → takes → feelings` was NOT carried. It is another app's
// domain; this body was cut from hers and owes her no schema. Her migration
// ran through `tauri-plugin-sql`'s Migration list; this one runs here, gated
// on SQLite's own `user_version`, which is the same idea with one less plugin.

pub const MIGRATION_V1: &str = r#"
CREATE TABLE IF NOT EXISTS works (
    id          TEXT PRIMARY KEY,
    kind        TEXT NOT NULL DEFAULT 'book',
    title       TEXT NOT NULL,
    byline      TEXT,
    note        TEXT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_works_updated ON works(updated_at);

-- A chapter is a part with parent_id NULL; a scene is a part whose parent_id
-- is a chapter. `ord` is DATA: order is a column, never an accident of insert
-- time, so the board can move a card and the base remembers it.
CREATE TABLE IF NOT EXISTS parts (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    parent_id   TEXT REFERENCES parts(id) ON DELETE CASCADE,
    ord         INTEGER NOT NULL DEFAULT 0,
    title       TEXT NOT NULL DEFAULT '',
    body        TEXT NOT NULL DEFAULT '',
    words       INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_parts_work ON parts(work_id, ord);
CREATE INDEX IF NOT EXISTS idx_parts_parent ON parts(parent_id, ord);

CREATE TABLE IF NOT EXISTS eras (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    ord         INTEGER NOT NULL DEFAULT 0,
    name        TEXT NOT NULL,
    note        TEXT
);
CREATE INDEX IF NOT EXISTS idx_eras_work ON eras(work_id, ord);

CREATE TABLE IF NOT EXISTS characters (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    note        TEXT,
    emoji       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_characters_work ON characters(work_id);

CREATE TABLE IF NOT EXISTS arcs (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    shape       TEXT NOT NULL DEFAULT 'other',
    note        TEXT
);
CREATE INDEX IF NOT EXISTS idx_arcs_work ON arcs(work_id);

-- THE HANG-ON-EITHER ROW. At least one of the four must be set, or the row
-- says nothing about anything — that is the CHECK, and the base enforces it
-- whatever a later window believes.
CREATE TABLE IF NOT EXISTS appearances (
    id            TEXT PRIMARY KEY,
    work_id       TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    part_id       TEXT REFERENCES parts(id) ON DELETE CASCADE,
    era_id        TEXT REFERENCES eras(id) ON DELETE CASCADE,
    character_id  TEXT REFERENCES characters(id) ON DELETE CASCADE,
    arc_id        TEXT REFERENCES arcs(id) ON DELETE CASCADE,
    note          TEXT,
    CHECK (
        part_id IS NOT NULL
        OR era_id IS NOT NULL
        OR character_id IS NOT NULL
        OR arc_id IS NOT NULL
    )
);
CREATE INDEX IF NOT EXISTS idx_appearances_work ON appearances(work_id);
CREATE INDEX IF NOT EXISTS idx_appearances_part ON appearances(part_id);
CREATE INDEX IF NOT EXISTS idx_appearances_era ON appearances(era_id);
CREATE INDEX IF NOT EXISTS idx_appearances_character ON appearances(character_id);
CREATE INDEX IF NOT EXISTS idx_appearances_arc ON appearances(arc_id);
"#;

/// Open a base at `path`, turn foreign keys ON (SQLite's default is OFF, and
/// the cascade is the whole point), and migrate it forward.
pub fn open(path: &std::path::Path) -> Res<Connection> {
    let conn = Connection::open(path).map_err(err)?;
    prepare(&conn)?;
    Ok(conn)
}

fn prepare(conn: &Connection) -> Res<()> {
    conn.execute_batch("PRAGMA foreign_keys = ON;").map_err(err)?;
    migrate(conn)
}

pub fn migrate(conn: &Connection) -> Res<()> {
    let version: i64 = conn
        .query_row("PRAGMA user_version", [], |r| r.get(0))
        .map_err(err)?;
    if version < 1 {
        conn.execute_batch(MIGRATION_V1).map_err(err)?;
        conn.execute_batch("PRAGMA user_version = 1;").map_err(err)?;
    }
    Ok(())
}

// ── The nouns, as rows ───────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Work {
    pub id: String,
    /// book · manuscript · article · essay · other — as TEXT, by the plan.
    /// The base does not police it: a kind the author invents is still a kind.
    pub kind: String,
    pub title: String,
    pub byline: Option<String>,
    pub note: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Part {
    pub id: String,
    pub work_id: String,
    /// null = a chapter; set = a scene under that chapter.
    pub parent_id: Option<String>,
    pub ord: i64,
    pub title: String,
    pub body: String,
    pub words: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Era {
    pub id: String,
    pub work_id: String,
    pub ord: i64,
    pub name: String,
    pub note: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Character {
    pub id: String,
    pub work_id: String,
    pub name: String,
    pub note: Option<String>,
    pub emoji: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Arc {
    pub id: String,
    pub work_id: String,
    pub name: String,
    /// rising · turning · resolving · other — as TEXT, by the plan.
    pub shape: String,
    pub note: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Appearance {
    pub id: String,
    pub work_id: String,
    pub part_id: Option<String>,
    pub era_id: Option<String>,
    pub character_id: Option<String>,
    pub arc_id: Option<String>,
    pub note: Option<String>,
}

const WORK_COLS: &str = "id, kind, title, byline, note, created_at, updated_at";
const PART_COLS: &str =
    "id, work_id, parent_id, ord, title, body, words, created_at, updated_at";
const ERA_COLS: &str = "id, work_id, ord, name, note";
const CHARACTER_COLS: &str = "id, work_id, name, note, emoji";
const ARC_COLS: &str = "id, work_id, name, shape, note";
const APPEARANCE_COLS: &str =
    "id, work_id, part_id, era_id, character_id, arc_id, note";

fn work_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Work> {
    Ok(Work {
        id: r.get(0)?,
        kind: r.get(1)?,
        title: r.get(2)?,
        byline: r.get(3)?,
        note: r.get(4)?,
        created_at: r.get(5)?,
        updated_at: r.get(6)?,
    })
}

fn part_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Part> {
    Ok(Part {
        id: r.get(0)?,
        work_id: r.get(1)?,
        parent_id: r.get(2)?,
        ord: r.get(3)?,
        title: r.get(4)?,
        body: r.get(5)?,
        words: r.get(6)?,
        created_at: r.get(7)?,
        updated_at: r.get(8)?,
    })
}

fn era_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Era> {
    Ok(Era {
        id: r.get(0)?,
        work_id: r.get(1)?,
        ord: r.get(2)?,
        name: r.get(3)?,
        note: r.get(4)?,
    })
}

fn character_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Character> {
    Ok(Character {
        id: r.get(0)?,
        work_id: r.get(1)?,
        name: r.get(2)?,
        note: r.get(3)?,
        emoji: r.get(4)?,
    })
}

fn arc_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Arc> {
    Ok(Arc {
        id: r.get(0)?,
        work_id: r.get(1)?,
        name: r.get(2)?,
        shape: r.get(3)?,
        note: r.get(4)?,
    })
}

fn appearance_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Appearance> {
    Ok(Appearance {
        id: r.get(0)?,
        work_id: r.get(1)?,
        part_id: r.get(2)?,
        era_id: r.get(3)?,
        character_id: r.get(4)?,
        arc_id: r.get(5)?,
        note: r.get(6)?,
    })
}

// ── work ─────────────────────────────────────────────────────────────────

pub fn list_works(conn: &Connection) -> Res<Vec<Work>> {
    let sql = format!("SELECT {WORK_COLS} FROM works ORDER BY updated_at DESC");
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt.query_map([], work_from).map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

pub fn get_work(conn: &Connection, id: &str) -> Res<Option<Work>> {
    let sql = format!("SELECT {WORK_COLS} FROM works WHERE id = ?1");
    conn.query_row(&sql, params![id], work_from)
        .optional()
        .map_err(err)
}

pub fn create_work(
    conn: &Connection,
    kind: &str,
    title: &str,
    byline: Option<&str>,
    note: Option<&str>,
) -> Res<Work> {
    let now = now_ms();
    let w = Work {
        id: new_id(),
        kind: if kind.trim().is_empty() { "other".into() } else { kind.trim().to_string() },
        title: title.trim().to_string(),
        byline: byline.map(|s| s.to_string()),
        note: note.map(|s| s.to_string()),
        created_at: now,
        updated_at: now,
    };
    conn.execute(
        "INSERT INTO works (id, kind, title, byline, note, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![w.id, w.kind, w.title, w.byline, w.note, w.created_at, w.updated_at],
    )
    .map_err(err)?;
    Ok(w)
}

pub fn update_work(
    conn: &Connection,
    id: &str,
    kind: &str,
    title: &str,
    byline: Option<&str>,
    note: Option<&str>,
) -> Res<Work> {
    let now = now_ms();
    let n = conn
        .execute(
            "UPDATE works SET kind = ?2, title = ?3, byline = ?4, note = ?5, updated_at = ?6
             WHERE id = ?1",
            params![id, kind, title, byline, note, now],
        )
        .map_err(err)?;
    if n == 0 {
        return Err(format!("no work with id {id}"));
    }
    get_work(conn, id)?.ok_or_else(|| format!("no work with id {id}"))
}

/// Deleting a work cascades: its parts (and their scenes), eras, characters,
/// arcs and every appearance hanging on any of them go with it. The cascade is
/// the base's, not this function's — see `PRAGMA foreign_keys` in `prepare`.
pub fn delete_work(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM works WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

// ── part ─────────────────────────────────────────────────────────────────

/// Every part of a work, chapters and scenes together, in reading order:
/// chapters by `ord`, each chapter's scenes by `ord` directly beneath it.
pub fn list_parts(conn: &Connection, work_id: &str) -> Res<Vec<Part>> {
    let sql = format!(
        "SELECT {PART_COLS} FROM parts WHERE work_id = ?1
         ORDER BY COALESCE((SELECT p.ord FROM parts p WHERE p.id = parts.parent_id), parts.ord),
                  parts.parent_id IS NOT NULL,
                  parts.ord"
    );
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt.query_map(params![work_id], part_from).map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

fn next_ord(conn: &Connection, work_id: &str, parent_id: Option<&str>) -> Res<i64> {
    let n: i64 = match parent_id {
        Some(p) => conn
            .query_row(
                "SELECT COALESCE(MAX(ord) + 1, 0) FROM parts WHERE work_id = ?1 AND parent_id = ?2",
                params![work_id, p],
                |r| r.get(0),
            )
            .map_err(err)?,
        None => conn
            .query_row(
                "SELECT COALESCE(MAX(ord) + 1, 0) FROM parts WHERE work_id = ?1 AND parent_id IS NULL",
                params![work_id],
                |r| r.get(0),
            )
            .map_err(err)?,
    };
    Ok(n)
}

pub fn create_part(
    conn: &Connection,
    work_id: &str,
    parent_id: Option<&str>,
    title: &str,
    body: &str,
) -> Res<Part> {
    let now = now_ms();
    let p = Part {
        id: new_id(),
        work_id: work_id.to_string(),
        parent_id: parent_id.map(|s| s.to_string()),
        ord: next_ord(conn, work_id, parent_id)?,
        title: title.to_string(),
        body: body.to_string(),
        words: count_words(body),
        created_at: now,
        updated_at: now,
    };
    conn.execute(
        "INSERT INTO parts (id, work_id, parent_id, ord, title, body, words, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            p.id, p.work_id, p.parent_id, p.ord, p.title, p.body, p.words, p.created_at, p.updated_at
        ],
    )
    .map_err(err)?;
    touch_work(conn, work_id)?;
    Ok(p)
}

/// `words` is recomputed here and never taken from the window: a count the
/// author cannot see being derived is a count nobody can trust.
pub fn update_part(conn: &Connection, id: &str, title: &str, body: &str) -> Res<Part> {
    let now = now_ms();
    let n = conn
        .execute(
            "UPDATE parts SET title = ?2, body = ?3, words = ?4, updated_at = ?5 WHERE id = ?1",
            params![id, title, body, count_words(body), now],
        )
        .map_err(err)?;
    if n == 0 {
        return Err(format!("no part with id {id}"));
    }
    let p = get_part(conn, id)?.ok_or_else(|| format!("no part with id {id}"))?;
    touch_work(conn, &p.work_id)?;
    Ok(p)
}

pub fn get_part(conn: &Connection, id: &str) -> Res<Option<Part>> {
    let sql = format!("SELECT {PART_COLS} FROM parts WHERE id = ?1");
    conn.query_row(&sql, params![id], part_from)
        .optional()
        .map_err(err)
}

pub fn delete_part(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM parts WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

/// Order is data. This writes `ord` and NOTHING else — not `updated_at`, not
/// `body`, not a part's place in the tree — so a re-order can never be
/// mistaken for an edit of the author's text (S2's gate is a proof of exactly
/// this). `ids` are positions 0..n in the order given; an id that is not this
/// work's is refused and the whole transaction rolls back.
pub fn reorder_parts(conn: &mut Connection, work_id: &str, ids: &[String]) -> Res<()> {
    let tx = conn.transaction().map_err(err)?;
    for (i, id) in ids.iter().enumerate() {
        let n = tx
            .execute(
                "UPDATE parts SET ord = ?1 WHERE id = ?2 AND work_id = ?3",
                params![i as i64, id, work_id],
            )
            .map_err(err)?;
        if n == 0 {
            return Err(format!("part {id} is not in work {work_id}"));
        }
    }
    tx.commit().map_err(err)
}

/// A work's `updated_at` moves when its parts move — the shelf sorts by it.
fn touch_work(conn: &Connection, work_id: &str) -> Res<()> {
    conn.execute(
        "UPDATE works SET updated_at = ?2 WHERE id = ?1",
        params![work_id, now_ms()],
    )
    .map_err(err)?;
    Ok(())
}

// ── era ──────────────────────────────────────────────────────────────────

pub fn list_eras(conn: &Connection, work_id: &str) -> Res<Vec<Era>> {
    let sql = format!("SELECT {ERA_COLS} FROM eras WHERE work_id = ?1 ORDER BY ord");
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt.query_map(params![work_id], era_from).map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

pub fn create_era(conn: &Connection, work_id: &str, name: &str, note: Option<&str>) -> Res<Era> {
    let ord: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(ord) + 1, 0) FROM eras WHERE work_id = ?1",
            params![work_id],
            |r| r.get(0),
        )
        .map_err(err)?;
    let e = Era {
        id: new_id(),
        work_id: work_id.to_string(),
        ord,
        name: name.to_string(),
        note: note.map(|s| s.to_string()),
    };
    conn.execute(
        "INSERT INTO eras (id, work_id, ord, name, note) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![e.id, e.work_id, e.ord, e.name, e.note],
    )
    .map_err(err)?;
    touch_work(conn, work_id)?;
    Ok(e)
}

pub fn update_era(conn: &Connection, id: &str, name: &str, note: Option<&str>) -> Res<Era> {
    let n = conn
        .execute(
            "UPDATE eras SET name = ?2, note = ?3 WHERE id = ?1",
            params![id, name, note],
        )
        .map_err(err)?;
    if n == 0 {
        return Err(format!("no era with id {id}"));
    }
    let sql = format!("SELECT {ERA_COLS} FROM eras WHERE id = ?1");
    conn.query_row(&sql, params![id], era_from).map_err(err)
}

pub fn delete_era(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM eras WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

pub fn reorder_eras(conn: &mut Connection, work_id: &str, ids: &[String]) -> Res<()> {
    let tx = conn.transaction().map_err(err)?;
    for (i, id) in ids.iter().enumerate() {
        let n = tx
            .execute(
                "UPDATE eras SET ord = ?1 WHERE id = ?2 AND work_id = ?3",
                params![i as i64, id, work_id],
            )
            .map_err(err)?;
        if n == 0 {
            return Err(format!("era {id} is not in work {work_id}"));
        }
    }
    tx.commit().map_err(err)
}

// ── character ────────────────────────────────────────────────────────────

pub fn list_characters(conn: &Connection, work_id: &str) -> Res<Vec<Character>> {
    let sql = format!("SELECT {CHARACTER_COLS} FROM characters WHERE work_id = ?1 ORDER BY name");
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt
        .query_map(params![work_id], character_from)
        .map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

pub fn create_character(
    conn: &Connection,
    work_id: &str,
    name: &str,
    note: Option<&str>,
    emoji: &str,
) -> Res<Character> {
    let c = Character {
        id: new_id(),
        work_id: work_id.to_string(),
        name: name.to_string(),
        note: note.map(|s| s.to_string()),
        emoji: emoji.to_string(),
    };
    conn.execute(
        "INSERT INTO characters (id, work_id, name, note, emoji) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![c.id, c.work_id, c.name, c.note, c.emoji],
    )
    .map_err(err)?;
    touch_work(conn, work_id)?;
    Ok(c)
}

pub fn update_character(
    conn: &Connection,
    id: &str,
    name: &str,
    note: Option<&str>,
    emoji: &str,
) -> Res<Character> {
    let n = conn
        .execute(
            "UPDATE characters SET name = ?2, note = ?3, emoji = ?4 WHERE id = ?1",
            params![id, name, note, emoji],
        )
        .map_err(err)?;
    if n == 0 {
        return Err(format!("no character with id {id}"));
    }
    let sql = format!("SELECT {CHARACTER_COLS} FROM characters WHERE id = ?1");
    conn.query_row(&sql, params![id], character_from).map_err(err)
}

pub fn delete_character(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM characters WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

// ── arc ──────────────────────────────────────────────────────────────────

pub fn list_arcs(conn: &Connection, work_id: &str) -> Res<Vec<Arc>> {
    let sql = format!("SELECT {ARC_COLS} FROM arcs WHERE work_id = ?1 ORDER BY name");
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt.query_map(params![work_id], arc_from).map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

pub fn create_arc(
    conn: &Connection,
    work_id: &str,
    name: &str,
    shape: &str,
    note: Option<&str>,
) -> Res<Arc> {
    let a = Arc {
        id: new_id(),
        work_id: work_id.to_string(),
        name: name.to_string(),
        shape: if shape.trim().is_empty() { "other".into() } else { shape.trim().to_string() },
        note: note.map(|s| s.to_string()),
    };
    conn.execute(
        "INSERT INTO arcs (id, work_id, name, shape, note) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![a.id, a.work_id, a.name, a.shape, a.note],
    )
    .map_err(err)?;
    touch_work(conn, work_id)?;
    Ok(a)
}

pub fn update_arc(
    conn: &Connection,
    id: &str,
    name: &str,
    shape: &str,
    note: Option<&str>,
) -> Res<Arc> {
    let n = conn
        .execute(
            "UPDATE arcs SET name = ?2, shape = ?3, note = ?4 WHERE id = ?1",
            params![id, name, shape, note],
        )
        .map_err(err)?;
    if n == 0 {
        return Err(format!("no arc with id {id}"));
    }
    let sql = format!("SELECT {ARC_COLS} FROM arcs WHERE id = ?1");
    conn.query_row(&sql, params![id], arc_from).map_err(err)
}

pub fn delete_arc(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM arcs WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

// ── appearance ───────────────────────────────────────────────────────────

pub fn list_appearances(conn: &Connection, work_id: &str) -> Res<Vec<Appearance>> {
    let sql = format!(
        "SELECT {APPEARANCE_COLS} FROM appearances WHERE work_id = ?1 ORDER BY rowid"
    );
    let mut stmt = conn.prepare(&sql).map_err(err)?;
    let rows = stmt
        .query_map(params![work_id], appearance_from)
        .map_err(err)?;
    rows.collect::<rusqlite::Result<Vec<_>>>().map_err(err)
}

/// One row, four nullable hands, at least one of them holding something. The
/// CHECK in the base is the law; this refusal is only the same law said early,
/// in a sentence a room can show.
pub fn create_appearance(
    conn: &Connection,
    work_id: &str,
    part_id: Option<&str>,
    era_id: Option<&str>,
    character_id: Option<&str>,
    arc_id: Option<&str>,
    note: Option<&str>,
) -> Res<Appearance> {
    if part_id.is_none() && era_id.is_none() && character_id.is_none() && arc_id.is_none() {
        return Err(
            "an appearance must hang on at least one of part · era · character · arc".into(),
        );
    }
    let a = Appearance {
        id: new_id(),
        work_id: work_id.to_string(),
        part_id: part_id.map(|s| s.to_string()),
        era_id: era_id.map(|s| s.to_string()),
        character_id: character_id.map(|s| s.to_string()),
        arc_id: arc_id.map(|s| s.to_string()),
        note: note.map(|s| s.to_string()),
    };
    conn.execute(
        "INSERT INTO appearances (id, work_id, part_id, era_id, character_id, arc_id, note)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![a.id, a.work_id, a.part_id, a.era_id, a.character_id, a.arc_id, a.note],
    )
    .map_err(err)?;
    touch_work(conn, work_id)?;
    Ok(a)
}

pub fn delete_appearance(conn: &Connection, id: &str) -> Res<()> {
    conn.execute("DELETE FROM appearances WHERE id = ?1", params![id])
        .map_err(err)?;
    Ok(())
}

// ── The proof's door ─────────────────────────────────────────────────────
//
// `.journals/proofs/2026-09-02-the-base-round-trip/` drives this, the way the
// mother's mixdown proof drives `bounce_to`: an #[ignore]d test that prints
// machine-readable lines, run by a Node script that judges them. It is
// ignored so `cargo test` stays silent for anyone who did not ask for it.

#[cfg(test)]
mod proof_door {
    use super::*;

    fn say(key: &str, value: impl std::fmt::Display) {
        println!("SCRIBE_PROOF_{key}={value}");
    }

    #[test]
    #[ignore]
    fn proof_base_round_trip() {
        let path = std::env::var("SCRIBE_PROOF_DB").expect("SCRIBE_PROOF_DB");
        let mut conn = open(std::path::Path::new(&path)).expect("open");

        // Every table the migration claims to create, by the base's own word.
        let mut names: Vec<String> = {
            let mut stmt = conn
                .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
                .unwrap();
            stmt.query_map([], |r| r.get::<_, String>(0))
                .unwrap()
                .map(|r| r.unwrap())
                .collect()
        };
        names.sort();
        say("TABLES", names.join(","));

        let fk: i64 = conn.query_row("PRAGMA foreign_keys", [], |r| r.get(0)).unwrap();
        say("FOREIGN_KEYS", fk);

        // A work with two chapters, one scene under the first.
        let w = create_work(&conn, "book", "The Salt Road", Some("KP"), Some("a first light"))
            .expect("create_work");
        say("WORK_ID", &w.id);
        say("WORK_KIND", &w.kind);

        let c1 = create_part(&conn, &w.id, None, "One", "the sea was still that morning").unwrap();
        let c2 = create_part(&conn, &w.id, None, "Two", "and then it was not").unwrap();
        let s1 = create_part(&conn, &w.id, Some(&c1.id), "The pier", "six words land in this scene").unwrap();
        say("CH1_ORD", c1.ord);
        say("CH2_ORD", c2.ord);
        say("SCENE_PARENT", s1.parent_id.clone().unwrap_or_default());
        say("SCENE_WORDS", s1.words);

        let era = create_era(&conn, &w.id, "Before the crossing", None).unwrap();
        let ch = create_character(&conn, &w.id, "Maren", Some("the pilot"), "🧭").unwrap();
        let arc = create_arc(&conn, &w.id, "The debt", "rising", None).unwrap();

        // Three appearances, each a different hand of the hang-on-either row.
        let a1 = create_appearance(&conn, &w.id, Some(&s1.id), None, Some(&ch.id), None, Some("she is here")).unwrap();
        let a2 = create_appearance(&conn, &w.id, Some(&c1.id), Some(&era.id), None, None, None).unwrap();
        let a3 = create_appearance(&conn, &w.id, Some(&c2.id), None, None, Some(&arc.id), None).unwrap();
        say("APPEARANCES_MADE", format!("{},{},{}", a1.id, a2.id, a3.id));

        // The CHECK, asked directly: a row hanging on nothing must be refused.
        let empty = create_appearance(&conn, &w.id, None, None, None, None, Some("nowhere"));
        say("EMPTY_APPEARANCE_REFUSED", empty.is_err());

        // Re-order the chapters, and prove only `ord` moved.
        let before: Vec<(String, i64)> = list_parts(&conn, &w.id)
            .unwrap()
            .iter()
            .map(|p| (p.id.clone(), p.updated_at))
            .collect();
        reorder_parts(&mut conn, &w.id, &[c2.id.clone(), c1.id.clone()]).unwrap();
        let after = list_parts(&conn, &w.id).unwrap();
        say("ORDER_AFTER", after.iter().map(|p| p.title.as_str()).collect::<Vec<_>>().join(","));
        let stamps_held = before
            .iter()
            .all(|(id, ts)| after.iter().any(|p| &p.id == id && p.updated_at == *ts));
        say("REORDER_TOUCHED_ONLY_ORD", stamps_held);

        // Read everything back.
        say("WORKS", list_works(&conn).unwrap().len());
        say("PARTS", list_parts(&conn, &w.id).unwrap().len());
        say("ERAS", list_eras(&conn, &w.id).unwrap().len());
        say("CHARACTERS", list_characters(&conn, &w.id).unwrap().len());
        say("ARCS", list_arcs(&conn, &w.id).unwrap().len());
        say("APPEARANCES", list_appearances(&conn, &w.id).unwrap().len());
        say("GET_WORK_TITLE", get_work(&conn, &w.id).unwrap().unwrap().title);

        // An edit sets words and updated_at by the command's own hand.
        let edited = update_part(&conn, &c1.id, "One", "one two three four five").unwrap();
        say("EDITED_WORDS", edited.words);
        say("EDITED_MOVED", edited.updated_at >= c1.updated_at);

        // Delete the work; find nothing left, anywhere.
        delete_work(&conn, &w.id).unwrap();
        let count = |t: &str| -> i64 {
            conn.query_row(&format!("SELECT COUNT(*) FROM {t}"), [], |r| r.get(0))
                .unwrap()
        };
        say("LEFT_WORKS", count("works"));
        say("LEFT_PARTS", count("parts"));
        say("LEFT_ERAS", count("eras"));
        say("LEFT_CHARACTERS", count("characters"));
        say("LEFT_ARCS", count("arcs"));
        say("LEFT_APPEARANCES", count("appearances"));
        say("DONE", 1);
    }
}
