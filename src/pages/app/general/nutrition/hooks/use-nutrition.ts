import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { nutritionApi } from "@/services/nutrition.service"
import type { ReferenceFoodSearchParams } from "@/types/nutrition"

const nutritionKeys = {
  groups: ["nutrition", "groups"] as const,
  group: (idOrSlug: string) => ["nutrition", "group", idOrSlug] as const,
  groupFoods: (idOrSlug: string) => ["nutrition", "group-foods", idOrSlug] as const,
  food: (id: string) => ["nutrition", "food", id] as const,
  search: (q: string) => ["nutrition", "search", q] as const,
  referenceFoods: (params: ReferenceFoodSearchParams) => ["nutrition", "reference-foods", params] as const,
  referenceFood: (id: string) => ["nutrition", "reference-food", id] as const,
  myDietPrescription: ["nutrition", "diet-prescription", "me"] as const,
}

export function useNutritionGroups() {
  return useQuery({
    queryKey: nutritionKeys.groups,
    queryFn: async () => (await nutritionApi.getGroups()).data,
  })
}

export function useNutritionGroup(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.group(idOrSlug ?? ""),
    queryFn: async () => (await nutritionApi.getGroup(idOrSlug as string)).data,
    enabled: Boolean(idOrSlug),
  })
}

export function useNutritionGroupFoods(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.groupFoods(idOrSlug ?? ""),
    queryFn: async () => (await nutritionApi.getGroupFoods(idOrSlug as string)).data,
    enabled: Boolean(idOrSlug),
  })
}

export function useNutritionFood(id: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.food(id ?? ""),
    queryFn: async () => (await nutritionApi.getFood(id as string)).data,
    enabled: Boolean(id),
  })
}

/** Giữ kết quả cũ trong lúc chờ kết quả mới để danh sách không nhấp nháy khi đang gõ. */
export function useNutritionSearch(query: string) {
  const q = query.trim()
  return useQuery({
    queryKey: nutritionKeys.search(q),
    queryFn: async () => (await nutritionApi.searchFoods(q)).data,
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
  })
}

/** Tra cứu toàn bộ dữ liệu tham chiếu; giữ trang cũ trong lúc tải trang mới để bảng không nhảy. */
export function useReferenceFoods(params: ReferenceFoodSearchParams) {
  return useQuery({
    queryKey: nutritionKeys.referenceFoods(params),
    queryFn: async () => (await nutritionApi.searchReferenceFoods(params)).data,
    placeholderData: keepPreviousData,
  })
}

export function useReferenceFood(id: string | undefined) {
  return useQuery({
    queryKey: nutritionKeys.referenceFood(id ?? ""),
    queryFn: async () => (await nutritionApi.getReferenceFood(id as string)).data,
    enabled: Boolean(id),
  })
}

/** Đơn ăn uống của hội viên đang đăng nhập; chỉ gọi khi người dùng là hội viên. */
export function useMyDietPrescription(enabled: boolean) {
  return useQuery({
    queryKey: nutritionKeys.myDietPrescription,
    queryFn: async () => (await nutritionApi.getMyDietPrescription()).data,
    enabled,
  })
}
