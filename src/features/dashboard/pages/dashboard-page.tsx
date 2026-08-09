import { Navigate } from "react-router-dom"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/types/authentication"
import { SuperAdminDashboard } from "../components/super-admin-dashboard"
import { PlaceholderDashboard } from "../components/placeholder-dashboard"

export function DashboardPage() {
  const { effectiveRole } = useAppShell()

  switch (effectiveRole) {
    case USER_ROLES.SUPER_ADMIN:
      return <SuperAdminDashboard />
    case USER_ROLES.ADMIN:
      return <PlaceholderDashboard role={USER_ROLES.ADMIN} />
    case USER_ROLES.CARE_COORDINATOR:
      return <PlaceholderDashboard role={USER_ROLES.CARE_COORDINATOR} />
    case USER_ROLES.DOCTOR:
      return <PlaceholderDashboard role={USER_ROLES.DOCTOR} />
    case USER_ROLES.MEMBER:
      return <PlaceholderDashboard role={USER_ROLES.MEMBER} />
    default:
      return <Navigate to="/unauthorized" replace />
  }
}

export default DashboardPage
