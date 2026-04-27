import { Outlet, useNavigate } from 'react-router-dom';

/**
 * Application shell layout component.
 * Renders the app header with 'Edge Well Management' title, navigation area,
 * and an Outlet for nested routes. Applies bg-stone-950 backdrop and consistent
 * padding/spacing.
 *
 * @returns {JSX.Element}
 */
function Layout() {
  const navigate = useNavigate();

  /**
   * Navigates to the home/well list page.
   */
  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-surface">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTitleClick}
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-dark-accent rounded-md px-1 py-0.5 transition-colors hover:opacity-80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-dark-accent"
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
              <h1 className="text-lg font-semibold text-white">
                Edge Well Management
              </h1>
            </button>
          </div>

          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-dark-accent focus:ring-offset-2 focus:ring-offset-dark-bg"
            >
              Wells
            </button>
            <button
              type="button"
              onClick={() => navigate('/wells/create')}
              className="btn-primary"
            >
              + New Well
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;