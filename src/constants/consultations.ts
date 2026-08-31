import type { BusinessDomainType } from "@/types/business-audit"

export const CARE_SERVICE_CODE_LABELS: Record<string, string> = {
  REMOTE_ONE_ON_ONE_CARE: "Chăm sóc 1-1 từ xa",
  SECURE_MESSAGING: "Nhắn tin bảo mật",
  HEALTH_RECORD_REVIEW: "Đánh giá hồ sơ sức khỏe",
  AI_SCREENING_REVIEW: "Đánh giá kết quả tầm soát AI",
  CARE_MONITORING: "Theo dõi chỉ số sức khỏe định kỳ",
  FINAL_CARE_SUMMARY: "Tổng kết y khoa cuối kỳ",
  VIDEO_CONSULTATION: "Tư vấn qua video call",
  EMERGENCY_CARE: "Cấp cứu khẩn cấp",
  TWENTY_FOUR_SEVEN_SUPPORT: "Hỗ trợ y tế 24/7",
  FORMAL_DIAGNOSIS: "Chẩn đoán bệnh chính thức",
  PRESCRIPTION: "Kê đơn thuốc",
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
