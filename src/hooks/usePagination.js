import { useState, useMemo, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '../constants.js';

/**
 * Custom React hook for pagination state management.
 * Tracks currentPage, pageSize, and computes totalPages, pageNumbers,
 * hasNext, hasPrev, isFirst, isLast. Provides navigation functions and
 * returns the paginated slice of data.
 *
 * @param {Array<object>} data - The full array of items to paginate.
 * @param {number} [initialPageSize] - Optional initial page size (defaults to DEFAULT_PAGE_SIZE).
 * @returns {{
 *   currentPage: number,
 *   pageSize: number,
 *   totalPages: number,
 *   totalItems: number,
 *   pageNumbers: number[],
 *   hasNext: boolean,
 *   hasPrev: boolean,
 *   isFirst: boolean,
 *   isLast: boolean,
 *   paginatedData: Array<object>,
 *   goToPage: (page: number) => void,
 *   nextPage: () => void,
 *   prevPage: () => void,
 *   firstPage: () => void,
 *   lastPage: () => void,
 *   setPageSize: (size: number) => void,
 * }}
 */
export function usePagination(data, initialPageSize = DEFAULT_PAGE_SIZE) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  /**
   * Total number of items in the data array.
   * @type {number}
   */
  const totalItems = Array.isArray(data) ? data.length : 0;

  /**
   * Total number of pages based on data length and page size.
   * @type {number}
   */
  const totalPages = useMemo(() => {
    if (totalItems === 0) {
      return 1;
    }
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  /**
   * Clamp current page to valid bounds when data or pageSize changes.
   * This is computed as a derived value to ensure consistency.
   * @type {number}
   */
  const clampedPage = useMemo(() => {
    if (currentPage < 1) {
      return 1;
    }
    if (currentPage > totalPages) {
      return totalPages;
    }
    return currentPage;
  }, [currentPage, totalPages]);

  // Sync clamped page back to state if it differs
  if (clampedPage !== currentPage) {
    setCurrentPage(clampedPage);
  }

  /**
   * Array of all page numbers from 1 to totalPages.
   * @type {number[]}
   */
  const pageNumbers = useMemo(() => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [totalPages]);

  /**
   * Whether there is a next page available.
   * @type {boolean}
   */
  const hasNext = clampedPage < totalPages;

  /**
   * Whether there is a previous page available.
   * @type {boolean}
   */
  const hasPrev = clampedPage > 1;

  /**
   * Whether the current page is the first page.
   * @type {boolean}
   */
  const isFirst = clampedPage === 1;

  /**
   * Whether the current page is the last page.
   * @type {boolean}
   */
  const isLast = clampedPage === totalPages;

  /**
   * The paginated slice of data for the current page.
   * @type {Array<object>}
   */
  const paginatedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    const startIndex = (clampedPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, clampedPage, pageSize]);

  /**
   * Navigates to a specific page number with bounds checking.
   * @param {number} page - The page number to navigate to.
   */
  const goToPage = useCallback((page) => {
    setCurrentPage((prev) => {
      const target = Math.max(1, Math.min(page, totalPages));
      return target;
    });
  }, [totalPages]);

  /**
   * Navigates to the next page if available.
   */
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev < totalPages) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalPages]);

  /**
   * Navigates to the previous page if available.
   */
  const prevPage = useCallback(() => {
    setCurrentPage((prev) => {
      if (prev > 1) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  /**
   * Navigates to the first page.
   */
  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  /**
   * Navigates to the last page.
   */
  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  /**
   * Updates the page size and resets to page 1.
   * @param {number} size - The new page size.
   */
  const setPageSize = useCallback((size) => {
    const newSize = Math.max(1, size);
    setPageSizeState(newSize);
    setCurrentPage(1);
  }, []);

  return {
    currentPage: clampedPage,
    pageSize,
    totalPages,
    totalItems,
    pageNumbers,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    paginatedData,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
  };
}

export default usePagination;