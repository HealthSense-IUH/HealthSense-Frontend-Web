import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  MemberHealthRecord,
  HealthStatisticsResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from "../types"

export const healthRecordApi = {
  /**
   * Get paginated list of health records for current authenticated user
   * GET /api/health-records/my-records?page=1&size=10
   */
  getMyRecords(params?: { page?: number; size?: number }) {
    const page = params?.page ?? 1
    const size = params?.size ?? 10
    return axiosClient.get<
      ApiResponse<PageResponse<MemberHealthRecord>>,
      ApiResponse<PageResponse<MemberHealthRecord>>
    >("/api/health-records/my-records", {
      params: { page, size },
    })
  },

  /**
   * Get detail of a specific health record
   * GET /api/health-records/{id}
   */
  getRecordById(id: string | number) {
    return axiosClient.get<ApiResponse<MemberHealthRecord>, ApiResponse<MemberHealthRecord>>(
      `/api/health-records/${id}`
    )
  },

  /**
   * Get user health statistics summary & chart data
   * GET /api/health-records/statistics?period=YEAR
   */
  getHealthStatistics(params?: {
    period?: "DAY" | "WEEK" | "MONTH" | "YEAR"
    referenceDate?: string
    timezone?: string
  }) {
    return axiosClient.get<
      ApiResponse<HealthStatisticsResponse>,
      ApiResponse<HealthStatisticsResponse>
    >("/api/health-records/statistics", {
      params: {
        period: params?.period ?? "YEAR",
        referenceDate: params?.referenceDate,
        timezone: params?.timezone ?? "Asia/Ho_Chi_Minh",
      },
    })
  },

  /**
   * Upload CSV record directly to backend
   * POST /api/health-records/upload-direct
   */
  uploadDirect(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return axiosClient.post<ApiResponse<MemberHealthRecord>, ApiResponse<MemberHealthRecord>>(
      "/api/health-records/upload-direct",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
  },

  /**
   * Request Presigned URL for S3 upload
   * POST /api/health-records/presigned-url
   */
  createPresignedUrl(payload: PresignedUrlRequest) {
    return axiosClient.post<
      ApiResponse<PresignedUrlResponse>,
      ApiResponse<PresignedUrlResponse>
    >("/api/health-records/presigned-url", payload)
  },

  /**
   * Confirm upload after S3 direct transfer
   * POST /api/health-records/{id}/confirm
   */
  confirmUpload(id: string | number) {
    return axiosClient.post<ApiResponse<MemberHealthRecord>, ApiResponse<MemberHealthRecord>>(
      `/api/health-records/${id}/confirm`
    )
  },
}
