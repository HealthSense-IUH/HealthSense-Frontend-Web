import { lazy } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/custom/GlobalErrorBoundary"
import { LazyElement } from "@/components/custom/LazyElement"
import { GuestOnlyRoute } from "@/pages/commons/GuestOnlyRoute"
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute"

const MemberLayout = lazy(() => import("@/pages/member"))
const DashboardPage = lazy(() => import("@/pages/member/dashboard"))
const WorkoutsPage = lazy(() => import("@/pages/member/workouts"))
const AfibHistoryPage = lazy(() => import("@/pages/member/afib-history"))
const ReportsPage = lazy(() => import("@/pages/member/reports"))
const SleepPage = lazy(() => import("@/pages/member/sleep"))

const ManagementPage = lazy(() => import("@/pages/admin/management-page"))
const LandingPage = lazy(() => import("@/pages/public/landing-page"))
const LoginPage = lazy(() => import("@/pages/auth/login-page"))
const RegisterPage = lazy(() => import("@/pages/auth/register-page"))

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
          <MemberLayout />
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
        path: "workouts",
        element: (
          <LazyElement>
            <WorkoutsPage />
          </LazyElement>
        ),
      },
      {
        path: "afib-history",
        element: (
          <LazyElement>
            <AfibHistoryPage />
          </LazyElement>
        ),
      },
      {
        path: "reports",
        element: (
          <LazyElement>
            <ReportsPage />
          </LazyElement>
        ),
      },
      {
        path: "sleep",
        element: (
          <LazyElement>
            <SleepPage />
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

