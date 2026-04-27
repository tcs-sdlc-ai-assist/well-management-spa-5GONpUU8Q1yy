import { useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Collapsible form section for Rig Setup fields in the well create/edit form.
 * Contains fields: Rig Name, Contractor.
 * Renders with dark theme styling. Accepts collapsed/expanded state prop and toggle handler.
 * In edit mode, defaults to collapsed.
 *
 * @param {{ isCollapsed: boolean, onToggle: () => void, rigName: string, contractor: string, onFieldChange: (field: string, value: string) => void, errors?: Record<string, string>, disabled?: boolean }} props
 * @param {boolean} props.isCollapsed - Whether the section is collapsed.
 * @param {() => void} props.onToggle - Callback to toggle collapsed/expanded state.
 * @param {string} props.rigName - Current value of the Rig Name field.
 * @param {string} props.contractor - Current value of the Contractor field.
 * @param {(field: string, value: string) => void} props.onFieldChange - Callback invoked with (fieldName, newValue) when a field changes.
 * @param {Record<string, string>} [props.errors] - Optional validation error messages keyed by field name.
 * @param {boolean} [props.disabled] - Whether the form fields are disabled.
 * @returns {JSX.Element}
 */
function RigSetupSection({ isCollapsed, onToggle, rigName, contractor, onFieldChange, errors, disabled }) {
  const sectionErrors = errors || {};

  /**
   * Handles change for the Rig Name input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleRigNameChange = useCallback(
    (e) => {
      onFieldChange('rig', e.target.value);
    },
    [onFieldChange]
  );

  /**
   * Handles change for the Contractor input.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleContractorChange = useCallback(
    (e) => {
      onFieldChange('contractor', e.target.value);
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
        aria-controls="rig-setup-section-content"
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
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-sm font-semibold text-white">Rig Setup</h3>
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
          id="rig-setup-section-content"
          className="border-t border-dark-border px-4 py-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Rig Name Field */}
            <div>
              <label htmlFor="rig-name" className="label">
                Rig Name <span className="text-red-400">*</span>
              </label>
              <input
                id="rig-name"
                type="text"
                value={rigName}
                onChange={handleRigNameChange}
                disabled={disabled}
                placeholder="Enter rig name..."
                aria-required="true"
                aria-invalid={!!sectionErrors.rig}
                aria-describedby={sectionErrors.rig ? 'rig-name-error' : undefined}
                className={`input ${sectionErrors.rig ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.rig && (
                <p id="rig-name-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.rig}
                </p>
              )}
            </div>

            {/* Contractor Field */}
            <div>
              <label htmlFor="contractor" className="label">
                Contractor <span className="text-red-400">*</span>
              </label>
              <input
                id="contractor"
                type="text"
                value={contractor}
                onChange={handleContractorChange}
                disabled={disabled}
                placeholder="Enter contractor..."
                aria-required="true"
                aria-invalid={!!sectionErrors.contractor}
                aria-describedby={sectionErrors.contractor ? 'contractor-error' : undefined}
                className={`input ${sectionErrors.contractor ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {sectionErrors.contractor && (
                <p id="contractor-error" className="mt-1 text-xs text-red-400">
                  {sectionErrors.contractor}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RigSetupSection.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  rigName: PropTypes.string.isRequired,
  contractor: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.string),
  disabled: PropTypes.bool,
};

RigSetupSection.defaultProps = {
  errors: {},
  disabled: false,
};

export default RigSetupSection;