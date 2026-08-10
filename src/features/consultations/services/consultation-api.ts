import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  AdminCreateConsultationSessionPayload,
  AdminListRequestsParams,
  ApproveConsultationRequestPayload,
  CareServicePackage,
  CloseConsultationPayload,
  ConsultationMessageItem,
  ConsultationMessagePage,
  ConsultationParticipantItem,
  ConsultationRequestItem,
  ConsultationRequestPage,
  ConsultationRequestReviewResponse,
  ConsultationSessionItem,
  ConsultationSessionPage,
  CreateConsultationRequestPayload,
  DoctorCandidateResponse,
  DoctorCareProfilePayload,
  DoctorCareProfileResponse,
  ExtendConsultationPayload,
  HealthRecordPage,
  RejectConsultationRequestPayload,
  SendConsultationMessagePayload,
  CreateCareServicePackagePayload,
  UpdateCareServicePackagePayload,
  ConsultationPaymentResponse,
  DoctorConsultationSessionResponse,
  DoctorConsultationDetailResponse,
  DoctorScopedHealthRecordResponse,
  ConsultationFinalSummaryResponse,
  UpsertConsultationFinalSummaryPayload,
} from "../types"

type PageParams = {
  page?: number
  size?: number
}

export const consultationApi = {
  listMyHealthRecords(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<HealthRecordPage>, ApiResponse<HealthRecordPage>>(
      "/api/health-records/my-records",
      { params }
    )
  },
  createRequest(payload: CreateConsultationRequestPayload) {
    return axiosClient.post<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      "/api/consultation-requests",
      payload
    )
  },
  listMyRequests(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationRequestPage>, ApiResponse<ConsultationRequestPage>>("/api/consultation-requests", {
      params,
    })
  },
  listAdminRequests(params: AdminListRequestsParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationRequestPage>, ApiResponse<ConsultationRequestPage>>("/api/admin/consultation-requests", {
      params,
    })
  },
  getMyRequest(requestId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      `/api/consultation-requests/${requestId}`
    )
  },
  cancelRequest(requestId: string | number) {
    return axiosClient.patch<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      `/api/consultation-requests/${requestId}/cancel`
    )
  },

  approveRequest(requestId: string | number, payload: ApproveConsultationRequestPayload) {
    return axiosClient.patch<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      `/api/admin/consultation-requests/${requestId}/approve`,
      payload
    )
  },
  rejectRequest(requestId: string | number, payload: RejectConsultationRequestPayload) {
    return axiosClient.patch<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      `/api/admin/consultation-requests/${requestId}/reject`,
      payload
    )
  },
  listMySessions(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationSessionPage>, ApiResponse<ConsultationSessionPage>>(
      "/api/consultation-sessions",
      { params }
    )
  },
  getSession(sessionId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationSessionItem>, ApiResponse<ConsultationSessionItem>>(
      `/api/consultation-sessions/${sessionId}`
    )
  },
  createSessionByAdmin(payload: AdminCreateConsultationSessionPayload) {
    return axiosClient.post<ApiResponse<ConsultationSessionItem>, ApiResponse<ConsultationSessionItem>>(
      "/api/admin/consultation-sessions",
      payload
    )
  },
  listAdminSessions(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationSessionPage>, ApiResponse<ConsultationSessionPage>>(
      "/api/admin/consultation-sessions",
      { params }
    )
  },
  extendSession(sessionId: string | number, payload: ExtendConsultationPayload) {
    return axiosClient.patch<ApiResponse<ConsultationSessionItem>, ApiResponse<ConsultationSessionItem>>(
      `/api/admin/consultation-sessions/${sessionId}/extend`,
      payload
    )
  },
  closeSession(sessionId: string | number, payload: CloseConsultationPayload) {
    return axiosClient.patch<ApiResponse<ConsultationSessionItem>, ApiResponse<ConsultationSessionItem>>(
      `/api/admin/consultation-sessions/${sessionId}/close`,
      payload
    )
  },
  expireOverdueSessions() {
    return axiosClient.post<ApiResponse<void>, ApiResponse<void>>(
      "/api/admin/consultation-sessions/expire-overdue"
    )
  },
  activateScheduledSessions() {
    return axiosClient.post<ApiResponse<void>, ApiResponse<void>>(
      "/api/admin/consultation-sessions/activate-scheduled"
    )
  },
  expireWaitingPaymentRequests() {
    return axiosClient.post<ApiResponse<void>, ApiResponse<void>>(
      "/api/admin/consultation-requests/expire-waiting-payment"
    )
  },
  listMessages(sessionId: string | number, params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationMessagePage>, ApiResponse<ConsultationMessagePage>>(
      `/api/consultation-sessions/${sessionId}/messages`,
      { params }
    )
  },
  listMessagesBefore(sessionId: string | number, beforeMessageId: string, params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationMessagePage>, ApiResponse<ConsultationMessagePage>>(
      `/api/consultation-sessions/${sessionId}/messages/before/${beforeMessageId}`,
      { params }
    )
  },
  sendMessage(sessionId: string | number, payload: SendConsultationMessagePayload) {
    return axiosClient.post<ApiResponse<ConsultationMessageItem>, ApiResponse<ConsultationMessageItem>>(
      `/api/consultation-sessions/${sessionId}/messages`,
      payload
    )
  },
  markRead(sessionId: string | number, lastReadMessageId: string) {
    return axiosClient.patch<ApiResponse<ConsultationParticipantItem>, ApiResponse<ConsultationParticipantItem>>(
      `/api/consultation-sessions/${sessionId}/messages/read`,
      { lastReadMessageId }
    )
  },
  listCareServicePackages(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<PageResponse<CareServicePackage>>, ApiResponse<PageResponse<CareServicePackage>>>(
      "/api/care-service-packages",
      { params }
    )
  },
  getCareServicePackage(packageId: string | number) {
    return axiosClient.get<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/care-service-packages/${packageId}`
    )
  },
  submitMoreInfo(requestId: string | number, payload: { additionalNote: string }) {
    return axiosClient.patch<ApiResponse<ConsultationRequestItem>, ApiResponse<ConsultationRequestItem>>(
      `/api/consultation-requests/${requestId}/more-info`,
      payload
    )
  },
  getRequestDetail(requestId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationRequestReviewResponse>, ApiResponse<ConsultationRequestReviewResponse>>(
      `/api/admin/consultation-requests/${requestId}`
    )
  },
  requestMoreInfo(requestId: string | number, payload: { reason: string }) {
    return axiosClient.patch<ApiResponse<ConsultationRequestReviewResponse>, ApiResponse<ConsultationRequestReviewResponse>>(
      `/api/admin/consultation-requests/${requestId}/need-more-info`,
      payload
    )
  },
  listDoctorCandidates(requestId: string | number, params: { specialty?: string; keyword?: string; eligibleOnly?: boolean; page?: number; size?: number } = {}) {
    return axiosClient.get<ApiResponse<PageResponse<DoctorCandidateResponse>>, ApiResponse<PageResponse<DoctorCandidateResponse>>>(
      `/api/admin/consultation-requests/${requestId}/doctor-candidates`,
      { params }
    )
  },
  getDoctorCareProfile(doctorId: string | number) {
    return axiosClient.get<ApiResponse<DoctorCareProfileResponse>, ApiResponse<DoctorCareProfileResponse>>(
      `/api/admin/doctors/${doctorId}/care-profile`
    )
  },
  updateDoctorCareProfile(doctorId: string | number, payload: DoctorCareProfilePayload) {
    return axiosClient.put<ApiResponse<DoctorCareProfileResponse>, ApiResponse<DoctorCareProfileResponse>>(
      `/api/admin/doctors/${doctorId}/care-profile`,
      payload
    )
  },
  listAdminCareServicePackages(params: { status?: string; page?: number; size?: number } = {}) {
    return axiosClient.get<ApiResponse<PageResponse<CareServicePackage>>, ApiResponse<PageResponse<CareServicePackage>>>(
      "/api/admin/care-service-packages",
      { params }
    )
  },
  getAdminCareServicePackage(packageId: string | number) {
    return axiosClient.get<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/admin/care-service-packages/${packageId}`
    )
  },
  createCareServicePackage(payload: CreateCareServicePackagePayload) {
    return axiosClient.post<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      "/api/admin/care-service-packages",
      payload
    )
  },
  updateCareServicePackage(packageId: string | number, payload: UpdateCareServicePackagePayload) {
    return axiosClient.patch<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/admin/care-service-packages/${packageId}`,
      payload
    )
  },
  activateCareServicePackage(packageId: string | number) {
    return axiosClient.patch<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/admin/care-service-packages/${packageId}/activate`
    )
  },
  deactivateCareServicePackage(packageId: string | number) {
    return axiosClient.patch<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/admin/care-service-packages/${packageId}/deactivate`
    )
  },
  retireCareServicePackage(packageId: string | number) {
    return axiosClient.patch<ApiResponse<CareServicePackage>, ApiResponse<CareServicePackage>>(
      `/api/admin/care-service-packages/${packageId}/retire`
    )
  },
  createConsultationPayment(requestId: string | number) {
    return axiosClient.post<ApiResponse<ConsultationPaymentResponse>, ApiResponse<ConsultationPaymentResponse>>(
      `/api/consultation-requests/${requestId}/payment`
    )
  },
  getConsultationPayment(requestId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationPaymentResponse>, ApiResponse<ConsultationPaymentResponse>>(
      `/api/consultation-requests/${requestId}/payment`
    )
  },
  getDoctorSessions(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<PageResponse<DoctorConsultationSessionResponse>>, ApiResponse<PageResponse<DoctorConsultationSessionResponse>>>(
      "/api/doctor/consultation-sessions",
      { params }
    )
  },
  getDoctorSessionDetail(sessionId: string | number) {
    return axiosClient.get<ApiResponse<DoctorConsultationDetailResponse>, ApiResponse<DoctorConsultationDetailResponse>>(
      `/api/doctor/consultation-sessions/${sessionId}`
    )
  },
  getDoctorScopedRecords(sessionId: string | number, params: PageParams = {}) {
    return axiosClient.get<ApiResponse<PageResponse<DoctorScopedHealthRecordResponse>>, ApiResponse<PageResponse<DoctorScopedHealthRecordResponse>>>(
      `/api/doctor/consultation-sessions/${sessionId}/health-records`,
      { params }
    )
  },
  getDoctorScopedRecordDetail(sessionId: string | number, recordId: string | number) {
    return axiosClient.get<ApiResponse<DoctorScopedHealthRecordResponse>, ApiResponse<DoctorScopedHealthRecordResponse>>(
      `/api/doctor/consultation-sessions/${sessionId}/health-records/${recordId}`
    )
  },
  reviewDoctorScopedRecordAttention(sessionId: string | number, recordId: string | number) {
    return axiosClient.patch<ApiResponse<void>, ApiResponse<void>>(
      `/api/doctor/consultation-sessions/${sessionId}/health-records/${recordId}/attention/review`
    )
  },
  getDoctorFinalSummary(sessionId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationFinalSummaryResponse>, ApiResponse<ConsultationFinalSummaryResponse>>(
      `/api/doctor/consultation-sessions/${sessionId}/final-summary`
    )
  },
  updateDoctorFinalSummary(sessionId: string | number, payload: UpsertConsultationFinalSummaryPayload) {
    return axiosClient.put<ApiResponse<ConsultationFinalSummaryResponse>, ApiResponse<ConsultationFinalSummaryResponse>>(
      `/api/doctor/consultation-sessions/${sessionId}/final-summary`,
      payload
    )
  },
  finalizeDoctorFinalSummary(sessionId: string | number) {
    return axiosClient.patch<ApiResponse<ConsultationFinalSummaryResponse>, ApiResponse<ConsultationFinalSummaryResponse>>(
      `/api/doctor/consultation-sessions/${sessionId}/final-summary/finalize`
    )
  },
  getMemberFinalSummary(sessionId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationFinalSummaryResponse>, ApiResponse<ConsultationFinalSummaryResponse>>(
      `/api/consultation-sessions/${sessionId}/final-summary`
    )
  },
  getAdminFinalSummary(sessionId: string | number) {
    return axiosClient.get<ApiResponse<ConsultationFinalSummaryResponse>, ApiResponse<ConsultationFinalSummaryResponse>>(
      `/api/admin/consultation-sessions/${sessionId}/final-summary`
    )
  },
}
