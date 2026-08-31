import type { UserRole } from "@/types/auth"

export type NeedsActionStatus = "OPEN" | "CLAIMED" | "RESOLVED" | string

export type NeedsActionPriority = "NORMAL" | "HIGH" | "CRITICAL" | string

export type NeedsActionType =
  | "PAYMENT_REQUIRES_REVIEW"
  | "PROVIDER_CANCELLATION_RECONCILIATION"
  | "REFUND_REVIEW_REQUIRED"
  | "REFUND_PROVIDER_FAILURE"
  | "DOCTOR_ACTIVE_CARE_INTERRUPTION"
  | "MEMBER_ACTIVE_CARE_INTERRUPTION"
  | "TERMINATION_REVIEW"
  | "SUMMARY_PENDING"
  | "SUMMARY_OVERDUE"
  | "SUMMARY_ESCALATED"
  | string

export interface NeedsActionResponse {
  id: number | string
  type: NeedsActionType
  status: NeedsActionStatus
  priority: NeedsActionPriority
  title: string
  description: string
  assignedRole: UserRole | string
  referenceType?: string | null
  referenceId?: string | number | null
  requestId?: number | string | null
  paymentId?: number | string | null
  sessionId?: number | string | null
  renewalId?: number | string | null
  refundId?: number | string | null
  memberId?: number | string | null
  doctorId?: number | string | null
  claimedBy?: number | string | null
  claimedByUserId?: number | string | null // legacy fallback
  claimedAt?: string | null
  resolvedBy?: number | string | null
  resolvedByUserId?: number | string | null // legacy fallback
  resolvedAt?: string | null
  resolutionNotes?: string | null
  resolution?: string | null // legacy fallback
  createdAt: string
  updatedAt?: string | null
}

export interface ResolveNeedsActionRequest {
  resolution: string
}

export interface NeedsActionFilterParams {
  status?: NeedsActionStatus | string
  type?: NeedsActionType | string
  page?: number
  size?: number
}
