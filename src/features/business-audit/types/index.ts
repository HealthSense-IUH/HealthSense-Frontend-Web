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

export type BusinessActorType = "USER" | "SYSTEM" | string

export interface BusinessAuditEventResponse {
  id: number | string
  domainType: BusinessDomainType
  domainId: string | number
  eventType: string
  actorId?: number | string | null
  actorRole?: string | null
  actorType: BusinessActorType
  previousState?: string | null
  newState?: string | null
  reason?: string | null
  metadataJson?: string | null
  correctionReference?: string | null
  occurredAt: string
}

export interface BusinessAuditFilterParams {
  domainType?: BusinessDomainType
  domainId?: string | number
  eventType?: string
  page?: number
  size?: number
}

/**
 * Domain types permissible for CARE_COORDINATOR
 * HealthRecord, Package, and Account domains are strictly forbidden for Coordinators.
 */
export const COORDINATOR_PERMITTED_DOMAINS: BusinessDomainType[] = [
  "REQUEST",
  "RESERVATION",
  "AGREEMENT",
  "PAYMENT",
  "SESSION",
  "RENEWAL",
  "REFUND",
  "FINAL_SUMMARY",
]

/**
 * All domain types permissible for ADMIN and SUPER_ADMIN
 */
export const ADMIN_ALL_DOMAINS: BusinessDomainType[] = [
  "PACKAGE",
  "REQUEST",
  "RESERVATION",
  "AGREEMENT",
  "PAYMENT",
  "SESSION",
  "RENEWAL",
  "REFUND",
  "HEALTH_RECORD",
  "FINAL_SUMMARY",
  "ACCOUNT",
]
