// THE BASE, from the window's side — one function per Tauri command, and no
// SQL anywhere in this repo's TypeScript.
//
// The mother (resonance-sistrum) loads SQLite in the window through
// `@tauri-apps/plugin-sql` and writes her queries in Svelte. Scribe does not:
// the base belongs to Rust (`src-tauri/src/base.rs`), the doors are named
// commands (`src-tauri/src/commands.rs`), and this file is the whole of what
// a room may ask for. `capabilities/default.json` carries no `sql:*`
// permission at all, so there is no second road even by accident.
//
// Arguments go out camelCase and land in Rust snake_case — Tauri's own
// convention. Rows come back in the base's snake_case, unrenamed.

import { invoke } from '@tauri-apps/api/core';
import type { Appearance, Arc, ArcShape, Character, Era, Part, Work, WorkKind } from '$lib/types/types';

// ── work ─────────────────────────────────────────────────────────────────

export const listWorks = (): Promise<Work[]> => invoke('list_works');

export const getWork = (id: string): Promise<Work | null> => invoke('get_work', { id });

export const createWork = (
	kind: WorkKind,
	title: string,
	byline?: string | null,
	note?: string | null
): Promise<Work> => invoke('create_work', { kind, title, byline: byline ?? null, note: note ?? null });

export const updateWork = (
	id: string,
	kind: WorkKind,
	title: string,
	byline?: string | null,
	note?: string | null
): Promise<Work> =>
	invoke('update_work', { id, kind, title, byline: byline ?? null, note: note ?? null });

/** Deleting a work cascades: parts, scenes, eras, characters, arcs and every
 *  appearance hanging on any of them go with it. The base's own foreign keys
 *  do it, not this call. */
export const deleteWork = (id: string): Promise<void> => invoke('delete_work', { id });

// ── part ─────────────────────────────────────────────────────────────────

export const listParts = (workId: string): Promise<Part[]> => invoke('list_parts', { workId });

export const createPart = (
	workId: string,
	parentId: string | null,
	title: string,
	body = ''
): Promise<Part> => invoke('create_part', { workId, parentId, title, body });

export const updatePart = (id: string, title: string, body: string): Promise<Part> =>
	invoke('update_part', { id, title, body });

export const deletePart = (id: string): Promise<void> => invoke('delete_part', { id });

/** Order is data. This writes `ord` and nothing else — not the body, not
 *  `updated_at` — so a move on the board can never read as an edit of the
 *  author's text. */
export const reorderParts = (workId: string, ids: string[]): Promise<void> =>
	invoke('reorder_parts', { workId, ids });

// ── era ──────────────────────────────────────────────────────────────────

export const listEras = (workId: string): Promise<Era[]> => invoke('list_eras', { workId });

export const createEra = (workId: string, name: string, note?: string | null): Promise<Era> =>
	invoke('create_era', { workId, name, note: note ?? null });

export const updateEra = (id: string, name: string, note?: string | null): Promise<Era> =>
	invoke('update_era', { id, name, note: note ?? null });

export const deleteEra = (id: string): Promise<void> => invoke('delete_era', { id });

export const reorderEras = (workId: string, ids: string[]): Promise<void> =>
	invoke('reorder_eras', { workId, ids });

// ── character ────────────────────────────────────────────────────────────

export const listCharacters = (workId: string): Promise<Character[]> =>
	invoke('list_characters', { workId });

export const createCharacter = (
	workId: string,
	name: string,
	note?: string | null,
	emoji?: string | null
): Promise<Character> =>
	invoke('create_character', { workId, name, note: note ?? null, emoji: emoji ?? null });

export const updateCharacter = (
	id: string,
	name: string,
	note?: string | null,
	emoji?: string | null
): Promise<Character> =>
	invoke('update_character', { id, name, note: note ?? null, emoji: emoji ?? null });

export const deleteCharacter = (id: string): Promise<void> => invoke('delete_character', { id });

// ── arc ──────────────────────────────────────────────────────────────────

export const listArcs = (workId: string): Promise<Arc[]> => invoke('list_arcs', { workId });

export const createArc = (
	workId: string,
	name: string,
	shape: ArcShape,
	note?: string | null
): Promise<Arc> => invoke('create_arc', { workId, name, shape, note: note ?? null });

export const updateArc = (
	id: string,
	name: string,
	shape: ArcShape,
	note?: string | null
): Promise<Arc> => invoke('update_arc', { id, name, shape, note: note ?? null });

export const deleteArc = (id: string): Promise<void> => invoke('delete_arc', { id });

// ── appearance — the hang-on-either row ──────────────────────────────────

export const listAppearances = (workId: string): Promise<Appearance[]> =>
	invoke('list_appearances', { workId });

/** At least one of partId · eraId · characterId · arcId must be set. The base
 *  refuses the empty row with a sentence, and its CHECK refuses it again. */
export const createAppearance = (
	workId: string,
	hangs: {
		partId?: string | null;
		eraId?: string | null;
		characterId?: string | null;
		arcId?: string | null;
		note?: string | null;
	}
): Promise<Appearance> =>
	invoke('create_appearance', {
		workId,
		partId: hangs.partId ?? null,
		eraId: hangs.eraId ?? null,
		characterId: hangs.characterId ?? null,
		arcId: hangs.arcId ?? null,
		note: hangs.note ?? null
	});

export const deleteAppearance = (id: string): Promise<void> =>
	invoke('delete_appearance', { id });

// ── a small kindness for the rooms ───────────────────────────────────────

/** Chapters, in order — the parts with no parent. */
export const chaptersOf = (parts: Part[]): Part[] => parts.filter((p) => p.parent_id === null);

/** The scenes under one chapter, in order. */
export const scenesOf = (parts: Part[], chapterId: string): Part[] =>
	parts.filter((p) => p.parent_id === chapterId);
