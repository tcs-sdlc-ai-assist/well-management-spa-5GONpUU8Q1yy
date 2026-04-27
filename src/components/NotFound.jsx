import { useNavigate } from 'react-router-dom';

/**
 * 404 Not Found page component displayed for invalid routes.
 * Shows a friendly message with dark theme styling and a button to navigate back to the well list.
 *
 * @returns {JSX.Element}
 */
function NotFound() {
  const navigate = useNavigate();

  /**
   * Navigates back to the well list grid.
   */
  const handleBackToWells = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-stone-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white">404</h1>
        <h2 className="text-lg font-semibold text-stone-300">Page Not Found</h2>
        <p className="max-w-md text-sm text-stone-400">
          The page you are looking for does not exist or has been moved.
          Please check the URL or navigate back to the well list.
        </p>

        <button
          type="button"
          onClick={handleBackToWells}
          className="btn-primary mt-4"
        >
          ← Back to Wells
        </button>
      </div>
    </div>
  );
}

export default NotFound;