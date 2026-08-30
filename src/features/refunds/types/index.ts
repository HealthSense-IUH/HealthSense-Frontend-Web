export type ConsultationRefundStatus =
  | "REVIEW_REQUIRED"
  | "RECOMMENDED"
  | "APPROVED"
  | "REJECTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | string

export type RefundRecommendation = "FULL" | "PARTIAL" | "NONE"

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
  originalAmount: number
  currency: string
  refundPolicySnapshot?: string | null
  status: ConsultationRefundStatus
  recommendation?: RefundRecommendation | null
  recommendedAmount?: number | null
  recommendedByUserId?: number | string | null
  recommendedAt?: string | null
  recommendationReason?: string | null
  operationalContext?: string | null
  approved?: boolean | null
  approvedAmount?: number | null
  decidedByUserId?: number | string | null
  decidedAt?: string | null
  decisionReason?: string | null
  providerRefundId?: string | null
  providerResult?: string | null
  attemptsCount?: number
  lastAttemptAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}
