import type { UserRole } from "@/types/authentication"

export type NeedsActionStatus = "OPEN" | "CLAIMED" | "RESOLVED"

export type NeedsActionPriority = "NORMAL" | "HIGH" | "CRITICAL"

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
  claimedByUserId?: number | string | null
  claimedAt?: string | null
  resolvedByUserId?: number | string | null
  resolvedAt?: string | null
  resolution?: string | null
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
