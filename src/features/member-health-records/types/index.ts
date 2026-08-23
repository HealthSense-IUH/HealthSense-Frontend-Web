import type { PredictionLabel, RecordStatus } from "@/lib/health-record-labels"
export type { PredictionLabel, RecordStatus }

export interface HRVFeatures {
  HR_mean?: number
  Mean_NN?: number
  SDNN?: number
  RMSSD?: number
  pNN50?: number
  NN50?: number
  CV?: number
  LF?: number
  HF?: number
  LF_HF_Ratio?: number
  LF_norm?: number
  HF_norm?: number
  Total_Power?: number
  [key: string]: unknown
}

export interface MemberHealthRecord {
  id: string | number
  userId?: string | number
  fileName: string
  fileSize?: number
  status: RecordStatus
  predictionLabel?: PredictionLabel | null
  confidence?: number | null
  hrvFeatures?: HRVFeatures | null
  createdAt: string
  updatedAt?: string
}

export interface HealthStatItem {
  date: string
  normalCount: number
  afibRiskCount: number
  uncertainCount: number
  afibSuspectedCount: number
  avgHeartRate?: number
}

export interface HealthStatisticsResponse {
  chartData?: HealthStatItem[]
  totalNormal: number
  totalAfibRisk: number
  totalUncertain: number
  totalAfibSuspected: number
}

export interface PresignedUrlRequest {
  fileName: string
  fileSize: number
}

export interface PresignedUrlResponse {
  recordId: number
  presignedUrl: string
  s3Key: string
}
