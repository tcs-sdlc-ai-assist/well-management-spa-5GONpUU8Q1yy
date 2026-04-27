import { RouterProvider } from 'react-router-dom';
import { seedMockDataIfEmpty } from './services/wellStorageService.js';
import router from './router.jsx';

seedMockDataIfEmpty();

/**
 * Root application component.
 * Initializes localStorage with mock data on first load by calling seedMockDataIfEmpty().
 * Renders RouterProvider with the configured router.
 * Serves as the top-level composition point.
 *
 * @returns {JSX.Element}
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;