import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type { ProfileUpdateRequest, UserResponse } from "../types"

export const profileApi = {
  /**
   * Get current authenticated user profile details
   * GET /api/auth/me
   */
  getMe() {
    return axiosClient.get<ApiResponse<UserResponse>, ApiResponse<UserResponse>>("/api/auth/me")
  },

  /**
   * Update current authenticated user metadata (NO admin endpoints, NO passwords)
   * PATCH /api/users/me
   */
  updateMe(payload: ProfileUpdateRequest) {
    return axiosClient.patch<ApiResponse<UserResponse>, ApiResponse<UserResponse>>(
      "/api/users/me",
      payload
    )
  },
}
