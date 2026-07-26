import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Watch,
  Building2,
  FileText,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react"

import { USER_ROLES, type UserRole } from "@/types/authentication"

export interface NavigationItem {
  id: string
  title: string
  href: string
  icon: LucideIcon
  allowedRoles: UserRole[]
  badge?: string | number
  exact?: boolean
}

export interface NavigationGroup {
  id: string
  title: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/app/dashboard",
        icon: LayoutDashboard,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
        exact: true,
      },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      {
        id: "user-management",
        title: "User Management",
        href: "/app/users",
        icon: Users,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "admin-management",
        title: "Administrators",
        href: "/app/admins",
        icon: ShieldCheck,
        allowedRoles: [USER_ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    id: "healthcare",
    title: "Healthcare",
    items: [
      {
        id: "health-monitoring",
        title: "Health Monitoring",
        href: "/app/monitoring",
        icon: Activity,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR, USER_ROLES.MEMBER],
      },
      {
        id: "medical-alerts",
        title: "Medical Alerts",
        href: "/app/alerts",
        icon: AlertTriangle,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR, USER_ROLES.MEMBER],
        badge: "8",
      },
      {
        id: "wearable-devices",
        title: "Wearable Devices",
        href: "/app/devices",
        icon: Watch,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR, USER_ROLES.MEMBER],
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        id: "organizations",
        title: "Organizations",
        href: "/app/organizations",
        icon: Building2,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "reports",
        title: "Reports",
        href: "/app/reports",
        icon: FileText,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.DOCTOR],
      },
      {
        id: "audit-logs",
        title: "Audit Logs",
        href: "/app/audit-logs",
        icon: History,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "system-settings",
        title: "System Settings",
        href: "/app/settings",
        icon: Settings,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },
]

export function findNavigationItemByPath(pathname: string): { item: NavigationItem | undefined; group: NavigationGroup | undefined } {
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.href === pathname || (pathname.startsWith(item.href) && item.href !== "/app/dashboard")) {
        return { item, group }
      }
    }
  }
  return { item: undefined, group: undefined }
}
