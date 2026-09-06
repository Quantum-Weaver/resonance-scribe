// RESONANCE SCRIBE — the author's studio.
//
// Cut from Resonance Sistrum v0.2.0 (the attested lineage); Sistrum itself is
// never altered. What crossed: the Tauri plumbing, the `.cargo/` 16 KB page
// alignment, the family's tokens and the spring's mirrors, and above all the
// HANG-ON-EITHER SHAPE — sistrum's `feelings` row hangs on a work or a take,
// which is exactly what an era, a character and an arc want. What did not
// cross: her rooms, her recorder, her tuner, her studio, her takes shelf, her
// migration and her sound. Scribe records nothing and plays nothing.
//
// The brief is `resonance-chamber/desk/THE-AUTHORS-STUDIO.md`, movement S1.
// The record of where this realm stands is the base:
//   python ../resonance-progenatrix/progenatrix.py recall --realm resonance-scribe

mod base;
mod commands;

use tauri::Manager;

/// The base's file, in this app's own data directory — the same shelf the
/// mother's `sqlite:sistrum.db` lands on, reached from Rust instead of from a
/// plugin. It is per-user and per-app, it never leaves the device, and
/// `.gitignore` refuses `*.db` and `*.sqlite` besides.
fn base_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("no app data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("could not make {dir:?}: {e}"))?;
    Ok(dir.join("scribe.db"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Opening the base runs the migration (base.rs, gated on SQLite's
            // own `user_version`) and turns foreign keys ON, which is what
            // makes deleting a work take its parts, eras, characters, arcs and
            // appearances with it.
            let path = base_path(app.handle())?;
            let conn = base::open(&path)?;
            app.manage(base::Base(std::sync::Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // ── work ─────────────────────────────────────────────────────
            commands::list_works,
            commands::get_work,
            commands::create_work,
            commands::update_work,
            commands::delete_work,
            // ── part — a chapter, or a scene under a chapter ─────────────
            commands::list_parts,
            commands::create_part,
            commands::update_part,
            commands::delete_part,
            commands::reorder_parts,
            // ── era ──────────────────────────────────────────────────────
            commands::list_eras,
            commands::create_era,
            commands::update_era,
            commands::delete_era,
            commands::reorder_eras,
            // ── character ────────────────────────────────────────────────
            commands::list_characters,
            commands::create_character,
            commands::update_character,
            commands::delete_character,
            // ── arc ──────────────────────────────────────────────────────
            commands::list_arcs,
            commands::create_arc,
            commands::update_arc,
            commands::delete_arc,
            // ── appearance — the hang-on-either row ──────────────────────
            commands::list_appearances,
            commands::create_appearance,
            commands::delete_appearance,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Resonance Scribe");
}
