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

export function getDefaultRouteForRole(role?: string | null): string {
  if (role === USER_ROLES.DOCTOR) {
    return "/app/management/doctor/consultations"
  }
  if (
    role === USER_ROLES.SUPER_ADMIN ||
    role === USER_ROLES.ADMIN
  ) {
    return "/app/management"
  }
  return "/app/general/dashboard"
}
