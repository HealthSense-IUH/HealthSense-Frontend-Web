import {
  Activity,
  AlertTriangle,
  Building2,
  FileText,
  History,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Watch,
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
  subItems?: Omit<NavigationItem, "icon" | "subItems">[]
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
          USER_ROLES.CARE_COORDINATOR,
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
        id: "care-service-packages",
        title: "Care Service Packages",
        href: "/app/packages",
        icon: Package,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "health-records-management",
        title: "Health Records",
        href: "/app/health-records",
        icon: Activity,
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
      {
        id: "doctor-consultations",
        title: "Phiên chăm sóc",
        href: "/app/doctor/consultations",
        icon: MessagesSquare,
        allowedRoles: [USER_ROLES.DOCTOR],
      },
      {
        id: "consultations",
        title: "Consultations",
        href: "/app/consultations",
        icon: MessagesSquare,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
        subItems: [
          {
            id: "consultations-records",
            title: "My Health Records",
            href: "/app/consultations?tab=records",
            allowedRoles: [USER_ROLES.MEMBER],
          },
          {
            id: "consultations-create-request",
            title: "Create Request",
            href: "/app/consultations?tab=create-request",
            allowedRoles: [USER_ROLES.MEMBER],
          },
          {
            id: "consultations-my-requests",
            title: "My Requests",
            href: "/app/consultations?tab=my-requests",
            allowedRoles: [USER_ROLES.MEMBER],
          },
          {
            id: "consultations-admin-requests",
            title: "Requests Management",
            href: "/app/consultations?tab=admin-requests",
            allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
          },
          {
            id: "consultations-create-session",
            title: "Create Session",
            href: "/app/consultations?tab=create-session",
            allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
          },
          {
            id: "consultations-sessions",
            title: "Sessions Management",
            href: "/app/consultations?tab=sessions",
            allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
          },
          {
            id: "consultations-my-sessions",
            title: "My Consultations",
            href: "/app/consultations?tab=sessions",
            allowedRoles: [USER_ROLES.DOCTOR, USER_ROLES.MEMBER],
          },
          {
            id: "consultations-chat",
            title: "Chat Room",
            href: "/app/consultations?tab=chat",
            allowedRoles: [USER_ROLES.DOCTOR, USER_ROLES.MEMBER],
          },
        ],
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
