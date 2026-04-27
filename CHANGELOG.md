# Changelog

All notable changes to the Well Management SPA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-01

### Added

- **Well List Grid** — Main data grid displaying all wells with columns for Status, Rig, Well Name, Well ID, Spud Date, Operator, Contractor, and Actions.
- **Column Filtering** — Real-time, case-insensitive partial-string filter inputs on Status, Rig, Well Name, Well ID, Operator, and Contractor columns with a Clear Filters button.
- **Column Sorting** — Sortable column headers with ascending/descending toggle and visual arrow indicators; active wells are pinned to the top of results regardless of sort order.
- **Pagination** — Pagination footer with First, Previous, page number buttons, Next, and Last controls; configurable page size selector (10, 25, 50 rows per page) that resets to page 1 on change.
- **localStorage Persistence** — All well data persisted to `localStorage` under the `wells` key; automatic mock data seeding on first load or when storage is empty/corrupted.
- **Mock Data Seeding** — 12 pre-defined wells across multiple rigs (CYC36, SPR-12, NPE-07, AGL-03, RMR-19) with varied statuses for demonstration of filtering, sorting, and pagination.
- **Activation Modal** — Confirmation dialog for well activation with two scenarios:
  - Simple confirmation when no conflict exists on the target rig.
  - Conflict warning displaying both the currently active well (to be demoted) and the well to be activated when another active well exists on the same rig.
- **Single-Active-Well-Per-Rig Enforcement** — Business rule ensuring only one well per rig can be active at a time; activating a new well automatically demotes the previously active well to inactive status.
- **Create Well Flow** — Form at `/wells/create` with Well Setup and Rig Setup collapsible sections, required field validation (Well Name, Spud Date, Operator, Rig Name, Contractor), and auto-generated UUID on submission.
- **Edit Well Flow** — Form at `/wells/:id/edit` pre-populated with existing well data; Well Setup section expanded and Rig Setup section collapsed by default; Well ID displayed as read-only.
- **View Well Details** — Read-only detail view at `/wells/:id` displaying all well fields in a card layout with a Back to Wells navigation button.
- **Client-Side Routing** — React Router v6 with `createBrowserRouter` supporting routes for well list (`/wells`), create (`/wells/create`), create sidetrack (`/wells/create-sidetrack`), view details (`/wells/:id`), edit (`/wells/:id/edit`), and a 404 Not Found page.
- **Dark Theme UI** — Full dark theme built with Tailwind CSS using custom color tokens (`dark-bg`, `dark-surface`, `dark-border`, `dark-accent`, `dark-link`) applied across all components.
- **Status Badges** — Color-coded status indicators with animated ping effect for active wells (emerald for active, red for inactive, blue for created).
- **Accessibility Compliance** — ARIA attributes throughout (`aria-modal`, `aria-labelledby`, `aria-sort`, `aria-expanded`, `aria-label`, `aria-required`, `aria-invalid`), focus trap in activation modal, keyboard navigation support (Escape to close, Tab/Shift+Tab focus cycling), and semantic HTML structure.
- **Responsive Layout** — Application shell with header navigation, responsive grid layouts using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`), and mobile-friendly table with horizontal scroll.
- **Form Validation** — Client-side validation with inline error messages, automatic expansion of collapsed sections containing errors, and error clearing on field input.
- **Reusable Components** — Modular component architecture including `SortableHeader`, `FilterInput`, `StatusBadge`, `PaginationControls`, `WellRow`, `ActivationModal`, `WellSetupSection`, `RigSetupSection`, `Layout`, and `NotFound`.
- **Custom React Hooks** — `useWells` for CRUD state management, `useFilters` for grid filtering, `useSorting` for column sort state with active-well pinning, and `usePagination` for pagination state and navigation.
- **Storage Service Layer** — `wellStorageService` providing `getAllWells`, `getWellById`, `createWell`, `updateWell`, `activateWell`, `deleteWell`, `seedMockDataIfEmpty`, and `resetToMockData` with input validation and custom `WellStorageError` class.
- **Test Suite** — Unit and integration tests using Vitest, React Testing Library, and `@testing-library/user-event` covering storage service operations, activation modal behavior, well form create/edit flows, and well grid interactions.
- **Vercel Deployment Configuration** — `vercel.json` with SPA rewrite rules for client-side routing support.