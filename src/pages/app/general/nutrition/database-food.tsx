import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, Database, Info, Scale } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatNutrientAmount } from "./format"
import { useReferenceFood } from "./hooks/use-nutrition"
import { REFERENCE_SOURCES } from "./sources"
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
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    )
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
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
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link to="/app/general/nutrition" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dinh dưỡng</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        {/* navigate(-1) giữ nguyên từ khóa, nhóm và trang đang xem ở danh sách */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="hover:text-primary transition-colors font-medium cursor-pointer"
        >
          Tra cứu toàn bộ dữ liệu
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="font-semibold text-slate-900 dark:text-foreground line-clamp-1">{title}</span>
      </nav>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-border dark:bg-card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {food.category && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">{food.category}</span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-muted px-2.5 py-0.5 rounded-md">
            <Database className="w-3 h-3" />
            {sourceInfo.label} · mã {food.sourceFoodCode}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">{title}</h1>
        {food.localName && food.localName !== food.displayName && (
          <p className="text-sm text-muted-foreground">{food.localName}</p>
        )}
        {food.wastePct != null && food.wastePct > 0 && (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Tỉ lệ thải bỏ khi sơ chế: <span className="font-semibold">{formatNutrientAmount(food.wastePct)}%</span>. Số
            liệu bên dưới tính trên phần ăn được.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Đây là số liệu tham khảo, không kèm khuyến nghị cho tim mạch.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-border dark:bg-card overflow-hidden">
        <div className="bg-slate-50/60 dark:bg-muted/20 border-b border-slate-100 dark:border-border p-6 space-y-3">
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
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-primary dark:text-primary-foreground dark:border-primary"
                    : "bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground"
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
              <div key={n.nutrientCode} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-muted/30 border border-slate-100 dark:border-border/60">
                <span className="text-xs text-muted-foreground line-clamp-1">{n.name}</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900 dark:text-foreground">
                    {formatNutrientAmount(n.amount * factor)}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{n.unit}</span>
                </div>
              </div>
            ))}
          </div>
          {otherNutrients.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-border">
              {otherNutrients.map((n) => (
                <div
                  key={n.nutrientCode}
                  className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-muted/20 border border-slate-100 dark:border-muted flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-muted-foreground">{n.name}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {formatNutrientAmount(n.amount * factor)} {n.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-muted/20 p-4 border border-slate-200/60 dark:border-border flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p className="leading-relaxed">
          {food.source === "VN_FCT"
            ? "Số liệu tính trên 100 g phần ăn được. Chất nào sách không có số liệu thì không hiển thị. Chất xơ trong bảng này là xơ thô (celluloza), khác chất xơ tiêu hóa của USDA. "
            : "Khẩu phần và số liệu theo USDA FNDDS, phản ánh món ăn phổ biến tại Mỹ; khẩu phần thực tế ở Việt Nam có thể khác. "}
          Thông tin chỉ mang tính tham khảo, không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng.
          <br />
          <span className="italic">Nguồn: {sourceInfo.citation}</span>
        </p>
      </div>
    </div>
  )
}
