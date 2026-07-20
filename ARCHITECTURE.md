# HealthSense Frontend Structure

This project follows the same route-first shape as the PingMe frontend.

## Folder Map

```text
src/
  App.tsx               Root React component
  app/                  App-level providers and bootstrapping helpers
  router/               React Router route declarations
  assets/               Source assets imported by React components
  components/
    ui/                 shadcn/ui generated primitives
    layout/             App shells, navigation, sidebars
    custom/             App utility components such as loader and error boundary
    common/             Shared app components used by many features
  config/               Environment and runtime configuration
  constants/            Shared constants and route names
  features/
    auth/               Auth state/domain logic
  hooks/                Shared hooks used across multiple features
  lib/                  Shared libraries, axiosClient, and helpers
  pages/
    app-routes-page/    Protected app pages and app route layout
    public-routes-page/ Public pages such as landing, login, register
    commons/            Route guards and route-level shared helpers
  services/             API modules grouped by backend domain
  styles/               Global style modules besides index.css
  types/                TypeScript types grouped by backend domain
    base/               Shared ApiResponse, PageResponse, pagination contracts
  utils/                Shared pure utility functions
```

## Placement Rules

- Put route declarations in `src/router/index.tsx`.
- Put the root component in `src/App.tsx`.
- Put global providers in `src/app/providers.tsx`.
- Put shared layout shells in `src/components/layout`.
- Put route loaders/error boundaries in `src/components/custom`.
- Keep shadcn primitives in `src/components/ui`; do not edit their folder name because `components.json` points there.
- Put public screens in `src/pages/public-routes-page/<page-name>/index.tsx`.
- Put authenticated screens in `src/pages/app-routes-page/<page-name>/index.tsx`.
- Put route guards and route helpers in `src/pages/commons`.
- Put reusable UI in `src/components/common` only after it is needed by more than one page.
- Put API modules in `src/services/<domain>`.
- Put API/domain models in `src/types/<domain>`.
- Put shared response wrappers in `src/types/base`.
- Put state/domain logic in `src/features/<domain>`.
- Use the `@/` alias for imports from `src`.

## Current Features

- `src/pages/public-routes-page/landing-page`: public marketing/home page.
- `src/pages/public-routes-page/login-page`: login form.
- `src/pages/public-routes-page/register-page`: register form.
- `src/pages/app-routes-page/dashboard-page`: user health dashboard.
- `src/pages/app-routes-page/management-page`: admin/system management screen.
- `src/features/auth`: auth state.
- `src/services/authentication`: auth API calls.
- `src/types/authentication`: auth DTOs and API response types.
- `src/types/base`: shared `ApiResponse<T>`, `PageResponse<T>`, and pagination params.
- `src/components/custom/LazyElement`: Suspense wrapper for lazy route elements.
- `src/components/custom/GlobalErrorBoundary`: Router error boundary with chunk-load recovery.
- `src/utils/errorHandler`: shared API error parsing/logging utilities.

## Auth API Flow

- Backend base URL defaults to `http://localhost:8080`; override with `VITE_API_BASE_URL`.
- All auth requests use `withCredentials: true` so the browser carries HttpOnly `refresh-token` and `session-id` cookies.
- Web login uses `POST /api/auth/login`, not `POST /api/auth/mobile/login`.
- Register uses `POST /api/auth/register`.
- Current user uses `GET /api/auth/me` with `Authorization: Bearer <accessToken>`.
- Refresh uses `POST /api/auth/refresh` without a body.
- Logout uses `POST /api/auth/logout` without a body.
- Access token lives in memory through `useAuthStore`; `userSession` is mirrored to localStorage for UI restoration after reload.
- Axios performs single-flight refresh: if several private requests receive `401`, only one refresh request runs and the others wait before retrying.
- Login/register/refresh `401` responses are not retried to avoid loops.
