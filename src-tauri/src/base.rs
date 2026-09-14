// THE BASE — the six nouns of THE AUTHOR'S STUDIO, and the only door to them.
//
// `resonance-chamber/desk/THE-AUTHORS-STUDIO.md` §"The nouns, as a base" is
// the brief, and its columns are written here unchanged:
//
//   author      — id ('author') · name · byline · contact · created_at · …
//   work        — id · kind · title · byline · note · rights · created_at · …
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

/// The author, and the work's rights. `author` holds at most one row, and the
/// CHECK is what says so: the id is the literal string `author`, so a second
/// row has nowhere to land. `contact` is a multi-line block kept verbatim and
/// may be empty. `works.rights` is added by `migrate`, not here, because the
/// column may already stand on a base this migration has met before.
pub const MIGRATION_V2: &str = r#"
CREATE TABLE IF NOT EXISTS author (
    id          TEXT PRIMARY KEY CHECK (id = 'author'),
    name        TEXT NOT NULL,
    byline      TEXT NOT NULL,
    contact     TEXT NOT NULL,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);
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

/// True when `table` already carries `column`, by SQLite's own word.
pub fn has_column(conn: &Connection, table: &str, column: &str) -> Res<bool> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({table})"))
        .map_err(err)?;
    let mut found = false;
    let rows = stmt.query_map([], |r| r.get::<_, String>(1)).map_err(err)?;
    for name in rows {
        if name.map_err(err)? == column {
            found = true;
        }
    }
    Ok(found)
}

/// Each step runs only on a base that has not had it, and each writes its own
/// `user_version`, so a base written by the first schema reaches the second
/// with every row it already held. `works.rights` is an ALTER rather than a
/// rebuild for that reason, and it is asked for only when the column is absent.
pub fn migrate(conn: &Connection) -> Res<()> {
    let version: i64 = conn
        .query_row("PRAGMA user_version", [], |r| r.get(0))
        .map_err(err)?;
    if version < 1 {
        conn.execute_batch(MIGRATION_V1).map_err(err)?;
        conn.execute_batch("PRAGMA user_version = 1;").map_err(err)?;
    }
    if version < 2 {
        conn.execute_batch(MIGRATION_V2).map_err(err)?;
        if !has_column(conn, "works", "rights")? {
            conn.execute_batch("ALTER TABLE works ADD COLUMN rights TEXT;")
                .map_err(err)?;
        }
        conn.execute_batch("PRAGMA user_version = 2;").map_err(err)?;
    }
    Ok(())
}

// ── The nouns, as rows ───────────────────────────────────────────────────

/// The author of the studio — one row, whose id is always `author`.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Author {
    pub id: String,
    pub name: String,
    pub byline: String,
    /// A multi-line block, kept verbatim, possibly empty.
    pub contact: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Work {
    pub id: String,
    /// book · manuscript · article · essay · other — as TEXT, by the plan.
    /// The base does not police it: a kind the author invents is still a kind.
    pub kind: String,
    pub title: String,
    pub byline: Option<String>,
    pub note: Option<String>,
    /// A drawn licence as JSON text, written whole by the window and never
    /// read here. NULL is a work with no rights page.
    pub rights: Option<String>,
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

/// Everything in one call, for a room that carries the studio out whole.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StudioDump {
    pub author: Option<Author>,
    pub works: Vec<Work>,
    pub parts: Vec<Part>,
    pub eras: Vec<Era>,
    pub characters: Vec<Character>,
    pub arcs: Vec<Arc>,
    pub appearances: Vec<Appearance>,
}

/// The one id the `author` table accepts.
pub const AUTHOR_ID: &str = "author";

const AUTHOR_COLS: &str = "id, name, byline, contact, created_at, updated_at";
const WORK_COLS: &str = "id, kind, title, byline, note, rights, created_at, updated_at";
const PART_COLS: &str =
    "id, work_id, parent_id, ord, title, body, words, created_at, updated_at";
