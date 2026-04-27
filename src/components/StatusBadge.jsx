import PropTypes from 'prop-types';
import { WELL_STATUS, STATUS_BADGE_STYLES } from '../constants.js';

/**
 * Presentational component that renders a status badge for a well.
 * Displays a colored dot indicator and status text with appropriate styling
 * based on the well's current status (active, inactive, or created).
 *
 * @param {{ status: string }} props
 * @param {string} props.status - The well status value (one of WELL_STATUS enum values).
 * @returns {JSX.Element}
 */
function StatusBadge({ status }) {
  const normalizedStatus = status ? status.toLowerCase() : '';
  const styles = STATUS_BADGE_STYLES[normalizedStatus] || STATUS_BADGE_STYLES[WELL_STATUS.CREATED];

  const label = normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);

  const isActive = normalizedStatus === WELL_STATUS.ACTIVE;

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${styles.dot} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${styles.dot}`}
        />
      </span>
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;