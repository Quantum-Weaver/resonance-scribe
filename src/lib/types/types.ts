// Theme customization — carried whole from the mother (resonance-sistrum),
// because the family's tokens and the reader's own axes are the same here.
export type TintLevel = 'off' | 'subtle' | 'full';

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'amoled';
  accentColor: string;
  presetName?: string;
  fontSize: 'small' | 'medium' | 'large';
  /** How far the accent bleeds into the background. A config saved before
   *  this field existed is merged over the default and reads as 'subtle'. */
  tint: TintLevel;
}

// ── THE SIX NOUNS ────────────────────────────────────────────────────────
//
// The shapes the Rust base hands back, field for field. The base is the
// truth (`src-tauri/src/base.rs`); these are only what the window is told,
// in the base's own snake_case so nothing is renamed on the way through.

/** book · manuscript · article · essay · other — as text, by the plan. A kind
 *  the author invents is still a kind; nothing here polices the list. */
export type WorkKind = 'book' | 'manuscript' | 'article' | 'essay' | 'other' | (string & {});

/** rising · turning · resolving · other — as text, by the plan. */
export type ArcShape = 'rising' | 'turning' | 'resolving' | 'other' | (string & {});

export const WORK_KINDS: readonly WorkKind[] = [
  'book',
  'manuscript',
  'article',
  'essay',
  'other'
];

export const ARC_SHAPES: readonly ArcShape[] = ['rising', 'turning', 'resolving', 'other'];

/** Work — the thing being written. */
export interface Work {
  id: string;
  kind: WorkKind;
  title: string;
  byline: string | null;
  note: string | null;
  created_at: number;
  updated_at: number;
}

/** Part — a chapter (`parent_id` null) or a scene under one (`parent_id` set).
 *  Order is DATA: `ord` is a column, moved only by `reorder_parts`. */
export interface Part {
  id: string;
  work_id: string;
  parent_id: string | null;
  ord: number;
  title: string;
  body: string;
  /** Counted by the base from the body, never sent by the window. */
  words: number;
  created_at: number;
  updated_at: number;
}

/** Era — a span in the story's time. */
export interface Era {
  id: string;
  work_id: string;
  ord: number;
  name: string;
  note: string | null;
}

export interface Character {
  id: string;
  work_id: string;
  name: string;
  note: string | null;
  emoji: string;
}

export interface Arc {
  id: string;
  work_id: string;
  name: string;
  shape: ArcShape;
  note: string | null;
}

/** Appearance — the hang-on-either row. A character in a scene, a scene in an
 *  era, an arc through a part: each is ONE row, never a second list. At least
 *  one of the four ids must be set; the base's own CHECK is what says so. */
export interface Appearance {
  id: string;
  work_id: string;
  part_id: string | null;
  era_id: string | null;
  character_id: string | null;
  arc_id: string | null;
  note: string | null;
}
