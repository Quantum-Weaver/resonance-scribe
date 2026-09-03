// src/lib/utils/components/runes/table.utils.ts
// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                    TABLE UTILITIES                                        ║
// ║                    Sort, filter, select, and data transformation          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─── Types ─────────────────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  /** The key currently being sorted by */
  key: string | null;
  /** Current sort direction */
  direction: SortDirection;
}

export interface ColumnConfig<T = Record<string, unknown>> {
  /** Data key in the row object */
  key: keyof T & string;
  /** Display header label */
  label: string;
  /** Is this column sortable? */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  /** Custom sort comparator */
  sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;
}

export interface FilterState {
  /** Key being filtered */
  key: string;
  /** Filter value */
  value: string;
  /** Match mode */
  mode?: 'contains' | 'exact' | 'startsWith';
}

// ─── Sort Logic ────────────────────────────────────────────────────────────

/**
 * Cycle to the next sort direction.
 * null → asc → desc → null
 */
export function toggleSortDirection(
  current: SortDirection
): SortDirection {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

/**
 * Update sort state when a column header is clicked.
 * If clicking the same column, cycles direction.
 * If clicking a different column, starts ascending.
 */
export function updateSortState(
  current: SortState,
  clickedKey: string
): SortState {
  if (current.key === clickedKey) {
    const nextDirection = toggleSortDirection(current.direction);
    return {
      key: nextDirection === null ? null : clickedKey,
      direction: nextDirection,
    };
  }

  return { key: clickedKey, direction: 'asc' };
}

/**
 * Sort an array of data by a given key and direction.
 * Handles strings, numbers, and dates.
 */
export function sortData<T extends Record<string, unknown>>(
  data: T[],
  key: keyof T & string,
  direction: 'asc' | 'desc',
  customSortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number
): T[] {
  if (!key || !direction) return data;

  const sorted = [...data].sort((a, b) => {
    if (customSortFn) {
      return customSortFn(a, b, direction);
    }

    const aVal = a[key];
    const bVal = b[key];

    // Null/undefined always sort last
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Date comparison
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    // Number comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // String comparison (locale-aware)
    const aStr = String(aVal);
    const bStr = String(bVal);
    return direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  return sorted;
}

/**
 * Get the sort indicator state for a column header.
 */
export function getSortIndicatorState(
  columnKey: string,
  currentSort: SortState
): SortDirection {
  if (currentSort.key !== columnKey) return null;
  return currentSort.direction;
}

/**
 * Check if a column is the currently active sort column.
 */
export function isActiveSortColumn(
  columnKey: string,
  currentSort: SortState
): boolean {
  return currentSort.key === columnKey && currentSort.direction !== null;
}

// ─── Filter Logic ──────────────────────────────────────────────────────────

/**
 * Filter data by a single filter state.
 */
export function filterData<T extends Record<string, unknown>>(
  data: T[],
  filter: FilterState
): T[] {
  if (!filter.value.trim()) return data;

  const lowerValue = filter.value.toLowerCase();

  return data.filter((row) => {
    const cellValue = row[filter.key];
    if (cellValue == null) return false;

    const cellStr = String(cellValue).toLowerCase();

    switch (filter.mode ?? 'contains') {
      case 'exact':
        return cellStr === lowerValue;
      case 'startsWith':
        return cellStr.startsWith(lowerValue);
      case 'contains':
      default:
        return cellStr.includes(lowerValue);
    }
  });
}

/**
 * Apply multiple filters to data (AND logic — all filters must match).
 */
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterState[]
): T[] {
  if (filters.length === 0) return data;

  return filters.reduce((filtered, filter) => {
    return filterData(filtered, filter);
  }, data);
}

// ─── Row Utilities ─────────────────────────────────────────────────────────

/**
 * Determine if a row index belongs to a striped pattern.
 * Used by the `striped` variant.
 */
export function isStripedRow(index: number): boolean {
  return index % 2 === 1;
}

/**
 * Get Tailwind alignment class for a column.
 */
export function getColumnAlignment(
  align?: 'left' | 'center' | 'right'
): string {
  switch (align) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'left':
    default:
      return 'text-left';
  }
}

// ─── Selection Logic ───────────────────────────────────────────────────────

export interface SelectionState {
  /** Set of selected row identifiers */
  selectedIds: Set<string>;
  /** Whether all rows on the current page are selected */
  isAllSelected: boolean;
}

/**
 * Toggle a single row's selection state.
 * Requires an `idKey` to identify rows uniquely.
 */
export function toggleRowSelection(
  current: SelectionState,
  rowId: string
): SelectionState {
  const next = new Set(current.selectedIds);

  if (next.has(rowId)) {
    next.delete(rowId);
  } else {
    next.add(rowId);
  }

  return {
    selectedIds: next,
    isAllSelected: false, // Can't know without total count
  };
}

/**
 * Toggle select-all for a page of rows.
 */
export function toggleSelectAll(
  current: SelectionState,
  rowIds: string[]
): SelectionState {
  const allSelected = rowIds.every((id) => current.selectedIds.has(id));

  if (allSelected) {
    // Deselect all on this page
    const next = new Set(current.selectedIds);
    rowIds.forEach((id) => next.delete(id));
    return { selectedIds: next, isAllSelected: false };
  }

  // Select all on this page
  const next = new Set([...current.selectedIds, ...rowIds]);
  return { selectedIds: next, isAllSelected: true };
}

/**
 * Check if a single row is selected.
 */
export function isRowSelected(
  selectedIds: Set<string>,
  rowId: string
): boolean {
  return selectedIds.has(rowId);
}

// ─── Column Helpers ────────────────────────────────────────────────────────

/**
 * Extract a display value from a row using a column config.
 * Falls back to raw value if no render function.
 */
export function getCellDisplayValue<T extends Record<string, unknown>>(
  row: T,
  column: ColumnConfig<T>,
  index: number
): React.ReactNode {
  const value = row[column.key];

  if (column.render) {
    return column.render(value, row, index);
  }

  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  return String(value);
}

/**
 * Build a unique row ID from a data row using an idKey.
 */
export function getRowId<T extends Record<string, unknown>>(
  row: T,
  idKey: keyof T & string = 'id' as keyof T & string,
  index: number
): string {
  const id = row[idKey];
  if (id != null) return String(id);
  return `row-${index}`;
}