import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Database, Info, Scale } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatNutrientAmount } from "./format"
import { useReferenceFood } from "./hooks/use-nutrition"
import { REFERENCE_SOURCES } from "./sources"
import { DietAdviceNote } from "./components/DietAdvice"
import type { ReferenceFoodPortion } from "@/types/nutrition"

const PER_100_GRAMS = "per-100g"

function portionLabel(portion: ReferenceFoodPortion) {
  // USDA ghi "Quantity not specified" cho khẩu phần dùng khi không rõ số lượng
  return portion.isDefault ? "Khẩu phần thường dùng" : portion.description
}

/** Chi tiết một thực phẩm USDA; số liệu được tính lại theo khẩu phần người dùng chọn. */
export default function NutritionDatabaseFoodPage() {
  const { foodId } = useParams<{ foodId: string }>()
  const navigate = useNavigate()
  const { data: food, isLoading } = useReferenceFood(foodId)
  const [selectedPortion, setSelectedPortion] = useState(PER_100_GRAMS)

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </Page>
    )
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">Không tìm thấy thực phẩm</h2>
        <p className="text-muted-foreground text-sm">Thực phẩm này không có trong cơ sở dữ liệu dinh dưỡng.</p>
        <Button onClick={() => navigate("/app/general/nutrition")}>Quay lại tra cứu</Button>
      </div>
    )
  }

  const title = food.displayName
  const sourceInfo = REFERENCE_SOURCES[food.source]
  const portionIndex = selectedPortion === PER_100_GRAMS ? -1 : Number(selectedPortion)
  const portion = food.portions[portionIndex]
  const grams = portion ? portion.gramWeight : 100
  const factor = grams / 100
  const keyNutrients = food.nutrients.filter((n) => n.isKey)
  const otherNutrients = food.nutrients.filter((n) => !n.isKey)

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: "Dinh dưỡng", to: "/app/general/nutrition" },
          // navigate(-1) giữ nguyên từ khóa, nhóm và trang đang xem ở danh sách
          { label: "Tra cứu toàn bộ dữ liệu", onClick: () => navigate(-1) },
          { label: title },
        ]}
        title={title}
        description={food.localName && food.localName !== food.displayName ? food.localName : undefined}
        meta={
          <>
            <Link
              to={`/app/general/nutrition/category/${food.group}`}
              className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md hover:bg-primary/15 transition-colors"
            >
              {food.groupName}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              <Database className="w-3 h-3" />
              {sourceInfo.label} · mã {food.sourceFoodCode}
            </span>
            {food.sourceCategory && (
              <span className="text-xs text-muted-foreground">Phân loại gốc: {food.sourceCategory}</span>
            )}
          </>
        }
      />

      <PageBody>
        <DietAdviceNote advice={food.advice} />
        {food.wastePct != null && food.wastePct > 0 && (
          <p className="text-xs text-slate-600">
            Tỉ lệ thải bỏ khi sơ chế: <span className="font-semibold">{formatNutrientAmount(food.wastePct)}%</span>. Số
            liệu bên dưới tính trên phần ăn được.
          </p>
        )}

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="bg-slate-50/60 border-b border-slate-100 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-bold">Thành phần dinh dưỡng</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[{ value: PER_100_GRAMS, label: "100 g" }, ...food.portions.map((p, i) => ({
                value: String(i),
                label: `${portionLabel(p)} (${formatNutrientAmount(p.gramWeight)} g)`,
              }))].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedPortion(option.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors",
                    selectedPortion === option.value
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Đang tính cho <span className="font-semibold text-foreground">{formatNutrientAmount(grams)} g</span>
              {portion ? ` (${portionLabel(portion)})` : ""}.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {keyNutrients.map((n) => (
                <div key={n.nutrientCode} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-muted-foreground line-clamp-1">{n.name}</span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      {formatNutrientAmount(n.amount * factor)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{n.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {otherNutrients.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100">
                {otherNutrients.map((n) => (
                  <div
                    key={n.nutrientCode}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-muted-foreground">{n.name}</span>
                    <span className="font-semibold text-slate-800 whitespace-nowrap">
                      {formatNutrientAmount(n.amount * factor)} {n.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </PageBody>

      <PageFooter>
        <p className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <span>
            {food.source === "VN_FCT"
              ? "Số liệu tính trên 100 g phần ăn được. Chất nào sách không có số liệu thì không hiển thị. Chất xơ trong bảng này là xơ thô (celluloza), khác chất xơ tiêu hóa của USDA. "
              : "Khẩu phần và số liệu theo USDA FNDDS, phản ánh món ăn phổ biến tại Mỹ; khẩu phần thực tế ở Việt Nam có thể khác. "}
            Đây là số liệu tham khảo; màu đánh giá (nếu có đơn ăn uống) chỉ so số liệu với các quy tắc bác sĩ kê, không thay thế tư
            vấn của bác sĩ hoặc chuyên gia dinh dưỡng.
          </span>
        </p>
        <p className="italic pl-6">Nguồn: {sourceInfo.citation}</p>
      </PageFooter>
    </Page>
  )
}
