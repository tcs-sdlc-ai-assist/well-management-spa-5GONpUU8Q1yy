import { useState, useEffect, useCallback } from 'react';
import {
  getAllWells,
  createWell as storageCreateWell,
  updateWell as storageUpdateWell,
  activateWell as storageActivateWell,
  deleteWell as storageDeleteWell,
  seedMockDataIfEmpty,
} from '../services/wellStorageService.js';

/**
 * Custom React hook for well data state management.
 * Wraps wellStorageService to provide reactive state with CRUD action dispatchers.
 *
 * @returns {{
 *   wells: Array<object>,
 *   loading: boolean,
 *   error: string|null,
 *   createWell: (wellData: object) => { success: boolean, well?: object, error?: string },
 *   updateWell: (id: string, updates: object) => { success: boolean, well?: object, error?: string },
 *   activateWell: (id: string) => { success: boolean, updated?: object, demoted?: object, error?: string },
 *   deleteWell: (id: string) => { success: boolean, error?: string },
 *   refreshWells: () => void,
 * }}
 */
export function useWells() {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Loads all wells from localStorage into state.
   */
  const refreshWells = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      seedMockDataIfEmpty();
      const data = getAllWells();
      setWells(data);
    } catch (e) {
      setError(e.message || 'Failed to load wells.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWells();
  }, [refreshWells]);

  /**
   * Creates a new well and refreshes state.
   * @param {object} wellData - The well data to create.
   * @returns {{ success: boolean, well?: object, error?: string }}
   */
  const createWell = useCallback((wellData) => {
    try {
      const well = storageCreateWell(wellData);
      setWells(getAllWells());
      return { success: true, well };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to create well.' };
    }
  }, []);

  /**
   * Updates an existing well by ID and refreshes state.
   * @param {string} id - The UUID of the well to update.
   * @param {object} updates - The fields to update.
   * @returns {{ success: boolean, well?: object, error?: string }}
   */
  const updateWell = useCallback((id, updates) => {
    try {
      const well = storageUpdateWell(id, updates);
      setWells(getAllWells());
      return { success: true, well };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to update well.' };
    }
  }, []);

  /**
   * Activates a well by ID, enforcing single-active-per-rig constraint, and refreshes state.
   * @param {string} id - The UUID of the well to activate.
   * @returns {{ success: boolean, updated?: object, demoted?: object, error?: string }}
   */
  const activateWell = useCallback((id) => {
    try {
      const result = storageActivateWell(id);
      setWells(getAllWells());
      return { success: true, updated: result.updated, demoted: result.demoted };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to activate well.' };
    }
  }, []);

  /**
   * Deletes a well by ID and refreshes state.
   * @param {string} id - The UUID of the well to delete.
   * @returns {{ success: boolean, error?: string }}
   */
  const deleteWell = useCallback((id) => {
    try {
      storageDeleteWell(id);
      setWells(getAllWells());
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to delete well.' };
    }
  }, []);

  return {
    wells,
    loading,
    error,
    createWell,
    updateWell,
    activateWell,
    deleteWell,
    refreshWells,
  };
}

export default useWells;