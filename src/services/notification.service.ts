import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  NotificationResponse,
  UnreadNotificationCountResponse,
} from "@/types/notification"

export const notificationApi = {
  /**
   * List in-app notifications for authenticated user
   * GET /api/notifications?page=1&size=20
   */
  listNotifications(params: { page?: number; size?: number } = {}) {
    const page = params.page ?? 1
    const size = params.size ?? 20
    return axiosClient.get<
      ApiResponse<PageResponse<NotificationResponse>>,
      ApiResponse<PageResponse<NotificationResponse>>
    >("/api/notifications", {
      params: { page, size },
    })
  },

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  getUnreadCount() {
    return axiosClient.get<
      ApiResponse<UnreadNotificationCountResponse>,
      ApiResponse<UnreadNotificationCountResponse>
    >("/api/notifications/unread-count")
  },

  /**
   * Mark one notification as read
   * PATCH /api/notifications/{notificationId}/read
   */
  markRead(notificationId: number | string) {
    return axiosClient.patch<
      ApiResponse<NotificationResponse>,
      ApiResponse<NotificationResponse>
    >(`/api/notifications/${notificationId}/read`)
  },

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  markAllRead() {
    return axiosClient.patch<ApiResponse<void>, ApiResponse<void>>(
      "/api/notifications/read-all"
    )
  },
}
