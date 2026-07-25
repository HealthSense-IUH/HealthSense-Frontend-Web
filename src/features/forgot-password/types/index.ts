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
