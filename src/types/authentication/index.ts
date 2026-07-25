export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  DOCTOR: "DOCTOR",
  MEMBER: "MEMBER",
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES] | string

export type AccountStatus = "ACTIVE" | "DISABLED" | string

export type UserSession = {
  userId: string | number
  email: string
  fullName?: string
  role: UserRole
  accountStatus?: AccountStatus
}

export type CurrentUser = Pick<UserSession, "userId" | "email" | "role">

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  fullName: string
}

export type LoginResponse = {
  accessToken: string
  tokenType: "Bearer" | string
  userSession: UserSession
}

export type RegisterResponse = UserSession
