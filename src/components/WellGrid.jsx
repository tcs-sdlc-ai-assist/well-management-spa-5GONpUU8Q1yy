import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useWells from '../hooks/useWells.js';
import useFilters from '../hooks/useFilters.js';
import useSorting from '../hooks/useSorting.js';
import usePagination from '../hooks/usePagination.js';
import SortableHeader from './SortableHeader.jsx';
import FilterInput from './FilterInput.jsx';
import WellRow from './WellRow.jsx';
import PaginationControls from './PaginationControls.jsx';
import ActivationModal from './ActivationModal.jsx';
import { WELL_STATUS } from '../constants.js';

/**
 * Main data grid component that orchestrates the well list display.
 * Renders table with column headers (STATUS, RIG, WELL NAME, WELL ID, SPUD DATE, OPERATOR, CONTRACTOR, ACTIONS),
 * filter inputs row, sortable headers, and well rows.
 * Integrates useWells, useFilters, useSorting, usePagination hooks.
 * Pins active wells to top of filtered/sorted results.
 * Includes '+ Create New Well' and '+ Create Sidetrack Well' buttons in header.
 * Manages ActivationModal state (open/close, selected well, conflict detection).
 *
 * @returns {JSX.Element}
 */
function WellGrid() {
  const navigate = useNavigate();
  const { wells, loading, error, activateWell } = useWells();

  const { filters, filteredWells, setFilter, clearFilters } = useFilters(wells);
  const { sortColumn, sortDirection, toggleSort, sortedWells } = useSorting(filteredWells);
  const {
    currentPage,
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
    setPageSize,
  } = usePagination(sortedWells);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWell, setSelectedWell] = useState(null);
  const [conflictWell, setConflictWell] = useState(null);

  /**
   * Handles the activate button click on a well row.
   * Detects if there is a conflict (another active well on the same rig)
   * and opens the activation modal accordingly.
   * @param {object} well - The well to activate.
   */
  const handleActivate = useCallback(
    (well) => {
      const existingActive = wells.find(
        (w) => w.rig === well.rig && w.status === WELL_STATUS.ACTIVE && w.id !== well.id
      );

      setSelectedWell(well);
      setConflictWell(existingActive || null);
      setModalOpen(true);
    },
    [wells]
  );

  /**
   * Confirms the activation in the modal.
   * Calls activateWell from the useWells hook and closes the modal.
   */
  const handleConfirmActivation = useCallback(() => {
    if (selectedWell) {
      activateWell(selectedWell.id);
    }
    setModalOpen(false);
    setSelectedWell(null);
    setConflictWell(null);
  }, [selectedWell, activateWell]);

  /**
   * Cancels the activation modal.
   */
  const handleCancelActivation = useCallback(() => {
    setModalOpen(false);
    setSelectedWell(null);
    setConflictWell(null);
  }, []);

  /**
   * Navigates to the create well page.
   */
  const handleCreateWell = () => {
    navigate('/wells/create');
  };

  /**
   * Navigates to the create sidetrack well page.
   */
  const handleCreateSidetrack = () => {
    navigate('/wells/create-sidetrack');
  };

  const handlePageChange = useCallback(
    (page) => {
      goToPage(page);
    },
    [goToPage]
  );

  const handlePageSizeChange = useCallback(
    (size) => {
      setPageSize(size);
    },
    [setPageSize]
  );

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stone-400 text-sm">Loading wells...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-4 my-6 rounded-md border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-dark-border bg-dark-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Well Management</h1>
          <p className="mt-1 text-sm text-stone-400">
            {totalItems} well{totalItems !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-md border border-dark-border bg-dark-bg px-3 py-2 text-sm font-medium text-stone-300 shadow-sm hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
            >
              Clear Filters
            </button>
          )}
          <button
            type="button"
            onClick={handleCreateSidetrack}
            className="btn-secondary"
          >
            + Create Sidetrack Well
          </button>
          <button
            type="button"
            onClick={handleCreateWell}
            className="btn-primary"
          >
            + Create New Well
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-border">
          <thead className="bg-dark-surface">
            <tr>
              <SortableHeader
                column="status"
                label="Status"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="rig"
                label="Rig"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="name"
                label="Well Name"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="id"
                label="Well ID"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="spudDate"
                label="Spud Date"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="operator"
                label="Operator"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <SortableHeader
                column="contractor"
                label="Contractor"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onToggleSort={toggleSort}
              />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-400">
                Actions
              </th>
            </tr>
            {/* Filter row */}
            <tr className="bg-dark-bg">
              <td className="px-4 py-2">
                <FilterInput
                  column="status"
                  value={filters.status || ''}
                  onChange={setFilter}
                  placeholder="Filter status..."
                />
              </td>
              <td className="px-4 py-2">
                <FilterInput
                  column="rig"
                  value={filters.rig || ''}
                  onChange={setFilter}
                  placeholder="Filter rig..."
                />
              </td>
              <td className="px-4 py-2">
                <FilterInput
                  column="wellName"
                  value={filters.wellName || ''}
                  onChange={setFilter}
                  placeholder="Filter well name..."
                />
              </td>
              <td className="px-4 py-2">
                <FilterInput
                  column="wellId"
                  value={filters.wellId || ''}
                  onChange={setFilter}
                  placeholder="Filter well ID..."
                />
              </td>
              <td className="px-4 py-2">
                {/* Spud date column - no filter */}
              </td>
              <td className="px-4 py-2">
                <FilterInput
                  column="operator"
                  value={filters.operator || ''}
                  onChange={setFilter}
                  placeholder="Filter operator..."
                />
              </td>
              <td className="px-4 py-2">
                <FilterInput
                  column="contractor"
                  value={filters.contractor || ''}
                  onChange={setFilter}
                  placeholder="Filter contractor..."
                />
              </td>
              <td className="px-4 py-2">
                {/* Actions column - no filter */}
              </td>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border bg-dark-bg">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-stone-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-stone-500">
                      {hasActiveFilters
                        ? 'No wells match the current filters.'
                        : 'No wells found. Create a new well to get started.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 text-sm text-dark-accent hover:underline focus:outline-none"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((well) => (
                <WellRow
                  key={well.id}
                  well={well}
                  onActivate={handleActivate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          pageNumbers={pageNumbers}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isFirst={isFirst}
          isLast={isLast}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Activation Modal */}
      <ActivationModal
        isOpen={modalOpen}
        well={selectedWell}
        conflictWell={conflictWell}
        onConfirm={handleConfirmActivation}
        onCancel={handleCancelActivation}
      />
    </div>
  );
}

export default WellGrid;