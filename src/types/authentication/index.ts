export type UserRole = "MEMBER" | "ADMIN" | string

export type AccountStatus = "ACTIVE" | "DISABLED" | string

export type UserSession = {
  userId: number
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
