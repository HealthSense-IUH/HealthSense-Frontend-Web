import axiosClient from "@/lib/axiosClient"
import type { ApiResponse, PageResponse } from "@/types/base"
import type {
  DietPrescription,
  DietRule,
  DietThreshold,
  Food,
  FoodGroup,
  ReferenceFood,
  ReferenceFoodSearchParams,
  ReferenceFoodSummary,
  UpdateDietPrescriptionRequest,
} from "@/types/nutrition"

export const nutritionApi = {
  /**
   * Danh sách nhóm thực phẩm chung, theo thứ tự hiển thị, kèm số thực phẩm theo nguồn và số món có khuyến nghị
   * GET /api/nutrition/groups
   */
  getGroups() {
    return axiosClient.get<ApiResponse<FoodGroup[]>, ApiResponse<FoodGroup[]>>("/api/nutrition/groups")
  },

  /**
   * Một nhóm thực phẩm, tra theo id (FISH) hoặc slug (fish-seafood)
   * GET /api/nutrition/groups/{idOrSlug}
   */
  getGroup(idOrSlug: string) {
    return axiosClient.get<ApiResponse<FoodGroup>, ApiResponse<FoodGroup>>(
      `/api/nutrition/groups/${encodeURIComponent(idOrSlug)}`
    )
  },

  /**
   * Các món có khuyến nghị trong một nhóm, theo thứ tự hiển thị
   * GET /api/nutrition/groups/{idOrSlug}/foods
   */
  getGroupFoods(idOrSlug: string) {
    return axiosClient.get<ApiResponse<Food[]>, ApiResponse<Food[]>>(
      `/api/nutrition/groups/${encodeURIComponent(idOrSlug)}/foods`
    )
  },

  /**
   * Chi tiết một món
   * GET /api/nutrition/foods/{id}
   */
  getFood(id: string) {
    return axiosClient.get<ApiResponse<Food>, ApiResponse<Food>>(
      `/api/nutrition/foods/${encodeURIComponent(id)}`
    )
  },

  /**
   * Tìm món, không phân biệt hoa thường và dấu tiếng Việt (tối đa 20 kết quả)
   * GET /api/nutrition/foods/search?q=
   */
  searchFoods(q: string) {
    return axiosClient.get<ApiResponse<Food[]>, ApiResponse<Food[]>>("/api/nutrition/foods/search", {
      params: { q },
    })
  },

  /**
   * Tra cứu toàn bộ dữ liệu (Việt Nam + USDA): không có q thì duyệt theo tên, có q thì tìm theo tên tiếng Việt
   * (có hoặc không dấu) hoặc tiếng Anh
   * GET /api/nutrition/reference/foods?q=&group=&source=&page=&size=
   */
  searchReferenceFoods(params: ReferenceFoodSearchParams) {
    return axiosClient.get<
      ApiResponse<PageResponse<ReferenceFoodSummary>>,
      ApiResponse<PageResponse<ReferenceFoodSummary>>
    >("/api/nutrition/reference/foods", { params })
  },

  /**
   * Chi tiết một thực phẩm kèm khẩu phần
   * GET /api/nutrition/reference/foods/{id}
   */
  getReferenceFood(id: string) {
    return axiosClient.get<ApiResponse<ReferenceFood>, ApiResponse<ReferenceFood>>(
      `/api/nutrition/reference/foods/${encodeURIComponent(id)}`
    )
  },

  /**
   * Đơn ăn uống của hội viên đang đăng nhập (chưa có đơn thì là lời khuyên chung)
   * GET /api/nutrition/diet-prescription/me
   */
  getMyDietPrescription() {
    return axiosClient.get<ApiResponse<DietPrescription>, ApiResponse<DietPrescription>>(
      "/api/nutrition/diet-prescription/me"
    )
  },

  /**
   * Ngưỡng mặc định để chấm màu thực phẩm (chỉ admin)
   * GET /api/admin/nutrition/diet-rules
   */
  getDietRules() {
    return axiosClient.get<ApiResponse<DietRule[]>, ApiResponse<DietRule[]>>("/api/admin/nutrition/diet-rules")
  },

  /**
   * Admin sửa ngưỡng mặc định; mức để trống = bỏ mức đó
   * PUT /api/admin/nutrition/diet-rules
   */
  updateDietRules(thresholds: DietThreshold[]) {
    return axiosClient.put<ApiResponse<DietRule[]>, ApiResponse<DietRule[]>>(
      "/api/admin/nutrition/diet-rules",
      thresholds
    )
  },

  /**
   * Bác sĩ xem đơn ăn uống của hội viên trong phiên tư vấn
   * GET /api/doctor/consultation-sessions/{sessionId}/diet-prescription
   */
  getSessionDietPrescription(sessionId: string | number) {
    return axiosClient.get<ApiResponse<DietPrescription>, ApiResponse<DietPrescription>>(
      `/api/doctor/consultation-sessions/${encodeURIComponent(sessionId)}/diet-prescription`
    )
  },

  /**
   * Bác sĩ kê hoặc sửa đơn ăn uống (chỉ khi phiên đang diễn ra)
   * PUT /api/doctor/consultation-sessions/{sessionId}/diet-prescription
   */
  updateSessionDietPrescription(sessionId: string | number, body: UpdateDietPrescriptionRequest) {
    return axiosClient.put<ApiResponse<DietPrescription>, ApiResponse<DietPrescription>>(
      `/api/doctor/consultation-sessions/${encodeURIComponent(sessionId)}/diet-prescription`,
      body
    )
  },
}
