import React from "react"
import { Activity, AlertCircle, Info } from "lucide-react"

import { PREDICTION_LABEL_CONFIG } from "@/constants/health-records"
import i18n from "@/lib/i18n"
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
      label: i18n.t("health:predictionLabel.processing.label"),
      shortLabel: i18n.t("health:predictionLabel.processing.short"),
      badgeText: i18n.t("health:predictionLabel.processing.label"),
      badgeClass:
        "bg-primary-50 text-primary-900 border-primary-300",
      dotClass: "bg-primary-500 animate-pulse",
      topBarClass: "bg-primary-500",
      statusTextClass: "text-primary-700 font-semibold",
      advice:
        i18n.t("health:predictionLabel.processing.advice"),
      isRisk: false,
      probabilityRangeText: i18n.t("health:predictionLabel.processing.short"),
      icon: React.createElement(Activity, {
        className: "w-5 h-5 text-primary-600 animate-spin",
      }),
    }
  }

  if (status === "FAILED") {
    return {
      key: "FAILED",
      label: i18n.t("health:predictionLabel.failed.label"),
      shortLabel: i18n.t("health:predictionLabel.failed.short"),
      badgeText: i18n.t("health:predictionLabel.failed.short"),
      badgeClass:
        "bg-slate-100 text-slate-900 border-slate-300",
      dotClass: "bg-slate-400",
      topBarClass: "bg-slate-400",
      statusTextClass: "text-slate-700 font-semibold",
      advice:
        i18n.t("health:predictionLabel.failed.advice"),
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
    label: label || i18n.t("health:predictionLabel.unknown.label"),
    shortLabel: label || i18n.t("health:predictionLabel.unknown.short"),
    badgeText: label || i18n.t("health:predictionLabel.unknown.short"),
    badgeClass:
      "bg-slate-100 text-slate-900 border-slate-300",
    dotClass: "bg-slate-400",
    topBarClass: "bg-slate-400",
    statusTextClass: "text-slate-700 font-semibold",
    advice: i18n.t("health:predictionLabel.unknown.advice"),
    isRisk: false,
    probabilityRangeText: "N/A",
    icon: React.createElement(Info, {
      className: "w-5 h-5 text-slate-500",
    }),
  }
}
