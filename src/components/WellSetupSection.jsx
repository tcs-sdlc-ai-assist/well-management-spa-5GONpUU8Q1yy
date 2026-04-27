import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { WELL_STATUS_VALUES } from '../constants.js';

/**
 * Collapsible form section for Well Setup fields in the well create/edit form.
 * Contains fields: Well Name, Well ID, Spud Date, Operator, Status.
 * Renders with dark theme styling. Accepts collapsed/expanded state prop and toggle handler.
 * In edit mode, defaults to expanded.
 *
 * @param {{ isCollapsed: boolean, onToggle: () => void, wellName: string, wellId: string, spudDate: string, operator: string, status: string, onFieldChange: (field: string, value: string) => void, errors?: Record<string, string>, disabled?: boolean, isEditMode?: boolean }} props
 * @param {boolean} props.isCollapsed - Whether the section is collapsed.
 * @param {() => void} props.onToggle - Callback to toggle collapsed/expanded state.
 * @param {string} props.wellName - Current value of the Well Name field.
 * @param {string} props.wellId - Current value of the Well ID field (read-only in edit mode).
 * @param {string} props.spudDate - Current value of the Spud Date field.
 * @param {string} props.operator - Current value of the Operator field.
 * @param {string} props.status - Current value of the Status field.
 * @param {(field: string, value: string) => void} props.onFieldChange - Callback invoked with (fieldName, newValue) when a field changes.
 * @param {Record<string, string>} [props.errors] - Optional validation error messages keyed by field name.
 * @param {boolean} [props.disabled] - Whether the form fields are disabled.
 * @param {boolean} [props.isEditMode] - Whether the form is in edit mode (Well ID becomes read-only).
 * @returns {JSX.Element}
 */
function WellSetupSection({
  isCollapsed,
  onToggle,
  wellName,
  wellId,
  spudDate,
  operator,
  status,
  onFieldChange,
  errors,
  disabled,
  isEditMode,
}) {
  const sectionErrors = errors || {};

  /**
   * Handles change for the Well Name input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleWellNameChange = useCallback(
    (e) => {
      onFieldChange('name', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles change for the Well ID input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleWellIdChange = useCallback(
    (e) => {
      onFieldChange('wellId', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles change for the Spud Date input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleSpudDateChange = useCallback(
    (e) => {
      onFieldChange('spudDate', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles change for the Operator input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleOperatorChange = useCallback(
    (e) => {
      onFieldChange('operator', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles change for the Status select.
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const handleStatusChange = useCallback(
    (e) => {
      onFieldChange('status', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles keyboard events on the section header for accessibility.
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={!isCollapsed}
        aria-controls="well-setup-section-content"
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-stone-800/50 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-inset"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-dark-accent"
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
          <h3 className="text-sm font-semibold text-white">Well Setup</h3>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-stone-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Section Content */}
      {!isCollapsed && (
        <div
          id="well-setup-section-content"
          className="border-t border-dark-border px-4 py-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Well Name Field */}
            <div>
              <label htmlFor="well-name" className="label">
                Well Name <span className="text-red-400">*</span>
              </label>
              <input
                id="well-name"
                type="text"
                value={wellName}
                onChange={handleWellNameChange}
                disabled={disabled}
                placeholder="Enter well name..."
                aria-required="true"
                aria-invalid={!!sectionErrors.name}
                aria-describedby={sectionErrors.name ? 'well-name-error' : undefined}
                className={`input ${sectionErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.name && (
                <p id="well-name-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.name}
                </p>
              )}
            </div>

            {/* Well ID Field */}
            <div>
              <label htmlFor="well-id" className="label">
                Well ID
              </label>
              <input
                id="well-id"
                type="text"
                value={wellId}
                onChange={handleWellIdChange}
                disabled={disabled || isEditMode}
                placeholder={isEditMode ? '' : 'Auto-generated if empty'}
                readOnly={isEditMode}
                aria-describedby={sectionErrors.wellId ? 'well-id-error' : undefined}
                className={`input ${isEditMode ? 'cursor-not-allowed opacity-60' : ''} ${sectionErrors.wellId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.wellId && (
                <p id="well-id-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.wellId}
                </p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-stone-500">
                  Well ID cannot be changed after creation.
                </p>
              )}
            </div>

            {/* Spud Date Field */}
            <div>
              <label htmlFor="spud-date" className="label">
                Spud Date <span className="text-red-400">*</span>
              </label>
              <input
                id="spud-date"
                type="date"
                value={spudDate}
                onChange={handleSpudDateChange}
                disabled={disabled}
                aria-required="true"
                aria-invalid={!!sectionErrors.spudDate}
                aria-describedby={sectionErrors.spudDate ? 'spud-date-error' : undefined}
                className={`input ${sectionErrors.spudDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.spudDate && (
                <p id="spud-date-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.spudDate}
                </p>
              )}
            </div>

            {/* Operator Field */}
            <div>
              <label htmlFor="operator" className="label">
                Operator <span className="text-red-400">*</span>
              </label>
              <input
                id="operator"
                type="text"
                value={operator}
                onChange={handleOperatorChange}
                disabled={disabled}
                placeholder="Enter operator..."
                aria-required="true"
                aria-invalid={!!sectionErrors.operator}
                aria-describedby={sectionErrors.operator ? 'operator-error' : undefined}
                className={`input ${sectionErrors.operator ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.operator && (
                <p id="operator-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.operator}
                </p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="well-status" className="label">
                Status
              </label>
              <select
                id="well-status"
                value={status}
                onChange={handleStatusChange}
                disabled={disabled}
                aria-describedby={sectionErrors.status ? 'well-status-error' : undefined}
                className={`input ${sectionErrors.status ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                {WELL_STATUS_VALUES.map((statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                  </option>
                ))}
              </select>
              {sectionErrors.status && (
                <p id="well-status-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.status}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

WellSetupSection.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  wellName: PropTypes.string.isRequired,
  wellId: PropTypes.string.isRequired,
  spudDate: PropTypes.string.isRequired,
  operator: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string),
  disabled: PropTypes.bool,
  isEditMode: PropTypes.bool,
};

WellSetupSection.defaultProps = {
  errors: {},
  disabled: false,
  isEditMode: false,
};

export default WellSetupSection;