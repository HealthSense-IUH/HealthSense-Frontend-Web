import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  ConsultationRefundResponse,
  RecommendRefundRequest,
  DecideRefundRequest,
  ReconcileRefundRequest,
} from "../types"

export const refundApi = {
  /**
   * Submit coordinator refund recommendation for a paid payment
   * POST /api/admin/consultation-refunds/payments/{paymentId}/recommendation
   * Role: CARE_COORDINATOR only
   */
  recommendRefund(paymentId: number | string, payload: RecommendRefundRequest) {
    return axiosClient.post<
      ApiResponse<ConsultationRefundResponse>,
      ApiResponse<ConsultationRefundResponse>
    >(`/api/admin/consultation-refunds/payments/${paymentId}/recommendation`, payload)
  },

  /**
   * Approve or reject a recommended refund
   * POST /api/admin/consultation-refunds/{refundId}/decision
   * Role: ADMIN, SUPER_ADMIN only
   */
  decideRefund(refundId: number | string, payload: DecideRefundRequest) {
    return axiosClient.post<
      ApiResponse<ConsultationRefundResponse>,
      ApiResponse<ConsultationRefundResponse>
    >(`/api/admin/consultation-refunds/${refundId}/decision`, payload)
  },

  /**
   * Trigger / retry provider refund execution
   * POST /api/admin/consultation-refunds/{refundId}/execute
   * Role: ADMIN, SUPER_ADMIN only
   */
  executeRefund(refundId: number | string) {
    return axiosClient.post<
      ApiResponse<ConsultationRefundResponse>,
      ApiResponse<ConsultationRefundResponse>
    >(`/api/admin/consultation-refunds/${refundId}/execute`)
  },

  /**
   * Reconcile externally executed refund
   * POST /api/admin/consultation-refunds/{refundId}/reconcile
   * Role: ADMIN, SUPER_ADMIN only
   */
  reconcileRefund(refundId: number | string, payload: ReconcileRefundRequest) {
    return axiosClient.post<
      ApiResponse<ConsultationRefundResponse>,
      ApiResponse<ConsultationRefundResponse>
    >(`/api/admin/consultation-refunds/${refundId}/reconcile`, payload)
  },

  /**
   * View refund detail
   * GET /api/admin/consultation-refunds/{refundId}
   * Role: CARE_COORDINATOR, ADMIN, SUPER_ADMIN
   */
  getRefundDetail(refundId: number | string) {
    return axiosClient.get<
      ApiResponse<ConsultationRefundResponse>,
      ApiResponse<ConsultationRefundResponse>
    >(`/api/admin/consultation-refunds/${refundId}`)
  },
}
