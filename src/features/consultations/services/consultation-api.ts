import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  AdminCreateConsultationSessionPayload,
  ApproveConsultationRequestPayload,
  CloseConsultationPayload,
  ConsultationMessageItem,
  ConsultationMessagePage,
  ConsultationParticipantItem,
  ConsultationRequestItem,
  ConsultationRequestPage,
  ConsultationSessionItem,
  ConsultationSessionPage,
  CreateConsultationRequestPayload,
  ExtendConsultationPayload,
  HealthRecordPage,
  RejectConsultationRequestPayload,
  SendConsultationMessagePayload,
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
    return axiosClient.get<ApiResponse<ConsultationRequestPage>, ApiResponse<ConsultationRequestPage>>(
      "/api/consultation-requests",
      { params }
    )
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
  listAdminRequests(params: PageParams = {}) {
    return axiosClient.get<ApiResponse<ConsultationRequestPage>, ApiResponse<ConsultationRequestPage>>(
      "/api/admin/consultation-requests",
      { params }
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
}
