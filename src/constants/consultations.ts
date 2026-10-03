import i18n from "@/lib/i18n"
import type { BusinessDomainType } from "@/types/business-audit"

export const CARE_SERVICE_CODE_LABELS: Record<string, string> = {
  get REMOTE_ONE_ON_ONE_CARE() {
    return i18n.t("consultation:careServices.remoteOneOnOneCare")
  },
  get SECURE_MESSAGING() {
    return i18n.t("consultation:careServices.secureMessaging")
  },
  get HEALTH_RECORD_REVIEW() {
    return i18n.t("consultation:careServices.healthRecordReview")
  },
  get AI_SCREENING_REVIEW() {
    return i18n.t("consultation:careServices.aiScreeningReview")
  },
  get CARE_MONITORING() {
    return i18n.t("consultation:careServices.careMonitoring")
  },
  get FINAL_CARE_SUMMARY() {
    return i18n.t("consultation:careServices.finalCareSummary")
  },
  get VIDEO_CONSULTATION() {
    return i18n.t("consultation:careServices.videoConsultation")
  },
  get EMERGENCY_CARE() {
    return i18n.t("consultation:careServices.emergencyCare")
  },
  get TWENTY_FOUR_SEVEN_SUPPORT() {
    return i18n.t("consultation:careServices.twentyFourSevenSupport")
  },
  get FORMAL_DIAGNOSIS() {
    return i18n.t("consultation:careServices.formalDiagnosis")
  },
  get PRESCRIPTION() {
    return i18n.t("consultation:careServices.prescription")
  },
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
