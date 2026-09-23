import {
  Activity,
  Coins,
  FileText,
  HeartPulse,
  LayoutDashboard,
  MessagesSquare,
  Stethoscope,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"

export interface NavigationItem {
  id: string
  /** Nhan tieng Viet goc — dung lam ban du phong khi thieu ban dich. */
  title: string
  shortTitle?: string
  /** Khoa i18n: nav.item.<id> / nav.short.<id>. Sidebar tu dich qua useNavLabel(). */
  titleKey?: string
  shortTitleKey?: string
  href: string
  icon: LucideIcon
  allowedRoles: UserRole[]
  badge?: string | number
  exact?: boolean
  subItems?: Omit<NavigationItem, "icon" | "subItems">[]
}

export interface NavigationGroup {
  id: string
  /** Nhan tieng Viet goc — ban du phong. */
  title: string
  /** Khoa i18n: nav.group.<id>. */
  titleKey?: string
  items: NavigationItem[]
}

export const allNavigationGroups: NavigationGroup[] = [
  // 1. Phân hệ Quản trị hệ thống (Chỉ dành cho ADMIN / SUPER_ADMIN)
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
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
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
        id: "admin-credit-operations",
        title: "Quản lý lượt tư vấn",
        shortTitle: "Lượt tư vấn",
        href: "/app/management/credit-operations",
        icon: Coins,
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
    ],
  },

  // 2. Phân hệ Bác sĩ chuyên khoa (Chỉ dành cho DOCTOR)
  {
    id: "doctor-main",
    title: "Phiên khám Bác sĩ",
    items: [
      {
        id: "doctor-consultations",
        title: "Quản lý phiên khám",
        shortTitle: "Phiên khám",
        href: "/app/management/doctor/consultations",
        icon: Stethoscope,
        allowedRoles: [USER_ROLES.DOCTOR],
      },
    ],
  },

  // 3. Phân hệ Hội viên / Người dùng (Chỉ dành cho MEMBER)
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
        allowedRoles: [USER_ROLES.MEMBER],
        exact: true,
      },
      {
        id: "reports",
        title: "Báo cáo sức khỏe",
        shortTitle: "Báo cáo",
        href: "/app/general/reports",
        icon: FileText,
        allowedRoles: [USER_ROLES.MEMBER],
      },
    ],
  },

  // 4. Theo dõi sức khỏe cá nhân & Tư vấn (MEMBER + Điều phối/Admin)
  {
    id: "general-health",
    title: "Sức khỏe cá nhân",
    items: [
      {
        id: "afib-history",
        title: "Lịch sử đo",
        shortTitle: "Lịch sử đo",
        href: "/app/general/afib-history",
        icon: HeartPulse,
        allowedRoles: [USER_ROLES.MEMBER],
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
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },

  // 5. Tài khoản chung cho tất cả các vai trò
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
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },
]

// Giữ lại alias để tương thích ngược nếu có file khác import
export const generalNavigationGroups = allNavigationGroups
export const managementNavigationGroups = allNavigationGroups

/**
 * Xác định pathname có thuộc phân hệ Quản trị (Management) hay không.
 */
export function isManagementPath(pathname: string): boolean {
  return pathname.startsWith("/app/management")
}

