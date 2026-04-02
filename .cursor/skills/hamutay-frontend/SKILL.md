---
name: hamutay-frontend
description: Use when changing routes, adding portal or school admin screens, or integrating with the Hamutay API in this Vite + React app.
---

# Hamutay frontend (Vite + React)

## Stack

- **Vite 8**, **React 19**, **React Router 7** (`react-router-dom`).
- **Package manager:** **pnpm** (see `packageManager` in `package.json`). Before `pnpm install`, run `pnpm run validate:pm` so global `ignore-scripts` / Yarn `enableScripts` are not blocking lifecycle scripts.
- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`.
- TypeScript: `tsconfig.json`, env types in `src/vite-env.d.ts`.
- Human docs: **`docs/index.md`**, **`docs/architecture.md`**, **`docs/setup.md`**.

## Layout

- `src/pages/` — top-level screens (`Landing`, `Login`, `Dashboard`, `SchoolDashboard`, `SelectSchool`, `SchoolPortal`).
- `src/pages/modules/` — feature modules embedded in dashboards (users, schools, roles, academic structure, plans).
- `src/components/` — shared UI (`PlatformTable`, `ProtectedRoute`, `StorageImage`).
- `ProtectedRoute` wraps private routes; auth uses `localStorage` (`token`, `user`) and sometimes `sessionStorage` (`pending_login` for school selection).

## Routes (see `src/App.tsx`)

- Public with layout: `/`, `/login`.
- Semi-public: `/select-school` (expects `sessionStorage` data from login).
- Platform admin (protected): `/dashboard`, `/dashboard/schools/:id`.
- School portal (protected): `/school-portal`.

## Config and API

- All API base URLs come from `src/config.ts`: `API_URL`, `APP_URL`.
- Override with Vite env: `VITE_API_URL`, `VITE_APP_URL` (optional; defaults to localhost in dev).

## UI copy

- User-facing strings in the UI are in **Spanish** unless you are explicitly localizing.

## When implementing features

- Prefer existing patterns: inline styles and Lucide icons match the current codebase.
- New API calls: use `API_URL` from config and `Authorization: Bearer` from `localStorage.getItem('token')` where other modules do.
