/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react"
import { Navigate, createBrowserRouter, useLocation } from "react-router-dom"

import { GlobalErrorBoundary } from "@/components/custom/GlobalErrorBoundary"
import { LazyElement } from "@/components/custom/LazyElement"
import { GuestOnlyRoute } from "@/pages/commons/GuestOnlyRoute"
import { ProtectedRoute } from "@/pages/commons/ProtectedRoute"

import { USER_ROLES } from "@/constants"

const AppLayout = lazy(() => import("@/pages/app/app-layout"))
const DashboardPage = lazy(() => import("@/pages/app/general/dashboard"))
const AfibHistoryPage = lazy(() => import("@/pages/app/general/afib-history"))
const ReportsPage = lazy(() => import("@/pages/app/general/reports"))
const CareHistoryPage = lazy(() => import("@/pages/app/general/care-history"))
const PackageCatalogPage = lazy(() => import("@/pages/app/general/packages"))
const ProfilePage = lazy(() => import("@/pages/app/general/profile"))
const ConsultationsPage = lazy(() => import("@/pages/app/general/consultations"))
const PaymentResultPage = lazy(() => import("@/pages/app/general/payment-result"))

const ManagementPage = lazy(() => import("@/pages/app/management/hub"))
const UserManagementPage = lazy(() => import("@/pages/app/management/users"))
const AdminPackagesPage = lazy(() => import("@/pages/app/management/packages"))
const AdminHealthRecordsPage = lazy(() => import("@/pages/app/management/health-records"))
const NeedsActionsPage = lazy(() => import("@/pages/app/management/needs-actions"))
const BusinessAuditPage = lazy(() => import("@/pages/app/management/audit"))
const DoctorSessionsPage = lazy(() => import("@/pages/app/management/doctor-consultations"))

const LandingPage = lazy(() => import("@/pages/public/landing"))
const LoginPage = lazy(() => import("@/pages/public/login"))
const ForgotPasswordPage = lazy(() => import("@/pages/public/forgot-password"))
const TermsPage = lazy(() => import("@/pages/public/terms"))

/** Redirect giữ nguyên query string (quan trọng với URL PayOS trả về). */
function RedirectPreserveQuery({ to }: { to: string }) {
  const location = useLocation()
  return <Navigate to={{ pathname: to, search: location.search }} replace />
}

const wrap = (node: React.ReactNode) => <LazyElement>{node}</LazyElement>

/**
 * CẤU TRÚC ROUTE
 * ==============
 * /                    Landing (public)
 * /terms               Điều khoản (public)
 * /login, /register... GuestOnly (đã đăng nhập thì đá về app)
 * /app                 Yêu cầu đăng nhập (ProtectedRoute + MemberLayout)
 *   /app/general/*     Phân hệ NGƯỜI DÙNG — mọi role đăng nhập đều vào được
 *   /app/management/*  Phân hệ QUẢN TRỊ — gác quyền 1 lần ở cổng này
 *                      (SUPER_ADMIN / ADMIN / CARE_COORDINATOR / DOCTOR),
 *                      từng trang con siết thêm nếu cần
 * Cuối file: các redirect từ đường dẫn cũ (bookmark, link PayOS...) về đường mới.
 */
export const router = createBrowserRouter([
  // ---------- PUBLIC ----------
  {
    path: "/",
    errorElement: <GlobalErrorBoundary />,
    element: wrap(<LandingPage />),
  },
  {
    path: "/terms",
    errorElement: <GlobalErrorBoundary />,
    element: wrap(<TermsPage />),
  },
  {
    path: "/terms-and-conditions",
    errorElement: <GlobalErrorBoundary />,
    element: wrap(<TermsPage />),
  },

  // ---------- GUEST ONLY ----------
  {
    errorElement: <GlobalErrorBoundary />,
    element: <GuestOnlyRoute />,
    children: [
      { path: "/login", element: wrap(<LoginPage />) },
      { path: "/register", element: wrap(<LoginPage />) },
      { path: "/forgot-password", element: wrap(<ForgotPasswordPage />) },
      { path: "/forgot-password/verify", element: wrap(<ForgotPasswordPage />) },
      { path: "/reset-password", element: wrap(<ForgotPasswordPage />) },
    ],
  },

  // ---------- APP (yêu cầu đăng nhập) ----------
  {
    path: "/app",
    errorElement: <GlobalErrorBoundary />,
    element: (
      <ProtectedRoute>
        <LazyElement>
          <AppLayout />
        </LazyElement>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/app/general/dashboard" replace /> },

      // ----- PHÂN HỆ NGƯỜI DÙNG -----
      {
        path: "general",
        children: [
          { index: true, element: <Navigate to="/app/general/dashboard" replace /> },
          { path: "dashboard", element: wrap(<DashboardPage />) },
          { path: "afib-history", element: wrap(<AfibHistoryPage />) },
          { path: "reports", element: wrap(<ReportsPage />) },
          { path: "care-history", element: wrap(<CareHistoryPage />) },
          { path: "packages/catalog", element: wrap(<PackageCatalogPage />) },
          { path: "profile", element: wrap(<ProfilePage />) },
          {
            path: "consultations",
            children: [
              { index: true, element: wrap(<ConsultationsPage />) },
              { path: "payment/result", element: wrap(<PaymentResultPage />) },
              { path: "payment/cancel", element: wrap(<PaymentResultPage />) },
            ],
          },
        ],
      },

      // ----- PHÂN HỆ QUẢN TRỊ (gác quyền tại cổng) -----
      {
        path: "management",
        element: (
          <ProtectedRoute
            allowedRoles={[
              USER_ROLES.SUPER_ADMIN,
              USER_ROLES.ADMIN,
              USER_ROLES.CARE_COORDINATOR,
              USER_ROLES.DOCTOR,
            ]}
          />
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute
                allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}
              >
                {wrap(<ManagementPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "users",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}>
                {wrap(<UserManagementPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "packages",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}>
                {wrap(<AdminPackagesPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "health-records",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]}>
                {wrap(<AdminHealthRecordsPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "needs-actions",
            element: (
              <ProtectedRoute
                allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}
              >
                {wrap(<NeedsActionsPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "audit",
            element: (
              <ProtectedRoute
                allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR]}
              >
                {wrap(<BusinessAuditPage />)}
              </ProtectedRoute>
            ),
          },
          {
            path: "doctor/consultations",
            element: (
              <ProtectedRoute allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR]}>
                {wrap(<DoctorSessionsPage />)}
              </ProtectedRoute>
            ),
          },
        ],
      },

      // GIỮ TẠM 2 redirect thanh toán: PayOS quay về theo env PAYMENT_RETURN_URL /
      // PAYMENT_CANCEL_URL cấu hình trên server Core — có thể còn trỏ đường cũ.
      // Sau khi đổi 2 env đó sang /app/general/consultations/payment/... thì xóa nốt.
      {
        path: "consultations/payment/result",
        element: <RedirectPreserveQuery to="/app/general/consultations/payment/result" />,
      },
      {
        path: "consultations/payment/cancel",
        element: <RedirectPreserveQuery to="/app/general/consultations/payment/cancel" />,
      },
    ],
  },
])
