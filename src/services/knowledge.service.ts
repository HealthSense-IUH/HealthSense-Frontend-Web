import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type { PaginatedResponse } from "@/types/health-record"
import type { KnowledgeDocument, KnowledgeListParams, KnowledgeSummary } from "@/types/knowledge"

const BASE = "/api/admin/knowledge/documents"

/** API quản lý kho tri thức (ADMIN / SUPER_ADMIN). */
export const knowledgeApi = {
  list(params: KnowledgeListParams) {
    return axiosClient.get<ApiResponse<PaginatedResponse<KnowledgeDocument>>, ApiResponse<PaginatedResponse<KnowledgeDocument>>>(
      BASE,
      { params }
    )
  },

  summary() {
    return axiosClient.get<ApiResponse<KnowledgeSummary>, ApiResponse<KnowledgeSummary>>(`${BASE}/summary`)
  },

  /** Tải file lên; máy chủ lưu MinIO rồi đẩy message để worker ingest (tách đoạn + embedding). */
  upload(file: File, title?: string) {
    const form = new FormData()
    form.append("file", file)
    if (title?.trim()) form.append("title", title.trim())
    return axiosClient.post<ApiResponse<KnowledgeDocument>, ApiResponse<KnowledgeDocument>>(BASE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  get(id: string) {
    return axiosClient.get<ApiResponse<KnowledgeDocument>, ApiResponse<KnowledgeDocument>>(`${BASE}/${id}`)
  },

  reingest(id: string) {
    return axiosClient.post<ApiResponse<KnowledgeDocument>, ApiResponse<KnowledgeDocument>>(`${BASE}/${id}/reingest`)
  },

  remove(id: string) {
    return axiosClient.delete<void, void>(`${BASE}/${id}`)
  },
}
