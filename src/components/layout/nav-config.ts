import {
  Activity,
  FileText,
  Flame,
  HeartPulse,
  History,
  LayoutDashboard,
  MessagesSquare,
  Moon,
  Package,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { USER_ROLES, type UserRole } from "@/types/authentication"

export interface NavigationItem {
  id: string
  title: string
  shortTitle?: string
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

// 1. Menu dành cho Người dùng bình thường / Hội viên (General Scope)
export const generalNavigationGroups: NavigationGroup[] = [
  {
    id: "general-overview",
    title: "Tổng quan",
    items: [
      {
        id: "dashboard",
        title: "Bảng điều khiển",
        shortTitle: "Tổng quan",
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
      {
        id: "packages-catalog",
        title: "Gói Dịch vụ Chăm sóc",
        shortTitle: "Gói khám",
        href: "/app/packages/catalog",
        icon: Package,
        allowedRoles: [
          USER_ROLES.MEMBER,
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
        ],
      },
    ],
  },
  {
    id: "general-health",
    title: "Sức khỏe cá nhân",
    items: [
      {
        id: "afib-history",
        title: "Tầm soát Rung nhĩ (AFib)",
        shortTitle: "Rung nhĩ",
        href: "/app/afib-history",
        icon: HeartPulse,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "sleep",
        title: "Theo dõi Giấc ngủ",
        shortTitle: "Giấc ngủ",
        href: "/app/sleep",
        icon: Moon,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "workouts",
        title: "Hoạt động & Luyện tập",
        shortTitle: "Tập luyện",
        href: "/app/workouts",
        icon: Flame,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "reports",
        title: "Báo cáo sức khỏe",
        shortTitle: "Báo cáo",
        href: "/app/reports",
        icon: FileText,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "consultations",
        title: "Tư vấn sức khỏe",
        shortTitle: "Tư vấn",
        href: "/app/consultations",
        icon: MessagesSquare,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "care-history",
        title: "Lịch sử Chăm sóc",
        shortTitle: "Lịch sử khám",
        href: "/app/care-history",
        icon: History,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },
  {
    id: "general-account",
    title: "Tài khoản",
    items: [
      {
        id: "profile",
        title: "Hồ sơ cá nhân",
        shortTitle: "Hồ sơ",
        href: "/app/profile",
        icon: User,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.CARE_COORDINATOR,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },
]

// 2. Menu dành cho Quản trị viên / Bác sĩ / Quản lý (Management Scope)
export const managementNavigationGroups: NavigationGroup[] = [
  {
    id: "management-main",
    title: "Quản trị hệ thống",
    items: [
      {
        id: "management-overview",
        title: "Bảng quản trị hệ thống",
        shortTitle: "Tổng quan",
        href: "/app/management",
        icon: LayoutDashboard,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
        exact: true,
      },
      {
        id: "user-management",
        title: "Quản lý người dùng",
        shortTitle: "Người dùng",
        href: "/app/users",
        icon: Users,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "care-service-packages",
        title: "Gói dịch vụ chăm sóc",
        shortTitle: "Gói DV",
        href: "/app/packages",
        icon: Package,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
      },
      {
        id: "health-records-management",
        title: "Hồ sơ sức khỏe bệnh nhân",
        shortTitle: "Hồ sơ bệnh",
        href: "/app/health-records",
        icon: Activity,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
      },
      {
        id: "doctor-consultations",
        title: "Phiên khám Bác sĩ",
        shortTitle: "Phiên khám",
        href: "/app/doctor/consultations",
        icon: MessagesSquare,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR],
      },
    ],
  },
]

// Fallback all navigation groups for breadcrumb matching
export const navigationGroups: NavigationGroup[] = [
  ...generalNavigationGroups,
  ...managementNavigationGroups,
]

export function findNavigationItemByPath(pathname: string): { item: NavigationItem | undefined; group: NavigationGroup | undefined } {
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.href === pathname || (pathname.startsWith(item.href) && item.href !== "/app/dashboard" && item.href !== "/app/management")) {
        return { item, group }
      }
    }
  }
  return { item: undefined, group: undefined }
}
