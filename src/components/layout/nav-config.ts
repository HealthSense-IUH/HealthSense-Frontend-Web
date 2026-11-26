import type { ComponentType } from "react"

import {
  HsChartBarsIcon,
  HsCommunityUsersIcon,
  HsConsultationChatIcon,
  HsCreditWalletIcon,
  HsDashboardIcon,
  HsDoctorStethoscopeIcon,
  HsHeartPulseIcon,
  HsNutritionBowlIcon,
  HsNutritionRulesIcon,
  HsProfileFamilyIcon,
  HsReportDocIcon,
  HsScreeningCheckIcon,
} from "@/components/icons/health-icons"
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
  icon: ComponentType<{ className?: string }>
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
        id: "statistics",
        href: "/app/management/statistics",
        icon: HsChartBarsIcon,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "user-management",
        href: "/app/management/users",
        icon: HsCommunityUsersIcon,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "admin-credit-operations",
        href: "/app/management/credit-operations",
        icon: HsCreditWalletIcon,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "health-records-management",
        href: "/app/management/health-records",
        icon: HsScreeningCheckIcon,
        allowedRoles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
      },
      {
        id: "nutrition-rules",
        href: "/app/management/nutrition-rules",
        icon: HsNutritionRulesIcon,
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
        icon: HsDoctorStethoscopeIcon,
        allowedRoles: [USER_ROLES.DOCTOR],
      },
      {
        id: "doctor-statistics",
        href: "/app/doctor/statistics",
        icon: HsChartBarsIcon,
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
        icon: HsDashboardIcon,
        allowedRoles: [USER_ROLES.MEMBER],
        exact: true,
      },
      {
        id: "member-statistics",
        href: "/app/general/statistics",
        icon: HsChartBarsIcon,
        allowedRoles: [USER_ROLES.MEMBER],
      },
      {
        id: "reports",
        href: "/app/general/reports",
        icon: HsReportDocIcon,
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
        icon: HsHeartPulseIcon,
        allowedRoles: [USER_ROLES.MEMBER],
      },
      {
        id: "consultations",
        href: "/app/general/consultations",
        icon: HsConsultationChatIcon,
        allowedRoles: [
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.ADMIN,
          USER_ROLES.MEMBER,
        ],
      },
      {
        id: "nutrition",
        href: "/app/general/nutrition",
        icon: HsNutritionBowlIcon,
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
        icon: HsProfileFamilyIcon,
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

/**
 * Xác định pathname có thuộc phân hệ Quản trị (Management) hay không.
 */
export function isManagementPath(pathname: string): boolean {
  return pathname.startsWith("/app/management") || pathname.startsWith("/app/doctor")
}

/** Nhóm điều hướng thuộc phân hệ Quản trị (id bắt đầu bằng management- hoặc doctor-); các nhóm còn lại thuộc phân hệ Cá nhân. */
export function isManagementGroup(groupId: string): boolean {
  return groupId.startsWith("management-") || groupId.startsWith("doctor-")
}

