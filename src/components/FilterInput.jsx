import PropTypes from 'prop-types';

/**
 * Reusable filter input component for grid column headers.
 * Renders a text input with dark theme styling for filtering well data columns.
 *
 * @param {{ column: string, value: string, onChange: (column: string, value: string) => void, placeholder?: string }} props
 * @param {string} props.column - The column key this filter applies to.
 * @param {string} props.value - The current filter value.
 * @param {(column: string, value: string) => void} props.onChange - Callback invoked with (column, newValue) when input changes.
 * @param {string} [props.placeholder] - Optional placeholder text. Defaults to "Filter {column}...".
 * @returns {JSX.Element}
 */
function FilterInput({ column, value, onChange, placeholder }) {
  const displayPlaceholder = placeholder || `Filter ${column}...`;

  const handleChange = (e) => {
    onChange(column, e.target.value);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={displayPlaceholder}
      aria-label={`Filter by ${column}`}
      className="block w-full rounded-md border border-stone-700 bg-stone-800 px-2 py-1 text-xs text-white placeholder-stone-500 focus:border-dark-accent focus:outline-none focus:ring-1 focus:ring-dark-accent transition-colors"
    />
  );
}

FilterInput.propTypes = {
  column: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

FilterInput.defaultProps = {
  placeholder: undefined,
};

export default FilterInput;