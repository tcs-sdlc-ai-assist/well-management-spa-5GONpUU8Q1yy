import { useState, useMemo, useCallback } from 'react';
import { FILTERABLE_COLUMNS } from '../constants.js';

/**
 * Mapping from filter column keys to well object property names.
 * Supports both the filterable columns from constants and additional
 * column aliases used by the grid (rig, wellName, wellId, operator, contractor).
 * @type {Record<string, string>}
 */
const COLUMN_TO_PROPERTY = {
  name: 'name',
  status: 'status',
  type: 'type',
  location: 'location',
  owner: 'owner',
  rig: 'rig',
  wellName: 'name',
  wellId: 'id',
  operator: 'operator',
  contractor: 'contractor',
};

/**
 * Creates the initial empty filter state object.
 * Includes all filterable columns from constants plus additional grid columns.
 * @returns {Record<string, string>}
 */
function createInitialFilters() {
  const filters = {};
  const allKeys = [...new Set([...FILTERABLE_COLUMNS, 'rig', 'wellName', 'wellId', 'operator', 'contractor'])];
  for (const key of allKeys) {
    filters[key] = '';
  }
  return filters;
}

/**
 * Custom React hook for managing grid filter state.
 * Maintains filter values for each filterable column and applies
 * case-insensitive partial-string matching to the wells array.
 *
 * @param {Array<object>} wells - The full array of well objects to filter.
 * @returns {{
 *   filters: Record<string, string>,
 *   filteredWells: Array<object>,
 *   setFilter: (column: string, value: string) => void,
 *   clearFilters: () => void,
 * }}
 */
export function useFilters(wells) {
  const [filters, setFilters] = useState(createInitialFilters);

  /**
   * Sets the filter value for a specific column.
   * @param {string} column - The column key to filter on.
   * @param {string} value - The filter string value.
   */
  const setFilter = useCallback((column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  }, []);

  /**
   * Clears all filter values back to empty strings.
   */
  const clearFilters = useCallback(() => {
    setFilters(createInitialFilters());
  }, []);

  /**
   * The filtered wells array, computed by applying all active filters
   * with case-insensitive partial-string matching.
   * @type {Array<object>}
   */
  const filteredWells = useMemo(() => {
    if (!Array.isArray(wells)) {
      return [];
    }

    const activeFilters = Object.entries(filters).filter(
      ([, value]) => value !== ''
    );

    if (activeFilters.length === 0) {
      return wells;
    }

    return wells.filter((well) => {
      return activeFilters.every(([column, filterValue]) => {
        const property = COLUMN_TO_PROPERTY[column] || column;
        const wellValue = well[property];

        if (wellValue === undefined || wellValue === null) {
          return false;
        }

        const normalizedWellValue = String(wellValue).toLowerCase();
        const normalizedFilterValue = filterValue.toLowerCase();

        return normalizedWellValue.includes(normalizedFilterValue);
      });
    });
  }, [wells, filters]);

  return {
    filters,
    filteredWells,
    setFilter,
    clearFilters,
  };
}

export default useFilters;