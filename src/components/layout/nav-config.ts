import {
  Activity,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  Package,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"

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
        href: "/app/general/dashboard",
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
        id: "reports",
        title: "Báo cáo sức khỏe",
        shortTitle: "Báo cáo",
        href: "/app/general/reports",
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
        id: "packages-catalog",
        title: "Gói Dịch vụ Chăm sóc",
        shortTitle: "Gói khám",
        href: "/app/general/packages/catalog",
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
        href: "/app/general/afib-history",
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
        id: "consultations",
        title: "Tư vấn sức khỏe",
        shortTitle: "Tư vấn",
        href: "/app/general/consultations",
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
        href: "/app/general/care-history",
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
        href: "/app/general/profile",
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
        href: "/app/management/users",
        icon: Users,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "care-service-packages",
        title: "Gói dịch vụ chăm sóc",
        shortTitle: "Gói DV",
        href: "/app/management/packages",
        icon: Package,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "health-records-management",
        title: "Hồ sơ sức khỏe bệnh nhân",
        shortTitle: "Hồ sơ bệnh",
        href: "/app/management/health-records",
        icon: Activity,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "needs-actions",
        title: "Hàng đợi Xử lý (Needs Action)",
        shortTitle: "Hàng đợi",
        href: "/app/management/needs-actions",
        icon: ListTodo,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
      },
      {
        id: "business-audit",
        title: "Nhật ký Kiểm toán (Audit)",
        shortTitle: "Kiểm toán",
        href: "/app/management/audit",
        icon: ShieldCheck,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.CARE_COORDINATOR],
      },
      {
        id: "doctor-consultations",
        title: "Phiên khám Bác sĩ",
        shortTitle: "Phiên khám",
        href: "/app/management/doctor/consultations",
        icon: MessagesSquare,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.DOCTOR],
      },
    ],
  },
]



/**
 * Xác định pathname có thuộc phân hệ Quản trị (Management) hay không.
 * Cấu trúc route mới gom toàn bộ trang quản trị dưới /app/management
 * nên chỉ cần 1 phép so tiền tố — hết sạch lớp bug va chạm tiền tố cũ.
 */
export function isManagementPath(pathname: string): boolean {
  return pathname.startsWith("/app/management")
}
