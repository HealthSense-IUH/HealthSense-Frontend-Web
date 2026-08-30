import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  BusinessAuditEventResponse,
  BusinessAuditFilterParams,
} from "../types"

export const businessAuditApi = {
  /**
   * Query append-only business audit events
   * GET /api/admin/business-audit-events?domainType=&domainId=&eventType=&page=&size=
   * Role: CARE_COORDINATOR (scoped domains), ADMIN, SUPER_ADMIN (broad domains)
   */
  queryAuditEvents(params: BusinessAuditFilterParams = {}) {
    const page = params.page ?? 1
    const size = params.size ?? 20
    return axiosClient.get<
      ApiResponse<PageResponse<BusinessAuditEventResponse>>,
      ApiResponse<PageResponse<BusinessAuditEventResponse>>
    >("/api/admin/business-audit-events", {
      params: {
        ...params,
        page,
        size,
      },
    })
  },

  /**
   * Get single business audit event detail
   * GET /api/admin/business-audit-events/{eventId}
   */
  getAuditEventDetail(eventId: number | string) {
    return axiosClient.get<
      ApiResponse<BusinessAuditEventResponse>,
      ApiResponse<BusinessAuditEventResponse>
    >(`/api/admin/business-audit-events/${eventId}`)
  },
}
