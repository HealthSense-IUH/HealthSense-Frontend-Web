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
      "bg-success-50 text-success-900 border-success-300",
    dotClass: "bg-success-500",
    topBarClass: "bg-success-500",
    statusTextClass: "text-success-700 font-semibold",
    advice:
      "Tín hiệu nhịp tim ổn định và nằm trong dải sinh lý bình thường. Hãy duy trì theo dõi sức khỏe định kỳ.",
    isRisk: false,
    probabilityRangeText: "< 30%",
    icon: React.createElement(ShieldCheck, {
      className: "w-5 h-5 text-success-600",
    }),
  },
  UNCERTAIN: {
    key: "UNCERTAIN",
    label: "Chưa rõ",
    shortLabel: "Chưa rõ",
    badgeText: "Chưa rõ",
    badgeClass:
      "bg-primary-50 text-primary-900 border-primary-300",
    dotClass: "bg-primary-500",
    topBarClass: "bg-primary-500",
    statusTextClass: "text-primary-700 font-semibold",
    advice:
      "Dữ liệu có một số đoạn nhiễu nhẹ. Kết quả mang tính tham khảo, nên đo lại khi ngồi yên tĩnh.",
    isRisk: false,
    probabilityRangeText: "30% - 50%",
    icon: React.createElement(Info, {
      className: "w-5 h-5 text-primary-600",
    }),
  },
  AFIB_SUSPECTED: {
    key: "AFIB_SUSPECTED",
    label: "Nghi ngờ AFib",
    shortLabel: "Nghi ngờ AFib",
    badgeText: "Nghi ngờ AFib",
    badgeClass:
      "bg-warning-50 text-warning-900 border-warning-300",
    dotClass: "bg-warning-500",
    topBarClass: "bg-warning-500",
    statusTextClass: "text-warning-700 font-bold",
    advice:
      "Có dấu hiệu loạn nhịp hoặc biến thiên khoảng cách R-R bất thường nhẹ. Khuyến khích đo lại khi nghỉ ngơi.",
    isRisk: true,
    probabilityRangeText: "50% - 70%",
    icon: React.createElement(AlertCircle, {
      className: "w-5 h-5 text-warning-600",
    }),
  },
  AFIB: {
    key: "AFIB",
    label: "Cảnh báo AFib",
    shortLabel: "Cảnh báo AFib",
    badgeText: "Cảnh báo AFib",
    badgeClass:
      "bg-danger-50 text-danger-900 border-danger-300",
    dotClass: "bg-danger-500",
    topBarClass: "bg-danger-500",
    statusTextClass: "text-danger-700 font-bold",
    advice:
      "AI phát hiện biến thiên nhịp tim có tính chất rung nhĩ. Khuyến nghị liên hệ bác sĩ chuyên khoa tim mạch để được chẩn đoán.",
    isRisk: true,
    probabilityRangeText: "≥ 70%",
    icon: React.createElement(AlertTriangle, {
      className: "w-5 h-5 text-danger-600",
    }),
  },
}
