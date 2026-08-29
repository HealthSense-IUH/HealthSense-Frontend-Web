import axios from "axios"
import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  AvatarPresignedUrlRequest,
  AvatarPresignedUrlResponse,
  IdentityCardPresignedUrlRequest,
  IdentityCardPresignedUrlResponse,
  MemberDetailResponse,
  ProfileUpdateRequest,
  UserResponse,
} from "../types"

export const profileApi = {
  /**
   * Get current authenticated user profile details
   * GET /api/users/me
   */
  getMe() {
    return axiosClient.get<ApiResponse<UserResponse>, ApiResponse<UserResponse>>("/api/users/me")
  },

  /**
   * Get rich member details (including record count and latest health record)
   * GET /api/users/me/detail
   */
  getMeDetail() {
    return axiosClient.get<ApiResponse<MemberDetailResponse>, ApiResponse<MemberDetailResponse>>(
      "/api/users/me/detail"
    )
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

  /**
   * Generate S3 Presigned URL for uploading avatar
   * POST /api/users/me/avatar/presigned-url
   */
  generateAvatarPresignedUrl(payload: AvatarPresignedUrlRequest) {
    return axiosClient.post<
      ApiResponse<AvatarPresignedUrlResponse>,
      ApiResponse<AvatarPresignedUrlResponse>
    >("/api/users/me/avatar/presigned-url", payload)
  },

  /**
   * Generate S3 Presigned URL for uploading identity card (CCCD)
   * POST /api/users/me/identity-card/presigned-url
   */
  generateIdentityCardPresignedUrl(payload: IdentityCardPresignedUrlRequest) {
    return axiosClient.post<
      ApiResponse<IdentityCardPresignedUrlResponse>,
      ApiResponse<IdentityCardPresignedUrlResponse>
    >("/api/users/me/identity-card/presigned-url", payload)
  },

  /**
   * Upload file directly to S3 Presigned URL
   */
  uploadFileToS3(uploadUrl: string, file: File, contentType?: string) {
    return axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": contentType || file.type || "application/octet-stream",
      },
    })
  },
}
