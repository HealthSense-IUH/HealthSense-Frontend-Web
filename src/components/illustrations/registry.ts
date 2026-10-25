import {
  ChartIllustration,
  ConsultationIllustration,
  DocumentsIllustration,
  EmptyBoxIllustration,
  ErrorIllustration,
  HeartPulseIllustration,
  NoResultsIllustration,
  NutritionIllustration,
  ShieldUserIllustration,
  WearableIllustration,
} from "./index"

/** Tra cứu minh hoạ theo tên (dùng cho EmptyState); tách khỏi file component để Fast Refresh hoạt động. */
export const illustrations = {
  heart: HeartPulseIllustration,
  empty: EmptyBoxIllustration,
  search: NoResultsIllustration,
  documents: DocumentsIllustration,
  consultation: ConsultationIllustration,
  nutrition: NutritionIllustration,
  chart: ChartIllustration,
  error: ErrorIllustration,
  wearable: WearableIllustration,
  shield: ShieldUserIllustration,
} as const

export type IllustrationName = keyof typeof illustrations
