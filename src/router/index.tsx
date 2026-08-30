import { lazy } from "react"
import { Navigate, createBrowserRouter } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/custom/GlobalErrorBoundary"
import { LazyElement } from "@/components/custom/LazyElement"
import { GuestOnlyRoute } from "@/pages/commons/GuestOnlyRoute"
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute"

import { USER_ROLES } from "@/types/authentication"

const MemberLayout = lazy(() => import("@/pages/member"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/dashboard-page"))
const WorkoutsPage = lazy(() => import("@/pages/member/workouts"))
const AfibHistoryPage = lazy(() => import("@/pages/member/afib-history"))
const ReportsPage = lazy(() => import("@/pages/member/reports"))
const SleepPage = lazy(() => import("@/pages/member/sleep"))
const CareHistoryPage = lazy(() => import("@/features/care-history/pages/care-history-page"))
const PackageCatalogPage = lazy(() => import("@/features/care-service-packages/pages/package-catalog-page"))

const ManagementPage = lazy(() => import("@/pages/admin/management-page"))
const UserManagementPage = lazy(() => import("@/features/user-management/pages/user-management-page"))
const AdminHealthRecordsPage = lazy(() => import("@/features/admin-health-records/pages/admin-health-records-page"))
const AdminPackagesPage = lazy(() => import("@/features/care-service-packages/pages/admin-packages-page"))
const NeedsActionsPage = lazy(() => import("@/features/needs-actions/pages/needs-actions-page"))
const BusinessAuditPage = lazy(() => import("@/features/business-audit/pages/business-audit-page"))
const ConsultationsPage = lazy(() => import("@/features/consultations/pages/consultations-page"))
const PaymentResultPage = lazy(() => import("@/features/consultations/pages/payment-result-page"))
const DoctorSessionsPage = lazy(() => import("@/features/consultations/pages/doctor-sessions-page"))
const ProfilePage = lazy(() => import("@/features/profile/pages/profile-page"))
const LandingPage = lazy(() => import("@/pages/public/landing-page"))
const LoginPage = lazy(() => import("@/pages/public/login-page"))
const ForgotPasswordPage = lazy(() => import("@/features/forgot-password/pages/forgot-password-page"))
const TermsPage = lazy(() => import("@/pages/public/terms-page"))

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
    path: "/terms",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <LazyElement>
        <TermsPage />
      </LazyElement>
    ),
  },
  {
    path: "/terms-and-conditions",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <LazyElement>
        <TermsPage />
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
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
                <LazyElement>
                  <ManagementPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "users",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}>
                <LazyElement>
                  <UserManagementPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "packages",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
                <LazyElement>
                  <AdminPackagesPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "health-records",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
                <LazyElement>
                  <AdminHealthRecordsPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "doctor/consultations",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR]}>
                <LazyElement>
                  <DoctorSessionsPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "needs-actions",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
                <LazyElement>
                  <NeedsActionsPage />
                </LazyElement>
              </ProtectedRoute>
            ),
          },
          {
            path: "audit",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
                <LazyElement>
                  <BusinessAuditPage />
                </LazyElement>
              </ProtectedRoute>
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
            path: "care-history",
            element: (
              <LazyElement>
                <CareHistoryPage />
              </LazyElement>
            ),
          },
          {
            path: "packages/catalog",
            element: (
              <LazyElement>
                <PackageCatalogPage />
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
        path: "care-history",
        element: (
          <LazyElement>
            <CareHistoryPage />
          </LazyElement>
        ),
      },
      {
        path: "packages/catalog",
        element: (
          <LazyElement>
            <PackageCatalogPage />
          </LazyElement>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}>
            <LazyElement>
              <UserManagementPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },
      {
        path: "packages",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
            <LazyElement>
              <AdminPackagesPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },
      {
        path: "health-records",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
            <LazyElement>
              <AdminHealthRecordsPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },
      {
        path: "doctor/consultations",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR]}>
            <LazyElement>
              <DoctorSessionsPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },
      {
        path: "needs-actions",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
            <LazyElement>
              <NeedsActionsPage />
            </LazyElement>
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}>
            <LazyElement>
              <BusinessAuditPage />
            </LazyElement>
          </ProtectedRoute>
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
