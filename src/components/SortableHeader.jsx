import PropTypes from 'prop-types';

/**
 * Sortable table header component that toggles sort direction on click.
 * Displays ascending/descending arrow indicator and includes keyboard
 * accessibility (Enter/Space to toggle) and aria-sort attribute.
 *
 * @param {{ column: string, label: string, sortColumn: string, sortDirection: string, onToggleSort: (column: string) => void }} props
 * @param {string} props.column - The column key this header represents.
 * @param {string} props.label - The display label for the column header.
 * @param {string} props.sortColumn - The currently active sort column key.
 * @param {string} props.sortDirection - The current sort direction ('asc' or 'desc').
 * @param {(column: string) => void} props.onToggleSort - Callback invoked with the column key when sort is toggled.
 * @returns {JSX.Element}
 */
function SortableHeader({ column, label, sortColumn, sortDirection, onToggleSort }) {
  const isActive = sortColumn === column;

  const ariaSortValue = isActive
    ? sortDirection === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  const handleClick = () => {
    onToggleSort(column);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleSort(column);
    }
  };

  /**
   * Renders the sort direction arrow indicator.
   * Shows an up arrow for ascending, down arrow for descending.
   * When inactive, shows a subtle neutral indicator.
   * @returns {JSX.Element}
   */
  const renderSortIndicator = () => {
    if (!isActive) {
      return (
        <span className="ml-1 text-stone-600" aria-hidden="true">
          ↕
        </span>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <span className="ml-1 text-dark-accent" aria-hidden="true">
          ↑
        </span>
      );
    }

    return (
      <span className="ml-1 text-dark-accent" aria-hidden="true">
        ↓
      </span>
    );
  };

  return (
    <th
      role="columnheader"
      aria-sort={ariaSortValue}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors hover:text-dark-accent ${
        isActive ? 'text-dark-accent' : 'text-stone-400'
      }`}
    >
      <span className="inline-flex items-center">
        {label}
        {renderSortIndicator()}
      </span>
    </th>
  );
}

SortableHeader.propTypes = {
  column: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onToggleSort: PropTypes.func.isRequired,
};

export default SortableHeader;