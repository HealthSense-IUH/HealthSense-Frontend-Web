import React from "react"
import { Activity, AlertCircle, Info } from "lucide-react"

import { PREDICTION_LABEL_CONFIG } from "@/constants/health-records"
import type {
  PredictionLabel,
  PredictionLabelMeta,
  RecordStatus,
} from "@/types/health-record"

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
      badgeClass:
        "bg-blue-50 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-700",
      dotClass: "bg-blue-500 animate-pulse",
      topBarClass: "bg-blue-500",
      statusTextClass: "text-blue-700 dark:text-blue-400 font-semibold",
      advice:
        "Dữ liệu đang được phân tích qua mô hình AI. Vui lòng đợi trong giây lát...",
      isRisk: false,
      probabilityRangeText: "Đang xử lý",
      icon: React.createElement(Activity, {
        className: "w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin",
      }),
    }
  }

  if (status === "FAILED") {
    return {
      key: "FAILED",
      label: "Lỗi phân tích",
      shortLabel: "Lỗi",
      badgeText: "Lỗi",
      badgeClass:
        "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
      dotClass: "bg-slate-400",
      topBarClass: "bg-slate-400",
      statusTextClass: "text-slate-700 dark:text-slate-400 font-semibold",
      advice:
        "Tín hiệu đo quá ngắn hoặc chứa nhiều nhiễu động. Khuyến nghị thực hiện đo lại trong trạng thái nghỉ ngơi.",
      isRisk: false,
      probabilityRangeText: "N/A",
      icon: React.createElement(AlertCircle, {
        className: "w-5 h-5 text-slate-500",
      }),
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
    badgeClass:
      "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-400",
    topBarClass: "bg-slate-400",
    statusTextClass: "text-slate-700 dark:text-slate-400 font-semibold",
    advice: "Bản ghi đang chờ đồng bộ hóa dữ liệu.",
    isRisk: false,
    probabilityRangeText: "N/A",
    icon: React.createElement(Info, {
      className: "w-5 h-5 text-slate-500",
    }),
  }
}
