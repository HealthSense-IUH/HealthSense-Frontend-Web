export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CARE_COORDINATOR: "CARE_COORDINATOR",
  DOCTOR: "DOCTOR",
  MEMBER: "MEMBER",
} as const

export type UserRoleConst = (typeof USER_ROLES)[keyof typeof USER_ROLES]
