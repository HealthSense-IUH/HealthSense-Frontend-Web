import { lazy } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/custom/GlobalErrorBoundary"
import { LazyElement } from "@/components/custom/LazyElement"
import { GuestOnlyRoute } from "@/pages/commons/GuestOnlyRoute"
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute"

const AppRoutesPage = lazy(() => import("@/pages/app-routes-page"))
const DashboardPage = lazy(() => import("@/pages/app-routes-page/dashboard-page"))
const ManagementPage = lazy(() => import("@/pages/app-routes-page/management-page"))
const LandingPage = lazy(() => import("@/pages/public-routes-page/landing-page"))
const LoginPage = lazy(() => import("@/pages/public-routes-page/login-page"))
const RegisterPage = lazy(() => import("@/pages/public-routes-page/register-page"))

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <LazyElement>
        <LandingPage />
      </LazyElement>
    ),
  },
  {
    errorElement: <GlobalErrorBoundary />,
    element: <GuestOnlyRoute />,
    children: [
      {
        path: "/login",
        element: (
          <LazyElement>
            <LoginPage />
          </LazyElement>
        ),
      },
      {
        path: "/register",
        element: (
          <LazyElement>
            <RegisterPage />
          </LazyElement>
        ),
      },
    ],
  },
  {
    path: "/app",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <LazyElement>
          <AppRoutesPage />
        </LazyElement>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <LazyElement>
            <DashboardPage />
          </LazyElement>
        ),
      },
      {
        path: "management",
        element: (
          <LazyElement>
            <ManagementPage />
          </LazyElement>
        ),
      },
    ],
  },
  {
    path: "/general",
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: "/management",
    element: <Navigate to="/app/management" replace />,
  },
])
