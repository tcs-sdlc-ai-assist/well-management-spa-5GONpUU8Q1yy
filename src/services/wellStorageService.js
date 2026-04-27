import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEY, WELL_STATUS, WELL_STATUS_VALUES } from '../constants.js';
import mockWells from '../data/mockData.js';

/**
 * Custom error class for well storage operations.
 */
class WellStorageError extends Error {
  /**
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = 'WellStorageError';
    this.cause = cause;
  }
}

/**
 * Reads the raw wells array from localStorage.
 * If data is corrupted or missing, returns null.
 * @returns {Array|null}
 */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Writes the wells array to localStorage atomically.
 * @param {Array} wells
 * @throws {WellStorageError} if write fails
 */
function writeToStorage(wells) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wells));
  } catch (e) {
    throw new WellStorageError(
      'Failed to write to localStorage. Storage quota may be exceeded. Please clear browser storage and try again.',
      e
    );
  }
}

/**
 * Trims a string value if it is a string, otherwise returns it as-is.
 * @param {*} value
 * @returns {*}
 */
function trimIfString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Validates well input data for create/update operations.
 * @param {object} wellData - The well data to validate.
 * @param {boolean} [isCreate=false] - Whether this is a create operation.
 * @param {string} [existingId] - The ID of the well being updated (for uniqueness checks).
 * @throws {WellStorageError} if validation fails.
 */
function validateWellData(wellData, isCreate = false, existingId = null) {
  const requiredFields = ['name', 'type', 'location', 'owner', 'operator', 'contractor', 'rig', 'spudDate'];

  if (isCreate) {
    for (const field of requiredFields) {
      if (!wellData[field] || (typeof wellData[field] === 'string' && wellData[field].trim() === '')) {
        throw new WellStorageError(`Validation failed: "${field}" is required.`);
      }
    }
  }

  const stringFields = ['name', 'type', 'location', 'owner', 'operator', 'contractor', 'rig'];
  for (const field of stringFields) {
    if (wellData[field] !== undefined) {
      if (typeof wellData[field] !== 'string') {
        throw new WellStorageError(`Validation failed: "${field}" must be a string.`);
      }
      if (wellData[field].trim().length > 100) {
        throw new WellStorageError(`Validation failed: "${field}" must be 100 characters or fewer.`);
      }
    }
  }

  if (wellData.spudDate !== undefined) {
    const date = new Date(wellData.spudDate);
    if (isNaN(date.getTime())) {
      throw new WellStorageError('Validation failed: "spudDate" must be a valid date.');
    }
  }

  if (wellData.status !== undefined) {
    if (!WELL_STATUS_VALUES.includes(wellData.status)) {
      throw new WellStorageError(
        `Validation failed: "status" must be one of: ${WELL_STATUS_VALUES.join(', ')}.`
      );
    }
  }

  if (wellData.name !== undefined) {
    const wells = readFromStorage() || [];
    const trimmedName = wellData.name.trim();
    const duplicate = wells.find(
      (w) => w.name === trimmedName && w.id !== existingId
    );
    if (duplicate) {
      throw new WellStorageError(`Validation failed: A well with name "${trimmedName}" already exists.`);
    }
  }
}

/**
 * Retrieves all wells from localStorage.
 * If data is corrupted, resets to mock data and returns that.
 * @returns {Array<object>} Array of well objects.
 */
export function getAllWells() {
  let wells = readFromStorage();
  if (wells === null) {
    seedMockDataIfEmpty();
    wells = readFromStorage();
    if (wells === null) {
      return [];
    }
  }
  return wells;
}

/**
 * Retrieves a single well by its ID.
 * @param {string} id - The UUID of the well.
 * @returns {object|null} The well object, or null if not found.
 */
export function getWellById(id) {
  const wells = getAllWells();
  return wells.find((w) => w.id === id) || null;
}

/**
 * Creates a new well and persists it to localStorage.
 * @param {object} wellData - The well data (name, type, location, owner, operator, contractor, rig, spudDate, status).
 * @returns {object} The newly created well object with generated id and createdAt.
 * @throws {WellStorageError} if validation or storage fails.
 */
