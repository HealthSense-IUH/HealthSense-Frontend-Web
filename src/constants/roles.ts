import i18n from "@/lib/i18n"

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CARE_COORDINATOR: "CARE_COORDINATOR",
  DOCTOR: "DOCTOR",
  MEMBER: "MEMBER",
} as const

export type UserRoleConst = (typeof USER_ROLES)[keyof typeof USER_ROLES]

/** Tên vai trò theo ngôn ngữ đang chọn ("MEMBER" -> "Hội viên" / "Member"); vai trò lạ giữ nguyên mã. */
export function roleLabel(role?: string | null): string {
  if (!role) return ""
  return i18n.t(`common:roles.${role}`, { defaultValue: role })
}

/** Trang mặc định của phân hệ Cá nhân (/app/general) theo vai trò; staff cũng có vài trang ở đây. */
export function getDefaultGeneralRouteForRole(role?: string | null): string {
  if (role === USER_ROLES.DOCTOR) return "/app/general/nutrition"
  if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN) return "/app/general/consultations"
  return "/app/general/dashboard"
}

/** Vai trò có phân hệ Quản trị (được chuyển qua lại giữa /app/general và /app/management). */
export function hasManagementArea(role?: string | null): boolean {
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN || role === USER_ROLES.DOCTOR
}

export function getDefaultRouteForRole(role?: string | null): string {
  if (role === USER_ROLES.DOCTOR) {
    return "/app/management/doctor/consultations"
  }
  if (
    role === USER_ROLES.SUPER_ADMIN ||
    role === USER_ROLES.ADMIN
  ) {
    return "/app/management/statistics/users"
  }
  return "/app/general/dashboard"
}
