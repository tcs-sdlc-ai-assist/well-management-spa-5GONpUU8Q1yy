import { useState, useMemo, useCallback } from 'react';
import { WELL_STATUS } from '../constants.js';

/**
 * Custom React hook for managing grid sort state.
 * Tracks sort column and direction (asc/desc). Provides toggleSort() function.
 * Returns sorted wells array with active wells pinned to top regardless of sort order.
 *
 * @param {Array<object>} wells - The array of well objects to sort.
 * @param {{ column: string, direction: string }} [initialSort] - Optional initial sort configuration.
 * @returns {{
 *   sortColumn: string,
 *   sortDirection: string,
 *   toggleSort: (column: string) => void,
 *   sortedWells: Array<object>,
 * }}
 */
export function useSorting(wells, initialSort = { column: 'spudDate', direction: 'asc' }) {
  const [sortColumn, setSortColumn] = useState(initialSort.column);
  const [sortDirection, setSortDirection] = useState(initialSort.direction);

  /**
   * Toggles sort for a given column.
   * If the column is already the active sort column, the direction is toggled.
   * If a new column is selected, it defaults to ascending.
   * @param {string} column - The column key to sort by.
   */
  const toggleSort = useCallback((column) => {
    setSortColumn((prevColumn) => {
      if (prevColumn === column) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevColumn;
      }
      setSortDirection('asc');
      return column;
    });
  }, []);

  /**
   * Comparator function for sorting well objects by the current sort column and direction.
   * Handles string and date comparisons.
   * @param {object} a - First well object.
   * @param {object} b - Second well object.
   * @returns {number} Comparison result.
   */
  const compare = useCallback((a, b) => {
    const valA = a[sortColumn];
    const valB = b[sortColumn];

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    let comparison = 0;

    if (sortColumn === 'spudDate' || sortColumn === 'createdAt') {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      comparison = dateA - dateB;
    } else {
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) comparison = -1;
      else if (strA > strB) comparison = 1;
      else comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  }, [sortColumn, sortDirection]);

  /**
   * The sorted wells array, computed by applying the current sort configuration.
   * Active wells are pinned to the top of the list regardless of sort order.
   * @type {Array<object>}
   */
  const sortedWells = useMemo(() => {
    if (!Array.isArray(wells)) {
      return [];
    }

    const activeWells = wells.filter((w) => w.status === WELL_STATUS.ACTIVE);
    const nonActiveWells = wells.filter((w) => w.status !== WELL_STATUS.ACTIVE);

    const sortedActive = [...activeWells].sort(compare);
    const sortedNonActive = [...nonActiveWells].sort(compare);

    return [...sortedActive, ...sortedNonActive];
  }, [wells, compare]);

  return {
    sortColumn,
    sortDirection,
    toggleSort,
    sortedWells,
  };
}

export default useSorting;