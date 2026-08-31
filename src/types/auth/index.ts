import { USER_ROLES } from "@/constants/roles"

export { USER_ROLES }
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES] | string

export type AccountStatus = "ACTIVE" | "DISABLED" | "INACTIVE" | "PENDING_VERIFY" | string

export type UserSession = {
  userId: string | number
  email: string
  fullName?: string
  role: UserRole
  accountStatus?: AccountStatus
  avatarUrl?: string
  timezone?: string
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

// Forgot password types
export type ForgotPasswordOtpRequest = {
  email: string
}

export type VerifyForgotPasswordOtpRequest = {
  email: string
  otp: string
}

export type ResetPasswordRequest = {
  resetToken: string
  newPassword: string
}

export type ForgotPasswordOtpResponse = {
  email?: string
  expiresInSeconds?: number
  message?: string
}

export type VerifyForgotPasswordOtpResponse = {
  resetToken?: string
  token?: string
  passwordResetToken?: string
  expiresInSeconds?: number
  message?: string
}
