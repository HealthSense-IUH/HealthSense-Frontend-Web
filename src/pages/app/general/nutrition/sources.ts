import type { ReferenceFoodSource } from "@/types/nutrition"

/** Tên hiển thị và trích dẫn của từng nguồn dữ liệu dinh dưỡng tham chiếu. */
export const REFERENCE_SOURCES: Record<ReferenceFoodSource, { short: string; label: string; citation: string }> = {
  VN_FCT: {
    short: "Việt Nam",
    label: "Bảng thành phần thực phẩm Việt Nam 2007",
    citation: "Viện Dinh dưỡng - Bộ Y tế (2007). Bảng thành phần thực phẩm Việt Nam. Nhà xuất bản Y học, Hà Nội.",
  },
  USDA_FNDDS: {
    short: "USDA",
    label: "USDA FNDDS 2021-2023",
    citation: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central: FNDDS 2021-2023.",
  },
}
