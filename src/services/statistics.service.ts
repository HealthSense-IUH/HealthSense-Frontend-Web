import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  UserStatisticsQuery,
  UserStatisticsResponse,
  ConsultationStatisticsQuery,
  ConsultationStatisticsResponse,
  HealthRecordStatisticsQuery,
  HealthRecordStatisticsResponse,
  PaymentStatisticsQuery,
  PaymentStatisticsResponse,
} from "@/types/statistics"

export const adminStatisticsApi = {
  /**
   * Lấy thống kê người dùng hệ thống cho Quản trị viên
   * GET /api/admin/statistics/users
   */
  getUserStatistics(params: UserStatisticsQuery) {
    return axiosClient.get<
      ApiResponse<UserStatisticsResponse>,
      ApiResponse<UserStatisticsResponse>
    >("/api/admin/statistics/users", { params })
  },

  /**
   * Lấy thống kê phiên tư vấn hệ thống cho Quản trị viên
   * GET /api/admin/statistics/consultations
   */
  getConsultationStatistics(params: ConsultationStatisticsQuery) {
    return axiosClient.get<
      ApiResponse<ConsultationStatisticsResponse>,
      ApiResponse<ConsultationStatisticsResponse>
    >("/api/admin/statistics/consultations", { params })
  },

  /**
   * Lấy thống kê hồ sơ sức khỏe hệ thống cho Quản trị viên
   * GET /api/admin/statistics/health-records
   */
  getHealthRecordStatistics(params: HealthRecordStatisticsQuery) {
    return axiosClient.get<
      ApiResponse<HealthRecordStatisticsResponse>,
      ApiResponse<HealthRecordStatisticsResponse>
    >("/api/admin/statistics/health-records", { params })
  },

  /**
   * Lấy thống kê thanh toán và doanh thu hệ thống cho Quản trị viên
   * GET /api/admin/statistics/payments
   */
  getPaymentStatistics(params: PaymentStatisticsQuery) {
    return axiosClient.get<
      ApiResponse<PaymentStatisticsResponse>,
      ApiResponse<PaymentStatisticsResponse>
    >("/api/admin/statistics/payments", { params })
  },
}
