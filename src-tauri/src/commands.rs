// THE DOORS — one Tauri command per verb of THE AUTHOR'S STUDIO's six nouns,
// and nothing else. Each takes the base's lock, calls the plain function in
// `base.rs`, and hands the row back; all the meaning lives there, so a proof
// can walk the same road with no app running.
//
// The window has no other way in. There is no `sql:*` permission in
// `capabilities/default.json` and no SQL in any `.svelte` file: a room that
// wants a row asks for it by name.

use crate::base::{self, Appearance, Arc, Base, Character, Era, Part, Res, Work};

type S<'a> = tauri::State<'a, Base>;

/// The one thing that can go wrong before a query does: another thread died
/// holding the base's lock. Named once, so every door says it the same way.
fn poisoned<E>(_: E) -> String {
    "the base's lock is poisoned".to_string()
}

// ── work ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_works(base: S<'_>) -> Res<Vec<Work>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_works(&conn)
}

#[tauri::command]
pub fn get_work(base: S<'_>, id: String) -> Res<Option<Work>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::get_work(&conn, &id)
}

#[tauri::command]
pub fn create_work(
    base: S<'_>,
    kind: String,
    title: String,
    byline: Option<String>,
    note: Option<String>,
) -> Res<Work> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_work(
        &conn,
        &kind,
        &title,
        byline.as_deref(),
        note.as_deref(),
    )
}

#[tauri::command]
pub fn update_work(
    base: S<'_>,
    id: String,
    kind: String,
    title: String,
    byline: Option<String>,
    note: Option<String>,
) -> Res<Work> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::update_work(
        &conn,
        &id,
        &kind,
        &title,
        byline.as_deref(),
        note.as_deref(),
    )
}

#[tauri::command]
pub fn delete_work(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_work(&conn, &id)
}

// ── part ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_parts(base: S<'_>, work_id: String) -> Res<Vec<Part>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_parts(&conn, &work_id)
}

#[tauri::command]
pub fn create_part(
    base: S<'_>,
    work_id: String,
    parent_id: Option<String>,
    title: String,
    body: String,
) -> Res<Part> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_part(&conn, &work_id, parent_id.as_deref(), &title, &body)
}

#[tauri::command]
pub fn update_part(base: S<'_>, id: String, title: String, body: String) -> Res<Part> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::update_part(&conn, &id, &title, &body)
}

#[tauri::command]
pub fn delete_part(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_part(&conn, &id)
}

#[tauri::command]
pub fn reorder_parts(base: S<'_>, work_id: String, ids: Vec<String>) -> Res<()> {
    let mut conn = base.0.lock().map_err(poisoned)?;
    base::reorder_parts(&mut conn, &work_id, &ids)
}

// ── era ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_eras(base: S<'_>, work_id: String) -> Res<Vec<Era>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_eras(&conn, &work_id)
}

#[tauri::command]
pub fn create_era(base: S<'_>, work_id: String, name: String, note: Option<String>) -> Res<Era> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_era(&conn, &work_id, &name, note.as_deref())
}

#[tauri::command]
pub fn update_era(base: S<'_>, id: String, name: String, note: Option<String>) -> Res<Era> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::update_era(&conn, &id, &name, note.as_deref())
}

#[tauri::command]
pub fn delete_era(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_era(&conn, &id)
}

#[tauri::command]
pub fn reorder_eras(base: S<'_>, work_id: String, ids: Vec<String>) -> Res<()> {
    let mut conn = base.0.lock().map_err(poisoned)?;
    base::reorder_eras(&mut conn, &work_id, &ids)
}

// ── character ────────────────────────────────────────────────────────────
//
// No `reorder_characters` and no `reorder_arcs`: the plan's columns give `ord`
// to `part` and `era` alone, and a reorder door with no ordinal to write would
// be a lie in the shape of a command. The cast and the arcs list by name.

#[tauri::command]
pub fn list_characters(base: S<'_>, work_id: String) -> Res<Vec<Character>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_characters(&conn, &work_id)
}

#[tauri::command]
pub fn create_character(
    base: S<'_>,
    work_id: String,
    name: String,
    note: Option<String>,
    emoji: Option<String>,
) -> Res<Character> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_character(
        &conn,
        &work_id,
        &name,
        note.as_deref(),
        emoji.as_deref().unwrap_or(""),
    )
}

#[tauri::command]
pub fn update_character(
    base: S<'_>,
    id: String,
    name: String,
    note: Option<String>,
    emoji: Option<String>,
) -> Res<Character> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::update_character(
        &conn,
        &id,
        &name,
        note.as_deref(),
        emoji.as_deref().unwrap_or(""),
    )
}

#[tauri::command]
pub fn delete_character(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_character(&conn, &id)
}

// ── arc ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn list_arcs(base: S<'_>, work_id: String) -> Res<Vec<Arc>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_arcs(&conn, &work_id)
}

#[tauri::command]
pub fn create_arc(
    base: S<'_>,
    work_id: String,
    name: String,
    shape: String,
    note: Option<String>,
) -> Res<Arc> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_arc(&conn, &work_id, &name, &shape, note.as_deref())
}

#[tauri::command]
pub fn update_arc(
    base: S<'_>,
    id: String,
    name: String,
    shape: String,
    note: Option<String>,
) -> Res<Arc> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::update_arc(&conn, &id, &name, &shape, note.as_deref())
}

#[tauri::command]
pub fn delete_arc(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_arc(&conn, &id)
}

// ── appearance ───────────────────────────────────────────────────────────
//
// There is no `update_appearance`. An appearance says one thing — this hangs
// on that — and a change of mind is a new row and a deleted one, which is
// cheaper to reason about and impossible to half-write.

#[tauri::command]
pub fn list_appearances(base: S<'_>, work_id: String) -> Res<Vec<Appearance>> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::list_appearances(&conn, &work_id)
}

#[tauri::command]
pub fn create_appearance(
    base: S<'_>,
    work_id: String,
    part_id: Option<String>,
    era_id: Option<String>,
    character_id: Option<String>,
    arc_id: Option<String>,
    note: Option<String>,
) -> Res<Appearance> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::create_appearance(
        &conn,
        &work_id,
        part_id.as_deref(),
        era_id.as_deref(),
        character_id.as_deref(),
        arc_id.as_deref(),
        note.as_deref(),
    )
}

#[tauri::command]
pub fn delete_appearance(base: S<'_>, id: String) -> Res<()> {
    let conn = base.0.lock().map_err(poisoned)?;
    base::delete_appearance(&conn, &id)
}
