import { useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

/** Trang dinh dưỡng chỉ có một route; nhóm đang xem và món đang mở nằm trên query để Back / chia sẻ link vẫn đúng. */
export const NUTRITION_PATH = "/app/general/nutrition"

/** Query của trang dinh dưỡng: category = nhóm đang xem, type = loại trong nhóm, food / ref = popup chi tiết. */
export const NUTRITION_QUERY = {
  category: "category",
  type: "type",
  food: "food",
  ref: "ref",
} as const

/** Popup mở bằng thao tác trong trang được đánh dấu để khi đóng chỉ cần quay lại một bước lịch sử. */
const DIALOG_STATE = { nutritionDialog: true }

export function nutritionUrl(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  return query ? `${NUTRITION_PATH}?${query}` : NUTRITION_PATH
}

/** Link mở popup chi tiết, giữ nguyên nhóm / từ khóa / trang đang xem. */
export function useDetailLink() {
  const [searchParams] = useSearchParams()
  return (kind: "food" | "ref", id: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete(kind === "food" ? NUTRITION_QUERY.ref : NUTRITION_QUERY.food)
    next.set(NUTRITION_QUERY[kind], id)
    return { to: { search: `?${next}` }, state: DIALOG_STATE }
  }
}

export function useNutritionNav() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const update = (changes: Record<string, string | null>, options?: { replace?: boolean; dialog?: boolean }) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value == null) next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: options?.replace, state: options?.dialog ? DIALOG_STATE : undefined })
  }

  return {
    category: searchParams.get(NUTRITION_QUERY.category),
    type: searchParams.get(NUTRITION_QUERY.type),
    foodId: searchParams.get(NUTRITION_QUERY.food),
    refId: searchParams.get(NUTRITION_QUERY.ref),
    /** Xem một nhóm; bỏ loại, popup và bộ lọc tra cứu của nhóm trước */
    openCategory: (category: string) =>
      update({ category, type: null, food: null, ref: null, tab: null, q: null, source: null, page: null }),
    /** Về danh sách nhóm */
    closeCategory: () => update({ category: null, type: null, q: null, source: null, page: null }),
    /** Chọn / bỏ chọn một loại trong nhóm (ví dụ "Cá hồi") */
    selectType: (type: string | null) => update({ type }),
    openFood: (id: string) => update({ food: id, ref: null }, { dialog: true }),
    openReference: (id: string) => update({ ref: id, food: null }, { dialog: true }),
    /** Đóng popup: quay lại một bước nếu popup được mở trong trang, không thì bỏ tham số (link chia sẻ) */
    closeDetail: () => {
      const state = location.state as typeof DIALOG_STATE | null
      if (state?.nutritionDialog) navigate(-1)
      else update({ food: null, ref: null }, { replace: true })
    },
  }
}

/** Giữ id cuối cùng khi popup đang đóng để nội dung không biến mất giữa hiệu ứng đóng. */
export function useRetainedId(id: string | null) {
  const [retained, setRetained] = useState(id)
  if (id && id !== retained) setRetained(id)
  return id ?? retained
}