export function createWell(wellData) {
  validateWellData(wellData, true);

  const wells = getAllWells();

  const newWell = {
    id: uuidv4(),
    name: trimIfString(wellData.name),
    status: wellData.status || WELL_STATUS.CREATED,
    type: trimIfString(wellData.type),
    location: trimIfString(wellData.location),
    owner: trimIfString(wellData.owner),
    operator: trimIfString(wellData.operator),
    contractor: trimIfString(wellData.contractor),
    rig: trimIfString(wellData.rig),
    spudDate: trimIfString(wellData.spudDate),
    createdAt: new Date().toISOString(),
  };

  wells.push(newWell);
  writeToStorage(wells);
  return newWell;
}

/**
 * Updates an existing well by ID with the provided updates.
 * @param {string} id - The UUID of the well to update.
 * @param {object} updates - An object containing the fields to update.
 * @returns {object} The updated well object.
 * @throws {WellStorageError} if the well is not found, validation fails, or storage fails.
 */
export function updateWell(id, updates) {
  validateWellData(updates, false, id);

  const wells = getAllWells();
  const index = wells.findIndex((w) => w.id === id);

  if (index === -1) {
    throw new WellStorageError(`Well with id "${id}" not found.`);
  }

  const updatedWell = { ...wells[index] };

  const allowedFields = ['name', 'status', 'type', 'location', 'owner', 'operator', 'contractor', 'rig', 'spudDate'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updatedWell[field] = trimIfString(updates[field]);
    }
  }

  wells[index] = updatedWell;
  writeToStorage(wells);
  return updatedWell;
}

/**
 * Activates a well by ID, enforcing the single-active-per-rig constraint.
 * If another well on the same rig is currently active, it is demoted to inactive.
 * @param {string} id - The UUID of the well to activate.
 * @returns {{ updated: object, demoted?: object }} The activated well and optionally the demoted well.
 * @throws {WellStorageError} if the well is not found or storage fails.
 */
export function activateWell(id) {
  const wells = getAllWells();
  const targetIndex = wells.findIndex((w) => w.id === id);

  if (targetIndex === -1) {
    throw new WellStorageError(`Well with id "${id}" not found.`);
  }

  const target = wells[targetIndex];

  if (target.status === WELL_STATUS.ACTIVE) {
    return { updated: target };
  }

  let demoted = undefined;

  for (let i = 0; i < wells.length; i++) {
    if (wells[i].rig === target.rig && wells[i].status === WELL_STATUS.ACTIVE) {
      wells[i] = { ...wells[i], status: WELL_STATUS.INACTIVE };
      demoted = wells[i];
      break;
    }
  }

  wells[targetIndex] = { ...wells[targetIndex], status: WELL_STATUS.ACTIVE };
  const updated = wells[targetIndex];

  writeToStorage(wells);

  const result = { updated };
  if (demoted) {
    result.demoted = demoted;
  }
  return result;
}

/**
 * Deletes a well by ID from localStorage.
 * @param {string} id - The UUID of the well to delete.
 * @throws {WellStorageError} if the well is not found or storage fails.
 */
export function deleteWell(id) {
  const wells = getAllWells();
  const index = wells.findIndex((w) => w.id === id);

  if (index === -1) {
    throw new WellStorageError(`Well with id "${id}" not found.`);
  }

  wells.splice(index, 1);
  writeToStorage(wells);
}

/**
 * Seeds localStorage with mock well data if the storage is empty or missing.
 * Also resets data if the stored value is corrupted (not a valid JSON array).
 */
export function seedMockDataIfEmpty() {
  const existing = readFromStorage();
  if (existing === null || existing.length === 0) {
    writeToStorage(mockWells);
  }
}

/**
 * Resets localStorage well data to the original mock data.
 * Useful for recovering from corrupted state.
 */
export function resetToMockData() {
  writeToStorage(mockWells);
}

export { WellStorageError };