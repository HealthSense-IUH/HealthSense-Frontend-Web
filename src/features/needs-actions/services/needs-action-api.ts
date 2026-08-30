import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  NeedsActionResponse,
  NeedsActionFilterParams,
  ResolveNeedsActionRequest,
} from "../types"

import type { ConsultationPaymentResponse } from "@/features/consultations/types"

export const needsActionApi = {
  /**
   * Discover and list role-scoped Needs Action work
   * GET /api/admin/needs-actions?status=&type=&page=&size=
   */
  listNeedsActions(params: NeedsActionFilterParams = {}) {
    const page = params.page ?? 1
    const size = params.size ?? 20
    return axiosClient.get<
      ApiResponse<PageResponse<NeedsActionResponse>>,
      ApiResponse<PageResponse<NeedsActionResponse>>
    >("/api/admin/needs-actions", {
      params: {
        ...params,
        page,
        size,
      },
    })
  },

  /**
   * Get single Needs Action item detail
   * GET /api/admin/needs-actions/{itemId}
   */
  getNeedsAction(itemId: number | string) {
    return axiosClient.get<
      ApiResponse<NeedsActionResponse>,
      ApiResponse<NeedsActionResponse>
    >(`/api/admin/needs-actions/${itemId}`)
  },

  /**
   * Claim an open Needs Action item
   * PATCH /api/admin/needs-actions/{itemId}/claim
   */
  claimNeedsAction(itemId: number | string) {
    return axiosClient.patch<
      ApiResponse<NeedsActionResponse>,
      ApiResponse<NeedsActionResponse>
    >(`/api/admin/needs-actions/${itemId}/claim`)
  },

  /**
   * Manually resolve a Needs Action item with resolution explanation
   * PATCH /api/admin/needs-actions/{itemId}/resolve
   */
  resolveNeedsAction(itemId: number | string, payload: ResolveNeedsActionRequest) {
    return axiosClient.patch<
      ApiResponse<NeedsActionResponse>,
      ApiResponse<NeedsActionResponse>
    >(`/api/admin/needs-actions/${itemId}/resolve`, payload)
  },

  /**
   * Retry failed PayOS provider payment-link cancellation (Admin / Super Admin only)
   * POST /api/admin/payment-reconciliation/{paymentId}/retry-cancellation
   */
  retryProviderCancellation(paymentId: number | string) {
    return axiosClient.post<
      ApiResponse<ConsultationPaymentResponse>,
      ApiResponse<ConsultationPaymentResponse>
    >(`/api/admin/payment-reconciliation/${paymentId}/retry-cancellation`)
  },
}
