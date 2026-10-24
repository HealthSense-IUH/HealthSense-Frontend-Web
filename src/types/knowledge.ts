export type KnowledgeDocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED"

/** Tài liệu trong kho tri thức của trợ lý Cara (metadata; file ở MinIO, vector ở Qdrant). */
export interface KnowledgeDocument {
  id: string
  title: string
  fileName: string
  contentType: string | null
  sizeBytes: number
  status: KnowledgeDocumentStatus
  chunkCount: number
  errorMessage: string | null
  uploadedBy: number | null
  createdAt: string
  updatedAt: string
  processedAt: string | null
}

export interface KnowledgeSummary {
  total: number
  ready: number
  processing: number
  failed: number
}

export interface KnowledgeListParams {
  keyword?: string
  page: number
  size: number
}
