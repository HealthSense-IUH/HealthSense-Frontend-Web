import type { PredictionLabel } from "@/lib/health-record-labels"

export type HealthRecordStatus = 'PENDING_UPLOAD' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type { PredictionLabel }

export type HrvFeatures = Record<string, number>

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

export type UpdateHealthRecordDto = {
  fileName?: string
  status?: HealthRecordStatus
  predictionLabel?: PredictionLabel
  confidence?: number
  hrvFeaturesJson?: string
}


export interface SystemHealthStat {
  statDate: string;
  totalRecords: number;
  totalNormal: number;
  totalAfib: number;
  totalUncertain: number;
}

