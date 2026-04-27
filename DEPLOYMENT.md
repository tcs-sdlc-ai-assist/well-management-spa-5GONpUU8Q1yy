# Deployment Guide

This document covers deployment of the Well Management SPA to Vercel, including build configuration, SPA routing, environment variables, and CI/CD integration with GitHub Actions.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Vercel Deployment](#vercel-deployment)
  - [Automatic Deployment via GitHub](#automatic-deployment-via-github)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Environment Variables](#environment-variables)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) v9 or later
- A [Vercel](https://vercel.com/) account
- A GitHub repository connected to Vercel (for automatic deployments)

---

## Build Configuration

The project uses [Vite](https://vitejs.dev/) as the build tool. The relevant configuration lives in `vite.config.js`:

| Setting        | Value   |
| -------------- | ------- |
| Build command  | `vite build` |
| Output directory | `dist` |
| Dev server port | `3000` |
| Source maps    | Enabled |

### Build Locally

```bash
# Install dependencies
npm install

# Run the production build
npm run build
```

The compiled assets are written to the `dist/` directory. You can preview the production build locally:

```bash
npm run preview
```

### Run Tests

```bash
# Single run
npm test

# Watch mode
npm run test:watch
```

---

## Vercel Deployment

### Automatic Deployment via GitHub

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the GitHub repository containing this project.
3. Vercel auto-detects the Vite framework. Confirm the following settings:

   | Setting            | Value        |
   | ------------------ | ------------ |
   | Framework Preset   | Vite         |
   | Build Command      | `npm run build` |
   | Output Directory   | `dist`       |
   | Install Command    | `npm install`|

4. Add any required environment variables (see [Environment Variables](#environment-variables)).
5. Click **Deploy**.

Once connected, every push to the `main` branch triggers a production deployment. Pull requests automatically receive preview deployments.

### Manual Deployment via Vercel CLI

```bash
# Install the Vercel CLI globally
npm install -g vercel

# Log in to your Vercel account
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### SPA Rewrite Configuration

Client-side routing with React Router requires all paths to resolve to `index.html`. The `vercel.json` file at the project root handles this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that routes such as `/wells`, `/wells/create`, `/wells/:id`, and `/wells/:id/edit` are served by the SPA entry point rather than returning a 404 from the hosting platform.

> **Note:** This file is already included in the repository. No additional configuration is needed.

---

## Environment Variables

Environment variables are managed through `.env` files locally and through the Vercel dashboard for deployed environments.

| Variable           | Description                  | Default            | Required |
| ------------------ | ---------------------------- | ------------------ | -------- |
| `VITE_APP_TITLE`   | Application title shown in the UI | `Well Management` | No       |

### Local Development

Create a `.env` file in the project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

Edit `.env` as needed:

```
VITE_APP_TITLE=Well Management
```

All client-side environment variables **must** be prefixed with `VITE_` to be exposed to the application via `import.meta.env.VITE_*`.

### Vercel Dashboard

1. Navigate to your project in the Vercel dashboard.
2. Go to **Settings** → **Environment Variables**.
3. Add each variable with the appropriate scope:
   - **Production** — applied to production deployments
   - **Preview** — applied to pull request preview deployments
   - **Development** — applied when using `vercel dev`

> **Important:** Never commit `.env` files containing secrets to version control. The `.gitignore` file already excludes `.env`, `.env.local`, and `.env.*.local`.

---

## CI/CD with GitHub Actions

Below is a recommended GitHub Actions workflow for running tests and deploying to Vercel on every push.

Create `.github/workflows/ci.yml` in your repository:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    name: Deploy to Vercel
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build with Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets

Add the following secrets in your GitHub repository under **Settings** → **Secrets and variables** → **Actions**:

| Secret              | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Personal access token from [Vercel Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | Found in `.vercel/project.json` after running `vercel link`                 |
| `VERCEL_PROJECT_ID` | Found in `.vercel/project.json` after running `vercel link`                 |

To obtain `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, run `vercel link` locally and inspect the generated `.vercel/project.json` file.

> **Alternative:** If you have Vercel's GitHub integration enabled, Vercel automatically deploys on push without the deploy job above. In that case, you only need the `test` job to gate deployments — Vercel will not deploy if the GitHub check fails when branch protection rules are configured.

---

## Troubleshooting

### 404 on page refresh

Ensure `vercel.json` contains the SPA rewrite rule. Without it, Vercel returns a 404 for any route other than `/index.html`.

### Environment variables not available

- Verify the variable is prefixed with `VITE_`.
- Restart the dev server after changing `.env` files — Vite does not hot-reload environment variables.
- On Vercel, confirm the variable is set for the correct environment scope (Production, Preview, or Development).

### Build fails on Vercel

- Check that `npm run build` succeeds locally before pushing.
- Ensure the Node.js version on Vercel matches your local version (set in **Settings** → **General** → **Node.js Version**).
- Review the Vercel build logs for specific error messages.

### Tests fail in CI

- Run `npm test` locally to reproduce the failure.
- The test suite uses `jsdom` as the environment. Ensure `vitest.config.js` has `environment: 'jsdom'` and `setupFiles: './src/setupTests.js'`.
- If tests depend on `localStorage`, they should clear storage in `beforeEach`/`afterEach` hooks to avoid state leakage between tests.