import PropTypes from 'prop-types';
import { PAGE_SIZE_OPTIONS } from '../constants.js';

/**
 * Pagination footer component with navigation controls and page size selector.
 * Renders first, prev, page number buttons, next, last controls, and a page size dropdown.
 * Buttons are disabled at bounds. Active page is highlighted with bg-blue-600.
 *
 * @param {{ currentPage: number, totalPages: number, totalItems: number, pageSize: number, pageNumbers: number[], hasNext: boolean, hasPrev: boolean, isFirst: boolean, isLast: boolean, onPageChange: (page: number) => void, onPageSizeChange: (size: number) => void }} props
 * @returns {JSX.Element}
 */
function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageNumbers,
  hasNext,
  hasPrev,
  isFirst,
  isLast,
  onPageChange,
  onPageSizeChange,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
  };

  const handleFirst = () => {
    if (!isFirst) {
      onPageChange(1);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLast = () => {
    if (!isLast) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const baseButtonClass =
    'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg';

  const enabledClass = 'text-white hover:bg-stone-700 bg-dark-surface border border-dark-border';
  const disabledClass = 'text-stone-600 bg-dark-surface border border-dark-border cursor-not-allowed opacity-50';
  const activeClass = 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700';

  /**
   * Computes visible page numbers to avoid rendering too many buttons.
   * Shows at most 5 page numbers centered around the current page.
   * @returns {number[]}
   */
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return pageNumbers;
    }

    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      start = 1;
      end = 5;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div
      className="flex flex-col items-center justify-between gap-4 border-t border-dark-border bg-dark-surface px-4 py-3 sm:flex-row"
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-3">
        <label htmlFor="page-size-select" className="text-sm text-stone-400">
          Rows per page:
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={handlePageSizeChange}
          aria-label="Select page size"
          className="rounded-md border border-dark-border bg-dark-bg px-2 py-1 text-sm text-white focus:border-dark-accent focus:outline-none focus:ring-1 focus:ring-dark-accent transition-colors"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-stone-400">
          {startItem}–{endItem} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleFirst}
          onKeyDown={(e) => handleKeyDown(e, handleFirst)}
          disabled={isFirst}
          aria-label="Go to first page"
          className={`${baseButtonClass} ${isFirst ? disabledClass : enabledClass}`}
        >
          «
        </button>

        <button
          type="button"
          onClick={handlePrev}
          onKeyDown={(e) => handleKeyDown(e, handlePrev)}
          disabled={!hasPrev}
          aria-label="Go to previous page"
          className={`${baseButtonClass} ${!hasPrev ? disabledClass : enabledClass}`}
        >
          ‹
        </button>

        {visiblePages[0] > 1 && (
          <span className="px-1 text-sm text-stone-500" aria-hidden="true">
            …
          </span>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => handlePageClick(page)}
            onKeyDown={(e) => handleKeyDown(e, () => handlePageClick(page))}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${baseButtonClass} ${page === currentPage ? activeClass : enabledClass}`}
          >
            {page}
          </button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <span className="px-1 text-sm text-stone-500" aria-hidden="true">
            …
          </span>
        )}

        <button
          type="button"
          onClick={handleNext}
          onKeyDown={(e) => handleKeyDown(e, handleNext)}
          disabled={!hasNext}
          aria-label="Go to next page"
          className={`${baseButtonClass} ${!hasNext ? disabledClass : enabledClass}`}
        >
          ›
        </button>

        <button
          type="button"
          onClick={handleLast}
          onKeyDown={(e) => handleKeyDown(e, handleLast)}
          disabled={isLast}
          aria-label="Go to last page"
          className={`${baseButtonClass} ${isLast ? disabledClass : enabledClass}`}
        >
          »
        </button>
      </div>
    </div>
  );
}

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  pageNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
  hasNext: PropTypes.bool.isRequired,
  hasPrev: PropTypes.bool.isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
};

export default PaginationControls;