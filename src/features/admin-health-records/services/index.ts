import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  GetHealthRecordsParams,
  PaginatedResponse,
  HealthRecord,
  CreateHealthRecordDto,
  UpdateHealthRecordDto,
} from "../types"

export const adminHealthRecordApi = {
  getAllHealthRecords(params: GetHealthRecordsParams) {
    return axiosClient.get<ApiResponse<PaginatedResponse<HealthRecord>>, ApiResponse<PaginatedResponse<HealthRecord>>>(
      "/api/admin/health-records",
      { params }
    )
  },

  getHealthRecordById(id: string) {
    return axiosClient.get<ApiResponse<HealthRecord>, ApiResponse<HealthRecord>>(
      `/api/admin/health-records/${id}`
    )
  },

  createHealthRecord(payload: CreateHealthRecordDto) {
    return axiosClient.post<ApiResponse<HealthRecord>, ApiResponse<HealthRecord>>(
      "/api/admin/health-records",
      payload
    )
  },

  updateHealthRecord(id: string, payload: UpdateHealthRecordDto) {
    return axiosClient.patch<ApiResponse<HealthRecord>, ApiResponse<HealthRecord>>(
      `/api/admin/health-records/${id}`,
      payload
    )
  },
}
