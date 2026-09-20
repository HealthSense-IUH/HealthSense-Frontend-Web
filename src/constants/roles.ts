export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CARE_COORDINATOR: "CARE_COORDINATOR",
  DOCTOR: "DOCTOR",
  MEMBER: "MEMBER",
} as const

export type UserRoleConst = (typeof USER_ROLES)[keyof typeof USER_ROLES]

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
