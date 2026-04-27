import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivationModal from './ActivationModal.jsx';

const createMockWell = (overrides = {}) => ({
  id: 'well-123',
  name: 'Test Well Alpha',
  rig: 'RIG-A',
  status: 'created',
  ...overrides,
});

const createConflictWell = (overrides = {}) => ({
  id: 'well-456',
  name: 'Conflict Well Beta',
  rig: 'RIG-A',
  status: 'active',
  ...overrides,
});

describe('ActivationModal', () => {
  let onConfirm;
  let onCancel;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();
  });

  describe('rendering', () => {
    it('returns null when isOpen is false', () => {
      const { container } = render(
        <ActivationModal
          isOpen={false}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(container.innerHTML).toBe('');
    });

    it('returns null when well is null even if isOpen is true', () => {
      const { container } = render(
        <ActivationModal
          isOpen={true}
          well={null}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(container.innerHTML).toBe('');
    });

    it('renders the modal dialog when isOpen is true and well is provided', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders well details correctly', () => {
      const well = createMockWell({ id: 'abc-123', name: 'My Well', rig: 'RIG-X' });

      render(
        <ActivationModal
          isOpen={true}
          well={well}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('My Well')).toBeInTheDocument();
      expect(screen.getByText('abc-123')).toBeInTheDocument();
      expect(screen.getByText('RIG-X')).toBeInTheDocument();
    });
  });

  describe('Scenario 1 - no conflict', () => {
    it('shows confirmation message without conflict warning', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Activate Well')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to activate this well?')).toBeInTheDocument();
      expect(screen.queryByText('Active Well Conflict')).not.toBeInTheDocument();
    });

    it('shows Activate button instead of Confirm Switch', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Confirm Switch' })).not.toBeInTheDocument();
    });

    it('shows Cancel button', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Scenario 2 - conflict', () => {
    it('shows conflict warning with both wells', () => {
      const well = createMockWell({ name: 'New Well', id: 'new-id', rig: 'RIG-A' });
      const conflictWell = createConflictWell({ name: 'Old Active Well', id: 'old-id', rig: 'RIG-A' });

      render(
        <ActivationModal
          isOpen={true}
          well={well}
          conflictWell={conflictWell}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Active Well Conflict')).toBeInTheDocument();
      expect(screen.getByText('Will be deactivated')).toBeInTheDocument();
      expect(screen.getByText('Will be activated')).toBeInTheDocument();
      expect(screen.getByText('Old Active Well')).toBeInTheDocument();
      expect(screen.getByText('New Well')).toBeInTheDocument();
      expect(screen.getByText('old-id')).toBeInTheDocument();
      expect(screen.getByText('new-id')).toBeInTheDocument();
    });

    it('shows Confirm Switch button instead of Activate', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={createConflictWell()}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole('button', { name: 'Confirm Switch' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument();
    });

    it('displays rig name in the warning message', () => {
      const well = createMockWell({ rig: 'CYC36' });
      const conflictWell = createConflictWell({ rig: 'CYC36' });

      render(
        <ActivationModal
          isOpen={true}
          well={well}
          conflictWell={conflictWell}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('CYC36')).toBeInTheDocument();
    });
  });

  describe('confirm button calls activation handler', () => {
    it('calls onConfirm when Activate button is clicked (no conflict)', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const activateButton = screen.getByRole('button', { name: 'Activate' });
      await user.click(activateButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Confirm Switch button is clicked (conflict)', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={createConflictWell()}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const confirmButton = screen.getByRole('button', { name: 'Confirm Switch' });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel button closes modal without changes', () => {
    it('calls onCancel when Cancel button is clicked (no conflict)', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onCancel when Cancel button is clicked (conflict)', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={createConflictWell()}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onCancel when close button (X) is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Escape key closes modal', () => {
    it('calls onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('calls onCancel when Escape key is pressed in conflict scenario', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={createConflictWell()}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay click closes modal', () => {
    it('calls onCancel when overlay backdrop is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      // The overlay is the outermost div with the fixed inset-0 class
      const overlay = screen.getByRole('dialog').parentElement;
      await user.click(overlay);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when clicking inside the modal dialog', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      // onCancel should not be called from clicking inside the dialog content
      // (only overlay clicks trigger it)
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('focus trap works', () => {
    it('traps focus within the modal when Tab is pressed', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      const lastFocusable = focusableElements[focusableElements.length - 1];
      lastFocusable.focus();
      expect(document.activeElement).toBe(lastFocusable);

      await user.tab();

      // Focus should wrap to the first focusable element
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    it('traps focus in reverse when Shift+Tab is pressed on first element', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);

      const firstFocusable = focusableElements[0];
      firstFocusable.focus();
      expect(document.activeElement).toBe(firstFocusable);

      await user.tab({ shift: true });

      // Focus should wrap to the last focusable element
      const lastFocusable = focusableElements[focusableElements.length - 1];
      expect(document.activeElement).toBe(lastFocusable);
    });
  });

  describe('accessibility', () => {
    it('has aria-modal attribute set to true', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to the title', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('activation-modal-title');

      const title = document.getElementById(labelledBy);
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe('Activate Well');
    });

    it('has aria-labelledby pointing to conflict title when conflict exists', () => {
      render(
        <ActivationModal
          isOpen={true}
          well={createMockWell()}
          conflictWell={createConflictWell()}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      const title = document.getElementById(labelledBy);
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe('Active Well Conflict');
    });
  });

  describe('edge cases', () => {
    it('handles well with wellName and wellId properties', () => {
      const well = { wellName: 'Alt Name', wellId: 'alt-id', rig: 'RIG-Z' };

      render(
        <ActivationModal
          isOpen={true}
          well={well}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Alt Name')).toBeInTheDocument();
      expect(screen.getByText('alt-id')).toBeInTheDocument();
      expect(screen.getByText('RIG-Z')).toBeInTheDocument();
    });

    it('displays Unknown for missing well fields', () => {
      const well = {};

      render(
        <ActivationModal
          isOpen={true}
          well={well}
          conflictWell={null}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      const unknownTexts = screen.getAllByText('Unknown');
      expect(unknownTexts.length).toBeGreaterThanOrEqual(1);
    });
  });
});