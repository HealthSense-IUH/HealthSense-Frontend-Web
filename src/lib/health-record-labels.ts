import React from "react"
import { 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Activity,
  AlertTriangle 
} from "lucide-react"

export type PredictionLabel = "NORMAL" | "AFIB" | "AFIB_SUSPECTED" | "UNCERTAIN"

export type RecordStatus = 
  | "PENDING_UPLOAD" 
  | "PROCESSING" 
  | "PENDING_ANALYSIS" 
  | "COMPLETED" 
  | "FAILED"

export interface PredictionLabelMeta {
  key: PredictionLabel | "PROCESSING" | "FAILED" | "UNKNOWN"
  label: string
  shortLabel: string
  badgeText: string
  badgeClass: string
  dotClass: string
  topBarClass: string
  statusTextClass: string
  advice: string
  isRisk: boolean
  probabilityRangeText: string
  icon: React.ReactNode
}

/**
 * Single source of truth for all Prediction Labels across HealthSense
 */
export const PREDICTION_LABEL_CONFIG: Record<PredictionLabel, PredictionLabelMeta> = {
  NORMAL: {
    key: "NORMAL",
    label: "Bình thường",
    shortLabel: "Bình thường",
    badgeText: "Bình thường",
    badgeClass: "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700",
    dotClass: "bg-emerald-500",
    topBarClass: "bg-emerald-500",
    statusTextClass: "text-emerald-700 dark:text-emerald-400 font-semibold",
    advice: "Tín hiệu nhịp tim ổn định và nằm trong dải sinh lý bình thường. Hãy duy trì theo dõi sức khỏe định kỳ.",
    isRisk: false,
    probabilityRangeText: "< 30%",
    icon: React.createElement(ShieldCheck, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
  },
  UNCERTAIN: {
    key: "UNCERTAIN",
    label: "Chưa rõ",
    shortLabel: "Chưa rõ",
    badgeText: "Chưa rõ",
    badgeClass: "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-700",
    dotClass: "bg-purple-500",
    topBarClass: "bg-purple-500",
    statusTextClass: "text-purple-700 dark:text-purple-400 font-semibold",
    advice: "Dữ liệu có một số đoạn nhiễu nhẹ. Kết quả mang tính tham khảo, nên đo lại khi ngồi yên tĩnh.",
    isRisk: false,
    probabilityRangeText: "30% - 50%",
    icon: React.createElement(Info, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" }),
  },
  AFIB_SUSPECTED: {
    key: "AFIB_SUSPECTED",
    label: "Nghi ngờ AFib",
    shortLabel: "Nghi ngờ AFib",
    badgeText: "Nghi ngờ AFib",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700",
    dotClass: "bg-amber-500",
    topBarClass: "bg-amber-500",
    statusTextClass: "text-amber-700 dark:text-amber-400 font-bold",
    advice: "Có dấu hiệu loạn nhịp hoặc biến thiên khoảng cách R-R bất thường nhẹ. Khuyến khích đo lại khi nghỉ ngơi.",
    isRisk: true,
    probabilityRangeText: "50% - 70%",
    icon: React.createElement(AlertCircle, { className: "w-5 h-5 text-amber-600 dark:text-amber-400" }),
  },
  AFIB: {
    key: "AFIB",
    label: "Cảnh báo AFib",
    shortLabel: "Cảnh báo AFib",
    badgeText: "Cảnh báo AFib",
    badgeClass: "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700",
    dotClass: "bg-rose-500",
    topBarClass: "bg-rose-500",
    statusTextClass: "text-rose-700 dark:text-rose-400 font-bold",
    advice: "AI phát hiện biến thiên nhịp tim có tính chất rung nhĩ. Khuyến nghị liên hệ bác sĩ chuyên khoa tim mạch để được chẩn đoán.",
    isRisk: true,
    probabilityRangeText: "≥ 70%",
    icon: React.createElement(AlertTriangle, { className: "w-5 h-5 text-rose-600 dark:text-rose-400" }),
  },
}

/**
 * Get unified visual meta for health records
 */
export function getPredictionMeta(
  label?: PredictionLabel | null, 
  status?: RecordStatus
): PredictionLabelMeta {
  if (status === "PROCESSING" || status === "PENDING_ANALYSIS") {
    return {
      key: "PROCESSING",
      label: "Đang phân tích",
      shortLabel: "Đang xử lý",
      badgeText: "Đang phân tích",
      badgeClass: "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-700",
      dotClass: "bg-blue-500 animate-pulse",
      topBarClass: "bg-blue-500",
      statusTextClass: "text-blue-700 dark:text-blue-400 font-semibold",
      advice: "Dữ liệu đang được phân tích qua mô hình AI. Vui lòng đợi trong giây lát...",
      isRisk: false,
      probabilityRangeText: "Đang xử lý",
      icon: React.createElement(Activity, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" }),
    }
  }

  if (status === "FAILED") {
    return {
      key: "FAILED",
      label: "Lỗi phân tích",
      shortLabel: "Lỗi",
      badgeText: "Lỗi",
      badgeClass: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
      dotClass: "bg-slate-400",
      topBarClass: "bg-slate-400",
      statusTextClass: "text-slate-700 dark:text-slate-400 font-semibold",
      advice: "Tín hiệu đo quá ngắn hoặc chứa nhiều nhiễu động. Khuyến nghị thực hiện đo lại trong trạng thái nghỉ ngơi.",
      isRisk: false,
      probabilityRangeText: "N/A",
      icon: React.createElement(AlertCircle, { className: "w-5 h-5 text-slate-500" }),
    }
  }

  if (label && PREDICTION_LABEL_CONFIG[label]) {
    return PREDICTION_LABEL_CONFIG[label]
  }

  return {
    key: "UNKNOWN",
    label: label || "Chưa có kết luận",
    shortLabel: label || "Chưa rõ",
    badgeText: label || "Chưa rõ",
    badgeClass: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-400",
    topBarClass: "bg-slate-400",
    statusTextClass: "text-slate-700 dark:text-slate-400 font-semibold",
    advice: "Bản ghi đang chờ đồng bộ hóa dữ liệu.",
    isRisk: false,
    probabilityRangeText: "N/A",
    icon: React.createElement(Info, { className: "w-5 h-5 text-slate-500" }),
  }
}

/**
 * Format numbers with Vietnamese locale
 */
export function formatHrvNumber(val: unknown, decimals = 2): string {
  if (typeof val !== "number" || isNaN(val)) return "--"
  return Number(val.toFixed(decimals)).toLocaleString("vi-VN")
}

/**
 * Format ISO datetime string to vi-VN formatted date
 */
export function formatRecordDate(isoString?: string): string {
  if (!isoString) return "N/A"
  try {
    const d = new Date(isoString)
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return isoString
  }
}
