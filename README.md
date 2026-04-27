# Well Management SPA

A single-page application for managing oil & gas wells, built with React 18+, Vite, and Tailwind CSS. The app provides a full-featured data grid with filtering, sorting, pagination, and well activation workflows — all persisted to `localStorage`.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [License](#license)

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| [React 18+](https://react.dev/) | UI component library |
| [Vite 5](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router v6](https://reactrouter.com/) | Client-side routing (`react-router-dom`) |
| [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | Client-side data persistence |
| [uuid](https://www.npmjs.com/package/uuid) | Unique ID generation for wells |
| [PropTypes](https://www.npmjs.com/package/prop-types) | Runtime prop type checking |
| [Vitest](https://vitest.dev/) | Unit and integration testing |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Component testing utilities |

---

## Features

- **Well List Grid** — Data grid displaying all wells with columns for Status, Rig, Well Name, Well ID, Spud Date, Operator, Contractor, and Actions.
- **Column Filtering** — Real-time, case-insensitive partial-string filter inputs on Status, Rig, Well Name, Well ID, Operator, and Contractor columns with a Clear Filters button.
- **Column Sorting** — Sortable column headers with ascending/descending toggle and visual arrow indicators; active wells are pinned to the top of results regardless of sort order.
- **Pagination** — Pagination footer with First, Previous, page number buttons, Next, and Last controls; configurable page size selector (10, 25, 50 rows per page) that resets to page 1 on change.
- **localStorage Persistence** — All well data persisted to `localStorage` under the `wells` key; automatic mock data seeding on first load or when storage is empty/corrupted.
- **Mock Data Seeding** — 12 pre-defined wells across multiple rigs (CYC36, SPR-12, NPE-07, AGL-03, RMR-19) with varied statuses for demonstration.
- **Activation Modal** — Confirmation dialog for well activation with simple confirmation (no conflict) and conflict warning (existing active well on the same rig) scenarios.
- **Single-Active-Well-Per-Rig Enforcement** — Business rule ensuring only one well per rig can be active at a time; activating a new well automatically demotes the previously active well to inactive.
- **Create Well Flow** — Form at `/wells/create` with Well Setup and Rig Setup collapsible sections, required field validation, and auto-generated UUID on submission.
- **Edit Well Flow** — Form at `/wells/:id/edit` pre-populated with existing well data; Well Setup expanded and Rig Setup collapsed by default; Well ID displayed as read-only.
- **View Well Details** — Read-only detail view at `/wells/:id` displaying all well fields in a card layout.
- **Client-Side Routing** — React Router v6 with `createBrowserRouter` supporting routes for well list, create, create sidetrack, view details, edit, and a 404 Not Found page.
- **Dark Theme UI** — Full dark theme built with Tailwind CSS using custom color tokens (`dark-bg`, `dark-surface`, `dark-border`, `dark-accent`, `dark-link`).
- **Status Badges** — Color-coded status indicators with animated ping effect for active wells (emerald for active, red for inactive, blue for created).
- **Accessibility** — ARIA attributes throughout, focus trap in activation modal, keyboard navigation support, and semantic HTML structure.
- **Responsive Layout** — Application shell with header navigation, responsive grid layouts, and mobile-friendly table with horizontal scroll.
- **Form Validation** — Client-side validation with inline error messages, automatic expansion of collapsed sections containing errors, and error clearing on field input.
- **Reusable Components** — Modular component architecture including `SortableHeader`, `FilterInput`, `StatusBadge`, `PaginationControls`, `WellRow`, `ActivationModal`, `WellSetupSection`, `RigSetupSection`, `Layout`, and `NotFound`.
- **Custom React Hooks** — `useWells` for CRUD state management, `useFilters` for grid filtering, `useSorting` for column sort state with active-well pinning, and `usePagination` for pagination state and navigation.
- **Storage Service Layer** — `wellStorageService` providing `getAllWells`, `getWellById`, `createWell`, `updateWell`, `activateWell`, `deleteWell`, `seedMockDataIfEmpty`, and `resetToMockData` with input validation and custom `WellStorageError` class.

---

## Folder Structure

```
well-management-spa/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest test configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel SPA rewrite rules
├── .env.example                # Environment variable template
├── CHANGELOG.md                # Version history
├── DEPLOYMENT.md               # Deployment guide
├── README.md                   # Project documentation (this file)
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with RouterProvider
    ├── router.jsx              # Route definitions (createBrowserRouter)
    ├── index.css               # Tailwind directives and global styles
    ├── constants.js            # App-wide constants and enums
    ├── setupTests.js           # Test setup (jest-dom matchers)
    ├── components/
    │   ├── ActivationModal.jsx         # Well activation confirmation dialog
    │   ├── ActivationModal.test.jsx    # ActivationModal tests
    │   ├── FilterInput.jsx             # Column filter text input
    │   ├── Layout.jsx                  # App shell with header and Outlet
    │   ├── NotFound.jsx                # 404 page
    │   ├── PaginationControls.jsx      # Pagination footer
    │   ├── RigSetupSection.jsx         # Rig Setup collapsible form section
    │   ├── SortableHeader.jsx          # Sortable table column header
    │   ├── StatusBadge.jsx             # Color-coded status indicator
    │   ├── WellDetails.jsx             # Read-only well detail view
    │   ├── WellForm.jsx                # Create/Edit well form
    │   ├── WellForm.test.jsx           # WellForm tests
    │   ├── WellGrid.jsx                # Main well list data grid
    │   ├── WellGrid.test.jsx           # WellGrid tests
    │   ├── WellRow.jsx                 # Single well table row
    │   └── WellSetupSection.jsx        # Well Setup collapsible form section
    ├── data/
    │   └── mockData.js                 # Pre-defined mock well data
    ├── hooks/
    │   ├── useFilters.js               # Grid filtering hook
    │   ├── usePagination.js            # Pagination state hook
    │   ├── useSorting.js               # Column sorting hook
    │   └── useWells.js                 # Well CRUD state hook
    └── services/
        ├── wellStorageService.js       # localStorage CRUD operations
        └── wellStorageService.test.js  # Storage service tests
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd well-management-spa
npm install
```

### Environment Variables

Create a `.env` file from the provided template:

```bash
cp .env.example .env
```

Available variables:

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_APP_TITLE` | Application title shown in the UI | `Well Management` |

All client-side environment variables must be prefixed with `VITE_` to be accessible via `import.meta.env.VITE_*`.

### Development Server

Start the Vite development server on port 3000:

```bash
npm run dev
```

The application will open automatically at [http://localhost:3000](http://localhost:3000).

### Production Build

Build the application for production:

```bash
npm run build
```

The compiled assets are written to the `dist/` directory. Preview the production build locally:

```bash
npm run preview
```

---

## Usage Guide

### Viewing Wells

Navigate to the home page (`/wells`) to see the well list grid. All wells are loaded from `localStorage`. On first visit, 12 mock wells are automatically seeded.

### Filtering

Use the filter inputs below each column header to filter wells in real-time. Filtering is case-insensitive and supports partial string matching. Click **Clear Filters** to reset all filters.

### Sorting

Click any column header to sort by that column. Click again to toggle between ascending and descending order. Active wells are always pinned to the top of the list regardless of sort order.

### Pagination

Use the pagination controls at the bottom of the grid to navigate between pages. Select a page size (10, 25, or 50) from the dropdown. Changing the page size resets to page 1.

### Creating a Well

Click **+ New Well** in the header or **+ Create New Well** on the grid page. Fill in the required fields (Well Name, Spud Date, Operator, Rig Name, Contractor) and click **Create Well**. A UUID is automatically generated for the Well ID.

### Editing a Well

Click the **Edit** button on any well row to open the edit form at `/wells/:id/edit`. The form is pre-populated with the existing well data. The Well ID field is read-only. Update the desired fields and click **Update Well**.

### Viewing Well Details

For active wells, click **View Details** to see a read-only detail view at `/wells/:id` displaying all well fields.

### Activating a Well

Click the **Activate** button on any non-active well row. A confirmation modal appears:

- **No conflict**: Simple confirmation to activate the well.
- **Conflict**: Warning that another well on the same rig is currently active and will be demoted to inactive. Displays details of both wells.

Confirm to proceed or cancel to abort.

---

## Testing

The project uses [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/) and [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) for unit and integration tests.

### Run Tests

```bash
# Single run
npm test

# Watch mode
npm run test:watch
```

### Test Coverage

The test suite covers:

- **Storage Service** (`wellStorageService.test.js`) — CRUD operations, mock data seeding, validation, error handling, single-active-per-rig enforcement.
- **Activation Modal** (`ActivationModal.test.jsx`) — Rendering, conflict/no-conflict scenarios, confirm/cancel actions, keyboard navigation, focus trap, accessibility attributes.
- **Well Form** (`WellForm.test.jsx`) — Create/edit mode rendering, required field validation, form submission, localStorage persistence, cancel without saving.
- **Well Grid** (`WellGrid.test.jsx`) — Grid rendering, filtering, sorting, pagination, activation modal integration, page size changes.

### Test Environment

Tests run in a `jsdom` environment configured in `vitest.config.js`. The setup file (`src/setupTests.js`) imports `@testing-library/jest-dom` for extended DOM matchers.

---

## Deployment

The application is configured for deployment on [Vercel](https://vercel.com/). See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:

- Automatic deployment via GitHub integration
- Manual deployment via Vercel CLI
- SPA rewrite configuration
- Environment variable setup
- CI/CD with GitHub Actions

---

## License

This project is **private** and proprietary. All rights reserved. Unauthorized copying, distribution, or modification of this software is strictly prohibited.