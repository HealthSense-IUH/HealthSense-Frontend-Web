import React from "react"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react"

import type {
  PredictionLabel,
  PredictionLabelMeta,
} from "@/types/health-record"

/**
 * Single source of truth for all Prediction Labels across HealthSense
 */
export const PREDICTION_LABEL_CONFIG: Record<PredictionLabel, PredictionLabelMeta> = {
  NORMAL: {
    key: "NORMAL",
    label: "Bình thường",
    shortLabel: "Bình thường",
    badgeText: "Bình thường",
    badgeClass:
      "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700",
    dotClass: "bg-emerald-500",
    topBarClass: "bg-emerald-500",
    statusTextClass: "text-emerald-700 dark:text-emerald-400 font-semibold",
    advice:
      "Tín hiệu nhịp tim ổn định và nằm trong dải sinh lý bình thường. Hãy duy trì theo dõi sức khỏe định kỳ.",
    isRisk: false,
    probabilityRangeText: "< 30%",
    icon: React.createElement(ShieldCheck, {
      className: "w-5 h-5 text-emerald-600 dark:text-emerald-400",
    }),
  },
  UNCERTAIN: {
    key: "UNCERTAIN",
    label: "Chưa rõ",
    shortLabel: "Chưa rõ",
    badgeText: "Chưa rõ",
    badgeClass:
      "bg-purple-50 text-purple-900 border-purple-300 dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-700",
    dotClass: "bg-purple-500",
    topBarClass: "bg-purple-500",
    statusTextClass: "text-purple-700 dark:text-purple-400 font-semibold",
    advice:
      "Dữ liệu có một số đoạn nhiễu nhẹ. Kết quả mang tính tham khảo, nên đo lại khi ngồi yên tĩnh.",
    isRisk: false,
    probabilityRangeText: "30% - 50%",
    icon: React.createElement(Info, {
      className: "w-5 h-5 text-purple-600 dark:text-purple-400",
    }),
  },
  AFIB_SUSPECTED: {
    key: "AFIB_SUSPECTED",
    label: "Nghi ngờ AFib",
    shortLabel: "Nghi ngờ AFib",
    badgeText: "Nghi ngờ AFib",
    badgeClass:
      "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700",
    dotClass: "bg-amber-500",
    topBarClass: "bg-amber-500",
    statusTextClass: "text-amber-700 dark:text-amber-400 font-bold",
    advice:
      "Có dấu hiệu loạn nhịp hoặc biến thiên khoảng cách R-R bất thường nhẹ. Khuyến khích đo lại khi nghỉ ngơi.",
    isRisk: true,
    probabilityRangeText: "50% - 70%",
    icon: React.createElement(AlertCircle, {
      className: "w-5 h-5 text-amber-600 dark:text-amber-400",
    }),
  },
  AFIB: {
    key: "AFIB",
    label: "Cảnh báo AFib",
    shortLabel: "Cảnh báo AFib",
    badgeText: "Cảnh báo AFib",
    badgeClass:
      "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700",
    dotClass: "bg-rose-500",
    topBarClass: "bg-rose-500",
    statusTextClass: "text-rose-700 dark:text-rose-400 font-bold",
    advice:
      "AI phát hiện biến thiên nhịp tim có tính chất rung nhĩ. Khuyến nghị liên hệ bác sĩ chuyên khoa tim mạch để được chẩn đoán.",
    isRisk: true,
    probabilityRangeText: "≥ 70%",
    icon: React.createElement(AlertTriangle, {
      className: "w-5 h-5 text-rose-600 dark:text-rose-400",
    }),
  },
}
