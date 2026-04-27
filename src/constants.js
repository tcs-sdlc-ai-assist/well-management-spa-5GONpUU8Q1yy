/**
 * Application-wide constants and configuration values.
 */

/** @type {string} localStorage key for persisting wells data */
export const STORAGE_KEY = 'wells';

/** @type {number[]} Available page size options for pagination */
export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** @type {number} Default number of items per page */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Well status enum values.
 * @enum {string}
 */
export const WELL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CREATED: 'created',
};

/**
 * List of all valid well status values.
 * @type {string[]}
 */
export const WELL_STATUS_VALUES = [
  WELL_STATUS.ACTIVE,
  WELL_STATUS.INACTIVE,
  WELL_STATUS.CREATED,
];

/**
 * Column keys that can be used for filtering wells.
 * @type {string[]}
 */
export const FILTERABLE_COLUMNS = [
  'name',
  'status',
  'type',
  'location',
  'owner',
];

/**
 * Color and style token mappings for status badges.
 * Each status maps to Tailwind CSS classes for background, text, and dot indicator.
 * @type {Record<string, { bg: string, text: string, dot: string }>}
 */
export const STATUS_BADGE_STYLES = {
  [WELL_STATUS.ACTIVE]: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  [WELL_STATUS.INACTIVE]: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  [WELL_STATUS.CREATED]: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
};