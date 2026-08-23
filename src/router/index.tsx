import { lazy } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/custom/GlobalErrorBoundary"
import { LazyElement } from "@/components/custom/LazyElement"
import { GuestOnlyRoute } from "@/pages/commons/GuestOnlyRoute"
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute"

const MemberLayout = lazy(() => import("@/pages/member"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/dashboard-page"))
const WorkoutsPage = lazy(() => import("@/pages/member/workouts"))
const AfibHistoryPage = lazy(() => import("@/pages/member/afib-history"))
const ReportsPage = lazy(() => import("@/pages/member/reports"))
const SleepPage = lazy(() => import("@/pages/member/sleep"))

const ManagementPage = lazy(() => import("@/pages/admin/management-page"))
const UserManagementPage = lazy(() => import("@/features/user-management/pages/user-management-page"))
const AdminHealthRecordsPage = lazy(() => import("@/features/admin-health-records/pages/admin-health-records-page"))
const AdminPackagesPage = lazy(() => import("@/features/care-service-packages/pages/admin-packages-page"))
const ConsultationsPage = lazy(() => import("@/features/consultations/pages/consultations-page"))
const PaymentResultPage = lazy(() => import("@/features/consultations/pages/payment-result-page"))
const DoctorSessionsPage = lazy(() => import("@/features/consultations/pages/doctor-sessions-page"))
const ProfilePage = lazy(() => import("@/features/profile/pages/profile-page"))
const LandingPage = lazy(() => import("@/pages/public/landing-page"))
const LoginPage = lazy(() => import("@/pages/public/login-page"))
const ForgotPasswordPage = lazy(() => import("@/features/forgot-password/pages/forgot-password-page"))

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
            <LoginPage />
          </LazyElement>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <LazyElement>
            <ForgotPasswordPage />
          </LazyElement>
        ),
      },
      {
        path: "/forgot-password/verify",
        element: (
          <LazyElement>
            <ForgotPasswordPage />
          </LazyElement>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <LazyElement>
            <ForgotPasswordPage />
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
        children: [
          {
            index: true,
            element: (
              <LazyElement>
                <ManagementPage />
              </LazyElement>
            ),
          },
          {
            path: "users",
            element: (
              <LazyElement>
                <UserManagementPage />
              </LazyElement>
            ),
          },
          {
            path: "packages",
            element: (
              <LazyElement>
                <AdminPackagesPage />
              </LazyElement>
            ),
          },
          {
            path: "health-records",
            element: (
              <LazyElement>
                <AdminHealthRecordsPage />
              </LazyElement>
            ),
          },
          {
            path: "doctor/consultations",
            element: (
              <LazyElement>
                <DoctorSessionsPage />
              </LazyElement>
            ),
          },
        ],
      },
      {
        path: "general",
        children: [
          {
            index: true,
            element: <Navigate to="/app/general/dashboard" replace />,
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
            path: "consultations",
            element: (
              <LazyElement>
                <ConsultationsPage />
              </LazyElement>
            ),
          },
          {
            path: "profile",
            element: (
              <LazyElement>
                <ProfilePage />
              </LazyElement>
            ),
          },
        ],
      },
      {
        path: "users",
        element: (
          <LazyElement>
            <UserManagementPage />
          </LazyElement>
        ),
      },
      {
        path: "packages",
        element: (
          <LazyElement>
            <AdminPackagesPage />
          </LazyElement>
        ),
      },
      {
        path: "health-records",
        element: (
          <LazyElement>
            <AdminHealthRecordsPage />
          </LazyElement>
        ),
      },
      {
        path: "doctor/consultations",
        element: (
          <LazyElement>
            <DoctorSessionsPage />
          </LazyElement>
        ),
      },
      {
        path: "consultations",
        children: [
          {
            index: true,
            element: (
              <LazyElement>
                <ConsultationsPage />
              </LazyElement>
            ),
          },
          {
            path: "payment/result",
            element: (
              <LazyElement>
                <PaymentResultPage />
              </LazyElement>
            ),
          },
          {
            path: "payment/cancel",
            element: (
              <LazyElement>
                <PaymentResultPage />
              </LazyElement>
            ),
          },
        ],
      },
      {
        path: "profile",
        element: (
          <LazyElement>
            <ProfilePage />
          </LazyElement>
        ),
      },
    ],
  },
  {
    path: "/general",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/app/general/dashboard" replace />,
  },
  {
    path: "/management",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/app/management" replace />,
  },
  {
    path: "/admin/users",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/app/users" replace />,
  },
  {
    path: "/admin/health-records",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/app/health-records" replace />,
  },
  {
    path: "/profile",
    errorElement: <GlobalErrorBoundary />,
    element: <Navigate to="/app/profile" replace />,
  },
])
