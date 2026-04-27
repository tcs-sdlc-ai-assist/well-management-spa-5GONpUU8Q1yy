import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WellForm from './WellForm.jsx';
import WellGrid from './WellGrid.jsx';
import { STORAGE_KEY, WELL_STATUS } from '../constants.js';

const createTestWells = () => [
  {
    id: 'well-edit-1',
    name: 'Editable Well Alpha',
    status: WELL_STATUS.CREATED,
    type: 'Horizontal',
    location: 'Permian Basin, TX',
    owner: 'Test Owner',
    operator: 'Test Operator',
    contractor: 'Test Contractor',
    rig: 'RIG-EDIT',
    spudDate: '2024-03-15',
    createdAt: '2024-03-10T08:00:00.000Z',
  },
  {
    id: 'well-edit-2',
    name: 'Editable Well Beta',
    status: WELL_STATUS.ACTIVE,
    type: 'Vertical',
    location: 'Eagle Ford, TX',
    owner: 'Beta Owner',
    operator: 'Beta Operator',
    contractor: 'Beta Contractor',
    rig: 'RIG-BETA',
    spudDate: '2024-04-20',
    createdAt: '2024-04-15T10:00:00.000Z',
  },
];

function renderCreateForm() {
  return render(
    <MemoryRouter initialEntries={['/wells/create']}>
      <Routes>
        <Route path="/wells/create" element={<WellForm />} />
        <Route path="/" element={<div>Well List Page</div>} />
        <Route path="/wells" element={<div>Well List Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditForm(wellId) {
  return render(
    <MemoryRouter initialEntries={[`/wells/${wellId}/edit`]}>
      <Routes>
        <Route path="/wells/:id/edit" element={<WellForm />} />
        <Route path="/" element={<div>Well List Page</div>} />
        <Route path="/wells" element={<div>Well List Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WellForm', () => {
  let testWells;

  beforeEach(() => {
    localStorage.clear();
    testWells = createTestWells();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testWells));
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('create mode renders empty form with both sections expanded', () => {
    it('renders the Create New Well heading', () => {
      renderCreateForm();

      expect(screen.getByText('Create New Well')).toBeInTheDocument();
      expect(screen.getByText('Fill in the details below to create a new well.')).toBeInTheDocument();
    });

    it('renders the Create Well submit button', () => {
      renderCreateForm();

      expect(screen.getByRole('button', { name: 'Create Well' })).toBeInTheDocument();
    });

    it('renders the Cancel button', () => {
      renderCreateForm();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('has both Well Setup and Rig Setup sections expanded', () => {
      renderCreateForm();

      // Well Setup section content should be visible
      expect(screen.getByLabelText('Well Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Spud Date *')).toBeInTheDocument();
      expect(screen.getByLabelText('Operator *')).toBeInTheDocument();

      // Rig Setup section content should be visible
      expect(screen.getByLabelText('Rig Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Contractor *')).toBeInTheDocument();
    });

    it('has empty form fields in create mode', () => {
      renderCreateForm();

      expect(screen.getByLabelText('Well Name *')).toHaveValue('');
      expect(screen.getByLabelText('Operator *')).toHaveValue('');
      expect(screen.getByLabelText('Rig Name *')).toHaveValue('');
      expect(screen.getByLabelText('Contractor *')).toHaveValue('');
    });

    it('has both section toggle buttons with aria-expanded true', () => {
      renderCreateForm();

      const wellSetupToggle = screen.getByRole('button', { name: /well setup/i });
      const rigSetupToggle = screen.getByRole('button', { name: /rig setup/i });

      expect(wellSetupToggle).toHaveAttribute('aria-expanded', 'true');
      expect(rigSetupToggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('edit mode loads well data with Rig Setup collapsed and Well Setup expanded', () => {
    it('renders the Edit Well heading', () => {
      renderEditForm('well-edit-1');

      expect(screen.getByText('Edit Well')).toBeInTheDocument();
      expect(screen.getByText('Update the well details below and save your changes.')).toBeInTheDocument();
    });

    it('renders the Update Well submit button', () => {
      renderEditForm('well-edit-1');

      expect(screen.getByRole('button', { name: 'Update Well' })).toBeInTheDocument();
    });

    it('has Well Setup section expanded with pre-populated fields', () => {
      renderEditForm('well-edit-1');

      const wellSetupToggle = screen.getByRole('button', { name: /well setup/i });
      expect(wellSetupToggle).toHaveAttribute('aria-expanded', 'true');

      expect(screen.getByLabelText('Well Name *')).toHaveValue('Editable Well Alpha');
      expect(screen.getByLabelText('Operator *')).toHaveValue('Test Operator');
      expect(screen.getByLabelText('Spud Date *')).toHaveValue('2024-03-15');
    });

    it('has Rig Setup section collapsed in edit mode', () => {
      renderEditForm('well-edit-1');

      const rigSetupToggle = screen.getByRole('button', { name: /rig setup/i });
      expect(rigSetupToggle).toHaveAttribute('aria-expanded', 'false');

      // Rig fields should not be visible when collapsed
      expect(screen.queryByLabelText('Rig Name *')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Contractor *')).not.toBeInTheDocument();
    });

    it('shows rig fields when Rig Setup section is expanded', async () => {
      const user = userEvent.setup();
      renderEditForm('well-edit-1');

      const rigSetupToggle = screen.getByRole('button', { name: /rig setup/i });
      await user.click(rigSetupToggle);

      expect(screen.getByLabelText('Rig Name *')).toHaveValue('RIG-EDIT');
      expect(screen.getByLabelText('Contractor *')).toHaveValue('Test Contractor');
    });

    it('shows Well ID as read-only in edit mode', () => {
      renderEditForm('well-edit-1');

      const wellIdInput = screen.getByLabelText('Well ID');
      expect(wellIdInput).toHaveValue('well-edit-1');
      expect(wellIdInput).toHaveAttribute('readOnly');
    });

    it('shows error when well ID is not found', () => {
      renderEditForm('non-existent-id');

      expect(screen.getByText('Well with ID "non-existent-id" not found.')).toBeInTheDocument();
    });
  });

  describe('Update Well saves changes to localStorage', () => {
    it('saves updated well name to localStorage', async () => {
      const user = userEvent.setup();
      renderEditForm('well-edit-1');

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.clear(wellNameInput);
      await user.type(wellNameInput, 'Updated Well Name');

      // Expand rig setup to ensure rig fields are populated (they are already from load)
      const rigSetupToggle = screen.getByRole('button', { name: /rig setup/i });
      await user.click(rigSetupToggle);

      const updateButton = screen.getByRole('button', { name: 'Update Well' });
      await user.click(updateButton);

      // After submit, should navigate away
      await waitFor(() => {
        expect(screen.getByText('Well List Page')).toBeInTheDocument();
      });

      // Verify localStorage was updated
      const storedWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const updatedWell = storedWells.find((w) => w.id === 'well-edit-1');
      expect(updatedWell).toBeDefined();
      expect(updatedWell.name).toBe('Updated Well Name');
    });

    it('saves updated operator to localStorage', async () => {
      const user = userEvent.setup();
      renderEditForm('well-edit-1');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.clear(operatorInput);
      await user.type(operatorInput, 'New Operator Corp');

      const updateButton = screen.getByRole('button', { name: 'Update Well' });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText('Well List Page')).toBeInTheDocument();
      });

      const storedWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const updatedWell = storedWells.find((w) => w.id === 'well-edit-1');
      expect(updatedWell.operator).toBe('New Operator Corp');
    });
  });

  describe('Cancel returns to list without saving', () => {
    it('navigates back to well list when Cancel is clicked in create mode', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      // Type something in a field
      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Unsaved Well');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Well List Page')).toBeInTheDocument();
      });

      // Verify nothing was saved to localStorage
      const storedWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const unsavedWell = storedWells.find((w) => w.name === 'Unsaved Well');
      expect(unsavedWell).toBeUndefined();
    });

    it('navigates back to well list when Cancel is clicked in edit mode without saving', async () => {
      const user = userEvent.setup();
      renderEditForm('well-edit-1');

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.clear(wellNameInput);
      await user.type(wellNameInput, 'Changed But Not Saved');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Well List Page')).toBeInTheDocument();
      });

      // Verify original data is preserved in localStorage
      const storedWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const well = storedWells.find((w) => w.id === 'well-edit-1');
      expect(well.name).toBe('Editable Well Alpha');
    });
  });

  describe('required field validation prevents submission', () => {
    it('shows validation error when Well Name is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      // Fill in all required fields except Well Name
      const spudDateInput = screen.getByLabelText('Spud Date *');
      await user.type(spudDateInput, '2024-06-01');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.type(operatorInput, 'Test Operator');

      const rigNameInput = screen.getByLabelText('Rig Name *');
      await user.type(rigNameInput, 'TEST-RIG');

      const contractorInput = screen.getByLabelText('Contractor *');
      await user.type(contractorInput, 'Test Contractor');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Well Name is required.')).toBeInTheDocument();
    });

    it('shows validation error when Spud Date is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Validation Test Well');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.type(operatorInput, 'Test Operator');

      const rigNameInput = screen.getByLabelText('Rig Name *');
      await user.type(rigNameInput, 'TEST-RIG');

      const contractorInput = screen.getByLabelText('Contractor *');
      await user.type(contractorInput, 'Test Contractor');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Spud Date is required.')).toBeInTheDocument();
    });

    it('shows validation error when Operator is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Validation Test Well Op');

      const spudDateInput = screen.getByLabelText('Spud Date *');
      await user.type(spudDateInput, '2024-06-01');

      const rigNameInput = screen.getByLabelText('Rig Name *');
      await user.type(rigNameInput, 'TEST-RIG');

      const contractorInput = screen.getByLabelText('Contractor *');
      await user.type(contractorInput, 'Test Contractor');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Operator is required.')).toBeInTheDocument();
    });

    it('shows validation error when Rig Name is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Validation Test Well Rig');

      const spudDateInput = screen.getByLabelText('Spud Date *');
      await user.type(spudDateInput, '2024-06-01');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.type(operatorInput, 'Test Operator');

      const contractorInput = screen.getByLabelText('Contractor *');
      await user.type(contractorInput, 'Test Contractor');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Rig Name is required.')).toBeInTheDocument();
    });

    it('shows validation error when Contractor is empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Validation Test Well Con');

      const spudDateInput = screen.getByLabelText('Spud Date *');
      await user.type(spudDateInput, '2024-06-01');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.type(operatorInput, 'Test Operator');

      const rigNameInput = screen.getByLabelText('Rig Name *');
      await user.type(rigNameInput, 'TEST-RIG');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Contractor is required.')).toBeInTheDocument();
    });

    it('shows multiple validation errors when multiple fields are empty', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Well Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Spud Date is required.')).toBeInTheDocument();
      expect(screen.getByText('Operator is required.')).toBeInTheDocument();
      expect(screen.getByText('Rig Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Contractor is required.')).toBeInTheDocument();
    });

    it('does not navigate away when validation fails', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      // Should still be on the form page
      expect(screen.getByText('Create New Well')).toBeInTheDocument();
      expect(screen.queryByText('Well List Page')).not.toBeInTheDocument();
    });

    it('expands collapsed sections when they contain validation errors', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      // Collapse the Rig Setup section
      const rigSetupToggle = screen.getByRole('button', { name: /rig setup/i });
      await user.click(rigSetupToggle);

      // Verify it's collapsed
      expect(rigSetupToggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByLabelText('Rig Name *')).not.toBeInTheDocument();

      // Submit the form with empty fields
      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      // Rig Setup should be expanded again to show errors
      expect(screen.getByLabelText('Rig Name *')).toBeInTheDocument();
      expect(screen.getByText('Rig Name is required.')).toBeInTheDocument();
      expect(screen.getByText('Contractor is required.')).toBeInTheDocument();
    });

    it('clears validation error when user fills in the field', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      expect(screen.getByText('Well Name is required.')).toBeInTheDocument();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Now Filled In');

      expect(screen.queryByText('Well Name is required.')).not.toBeInTheDocument();
    });

    it('does not save to localStorage when validation fails', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const initialWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const initialCount = initialWells.length;

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      const afterWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(afterWells.length).toBe(initialCount);
    });
  });

  describe('successful create saves to localStorage', () => {
    it('creates a new well and navigates to list', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      const wellNameInput = screen.getByLabelText('Well Name *');
      await user.type(wellNameInput, 'Brand New Test Well');

      const spudDateInput = screen.getByLabelText('Spud Date *');
      await user.type(spudDateInput, '2024-09-01');

      const operatorInput = screen.getByLabelText('Operator *');
      await user.type(operatorInput, 'New Operator');

      const rigNameInput = screen.getByLabelText('Rig Name *');
      await user.type(rigNameInput, 'NEW-RIG');

      const contractorInput = screen.getByLabelText('Contractor *');
      await user.type(contractorInput, 'New Contractor');

      const createButton = screen.getByRole('button', { name: 'Create Well' });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Well List Page')).toBeInTheDocument();
      });

      const storedWells = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const newWell = storedWells.find((w) => w.name === 'Brand New Test Well');
      expect(newWell).toBeDefined();
      expect(newWell.operator).toBe('New Operator');
      expect(newWell.rig).toBe('NEW-RIG');
      expect(newWell.contractor).toBe('New Contractor');
      expect(newWell.status).toBe(WELL_STATUS.CREATED);
    });
  });
});