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
  SlidersHorizontal,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"

export interface NavigationItem {
  id: string
  /**
   * Nhan hien thi lay tu i18n theo id: common:nav.item.<id> / common:nav.short.<id> (xem useNavLabel()).
   * title/shortTitle chi la nhan du phong tuy chon khi thieu ban dich — de trong thi dung khoa i18n.
   */
  title?: string
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
  /** Nhan du phong tuy chon; nhan hien thi lay tu i18n: common:nav.group.<id>. */
  title?: string
  /** Khoa i18n: nav.group.<id>. */
  titleKey?: string
  items: NavigationItem[]
}

export const allNavigationGroups: NavigationGroup[] = [
  // 1. Phân hệ Quản trị hệ thống (Chỉ dành cho ADMIN / SUPER_ADMIN)
  {
    id: "management-main",
    items: [
      {
        id: "management-overview",
        href: "/app/management",
        icon: LayoutDashboard,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
        exact: true,
      },
      {
        id: "user-management",
        href: "/app/management/users",
        icon: Users,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "admin-credit-operations",
        href: "/app/management/credit-operations",
        icon: Coins,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "health-records-management",
        href: "/app/management/health-records",
        icon: Activity,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "nutrition-rules",
        href: "/app/management/nutrition-rules",
        icon: SlidersHorizontal,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
    ],
  },

  // 2. Phân hệ Bác sĩ chuyên khoa (Chỉ dành cho DOCTOR)
  {
    id: "doctor-main",
    items: [
      {
        id: "doctor-consultations",
        href: "/app/management/doctor/consultations",
        icon: Stethoscope,
        allowedRoles: [USER_ROLES.DOCTOR],
      },
    ],
  },

  // 3. Phân hệ Hội viên / Người dùng (Chỉ dành cho MEMBER)
  {
    id: "general-overview",
    items: [
      {
        id: "dashboard",
        href: "/app/general/dashboard",
        icon: LayoutDashboard,
        allowedRoles: [USER_ROLES.MEMBER],
        exact: true,
      },
      {
        id: "reports",
        href: "/app/general/reports",
        icon: FileText,
        allowedRoles: [USER_ROLES.MEMBER],
      },
    ],
  },

  // 4. Theo dõi sức khỏe cá nhân & Tư vấn (MEMBER + Điều phối/Admin)
  {
    id: "general-health",
    items: [
      {
        id: "afib-history",
        href: "/app/general/afib-history",
        icon: HeartPulse,
        allowedRoles: [USER_ROLES.MEMBER],
      },
      {
        id: "consultations",
        href: "/app/general/consultations",
        icon: MessagesSquare,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "nutrition",
        href: "/app/general/nutrition",
        icon: UtensilsCrossed,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.DOCTOR,
          USER_ROLES.MEMBER,
        ],
      },
    ],
  },

  // 5. Tài khoản chung cho tất cả các vai trò
  {
    id: "general-account",
    items: [
      {
        id: "profile",
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

