import type {
  CreditOperation,
  CreditOrderStatus,
  CreditPackageStatus,
  CreditPaymentProvider,
  CreditPaymentStatus,
  CreditReservationStatus,
  CreditSourceType,
  ConsultationCreditPolicy,
} from "@/types/credits"
import i18n, { currentIntlLocale } from "@/lib/i18n"

export interface StatusConfig {
  label: string
  className: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

// Nhãn hiển thị đọc từ i18n lúc truy cập (getter), không lúc nạp module,
// để đổi ngôn ngữ là nhãn đổi theo.
export const CREDIT_ORDER_STATUS_CONFIG: Record<CreditOrderStatus, StatusConfig> = {
  PAID: {
    get label() { return i18n.t("credits:orderStatus.paid") },
    className: "bg-success-50 text-success-700 border-success-200",
  },
  PENDING_PAYMENT: {
    get label() { return i18n.t("credits:orderStatus.pendingPayment") },
    className: "bg-warning-50 text-warning-700 border-warning-200",
  },
  CANCELLED: {
    get label() { return i18n.t("credits:orderStatus.cancelled") },
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  EXPIRED: {
    get label() { return i18n.t("credits:orderStatus.expired") },
    className: "bg-danger-50 text-danger-700 border-danger-200",
  },
  REQUIRES_REVIEW: {
    get label() { return i18n.t("credits:orderStatus.requiresReview") },
    className: "bg-warning-50 text-warning-700 border-warning-200",
  },
}

export const CREDIT_PACKAGE_STATUS_CONFIG: Record<CreditPackageStatus, StatusConfig> = {
  ACTIVE: {
    get label() { return i18n.t("credits:packageStatus.active") },
    className: "bg-success-50 text-success-700 border-success-200",
  },
  INACTIVE: {
    get label() { return i18n.t("credits:packageStatus.inactive") },
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
}

export const CREDIT_RESERVATION_STATUS_CONFIG: Record<CreditReservationStatus, StatusConfig> = {
  HELD: {
    get label() { return i18n.t("credits:reservationStatus.held") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  CAPTURED: {
    get label() { return i18n.t("credits:reservationStatus.captured") },
    className: "bg-danger-50 text-danger-700 border-danger-200",
  },
  RELEASED: {
    get label() { return i18n.t("credits:reservationStatus.released") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
}

export const CREDIT_PAYMENT_STATUS_CONFIG: Record<CreditPaymentStatus, StatusConfig> = {
  CREATING: {
    get label() { return i18n.t("credits:paymentStatus.creating") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  PENDING: {
    get label() { return i18n.t("credits:paymentStatus.pending") },
    className: "bg-warning-50 text-warning-700 border-warning-200",
  },
  PAID: {
    get label() { return i18n.t("credits:paymentStatus.paid") },
    className: "bg-success-50 text-success-700 border-success-200",
  },
  CANCELLED: {
    get label() { return i18n.t("credits:paymentStatus.cancelled") },
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  EXPIRED: {
    get label() { return i18n.t("credits:paymentStatus.expired") },
    className: "bg-danger-50 text-danger-700 border-danger-200",
  },
  REQUIRES_REVIEW: {
    get label() { return i18n.t("credits:paymentStatus.requiresReview") },
    className: "bg-warning-50 text-warning-700 border-warning-200",
  },
}

export const CREDIT_PAYMENT_PROVIDER_CONFIG: Record<
  CreditPaymentProvider,
  { label: string; description: string }
> = {
  MOCK: {
    get label() { return i18n.t("credits:paymentProvider.mock.label") },
    get description() { return i18n.t("credits:paymentProvider.mock.description") },
  },
  PAYOS: {
    get label() { return i18n.t("credits:paymentProvider.payos.label") },
    get description() { return i18n.t("credits:paymentProvider.payos.description") },
  },
}

export const CREDIT_OPERATION_CONFIG: Record<
  CreditOperation,
  { label: string; description: string; className: string }
> = {
  PURCHASE: {
    get label() { return i18n.t("credits:operation.purchase.label") },
    get description() { return i18n.t("credits:operation.purchase.description") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  RESERVE: {
    get label() { return i18n.t("credits:operation.reserve.label") },
    get description() { return i18n.t("credits:operation.reserve.description") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  CAPTURE: {
    get label() { return i18n.t("credits:operation.capture.label") },
    get description() { return i18n.t("credits:operation.capture.description") },
    className: "bg-danger-50 text-danger-700 border-danger-200",
  },
  RELEASE: {
    get label() { return i18n.t("credits:operation.release.label") },
    get description() { return i18n.t("credits:operation.release.description") },
    className: "bg-primary-50 text-primary-700 border-primary-200",
  },
  SESSION_CHARGE: {
    get label() { return i18n.t("credits:operation.sessionCharge.label") },
    get description() { return i18n.t("credits:operation.sessionCharge.description") },
    className: "bg-danger-50 text-danger-700 border-danger-200",
  },
  ADJUSTMENT: {
    get label() { return i18n.t("credits:operation.adjustment.label") },
    get description() { return i18n.t("credits:operation.adjustment.description") },
    className: "bg-warning-50 text-warning-700 border-warning-200",
  },
  SESSION_REFUND: {
    get label() { return i18n.t("credits:operation.sessionRefund.label") },
    get description() { return i18n.t("credits:operation.sessionRefund.description") },
    className: "bg-success-50 text-success-700 border-success-200",
  },
}

export const CREDIT_SOURCE_TYPE_CONFIG: Record<
  CreditSourceType,
  { label: string; isOrder: boolean }
> = {
  PURCHASE_ORDER: {
    get label() { return i18n.t("credits:sourceType.purchaseOrder") },
    isOrder: true,
  },
  CONSULTATION_REQUEST: {
    get label() { return i18n.t("credits:sourceType.consultationRequest") },
    isOrder: false,
  },
  CONSULTATION_SESSION: {
    get label() { return i18n.t("credits:sourceType.consultationSession") },
    isOrder: false,
  },
  ADMIN_ADJUSTMENT: {
    get label() { return i18n.t("credits:sourceType.adminAdjustment") },
    isOrder: false,
  },
}

export const CREDIT_ERROR_CODE_MESSAGES: Record<number, string> = {
  get 1003() { return i18n.t("credits:errorCode.c1003") },
  get 1201() { return i18n.t("credits:errorCode.c1201") },
  get 1203() { return i18n.t("credits:errorCode.c1203") },
  get 3001() { return i18n.t("credits:errorCode.c3001") },
  get 4008() { return i18n.t("credits:errorCode.c4008") },
  get 4100() { return i18n.t("credits:errorCode.c4100") },
  get 4103() { return i18n.t("credits:errorCode.c4103") },
  get 4104() { return i18n.t("credits:errorCode.c4104") },
  get 4105() { return i18n.t("credits:errorCode.c4105") },
  get 4106() { return i18n.t("credits:errorCode.c4106") },
  get 4108() { return i18n.t("credits:errorCode.c4108") },
  get 4109() { return i18n.t("credits:errorCode.c4109") },
  get 4110() { return i18n.t("credits:errorCode.c4110") },
  get 4111() { return i18n.t("credits:errorCode.c4111") },
  get 9999() { return i18n.t("credits:errorCode.c9999") },
}

/**
 * Format số tiền VND chuẩn mà không chia 100
 */
export function formatVnd(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫"
  return new Intl.NumberFormat(currentIntlLocale(), {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatVndPrice = formatVnd

/**
 * Tạo Idempotency-Key chuẩn cho credit operations
 */
export function generateCreditIdempotencyKey(prefix = "hs-credit"): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 10)
  return `${prefix}-${ts}-${rand}`
}

/**
 * Format số lượt hiển thị
 */
export function formatCreditQuantity(qty: number): string {
  if (typeof qty !== "number" || isNaN(qty)) return i18n.t("credits:quantity.credits", { count: 0, value: 0 })
  return i18n.t("credits:quantity.credits", { count: qty, value: qty.toLocaleString(currentIntlLocale()) })
}

/**
 * Fallback helpers an toàn khi gặp enum mới từ server
 */
export function getCreditPackageStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_PACKAGE_STATUS_CONFIG) {
    return CREDIT_PACKAGE_STATUS_CONFIG[status as CreditPackageStatus]
  }
  return {
    label: status || i18n.t("credits:display.unknown"),
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditReservationStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_RESERVATION_STATUS_CONFIG) {
    return CREDIT_RESERVATION_STATUS_CONFIG[status as CreditReservationStatus]
  }
  return {
    label: status || i18n.t("credits:reservationStatus.none"),
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditOrderStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_ORDER_STATUS_CONFIG) {
    return CREDIT_ORDER_STATUS_CONFIG[status as CreditOrderStatus]
  }
  return {
    label: status || i18n.t("credits:display.unknown"),
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditPaymentStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_PAYMENT_STATUS_CONFIG) {
    return CREDIT_PAYMENT_STATUS_CONFIG[status as CreditPaymentStatus]
  }
  return {
    label: status || i18n.t("credits:display.unknown"),
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditPaymentProviderConfig(provider?: string | null): { label: string; description: string } {
  if (provider && provider in CREDIT_PAYMENT_PROVIDER_CONFIG) {
    return CREDIT_PAYMENT_PROVIDER_CONFIG[provider as CreditPaymentProvider]
  }
  return {
    label: provider || i18n.t("credits:paymentProvider.mock.label"),
    description: i18n.t("credits:paymentProvider.fallbackDescription"),
  }
}

export function getCreditOperationConfig(op?: string | null) {
  if (op && op in CREDIT_OPERATION_CONFIG) {
    return CREDIT_OPERATION_CONFIG[op as CreditOperation]
  }
  return {
    label: op || i18n.t("credits:operation.fallbackLabel"),
    description: i18n.t("credits:operation.fallbackDescription"),
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditSourceTypeConfig(sourceType?: string | null) {
  if (sourceType && sourceType in CREDIT_SOURCE_TYPE_CONFIG) {
    return CREDIT_SOURCE_TYPE_CONFIG[sourceType as CreditSourceType]
  }
  return {
    label: sourceType || i18n.t("credits:sourceType.fallback"),
    isOrder: false,
  }
}

/**
 * Quy tắc hiển thị thông tin lượt tư vấn theo policy V20 (FRONTEND_V20_SESSION_CHARGE_HANDOFF.md)
 */
export function getCreditDisplay(snapshot?: {
  creditPolicy?: ConsultationCreditPolicy | null
  creditReservationStatus?: CreditReservationStatus | null
} | null): string | null {
  if (!snapshot?.creditPolicy) return null
  if (snapshot.creditPolicy === "PER_SESSION_CONFIRM_V2") {
    return snapshot.creditReservationStatus === "CAPTURED"
      ? i18n.t("credits:display.creditUsed")
      : i18n.t("credits:display.chargedOnConfirm")
  }
  if (snapshot.creditPolicy === "PER_SESSION_V1") {
    if (snapshot.creditReservationStatus === "HELD") return i18n.t("credits:display.held")
    if (snapshot.creditReservationStatus === "CAPTURED") return i18n.t("credits:display.creditUsed")
    if (snapshot.creditReservationStatus === "RELEASED") return i18n.t("credits:display.released")
  }
  return null
}

/**
 * Mã lỗi nghiệp vụ khi xác nhận phiên tư vấn (V20 Section 9)
 */
export const CONSULTATION_CONFIRM_ERROR_MESSAGES: Record<number, string> = {
  get 4100() { return i18n.t("credits:confirmError.c4100") },
  get 4026() { return i18n.t("credits:confirmError.c4026") },
  get 4027() { return i18n.t("credits:confirmError.c4027") },
  get 4028() { return i18n.t("credits:confirmError.c4028") },
  get 4009() { return i18n.t("credits:confirmError.c4009") },
  get 4014() { return i18n.t("credits:confirmError.c4014") },
  get 4002() { return i18n.t("credits:confirmError.c4002") },
  get 4004() { return i18n.t("credits:confirmError.c4004") },
}


export const VN_TIMEZONE_OFFSET_HOURS = 7
export const VN_TIMEZONE_OFFSET_MS = VN_TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000

/**
 * Trả về { year, month, day } tính theo múi giờ Việt Nam (UTC+7)
 */
export function getVnDateParts(date: Date = new Date()): { year: number; month: number; day: number } {
  const vnTime = new Date(date.getTime() + VN_TIMEZONE_OFFSET_MS)
  return {
    year: vnTime.getUTCFullYear(),
    month: vnTime.getUTCMonth() + 1,
    day: vnTime.getUTCDate(),
  }
}

/**
 * Tạo ISO Instant string (UTC) từ ngày giờ tại Việt Nam
 */
export function createVnInstantISO(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): string {
  return new Date(Date.UTC(year, month - 1, day, hour - VN_TIMEZONE_OFFSET_HOURS, minute, second)).toISOString()
}

/**
 * Chuyển YYYY-MM-DD từ input date thành đầu ngày Việt Nam dạng ISO instant
 */
export function parseVnDateInputToStartOfDayISO(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return undefined
  return createVnInstantISO(y, m, d, 0, 0, 0)
}

/**
 * Chuyển YYYY-MM-DD từ input date thành đầu ngày hôm sau tại Việt Nam (exclusive upper bound) dạng ISO instant
 */
export function parseVnDateInputToEndOfDayExclusiveISO(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return undefined
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1))
  return createVnInstantISO(nextDay.getUTCFullYear(), nextDay.getUTCMonth() + 1, nextDay.getUTCDate(), 0, 0, 0)
}

export function getStartOfDayISO(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function getStartOfNextDayISO(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export type PaymentDatePreset = "today" | "last7days" | "thisMonth" | "all" | "custom"

export function getPaymentDateRangePreset(preset: PaymentDatePreset): { from?: string; to?: string } {
  const { year, month, day } = getVnDateParts(new Date())

  if (preset === "today") {
    return {
      from: createVnInstantISO(year, month, day, 0, 0, 0),
      to: createVnInstantISO(year, month, day + 1, 0, 0, 0),
    }
  }

  if (preset === "last7days") {
    const past = new Date(Date.UTC(year, month - 1, day - 6))
    return {
      from: createVnInstantISO(past.getUTCFullYear(), past.getUTCMonth() + 1, past.getUTCDate(), 0, 0, 0),
      to: createVnInstantISO(year, month, day + 1, 0, 0, 0),
    }
  }

  if (preset === "thisMonth") {
    return {
      from: createVnInstantISO(year, month, 1, 0, 0, 0),
      to: createVnInstantISO(year, month, day + 1, 0, 0, 0),
    }
  }

  return { from: undefined, to: undefined }
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return "—"
  try {
    return new Intl.DateTimeFormat(currentIntlLocale(), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

