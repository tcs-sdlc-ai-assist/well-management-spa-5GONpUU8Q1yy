import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getWellById } from '../services/wellStorageService.js';
import StatusBadge from './StatusBadge.jsx';

/**
 * Read-only well details view component for /wells/:id route.
 * Loads well data from localStorage via wellStorageService.
 * Displays all well fields in a read-only card layout with dark theme styling.
 * Includes a 'Back to Wells' button to navigate to the grid.
 *
 * @returns {JSX.Element}
 */
function WellDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [well, setWell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      const data = getWellById(id);
      if (data) {
        setWell(data);
      } else {
        setError(`Well with ID "${id}" not found.`);
      }
    } catch (e) {
      setError(e.message || 'Failed to load well details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  /**
   * Navigates back to the well list grid.
   */
  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stone-400 text-sm">Loading well details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="btn-secondary"
        >
          ← Back to Wells
        </button>
      </div>
    );
  }

  if (!well) {
    return null;
  }

  const fields = [
    { label: 'Well Name', value: well.name || '—' },
    { label: 'Well ID', value: well.id || '—', mono: true },
    { label: 'Status', value: well.status, isStatus: true },
    { label: 'Rig', value: well.rig || '—' },
    { label: 'Operator', value: well.operator || '—' },
    { label: 'Contractor', value: well.contractor || '—' },
    { label: 'Type', value: well.type || '—' },
    { label: 'Location', value: well.location || '—' },
    { label: 'Owner', value: well.owner || '—' },
    { label: 'Spud Date', value: well.spudDate || '—' },
    { label: 'Created At', value: well.createdAt ? new Date(well.createdAt).toLocaleString() : '—' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Well Details</h1>
          <p className="mt-1 text-sm text-stone-400">
            Viewing details for <span className="font-medium text-white">{well.name || 'Unknown'}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="btn-secondary"
        >
          ← Back to Wells
        </button>
      </div>

      {/* Details Card */}
      <div className="rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
        <div className="border-b border-dark-border px-4 py-3 flex items-center gap-2">
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
          <h2 className="text-sm font-semibold text-white">Well Information</h2>
        </div>

        <div className="px-4 py-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="rounded-md border border-dark-border bg-dark-bg p-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {field.label}
                </dt>
                <dd className="mt-1 text-sm">
                  {field.isStatus ? (
                    <StatusBadge status={field.value} />
                  ) : (
                    <span className={`text-white ${field.mono ? 'font-mono' : ''}`}>
                      {field.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default WellDetails;