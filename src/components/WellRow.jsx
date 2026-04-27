import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { WELL_STATUS } from '../constants.js';

/**
 * Table row component for a single well in the grid.
 * Renders status badge, rig, well name, well ID, spud date, operator, contractor columns.
 * Active wells have highlighted styling with left border accent.
 * Includes Edit, Activate, and View Details action buttons depending on well status.
 *
 * @param {{ well: object, onActivate: (well: object) => void }} props
 * @param {object} props.well - The well object to render.
 * @param {(well: object) => void} props.onActivate - Callback invoked when the Activate button is clicked.
 * @returns {JSX.Element}
 */
function WellRow({ well, onActivate }) {
  const navigate = useNavigate();

  const isActive = well.status === WELL_STATUS.ACTIVE;

  const wellName = well.name || 'Unknown';
  const wellId = well.id || 'Unknown';
  const wellRig = well.rig || 'Unknown';
  const wellSpudDate = well.spudDate || '—';
  const wellOperator = well.operator || '—';
  const wellContractor = well.contractor || '—';

  const handleEdit = () => {
    navigate(`/wells/${well.id}/edit`);
  };

  const handleActivate = () => {
    onActivate(well);
  };

  const handleViewDetails = () => {
    navigate(`/wells/${well.id}`);
  };

  const rowClasses = isActive
    ? 'border-l-4 border-emerald-500 bg-stone-800/50'
    : 'border-l-4 border-transparent';

  return (
    <tr
      className={`${rowClasses} transition-colors hover:bg-stone-800/30`}
    >
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <StatusBadge status={well.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-300">
        {wellRig}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
        {wellName}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-stone-400">
        {wellId}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-300">
        {wellSpudDate}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-300">
        {wellOperator}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-300">
        {wellContractor}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEdit}
            aria-label={`Edit ${wellName}`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
          >
            Edit
          </button>
          {!isActive && (
            <button
              type="button"
              onClick={handleActivate}
              aria-label={`Activate ${wellName}`}
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
            >
              Activate
            </button>
          )}
          {isActive && (
            <button
              type="button"
              onClick={handleViewDetails}
              aria-label={`View details for ${wellName}`}
              className="inline-flex items-center justify-center rounded-md bg-stone-800 px-3 py-1.5 text-xs font-medium text-white shadow-sm border border-dark-border hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

WellRow.propTypes = {
  well: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string,
    location: PropTypes.string,
    owner: PropTypes.string,
    operator: PropTypes.string,
    contractor: PropTypes.string,
    rig: PropTypes.string,
    spudDate: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onActivate: PropTypes.func.isRequired,
};

export default WellRow;