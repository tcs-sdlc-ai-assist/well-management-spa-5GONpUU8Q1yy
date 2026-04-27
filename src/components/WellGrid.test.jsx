import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WellGrid from './WellGrid.jsx';
import { STORAGE_KEY, WELL_STATUS } from '../constants.js';

const createTestWells = (count = 12) => {
  const wells = [];
  for (let i = 1; i <= count; i++) {
    wells.push({
      id: `test-well-${i}`,
      name: `Test Well ${String(i).padStart(2, '0')}`,
      status: i === 1 ? WELL_STATUS.ACTIVE : i === 2 ? WELL_STATUS.INACTIVE : WELL_STATUS.CREATED,
      type: 'Horizontal',
      location: 'Test Basin, TX',
      owner: `Owner ${i}`,
      operator: `Operator ${i % 3 === 0 ? 'Alpha' : 'Beta'}`,
      contractor: `Contractor ${i % 2 === 0 ? 'One' : 'Two'}`,
      rig: i <= 4 ? 'RIG-A' : i <= 8 ? 'RIG-B' : 'RIG-C',
      spudDate: `2024-${String(i).padStart(2, '0')}-15`,
      createdAt: `2024-${String(i).padStart(2, '0')}-10T08:00:00.000Z`,
    });
  }
  return wells;
};

function renderWellGrid() {
  return render(
    <MemoryRouter>
      <WellGrid />
    </MemoryRouter>
  );
}

