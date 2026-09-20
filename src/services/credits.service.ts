import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  AdminCreditLedgerEntry,
  AdminCreditLedgerFilterParams,
  AdminCreditOrderDetail,
  AdminCreditOrdersFilterParams,
  AdminCreditOrderSummary,
  AdminCreditPackage,
  AdminMemberWallet,
  CreateAdminCreditPackageRequest,
  CreateCreditOrderRequest,
  CreditAdjustmentRequest,
  CreditMutationResponse,
  CreditOrderDetail,
  CreditOrderSummary,
  CreditPackage,
  CreditRecoveryResult,
  CreditSessionRefundRequest,
  CreditWallet,
  CreditWalletReconciliation,
  CreditLedgerEntry,
  UpdateAdminCreditPackageRequest,
} from "@/types/credits"

export interface GetLedgerParams {
  page?: number
  size?: number
}

export interface GetOrdersParams {
  page?: number
  size?: number
}

export const creditsApi = {
  /**
   * API 1: Lấy danh sách gói lượt tư vấn đang mở bán (ACTIVE)
   * GET /api/credits/packages
   */
  getPackages() {
    return axiosClient.get<ApiResponse<CreditPackage[]>, ApiResponse<CreditPackage[]>>(
      "/api/credits/packages"
    )
  },

  /**
   * API 2: Lấy thông tin ví lượt của member hiện tại
   * GET /api/credits/wallet
   */
  getWallet() {
    return axiosClient.get<ApiResponse<CreditWallet>, ApiResponse<CreditWallet>>(
      "/api/credits/wallet"
    )
  },

  /**
   * API 3: Lấy lịch sử biến động lượt tư vấn (Ledger)
   * GET /api/credits/ledger?page=1&size=10
   */
  getLedger(params?: GetLedgerParams) {
    const page = params?.page ?? 1
    const size = params?.size ?? 10
    return axiosClient.get<
      ApiResponse<PageResponse<CreditLedgerEntry>>,
      ApiResponse<PageResponse<CreditLedgerEntry>>
    >("/api/credits/ledger", {
      params: { page, size },
    })
  },

  /**
   * API 4: Mua gói lượt bằng phương thức giả lập MOCK
   * POST /api/credits/orders
   * Yêu cầu header Idempotency-Key và payload { packageId: string }
   */
  createOrder(payload: CreateCreditOrderRequest, idempotencyKey: string) {
    return axiosClient.post<
      ApiResponse<CreditOrderDetail>,
      ApiResponse<CreditOrderDetail>
    >("/api/credits/orders", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    })
  },

  /**
   * API 5: Lấy danh sách lịch sử các đơn mua lượt của member
   * GET /api/credits/orders?page=1&size=10
   */
  getOrders(params?: GetOrdersParams) {
    const page = params?.page ?? 1
    const size = params?.size ?? 10
    return axiosClient.get<
      ApiResponse<PageResponse<CreditOrderSummary>>,
      ApiResponse<PageResponse<CreditOrderSummary>>
    >("/api/credits/orders", {
      params: { page, size },
    })
  },

  getOrder(orderId: string) {
    return axiosClient.get<
      ApiResponse<CreditOrderDetail>,
      ApiResponse<CreditOrderDetail>
    >(`/api/credits/orders/${orderId}`)
  },
  getOrderById(orderId: string) {
    return this.getOrder(orderId)
  },

  /**
   * API 7: Hủy đơn mua lượt đang ở trạng thái PENDING_PAYMENT
   * POST /api/credits/orders/{orderId}/cancel
   */
  cancelOrder(orderId: string) {
    return axiosClient.post<
      ApiResponse<CreditOrderDetail>,
      ApiResponse<CreditOrderDetail>
    >(`/api/credits/orders/${orderId}/cancel`)
  },

  /* =========================================================================
   * ADMIN & SUPER_ADMIN APIs (Batch 1-4)
   * ========================================================================= */

  /**
   * ADMIN API 1: Danh sách toàn bộ gói lượt tư vấn (ACTIVE & INACTIVE)
   * GET /api/admin/credits/packages
   */
  adminGetPackages() {
    return axiosClient.get<
      ApiResponse<AdminCreditPackage[]>,
      ApiResponse<AdminCreditPackage[]>
    >("/api/admin/credits/packages")
  },

  /**
   * ADMIN API 2: Tạo gói lượt mới (mặc định INACTIVE)
   * POST /api/admin/credits/packages
   */
  adminCreatePackage(payload: CreateAdminCreditPackageRequest) {
    return axiosClient.post<
      ApiResponse<AdminCreditPackage>,
      ApiResponse<AdminCreditPackage>
    >("/api/admin/credits/packages", payload)
  },

  /**
   * ADMIN API 3: Cập nhật gói lượt tư vấn (Optimistic lock với version)
   * PATCH /api/admin/credits/packages/{packageId}
   */
  adminUpdatePackage(packageId: string, payload: UpdateAdminCreditPackageRequest) {
    return axiosClient.patch<
      ApiResponse<AdminCreditPackage>,
      ApiResponse<AdminCreditPackage>
    >(`/api/admin/credits/packages/${packageId}`, payload)
  },

  /**
   * ADMIN API 4: Tra cứu ví lượt của một Member
   * GET /api/admin/credits/members/{memberId}/wallet
   */
  adminGetWallet(memberId: string) {
    return axiosClient.get<
      ApiResponse<AdminMemberWallet>,
      ApiResponse<AdminMemberWallet>
    >(`/api/admin/credits/members/${memberId}/wallet`)
  },

  /**
   * ADMIN API 5: Tra cứu lịch sử biến động (Ledger) của một Member
   * GET /api/admin/credits/members/{memberId}/ledger
   */
  adminGetLedger(memberId: string, params?: AdminCreditLedgerFilterParams) {
    const page = params?.page ?? 1
    const size = params?.size ?? 10
    return axiosClient.get<
      ApiResponse<PageResponse<AdminCreditLedgerEntry>>,
      ApiResponse<PageResponse<AdminCreditLedgerEntry>>
    >(`/api/admin/credits/members/${memberId}/ledger`, {
      params: {
        page,
        size,
        ...(params?.operation ? { operation: params.operation } : {}),
        ...(params?.sourceType ? { sourceType: params.sourceType } : {}),
        ...(params?.from ? { from: params.from } : {}),
        ...(params?.to ? { to: params.to } : {}),
      },
    })
  },

  /**
   * ADMIN API 6: Tra cứu danh sách đơn mua lượt toàn hệ thống
   * GET /api/admin/credits/orders
   */
  adminGetOrders(params?: AdminCreditOrdersFilterParams) {
    const page = params?.page ?? 1
    const size = params?.size ?? 10
    return axiosClient.get<
      ApiResponse<PageResponse<AdminCreditOrderSummary>>,
      ApiResponse<PageResponse<AdminCreditOrderSummary>>
    >("/api/admin/credits/orders", {
      params: {
        page,
        size,
        ...(params?.memberId ? { memberId: params.memberId } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.provider ? { provider: params.provider } : {}),
        ...(params?.from ? { from: params.from } : {}),
        ...(params?.to ? { to: params.to } : {}),
      },
    })
  },

  /**
   * ADMIN API 7: Chi tiết đơn mua lượt kèm danh sách payment attempts
   * GET /api/admin/credits/orders/{orderId}
   */
  adminGetOrderDetail(orderId: string) {
    return axiosClient.get<
      ApiResponse<AdminCreditOrderDetail>,
      ApiResponse<AdminCreditOrderDetail>
    >(`/api/admin/credits/orders/${orderId}`)
  },

  /**
   * ADMIN API 8: Điều chỉnh lượt thủ công (Adjustment)
   * POST /api/admin/credits/members/{memberId}/adjustments
   */
  adminAdjustCredits(
    memberId: string,
    payload: CreditAdjustmentRequest,
    idempotencyKey: string
  ) {
    return axiosClient.post<
      ApiResponse<CreditMutationResponse>,
      ApiResponse<CreditMutationResponse>
    >(`/api/admin/credits/members/${memberId}/adjustments`, payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    })
  },

  /**
   * ADMIN API 9: Bồi hoàn lượt tư vấn cho phiên (Session Refund)
   * POST /api/admin/credits/sessions/refund
   */
  adminRefundSession(payload: CreditSessionRefundRequest, idempotencyKey: string) {
    return axiosClient.post<
      ApiResponse<CreditMutationResponse>,
      ApiResponse<CreditMutationResponse>
    >("/api/admin/credits/sessions/refund", payload, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    })
  },

  /**
   * ADMIN API 10: Báo cáo đối soát ví và ledger (Reconciliation)
   * GET /api/admin/credits/reconciliation
   */
  adminGetReconciliation(memberId?: string) {
    return axiosClient.get<
      ApiResponse<CreditWalletReconciliation[]>,
      ApiResponse<CreditWalletReconciliation[]>
    >("/api/admin/credits/reconciliation", {
      params: memberId ? { memberId } : undefined,
    })
  },

  /**
   * ADMIN API 11: Rà soát & thu hồi các lượt mồ côi (Recovery)
   * POST /api/admin/credits/recovery
   */
  adminRunRecovery(limit: number = 50) {
    return axiosClient.post<
      ApiResponse<CreditRecoveryResult>,
      ApiResponse<CreditRecoveryResult>
    >("/api/admin/credits/recovery", undefined, {
      params: { limit },
    })
  },
}
