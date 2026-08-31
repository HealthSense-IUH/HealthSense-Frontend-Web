import axiosClient from "@/lib/axiosClient"
import type {
  ForgotPasswordOtpRequest,
  ForgotPasswordOtpResponse,
  ResetPasswordRequest,
  VerifyForgotPasswordOtpRequest,
  VerifyForgotPasswordOtpResponse,
} from "@/types/auth"
import type { ApiResponse } from "@/types/base"

export const forgotPasswordApi = {
  requestOtp(payload: ForgotPasswordOtpRequest) {
    return axiosClient.post<
      ApiResponse<ForgotPasswordOtpResponse>,
      ApiResponse<ForgotPasswordOtpResponse>
    >("/api/auth/forgot-password/request-otp", payload)
  },

  verifyOtp(payload: VerifyForgotPasswordOtpRequest) {
    return axiosClient.post<
      ApiResponse<VerifyForgotPasswordOtpResponse>,
      ApiResponse<VerifyForgotPasswordOtpResponse>
    >("/api/auth/forgot-password/verify-otp", payload)
  },

  resetPassword(payload: ResetPasswordRequest) {
    return axiosClient.post<ApiResponse<void>, ApiResponse<void>>(
      "/api/auth/forgot-password/reset",
      payload
    )
  },
}
