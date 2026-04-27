import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal dialog component for well activation confirmation and conflict warning.
 *
 * Scenario 1 (no conflict): Displays well details and a simple confirmation message
 * with Activate and Cancel buttons.
 *
 * Scenario 2 (conflict): Displays a warning about the existing active well on the
 * same rig, showing details of both the current active well and the well to be
 * activated, with Confirm Switch and Cancel buttons.
 *
 * Features:
 * - Focus trap within modal
 * - Escape key to close
 * - Overlay click to close
 * - Accessible: aria-modal, role="dialog", aria-labelledby
 *
 * @param {{ isOpen: boolean, well: object|null, conflictWell: object|null, onConfirm: () => void, onCancel: () => void }} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {object|null} props.well - The well to be activated.
 * @param {object|null} props.conflictWell - The currently active well on the same rig that would be demoted (null if no conflict).
 * @param {() => void} props.onConfirm - Callback invoked when the user confirms activation.
 * @param {() => void} props.onCancel - Callback invoked when the user cancels.
 * @returns {JSX.Element|null}
 */
function ActivationModal({ isOpen, well, conflictWell, onConfirm, onCancel }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const hasConflict = conflictWell !== null && conflictWell !== undefined;

  /**
   * Returns all focusable elements within the modal.
   * @returns {HTMLElement[]}
   */
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(modalRef.current.querySelectorAll(selectors));
  }, []);

  /**
   * Handles keyboard events for focus trap and Escape to close.
   * @param {KeyboardEvent} e
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onCancel, getFocusableElements]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;

      const timer = setTimeout(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown, getFocusableElements]);

  /**
   * Handles clicks on the overlay backdrop to close the modal.
   * @param {React.MouseEvent} e
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen || !well) {
    return null;
  }

  const wellName = well.name || well.wellName || 'Unknown';
  const wellRig = well.rig || 'Unknown';
  const wellId = well.id || well.wellId || 'Unknown';

  const titleId = 'activation-modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleOverlayClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative mx-4 w-full max-w-md rounded-lg border border-dark-border bg-dark-surface p-6 shadow-xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close modal"
          className="absolute right-3 top-3 rounded-md p-1 text-stone-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-dark-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {hasConflict ? (
          <>
            {/* Conflict scenario */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <h2 id={titleId} className="text-lg font-semibold text-amber-400">
                Active Well Conflict
              </h2>
            </div>

            <p className="mb-4 text-sm text-stone-300">
              Rig <span className="font-medium text-white">{wellRig}</span> already has an active well.
              Activating a new well will deactivate the current one.
            </p>

            {/* Current active well details */}
            <div className="mb-3 rounded-md border border-red-500/20 bg-red-500/5 p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-red-400">
                Will be deactivated
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-stone-300">
                  <span className="text-stone-500">Name:</span>{' '}
                  <span className="text-white">{conflictWell.name || conflictWell.wellName || 'Unknown'}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">ID:</span>{' '}
                  <span className="font-mono text-white">{conflictWell.id || conflictWell.wellId || 'Unknown'}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">Rig:</span>{' '}
                  <span className="text-white">{conflictWell.rig || 'Unknown'}</span>
                </p>
              </div>
            </div>

            {/* Well to be activated details */}
            <div className="mb-6 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-400">
                Will be activated
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-stone-300">
                  <span className="text-stone-500">Name:</span>{' '}
                  <span className="text-white">{wellName}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">ID:</span>{' '}
                  <span className="font-mono text-white">{wellId}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">Rig:</span>{' '}
                  <span className="text-white">{wellRig}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
              >
                Confirm Switch
              </button>
            </div>
          </>
        ) : (
          <>
            {/* No conflict scenario */}
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-emerald-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <h2 id={titleId} className="text-lg font-semibold text-white">
                Activate Well
              </h2>
            </div>

            <p className="mb-4 text-sm text-stone-300">
              Are you sure you want to activate this well?
            </p>

            {/* Well details */}
            <div className="mb-6 rounded-md border border-dark-border bg-dark-bg p-3">
              <div className="space-y-1 text-sm">
                <p className="text-stone-300">
                  <span className="text-stone-500">Name:</span>{' '}
                  <span className="text-white">{wellName}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">ID:</span>{' '}
                  <span className="font-mono text-white">{wellId}</span>
                </p>
                <p className="text-stone-300">
                  <span className="text-stone-500">Rig:</span>{' '}
                  <span className="text-white">{wellRig}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
              >
                Activate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ActivationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  well: PropTypes.object,
  conflictWell: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ActivationModal.defaultProps = {
  well: null,
  conflictWell: null,
};

export default ActivationModal;