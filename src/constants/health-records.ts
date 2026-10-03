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
import i18n from "@/lib/i18n"

/**
 * Single source of truth for all Prediction Labels across HealthSense
 */
export const PREDICTION_LABEL_CONFIG: Record<PredictionLabel, PredictionLabelMeta> = {
  NORMAL: {
    key: "NORMAL",
    get label() { return i18n.t("health:predictionLabel.normal.label") },
    get shortLabel() { return i18n.t("health:predictionLabel.normal.short") },
    get badgeText() { return i18n.t("health:predictionLabel.normal.badge") },
    badgeClass:
      "bg-success-50 text-success-900 border-success-300",
    dotClass: "bg-success-500",
    topBarClass: "bg-success-500",
    statusTextClass: "text-success-700 font-semibold",
    get advice() { return i18n.t("health:predictionLabel.normal.advice") },
    isRisk: false,
    probabilityRangeText: "< 30%",
    icon: React.createElement(ShieldCheck, {
      className: "w-5 h-5 text-success-600",
    }),
  },
  UNCERTAIN: {
    key: "UNCERTAIN",
    get label() { return i18n.t("health:predictionLabel.uncertain.label") },
    get shortLabel() { return i18n.t("health:predictionLabel.uncertain.short") },
    get badgeText() { return i18n.t("health:predictionLabel.uncertain.badge") },
    badgeClass:
      "bg-primary-50 text-primary-900 border-primary-300",
    dotClass: "bg-primary-500",
    topBarClass: "bg-primary-500",
    statusTextClass: "text-primary-700 font-semibold",
    get advice() { return i18n.t("health:predictionLabel.uncertain.advice") },
    isRisk: false,
    probabilityRangeText: "30% - 50%",
    icon: React.createElement(Info, {
      className: "w-5 h-5 text-primary-600",
    }),
  },
  AFIB_SUSPECTED: {
    key: "AFIB_SUSPECTED",
    get label() { return i18n.t("health:predictionLabel.afibSuspected.label") },
    get shortLabel() { return i18n.t("health:predictionLabel.afibSuspected.short") },
    get badgeText() { return i18n.t("health:predictionLabel.afibSuspected.badge") },
    badgeClass:
      "bg-warning-50 text-warning-900 border-warning-300",
    dotClass: "bg-warning-500",
    topBarClass: "bg-warning-500",
    statusTextClass: "text-warning-700 font-bold",
    get advice() { return i18n.t("health:predictionLabel.afibSuspected.advice") },
    isRisk: true,
    probabilityRangeText: "50% - 70%",
    icon: React.createElement(AlertCircle, {
      className: "w-5 h-5 text-warning-600",
    }),
  },
  AFIB: {
    key: "AFIB",
    get label() { return i18n.t("health:predictionLabel.afib.label") },
    get shortLabel() { return i18n.t("health:predictionLabel.afib.short") },
    get badgeText() { return i18n.t("health:predictionLabel.afib.badge") },
    badgeClass:
      "bg-danger-50 text-danger-900 border-danger-300",
    dotClass: "bg-danger-500",
    topBarClass: "bg-danger-500",
    statusTextClass: "text-danger-700 font-bold",
    get advice() { return i18n.t("health:predictionLabel.afib.advice") },
    isRisk: true,
    probabilityRangeText: "≥ 70%",
    icon: React.createElement(AlertTriangle, {
      className: "w-5 h-5 text-danger-600",
    }),
  },
}
