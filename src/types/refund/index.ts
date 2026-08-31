export type ConsultationRefundStatus =
  | "REVIEW_REQUIRED"
  | "RECOMMENDED"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | string

export type RefundRecommendation = "FULL" | "PARTIAL" | "NONE" | string

export interface RecommendRefundRequest {
  recommendation: RefundRecommendation
  recommendedAmount?: number | null
  reason: string
  operationalContext?: string | null
}

export interface DecideRefundRequest {
  approved: boolean
  approvedAmount?: number | null
  reason: string
}

export interface ReconcileRefundRequest {
  succeeded: boolean
  providerRefundId?: string | null
  providerResult: string
}

export interface ConsultationRefundResponse {
  id: number | string
  paymentId: number | string
  requestId?: number | string | null
  renewalId?: number | string | null
  sessionId?: number | string | null
  agreementId?: number | string | null
  memberId?: number | string | null
  provider?: string | null
  originalPaidAmount?: number | null
  originalAmount?: number // legacy fallback
  currency: string
  refundPolicyReference?: string | null
  refundPolicySnapshot?: string | null // legacy fallback
  status: ConsultationRefundStatus
  recommendation?: RefundRecommendation | null
  recommendedAmount?: number | null
  reviewReason?: string | null
  reviewedBy?: number | string | null
  reviewedAt?: string | null
  recommendedByUserId?: number | string | null // legacy fallback
  recommendedAt?: string | null // legacy fallback
  recommendationReason?: string | null // legacy fallback
  operationalContext?: string | null
  approved?: boolean | null
  approvedAmount?: number | null
  decidedBy?: number | string | null
  decidedByUserId?: number | string | null // legacy fallback
  decidedAt?: string | null
  decisionReason?: string | null
  providerRefundId?: string | null
  providerResult?: string | null
  executionAttempts?: number | null
  attemptsCount?: number // legacy fallback
  lastExecutionAt?: string | null
  lastAttemptAt?: string | null // legacy fallback
  completedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}
