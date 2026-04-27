import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import WellGrid from './components/WellGrid.jsx';
import WellForm from './components/WellForm.jsx';
import WellDetails from './components/WellDetails.jsx';
import NotFound from './components/NotFound.jsx';

/**
 * Application router configuration using createBrowserRouter.
 * Defines all client-side routes for the Well Management SPA.
 *
 * Route structure:
 * - / → redirects to /wells
 * - /wells → WellGrid (well list)
 * - /wells/create → WellForm (create mode)
 * - /wells/create-sidetrack → placeholder for future sidetrack creation
 * - /wells/:id → WellDetails (read-only view)
 * - /wells/:id/edit → WellForm (edit mode)
 * - * → NotFound (404)
 *
 * @type {import('react-router-dom').Router}
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/wells" replace />,
      },
      {
        path: 'wells',
        element: <WellGrid />,
      },
      {
        path: 'wells/create',
        element: <WellForm />,
      },
      {
        path: 'wells/create-sidetrack',
        element: <WellForm />,
      },
      {
        path: 'wells/:id',
        element: <WellDetails />,
      },
      {
        path: 'wells/:id/edit',
        element: <WellForm />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default router;