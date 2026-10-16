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
  MemberConsultationStatisticsParams,
  MemberConsultationStatisticsResponse,
  MemberStatisticsParams,
  MemberPaymentStatisticsResponse,
  MemberHealthRecordStatisticsResponse,
  DoctorStatisticsRangeParams,
  DoctorConsultationStatisticsResponse,
  DoctorPatientStatisticsResponse,
  DoctorPatientListParams,
  DoctorPatientListItem,
  DoctorPatientDetail,
  DoctorPatientConsultation,
  DoctorPatientMedicalHistory,
  DoctorPatientHealthRecord,
} from "@/types/statistics"
import type { PageResponse } from "@/types/base/apiResponse"

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

export const memberStatisticsApi = {
  /**
   * Lấy thống kê phiên tư vấn của Member
   * GET /api/member/statistics/consultations
   */
  getConsultationStatistics(params: MemberConsultationStatisticsParams) {
    return axiosClient.get<
      ApiResponse<MemberConsultationStatisticsResponse>,
      ApiResponse<MemberConsultationStatisticsResponse>
    >("/api/member/statistics/consultations", { params })
  },

  /**
   * Lấy thống kê thanh toán và gói lượt của Member
   * GET /api/member/statistics/payments
   */
  getPaymentStatistics(params: MemberStatisticsParams) {
    return axiosClient.get<
      ApiResponse<MemberPaymentStatisticsResponse>,
      ApiResponse<MemberPaymentStatisticsResponse>
    >("/api/member/statistics/payments", { params })
  },

  /**
   * Lấy thống kê bản ghi sức khỏe / ECG của Member
   * GET /api/member/statistics/health-records
   */
  getHealthRecordStatistics(params: MemberStatisticsParams) {
    return axiosClient.get<
      ApiResponse<MemberHealthRecordStatisticsResponse>,
      ApiResponse<MemberHealthRecordStatisticsResponse>
    >("/api/member/statistics/health-records", { params })
  },
}

export const doctorStatisticsApi = {
  /**
   * Lấy KPI thống kê phiên tư vấn của Bác sĩ
   * GET /api/doctor/statistics/consultations
   */
  getConsultations(params: DoctorStatisticsRangeParams) {
    return axiosClient.get<
      ApiResponse<DoctorConsultationStatisticsResponse>,
      ApiResponse<DoctorConsultationStatisticsResponse>
    >("/api/doctor/statistics/consultations", { params })
  },

  /**
   * Lấy KPI thống kê bệnh nhân của Bác sĩ
   * GET /api/doctor/statistics/patients/overview
   */
  getPatientOverview(params: DoctorStatisticsRangeParams) {
    return axiosClient.get<
      ApiResponse<DoctorPatientStatisticsResponse>,
      ApiResponse<DoctorPatientStatisticsResponse>
    >("/api/doctor/statistics/patients/overview", { params })
  },

  /**
   * Lấy danh sách bệnh nhân đã từng khám với Bác sĩ
   * GET /api/doctor/statistics/patients
   */
  getPatients(params: DoctorPatientListParams) {
    return axiosClient.get<
      ApiResponse<PageResponse<DoctorPatientListItem>>,
      ApiResponse<PageResponse<DoctorPatientListItem>>
    >("/api/doctor/statistics/patients", { params })
  },

  /**
   * Lấy thông tin chi tiết một bệnh nhân
   * GET /api/doctor/statistics/patients/{memberId}
   */
  getPatient(memberId: string) {
    return axiosClient.get<
      ApiResponse<DoctorPatientDetail>,
      ApiResponse<DoctorPatientDetail>
    >(`/api/doctor/statistics/patients/${encodeURIComponent(memberId)}`)
  },

  /**
   * Lấy lịch sử phiên tư vấn giữa Bác sĩ và bệnh nhân
   * GET /api/doctor/statistics/patients/{memberId}/consultations
   */
  getPatientConsultations(memberId: string, page = 1, size = 20) {
    return axiosClient.get<
      ApiResponse<PageResponse<DoctorPatientConsultation>>,
      ApiResponse<PageResponse<DoctorPatientConsultation>>
    >(`/api/doctor/statistics/patients/${encodeURIComponent(memberId)}/consultations`, {
      params: { page, size },
    })
  },

  /**
   * Lấy lịch sử bệnh án (kết luận đã finalized) giữa Bác sĩ và bệnh nhân
   * GET /api/doctor/statistics/patients/{memberId}/medical-history
   */
  getPatientMedicalHistory(memberId: string, page = 1, size = 20) {
    return axiosClient.get<
      ApiResponse<PageResponse<DoctorPatientMedicalHistory>>,
      ApiResponse<PageResponse<DoctorPatientMedicalHistory>>
    >(`/api/doctor/statistics/patients/${encodeURIComponent(memberId)}/medical-history`, {
      params: { page, size },
    })
  },

  /**
   * Lấy hồ sơ đo ECG được chia sẻ giữa Bác sĩ và bệnh nhân
   * GET /api/doctor/statistics/patients/{memberId}/health-records
   */
  getPatientHealthRecords(memberId: string, page = 1, size = 20) {
    return axiosClient.get<
      ApiResponse<PageResponse<DoctorPatientHealthRecord>>,
      ApiResponse<PageResponse<DoctorPatientHealthRecord>>
    >(`/api/doctor/statistics/patients/${encodeURIComponent(memberId)}/health-records`, {
      params: { page, size },
    })
  },
}

