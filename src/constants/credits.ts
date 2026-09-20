import type {
  CreditOperation,
  CreditOrderStatus,
  CreditPackageStatus,
  CreditPaymentProvider,
  CreditPaymentStatus,
  CreditReservationStatus,
  CreditSourceType,
} from "@/types/credits"

export interface StatusConfig {
  label: string
  className: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

export const CREDIT_ORDER_STATUS_CONFIG: Record<CreditOrderStatus, StatusConfig> = {
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
  REQUIRES_REVIEW: {
    label: "Đang kiểm tra",
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  },
}

export const CREDIT_PACKAGE_STATUS_CONFIG: Record<CreditPackageStatus, StatusConfig> = {
  ACTIVE: {
    label: "Đang mở bán",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  INACTIVE: {
    label: "Tạm dừng bán",
    className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  },
}

export const CREDIT_RESERVATION_STATUS_CONFIG: Record<CreditReservationStatus, StatusConfig> = {
  HELD: {
    label: "Lượt đang được tạm giữ",
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  },
  CAPTURED: {
    label: "Lượt đã được sử dụng",
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  },
  RELEASED: {
    label: "Lượt đã được trả lại",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
  },
}

export const CREDIT_PAYMENT_STATUS_CONFIG: Record<CreditPaymentStatus, StatusConfig> = {
  CREATING: {
    label: "Đang khởi tạo",
    className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800",
  },
  PENDING: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
  },
  REQUIRES_REVIEW: {
    label: "Đang kiểm tra",
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  },
}

export const CREDIT_PAYMENT_PROVIDER_CONFIG: Record<
  CreditPaymentProvider,
  { label: string; description: string }
> = {
  MOCK: {
    label: "Thanh toán giả lập",
    description: "Thử nghiệm hệ thống, không trừ tiền thật",
  },
  PAYOS: {
    label: "Cổng thanh toán PayOS",
    description: "Cổng thanh toán trực tuyến PayOS",
  },
}

export const CREDIT_OPERATION_CONFIG: Record<
  CreditOperation,
  { label: string; description: string; className: string }
> = {
  PURCHASE: {
    label: "Mua lượt",
    description: "Cộng lượt khi thanh toán đơn mua",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  RESERVE: {
    label: "Giữ lượt tư vấn",
    description: "Tạm giữ lượt khi tham gia phiên tư vấn",
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  },
  CAPTURE: {
    label: "Sử dụng lượt",
    description: "Tiêu thụ lượt tư vấn đã giữ",
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  },
  RELEASE: {
    label: "Trả lượt giữ",
    description: "Hoàn trả lượt đang giữ về lại khả dụng",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    description: "Quản trị viên điều chỉnh lượt",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  SESSION_REFUND: {
    label: "Bồi hoàn lượt",
    description: "Bồi hoàn lượt tư vấn của phiên",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
}

export const CREDIT_SOURCE_TYPE_CONFIG: Record<
  CreditSourceType,
  { label: string; isOrder: boolean }
> = {
  PURCHASE_ORDER: {
    label: "Đơn mua",
    isOrder: true,
  },
  CONSULTATION_REQUEST: {
    label: "Yêu cầu tư vấn",
    isOrder: false,
  },
  CONSULTATION_SESSION: {
    label: "Phiên tư vấn",
    isOrder: false,
  },
  ADMIN_ADJUSTMENT: {
    label: "Điều chỉnh quản trị",
    isOrder: false,
  },
}

export const CREDIT_ERROR_CODE_MESSAGES: Record<number, string> = {
  1003: "Tài khoản của bạn hiện không hoạt động. Vui lòng liên hệ quản trị viên.",
  1201: "Thông tin yêu cầu không hợp lệ.",
  1203: "Dữ liệu gửi lên máy chủ không đúng định dạng.",
  3001: "Ràng buộc dữ liệu bị vi phạm.",
  4008: "Không tìm thấy thông tin hội viên.",
  4100: "Số dư lượt tư vấn không đủ để thực hiện thao tác này.",
  4103: "Xung đột mã yêu cầu (Idempotency Key). Vui lòng thử lại với yêu cầu mới.",
  4104: "Số dư ví lượt đã đạt giới hạn tối đa cho phép. Vui lòng liên hệ hỗ trợ.",
  4105: "Gói lượt tư vấn hiện không khả dụng hoặc đã ngừng bán.",
  4106: "Không tìm thấy thông tin đơn mua lượt hoặc đơn không thuộc về bạn.",
  4108: "Chức năng mua lượt tư vấn tạm thời chưa khả dụng trong hệ thống.",
  4109: "Không tìm thấy thông tin gói lượt quản trị.",
  4110: "Dữ liệu gói đã bị thay đổi bởi quản trị viên khác. Vui lòng tải lại dữ liệu mới nhất.",
  4111: "Phiên tư vấn không đủ điều kiện để bồi hoàn lượt tư vấn.",
  9999: "Hệ thống đang bảo trì hoặc gặp sự cố xử lý. Vui lòng thử lại sau.",
}

/**
 * Format số tiền VND chuẩn mà không chia 100
 */
export function formatVnd(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0 ₫"
  return new Intl.NumberFormat("vi-VN", {
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
  if (typeof qty !== "number" || isNaN(qty)) return "0 lượt"
  return `${qty.toLocaleString("vi-VN")} lượt`
}

/**
 * Fallback helpers an toàn khi gặp enum mới từ server
 */
export function getCreditPackageStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_PACKAGE_STATUS_CONFIG) {
    return CREDIT_PACKAGE_STATUS_CONFIG[status as CreditPackageStatus]
  }
  return {
    label: status || "Không xác định",
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditReservationStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_RESERVATION_STATUS_CONFIG) {
    return CREDIT_RESERVATION_STATUS_CONFIG[status as CreditReservationStatus]
  }
  return {
    label: status || "Không có tạm giữ",
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditOrderStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_ORDER_STATUS_CONFIG) {
    return CREDIT_ORDER_STATUS_CONFIG[status as CreditOrderStatus]
  }
  return {
    label: status || "Không xác định",
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditPaymentStatusConfig(status?: string | null): StatusConfig {
  if (status && status in CREDIT_PAYMENT_STATUS_CONFIG) {
    return CREDIT_PAYMENT_STATUS_CONFIG[status as CreditPaymentStatus]
  }
  return {
    label: status || "Không xác định",
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditPaymentProviderConfig(provider?: string | null): { label: string; description: string } {
  if (provider && provider in CREDIT_PAYMENT_PROVIDER_CONFIG) {
    return CREDIT_PAYMENT_PROVIDER_CONFIG[provider as CreditPaymentProvider]
  }
  return {
    label: provider || "Thanh toán giả lập",
    description: "Phương thức thanh toán",
  }
}

export function getCreditOperationConfig(op?: string | null) {
  if (op && op in CREDIT_OPERATION_CONFIG) {
    return CREDIT_OPERATION_CONFIG[op as CreditOperation]
  }
  return {
    label: op || "Khác",
    description: "Biến động lượt",
    className: "bg-muted text-muted-foreground border-border",
  }
}

export function getCreditSourceTypeConfig(sourceType?: string | null) {
  if (sourceType && sourceType in CREDIT_SOURCE_TYPE_CONFIG) {
    return CREDIT_SOURCE_TYPE_CONFIG[sourceType as CreditSourceType]
  }
  return {
    label: sourceType || "Nguồn khác",
    isOrder: false,
  }
}
