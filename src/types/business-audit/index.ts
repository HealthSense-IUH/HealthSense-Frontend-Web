export type BusinessDomainType =
  | "PACKAGE"
  | "REQUEST"
  | "RESERVATION"
  | "AGREEMENT"
  | "PAYMENT"
  | "SESSION"
  | "RENEWAL"
  | "REFUND"
  | "HEALTH_RECORD"
  | "FINAL_SUMMARY"
  | "ACCOUNT"
  | string

export type BusinessAuditTargetDomain = BusinessDomainType

export type BusinessActorType = "USER" | "SYSTEM" | string

export interface BusinessAuditEventResponse {
  id: number | string
  domainType: BusinessDomainType
  domainId: string | number
  eventType: string
  actorUserId?: number | string | null
  actorId?: number | string | null // legacy fallback
  actorRole?: string | null
  actorType: BusinessActorType
  previousState?: string | null
  newState?: string | null
  reason?: string | null
  metadataJson?: string | null
  correctionOfEventId?: number | string | null
  correctionReference?: string | null // legacy fallback
  requestId?: number | string | null
  agreementId?: number | string | null
  paymentId?: number | string | null
  sessionId?: number | string | null
  renewalId?: number | string | null
  refundId?: number | string | null
  healthRecordId?: number | string | null
  memberId?: number | string | null
  doctorId?: number | string | null
  summaryId?: number | string | null
  occurredAt: string
}

export interface BusinessAuditFilterParams {
  domainType?: BusinessDomainType
  domainId?: string | number
  eventType?: string
  page?: number
  size?: number
}