const ERA_COLS: &str = "id, work_id, ord, name, note";
const CHARACTER_COLS: &str = "id, work_id, name, note, emoji";
const ARC_COLS: &str = "id, work_id, name, shape, note";
const APPEARANCE_COLS: &str =
    "id, work_id, part_id, era_id, character_id, arc_id, note";

fn author_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Author> {
    Ok(Author {
        id: r.get(0)?,
        name: r.get(1)?,
        byline: r.get(2)?,
        contact: r.get(3)?,
        created_at: r.get(4)?,
        updated_at: r.get(5)?,
    })
}

fn work_from(r: &rusqlite::Row<'_>) -> rusqlite::Result<Work> {
    Ok(Work {
        id: r.get(0)?,
        kind: r.get(1)?,
        title: r.get(2)?,
        byline: r.get(3)?,
        note: r.get(4)?,
        rights: r.get(5)?,
        created_at: r.get(6)?,
        updated_at: r.get(7)?,
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

// ── author ───────────────────────────────────────────────────────────────

pub fn get_author(conn: &Connection) -> Res<Option<Author>> {
    let sql = format!("SELECT {AUTHOR_COLS} FROM author WHERE id = ?1");
    conn.query_row(&sql, params![AUTHOR_ID], author_from)
        .optional()
        .map_err(err)
}

/// Writes the one row, whether or not it already stands. `created_at` is set
/// on the first write and held after it; `updated_at` moves every time.
pub fn set_author(conn: &Connection, name: &str, byline: &str, contact: &str) -> Res<Author> {
    let now = now_ms();
    conn.execute(
        "INSERT INTO author (id, name, byline, contact, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?5)
         ON CONFLICT(id) DO UPDATE SET name = ?2, byline = ?3, contact = ?4, updated_at = ?5",
        params![AUTHOR_ID, name, byline, contact, now],
    )
    .map_err(err)?;
    get_author(conn)?.ok_or_else(|| "the author row did not take".to_string())
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
        rights: None,
        created_at: now,
        updated_at: now,
    };
    conn.execute(
        "INSERT INTO works (id, kind, title, byline, note, rights, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            w.id, w.kind, w.title, w.byline, w.note, w.rights, w.created_at, w.updated_at
        ],
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

/// The rights page, as the window drew it. The text is stored whole and never
/// parsed here; `None` clears it. `update_work` does not touch this column, so
/// editing a title cannot lose a licence.
pub fn set_work_rights(conn: &Connection, id: &str, rights: Option<&str>) -> Res<Work> {
    let n = conn
        .execute(
            "UPDATE works SET rights = ?2, updated_at = ?3 WHERE id = ?1",
            params![id, rights, now_ms()],
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

// ── the whole studio ─────────────────────────────────────────────────────

/// Every row of every table, in one call. The works come in `list_works`
/// order, and each work's parts, eras, characters, arcs and appearances follow
/// in the order their own `list_*` gives, so what a room exports is what a
/// room shows.
pub fn read_all(conn: &Connection) -> Res<StudioDump> {
    let works = list_works(conn)?;
    let mut parts = Vec::new();
    let mut eras = Vec::new();
    let mut characters = Vec::new();
    let mut arcs = Vec::new();
    let mut appearances = Vec::new();
    for w in &works {
        parts.extend(list_parts(conn, &w.id)?);
        eras.extend(list_eras(conn, &w.id)?);
        characters.extend(list_characters(conn, &w.id)?);
        arcs.extend(list_arcs(conn, &w.id)?);
        appearances.extend(list_appearances(conn, &w.id)?);
    }
    Ok(StudioDump {
        author: get_author(conn)?,
        works,
        parts,
        eras,
        characters,
        arcs,
        appearances,
    })
}

/// Empties every table, author included, in one transaction, and returns how
/// many rows went. Each table is counted immediately before it is emptied, and
/// children go before their parents, so the total is every row that stood and
/// not the cascade's shadow. The schema and the file stand; `VACUUM` returns
/// the space the rows held. Nothing outside this base is touched.
pub fn purge_all(conn: &mut Connection) -> Res<u64> {
    const TABLES: [&str; 7] = [
        "appearances",
        "arcs",
        "characters",
        "eras",
        "parts",
        "works",
        "author",
    ];
    let mut gone: u64 = 0;
    let tx = conn.transaction().map_err(err)?;
    for t in TABLES {
        let n: i64 = tx
            .query_row(&format!("SELECT COUNT(*) FROM {t}"), [], |r| r.get(0))
            .map_err(err)?;
        tx.execute(&format!("DELETE FROM {t}"), []).map_err(err)?;
        gone += n as u64;
    }
    tx.commit().map_err(err)?;
    conn.execute_batch("VACUUM;").map_err(err)?;
    Ok(gone)
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

    fn count(conn: &Connection, table: &str) -> i64 {
        conn.query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r.get(0))
            .unwrap()
    }

    fn tables(conn: &Connection) -> Vec<String> {
        let mut stmt = conn
            .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
            .unwrap();
        let mut names: Vec<String> = stmt
            .query_map([], |r| r.get::<_, String>(0))
            .unwrap()
            .map(|r| r.unwrap())
            .collect();
        names.sort();
        names
    }

    fn user_version(conn: &Connection) -> i64 {
        conn.query_row("PRAGMA user_version", [], |r| r.get(0)).unwrap()
    }

    /// The schema as it stood before `author` and `works.rights`, written out
    /// here so the migration is asked against a frozen old shape rather than
    /// against the statements it ships with today.
    const OLD_SCHEMA: &str = r#"
CREATE TABLE works (
    id          TEXT PRIMARY KEY,
    kind        TEXT NOT NULL DEFAULT 'book',
    title       TEXT NOT NULL,
    byline      TEXT,
    note        TEXT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);
CREATE TABLE parts (
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
CREATE TABLE eras (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    ord         INTEGER NOT NULL DEFAULT 0,
    name        TEXT NOT NULL,
    note        TEXT
);
CREATE TABLE characters (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    note        TEXT,
    emoji       TEXT NOT NULL DEFAULT ''
);
CREATE TABLE arcs (
    id          TEXT PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    shape       TEXT NOT NULL DEFAULT 'other',
    note        TEXT
);
CREATE TABLE appearances (
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
PRAGMA user_version = 1;
"#;

    /// A base written by the old schema, carrying a work and a part, opened by
    /// today's `open` — the migration runs on it and it keeps what it held.
    fn prove_old_base_migrates() {
        let old = std::env::var("SCRIBE_PROOF_OLD_DB").expect("SCRIBE_PROOF_OLD_DB");
        let old = std::path::Path::new(&old);
        {
            let c = Connection::open(old).unwrap();
            c.execute_batch(OLD_SCHEMA).unwrap();
            c.execute(
                "INSERT INTO works (id, kind, title, byline, note, created_at, updated_at)
                 VALUES ('old-work', 'book', 'The Old Road', 'KP', 'written before', 1, 2)",
                [],
            )
            .unwrap();
            c.execute(
                "INSERT INTO parts (id, work_id, parent_id, ord, title, body, words, created_at, updated_at)
                 VALUES ('old-part', 'old-work', NULL, 0, 'One', 'two words', 2, 1, 2)",
                [],
            )
            .unwrap();
            say("OLD_VERSION_BEFORE", user_version(&c));
            say("OLD_HAS_AUTHOR_BEFORE", tables(&c).contains(&"author".to_string()));
            say("OLD_HAS_RIGHTS_BEFORE", has_column(&c, "works", "rights").unwrap());
        }

        let c = open(old).expect("open the old base");
        say("OLD_VERSION_AFTER", user_version(&c));
        say("OLD_HAS_AUTHOR_AFTER", tables(&c).contains(&"author".to_string()));
        say("OLD_HAS_RIGHTS_AFTER", has_column(&c, "works", "rights").unwrap());
        say("OLD_WORKS", count(&c, "works"));
        say("OLD_PARTS", count(&c, "parts"));
        let kept = get_work(&c, "old-work").unwrap().unwrap();
        say("OLD_WORK_TITLE", &kept.title);
        say("OLD_WORK_RIGHTS_NULL", kept.rights.is_none());
        say("OLD_WORK_CREATED_AT", kept.created_at);
        drop(c);

        // Opening it again asks nothing of the schema a second time.
        let again = open(old).expect("re-open the migrated base");
        say("OLD_REOPEN_VERSION", user_version(&again));
        say("OLD_REOPEN_WORKS", count(&again, "works"));
    }

    #[test]
    #[ignore]
    fn proof_base_round_trip() {
        let path = std::env::var("SCRIBE_PROOF_DB").expect("SCRIBE_PROOF_DB");
        let mut conn = open(std::path::Path::new(&path)).expect("open");

        // Every table the migration claims to create, by the base's own word.
        say("TABLES", tables(&conn).join(","));
        say("USER_VERSION", user_version(&conn));
        say("WORKS_HAS_RIGHTS", has_column(&conn, "works", "rights").unwrap());

        let fk: i64 = conn.query_row("PRAGMA foreign_keys", [], |r| r.get(0)).unwrap();
        say("FOREIGN_KEYS", fk);

        prove_old_base_migrates();

        // The author: nothing before, one row after, and one row still after a
        // second writing.
        say("AUTHOR_BEFORE", get_author(&conn).unwrap().is_none());
        let first = set_author(
            &conn,
            "KP",
            "KP, the Quantum Weaver",
            "audhdities@proton.me\naudhdities.com",
        )
        .unwrap();
        say("AUTHOR_ID", &first.id);
        say("AUTHOR_NAME", &first.name);
        say("AUTHOR_CONTACT_LINES", first.contact.lines().count());
        say("AUTHOR_ROWS_AFTER_FIRST", count(&conn, "author"));
        let second = set_author(&conn, "KP", "KP, weaver", "").unwrap();
        say("AUTHOR_ROWS_AFTER_SECOND", count(&conn, "author"));
        say("AUTHOR_BYLINE_AFTER_SECOND", &second.byline);
        say("AUTHOR_CONTACT_EMPTY", second.contact.is_empty());
        say("AUTHOR_CREATED_HELD", second.created_at == first.created_at);
        say("AUTHOR_UPDATED_MOVED", second.updated_at >= first.updated_at);
        say("AUTHOR_READ_BACK", get_author(&conn).unwrap().unwrap().byline);

        // A work with two chapters, one scene under the first.
        let w = create_work(&conn, "book", "The Salt Road", Some("KP"), Some("a first light"))
            .expect("create_work");
        say("WORK_ID", &w.id);
        say("WORK_KIND", &w.kind);
        say("RIGHTS_AT_BIRTH_NULL", w.rights.is_none());

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

        // The rights page: JSON text in, the same text out, null clears it,
        // and an edit of the work's own fields leaves it standing.
        let drawn = r#"{"holder":"KP","grants":[{"name":"read"}],"exclusive":false}"#;
        let with = set_work_rights(&conn, &w.id, Some(drawn)).unwrap();
        say("RIGHTS_SET", with.rights.clone().unwrap_or_default());
        say(
            "RIGHTS_READ_BACK",
            get_work(&conn, &w.id).unwrap().unwrap().rights.unwrap_or_default(),
        );
        let held = update_work(&conn, &w.id, "book", "The Salt Road", Some("KP"), Some("a first light")).unwrap();
        say("RIGHTS_HELD_THROUGH_UPDATE", held.rights.as_deref() == Some(drawn));
        let cleared = set_work_rights(&conn, &w.id, None).unwrap();
        say("RIGHTS_CLEARED", cleared.rights.is_none());
        say(
            "RIGHTS_CLEARED_READ_BACK",
            get_work(&conn, &w.id).unwrap().unwrap().rights.is_none(),
        );
        set_work_rights(&conn, &w.id, Some(drawn)).unwrap();

        // Everything, in one call, in the order the lists give.
        let dump = read_all(&conn).unwrap();
        say("DUMP_AUTHOR", dump.author.is_some());
        say("DUMP_WORKS", dump.works.len());
        say("DUMP_PARTS", dump.parts.len());
        say("DUMP_ERAS", dump.eras.len());
        say("DUMP_CHARACTERS", dump.characters.len());
        say("DUMP_ARCS", dump.arcs.len());
        say("DUMP_APPEARANCES", dump.appearances.len());
        let counts_match = dump.works.len() as i64 == count(&conn, "works")
            && dump.parts.len() as i64 == count(&conn, "parts")
            && dump.eras.len() as i64 == count(&conn, "eras")
            && dump.characters.len() as i64 == count(&conn, "characters")
            && dump.arcs.len() as i64 == count(&conn, "arcs")
            && dump.appearances.len() as i64 == count(&conn, "appearances");
        say("DUMP_COUNTS_MATCH_TABLES", counts_match);
        say(
            "DUMP_PART_ORDER",
            dump.parts.iter().map(|p| p.title.as_str()).collect::<Vec<_>>().join(","),
        );
        let listed: Vec<String> = list_parts(&conn, &w.id).unwrap().iter().map(|p| p.id.clone()).collect();
        let dumped: Vec<String> = dump.parts.iter().map(|p| p.id.clone()).collect();
        say("DUMP_PARTS_IN_LIST_ORDER", dumped == listed);
        say("DUMP_WORK_RIGHTS", dump.works[0].rights.as_deref() == Some(drawn));
        say("DUMP_AUTHOR_BYLINE", dump.author.unwrap().byline);

        // Delete the work; find nothing left, anywhere.
        delete_work(&conn, &w.id).unwrap();
        say("LEFT_WORKS", count(&conn, "works"));
        say("LEFT_PARTS", count(&conn, "parts"));
        say("LEFT_ERAS", count(&conn, "eras"));
        say("LEFT_CHARACTERS", count(&conn, "characters"));
        say("LEFT_ARCS", count(&conn, "arcs"));
        say("LEFT_APPEARANCES", count(&conn, "appearances"));
        say("LEFT_AUTHOR", count(&conn, "author"));

        // A second studio, then the purge: every row gone, every table and the
        // file still standing, and the base still takes a row afterwards.
        let w2 = create_work(&conn, "essay", "Second Light", None, None).unwrap();
        let p2 = create_part(&conn, &w2.id, None, "One", "a b c").unwrap();
        let e2 = create_era(&conn, &w2.id, "Now", None).unwrap();
        let ch2 = create_character(&conn, &w2.id, "Ro", None, "").unwrap();
        let ar2 = create_arc(&conn, &w2.id, "The turn", "turning", None).unwrap();
        create_appearance(
            &conn,
            &w2.id,
            Some(&p2.id),
            Some(&e2.id),
            Some(&ch2.id),
            Some(&ar2.id),
            None,
        )
        .unwrap();
        set_work_rights(&conn, &w2.id, Some(drawn)).unwrap();
        let standing: i64 = [
            "works",
            "parts",
            "eras",
            "characters",
            "arcs",
            "appearances",
            "author",
        ]
        .iter()
        .map(|t| count(&conn, t))
        .sum();
        say("PURGE_ROWS_STANDING", standing);
        let purged = purge_all(&mut conn).unwrap();
        say("PURGED", purged);
        say("PURGE_COUNT_TRUE", purged as i64 == standing);
        say("AFTER_PURGE_WORKS", count(&conn, "works"));
        say("AFTER_PURGE_PARTS", count(&conn, "parts"));
        say("AFTER_PURGE_ERAS", count(&conn, "eras"));
        say("AFTER_PURGE_CHARACTERS", count(&conn, "characters"));
        say("AFTER_PURGE_ARCS", count(&conn, "arcs"));
        say("AFTER_PURGE_APPEARANCES", count(&conn, "appearances"));
        say("AFTER_PURGE_AUTHOR", count(&conn, "author"));
        say("AFTER_PURGE_TABLES", tables(&conn).join(","));
        say("AFTER_PURGE_VERSION", user_version(&conn));
        say("AFTER_PURGE_FILE", std::path::Path::new(&path).exists());
        let w3 = create_work(&conn, "book", "After the purge", None, None).unwrap();
        say("AFTER_PURGE_WRITES", count(&conn, "works") == 1 && w3.rights.is_none());
        say("DONE", 1);
    }
}
