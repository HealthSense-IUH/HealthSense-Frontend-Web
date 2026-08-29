import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  UserCreateRequest,
  UserItem,
  UserListFilterParams,
  UserPageResponse,
  UserUpdateRequest,
  AdminMemberDetailResponse,
} from "../types"

export const userManagementApi = {
  /**
   * List users filtered strictly by required Role parameter with support for defensive pagination
   * GET /api/admin/users?role=MEMBER&page=1&size=10
   */
  listUsers(params: UserListFilterParams) {
    return axiosClient.get<ApiResponse<UserPageResponse>, ApiResponse<UserPageResponse>>(
      "/api/admin/users",
      { params }
    )
  },

  /**
   * Get comprehensive profile details for a target user
   * GET /api/admin/users/{id}
   */
  getUserDetail(id: string | number) {
    return axiosClient.get<ApiResponse<UserItem>, ApiResponse<UserItem>>(
      `/api/admin/users/${id}`
    )
  },

  /**
   * Get target user details along with health record metrics (for MEMBER accounts)
   * GET /api/admin/users/{id}/detail
   */
  getAdminMemberDetail(id: string | number) {
    return axiosClient.get<ApiResponse<AdminMemberDetailResponse>, ApiResponse<AdminMemberDetailResponse>>(
      `/api/admin/users/${id}/detail`
    )
  },

  /**
   * Create a new user account without initial password (backend generates temporary pass & sends email)
   * POST /api/admin/users
   */
  createUser(payload: UserCreateRequest) {
    return axiosClient.post<ApiResponse<UserItem>, ApiResponse<UserItem>>(
      "/api/admin/users",
      payload
    )
  },

  /**
   * Update optional user metadata or account status (ACTIVE, LOCKED, etc.)
   * PATCH /api/admin/users/{id}
   */
  updateUser(id: string | number, payload: UserUpdateRequest) {
    return axiosClient.patch<ApiResponse<UserItem>, ApiResponse<UserItem>>(
      `/api/admin/users/${id}`,
      payload
    )
  },

  /**
   * Revoke and permanently delete a user account
   * DELETE /api/admin/users/{id}
   */
  deleteUser(id: string | number) {
    return axiosClient.delete<ApiResponse<void>, ApiResponse<void>>(
      `/api/admin/users/${id}`
    )
  },

  /**
   * Create a fake health record for testing purposes
   * POST /api/admin/health-records
   */
  createFakeHealthRecord(payload: { memberId: string | number }) {
    return axiosClient.post<ApiResponse<any>, ApiResponse<any>>(
      "/api/admin/health-records",
      payload
    )
  },
}