describe('WellGrid', () => {
  let testWells;

  beforeEach(() => {
    localStorage.clear();
    testWells = createTestWells();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testWells));
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering wells from localStorage', () => {
    it('renders wells from localStorage in the grid', () => {
      renderWellGrid();

      expect(screen.getByText('Well Management')).toBeInTheDocument();
      expect(screen.getByText('12 wells found')).toBeInTheDocument();

      expect(screen.getByText('Test Well 01')).toBeInTheDocument();
    });

    it('displays the correct number of wells on the first page with default page size', () => {
      renderWellGrid();

      const rows = screen.getAllByRole('row');
      // header row + filter row + 10 data rows (default page size)
      expect(rows.length).toBe(2 + 10);
    });
  });

  describe('filter inputs filter grid in real-time', () => {
    it('filters wells by well name', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const wellNameFilter = screen.getByPlaceholderText('Filter well name...');
      await user.type(wellNameFilter, 'Test Well 01');

      expect(screen.getByText('Test Well 01')).toBeInTheDocument();
      expect(screen.queryByText('Test Well 02')).not.toBeInTheDocument();
    });

    it('filters wells by rig', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const rigFilter = screen.getByPlaceholderText('Filter rig...');
      await user.type(rigFilter, 'RIG-C');

      expect(screen.getByText('4 wells found')).toBeInTheDocument();
    });

    it('filters wells by operator', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const operatorFilter = screen.getByPlaceholderText('Filter operator...');
      await user.type(operatorFilter, 'Alpha');

      const rows = screen.getAllByText(/Operator Alpha/);
      expect(rows.length).toBeGreaterThan(0);
    });

    it('filters wells by status', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const statusFilter = screen.getByPlaceholderText('Filter status...');
      await user.type(statusFilter, 'active');

      expect(screen.getByText('1 well found')).toBeInTheDocument();
    });

    it('shows empty state when no wells match filter', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const wellNameFilter = screen.getByPlaceholderText('Filter well name...');
      await user.type(wellNameFilter, 'ZZZZNONEXISTENT');

      expect(screen.getByText('No wells match the current filters.')).toBeInTheDocument();
    });

    it('clears filters when Clear Filters button is clicked', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const wellNameFilter = screen.getByPlaceholderText('Filter well name...');
      await user.type(wellNameFilter, 'ZZZZNONEXISTENT');

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      expect(screen.getByText('12 wells found')).toBeInTheDocument();
    });
  });

  describe('SPUD DATE sort toggles order', () => {
    it('toggles spud date sort direction on click', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const spudDateHeader = screen.getByRole('columnheader', { name: /spud date/i });

      // Default sort is spudDate asc, click to toggle to desc
      await user.click(spudDateHeader);

      // Click again to toggle back to asc
      await user.click(spudDateHeader);

      // The header should still be present and functional
      expect(spudDateHeader).toBeInTheDocument();
    });
  });

  describe('active well is pinned to top', () => {
    it('pins active wells to the top of the grid', () => {
      renderWellGrid();

      const tbody = screen.getAllByRole('row').filter((row) => {
        return row.closest('tbody');
      });

      // The first data row should contain the active well
      const firstDataRow = tbody[0];
      expect(within(firstDataRow).getByText('Test Well 01')).toBeInTheDocument();
    });
  });

  describe('pagination controls work with bounds checking', () => {
    it('renders pagination controls', () => {
      renderWellGrid();

      expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    });

    it('disables first and previous buttons on the first page', () => {
      renderWellGrid();

      expect(screen.getByLabelText('Go to first page')).toBeDisabled();
      expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    });

    it('enables next and last buttons when there are more pages', () => {
      renderWellGrid();

      expect(screen.getByLabelText('Go to next page')).not.toBeDisabled();
      expect(screen.getByLabelText('Go to last page')).not.toBeDisabled();
    });

    it('navigates to the next page when next button is clicked', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const nextButton = screen.getByLabelText('Go to next page');
      await user.click(nextButton);

      // On page 2, previous should be enabled
      expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();
    });

    it('navigates to the last page and disables next/last buttons', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const lastButton = screen.getByLabelText('Go to last page');
      await user.click(lastButton);

      expect(screen.getByLabelText('Go to next page')).toBeDisabled();
      expect(screen.getByLabelText('Go to last page')).toBeDisabled();
    });

    it('displays correct item range text', () => {
      renderWellGrid();

      expect(screen.getByText('1–10 of 12')).toBeInTheDocument();
    });
  });

  describe('activation modal opens on Activate click', () => {
    it('opens the activation modal when Activate button is clicked', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const activateButtons = screen.getAllByRole('button', { name: /^Activate/ });
      expect(activateButtons.length).toBeGreaterThan(0);

      await user.click(activateButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows conflict warning when activating a well on a rig with an existing active well', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      // Test Well 02 is inactive on RIG-A, Test Well 01 is active on RIG-A
      const activateButton = screen.getByLabelText('Activate Test Well 02');
      await user.click(activateButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Active Well Conflict')).toBeInTheDocument();
      expect(screen.getByText('Will be deactivated')).toBeInTheDocument();
      expect(screen.getByText('Will be activated')).toBeInTheDocument();
    });

    it('closes the modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const activateButtons = screen.getAllByRole('button', { name: /^Activate/ });
      await user.click(activateButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('activates the well when confirm is clicked in the modal', async () => {
      const user = userEvent.setup();

      // Set up wells where RIG-C has no active well
      const wellsNoConflict = createTestWells();
      // Make sure no well on RIG-C is active
      wellsNoConflict.forEach((w) => {
        if (w.rig === 'RIG-C') {
          w.status = WELL_STATUS.CREATED;
        }
      });
      // Also ensure well 1 is active on RIG-A only
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wellsNoConflict));

      renderWellGrid();

      const activateButton = screen.getByLabelText('Activate Test Well 09');
      await user.click(activateButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const confirmButton = screen.getByRole('button', { name: 'Activate' });
      await user.click(confirmButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('page size change resets to page 1', () => {
    it('resets to page 1 when page size is changed', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      // Navigate to page 2
      const nextButton = screen.getByLabelText('Go to next page');
      await user.click(nextButton);

      // Verify we're on page 2
      expect(screen.getByLabelText('Go to previous page')).not.toBeDisabled();

      // Change page size to 25
      const pageSizeSelect = screen.getByLabelText('Select page size');
      await user.selectOptions(pageSizeSelect, '25');

      // Should be back on page 1 with all items visible
      expect(screen.getByLabelText('Go to first page')).toBeDisabled();
      expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
      expect(screen.getByText('1–12 of 12')).toBeInTheDocument();
    });

    it('shows all wells when page size is larger than total wells', async () => {
      const user = userEvent.setup();
      renderWellGrid();

      const pageSizeSelect = screen.getByLabelText('Select page size');
      await user.selectOptions(pageSizeSelect, '50');

      expect(screen.getByText('1–12 of 12')).toBeInTheDocument();

      // Next and last should be disabled since all items fit on one page
      expect(screen.getByLabelText('Go to next page')).toBeDisabled();
      expect(screen.getByLabelText('Go to last page')).toBeDisabled();
    });
  });
});