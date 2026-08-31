import type { ReactNode } from "react"

export type PredictionLabel = "NORMAL" | "AFIB" | "AFIB_SUSPECTED" | "UNCERTAIN"

export type RecordStatus =
  | "PENDING_UPLOAD"
  | "PROCESSING"
  | "PENDING_ANALYSIS"
  | "COMPLETED"
  | "FAILED"

export type HealthRecordStatus = "PENDING_UPLOAD" | "PROCESSING" | "COMPLETED" | "FAILED"

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
  icon: ReactNode
}

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
  SD1?: number
  SD2?: number
  SampEn?: number
  /** 300 điểm sóng mạch đã chuẩn hóa 0-100 (AI Service sinh sẵn) */
  chartData?: number[]
  /** Chuỗi khoảng NN (ms) giữa các nhịp liên tiếp — để vẽ Poincaré */
  nnIntervals?: number[]
  /** Signal Quality Index — chất lượng tín hiệu của phép đo */
  sqi_ok?: boolean
  sqi_valid_ratio?: number
  sqi_spectral_conc?: number
  sqi_n_valid_beats?: number
  /** Chỉ số hiển thị bổ sung (AI Service tính, không đưa vào model) */
  hrMin?: number
  hrMax?: number
  stressScore?: number
  respiratoryRate?: number
  perfusionIndex?: number
  /** SpO2/BPM do firmware tính (SpO2 mức tham khảo — chưa hiệu chuẩn) */
  deviceSpO2?: number
  deviceBpm?: number
  [key: string]: unknown
}

export type HrvFeatures = Record<string, number>

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
  uploadUrl: string
  s3Key: string
}

export type HealthRecord = {
  id: string
  userId: string
  fileName: string
  fileSize: number | null
  status: HealthRecordStatus
  predictionLabel: PredictionLabel | null
  confidence: number | null
  hrvFeatures: HrvFeatures | null
  createdAt: string
  updatedAt: string
}

export type GetHealthRecordsParams = {
  page?: number
  size?: number
  memberId?: string | number
  status?: HealthRecordStatus
  predictionLabel?: PredictionLabel
  keyword?: string
  fromDate?: string // ISO datetime
  toDate?: string // ISO datetime
}

export type PaginatedResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasMore: boolean
}

export type CreateHealthRecordDto = {
  memberId: string
  fileName?: string
  s3FileKey?: string
  fileSize?: number
  status?: HealthRecordStatus
  predictionLabel?: PredictionLabel
  confidence?: number
  hrvFeaturesJson?: string
}

export interface SystemHealthStat {
  statDate: string
  totalRecords: number
  totalNormal: number
  totalAfib: number
  totalUncertain: number
}
