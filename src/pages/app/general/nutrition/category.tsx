import { useState, useMemo } from "react"
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Ban,
  LayoutGrid,
} from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader, PageSection } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FoodCard } from "./components/FoodCard"
import { ReferenceFoodBrowser } from "./components/ReferenceFoodBrowser"
import { FoodGroupIcon } from "./group-icons"
import { useNutritionGroup, useNutritionGroupFoods, useNutritionGroups } from "./hooks/use-nutrition"
import type { GuidanceType } from "@/types/nutrition"
import { cn } from "@/lib/utils"

export default function CategoryExplorerPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Read selected foodName from URL query param: ?food=Cá hồi
  const selectedFoodName = searchParams.get("food")

  // Filter tab for selected food variants: ALL, PRIORITIZE, CAUTION, LIMIT
  const [guidanceFilter, setGuidanceFilter] = useState<"ALL" | GuidanceType>("ALL")

  const { data: currentCategory, isLoading: isCategoryLoading } = useNutritionGroup(categoryId)
  const { data: categories = [] } = useNutritionGroups()
  const { data: foods = [], isLoading: isFoodsLoading } = useNutritionGroupFoods(categoryId)

  // Get distinct food_name items in this group (e.g., ["Cá hồi", "Cá thu", "Cá ngừ"])
  const foodNames = useMemo(() => Array.from(new Set(foods.map((f) => f.foodName))), [foods])

  // Get all variants for selected foodName
  const allVariants = useMemo(() => {
    if (!selectedFoodName) return []
    return foods.filter((f) => f.foodName === selectedFoodName)
  }, [foods, selectedFoodName])

  // Filtered variants based on tab
  const displayedVariants = useMemo(() => {
    if (guidanceFilter === "ALL") return allVariants
    return allVariants.filter((v) => v.guidance === guidanceFilter)
  }, [allVariants, guidanceFilter])

  // Guidance counts
  const counts = useMemo(() => {
    return {
      all: allVariants.length,
      prioritize: allVariants.filter((v) => v.guidance === "PRIORITIZE").length,
      caution: allVariants.filter((v) => v.guidance === "CAUTION").length,
      limit: allVariants.filter((v) => v.guidance === "LIMIT").length,
    }
  }, [allVariants])

  if (isCategoryLoading) {
    return (
      <Page>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </Page>
    )
  }

  if (!currentCategory) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <p className="text-muted-foreground">Không tìm thấy nhóm thực phẩm.</p>
        <Button onClick={() => navigate("/app/general/nutrition")}>Quay lại trang dinh dưỡng</Button>
      </div>
    )
  }

  const defaultIcon = <FoodGroupIcon icon={currentCategory.icon} />

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: "Dinh dưỡng", to: "/app/general/nutrition" },
          selectedFoodName
            ? {
                label: currentCategory.name,
                onClick: () => {
                  setSearchParams({})
                  setGuidanceFilter("ALL")
                },
              }
            : { label: currentCategory.name },
          ...(selectedFoodName ? [{ label: selectedFoodName }] : []),
        ]}
        icon={defaultIcon}
        eyebrow="Nhóm thực phẩm"
        title={selectedFoodName ?? currentCategory.name}
        description={
          selectedFoodName
            ? `Các biến thể của ${selectedFoodName} trong nhóm ${currentCategory.name.toLowerCase()}, phân loại theo mức độ khuyến nghị cho tim mạch và rung nhĩ.`
            : currentCategory.description
        }
      />

      <PageBody>

        {/* VIEW 1: Khi chưa chọn món cụ thể -> SHOW DANH SÁCH CÁC LOẠI CÓ KHUYẾN NGHỊ (Cá hồi, Cá thu, Cá ngừ...) */}
        {!selectedFoodName && (isFoodsLoading || foodNames.length > 0) && (
          <PageSection
            title={`Có khuyến nghị cho tim mạch (${foodNames.length})`}
            description="Chọn một loại để xem các biến thể và khuyến nghị dinh dưỡng."
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isFoodsLoading &&
                Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
              {foodNames.map((fn) => {
                const variants = foods.filter((f) => f.foodName === fn)
                const count = variants.length
                const sampleVariants = variants.map((v) => v.foodNameSpecific).slice(0, 3).join(", ")

                return (
                  <button
                    key={fn}
                    type="button"
                    onClick={() => {
                      setSearchParams({ food: fn })
                      setGuidanceFilter("ALL")
                    }}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary-300 hover:shadow-md cursor-pointer"
                  >
                    <div className="w-full space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                          {fn}
                        </h3>
                        <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                          {count} món
                        </span>
                      </div>
                      {sampleVariants && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          Gồm có: {sampleVariants}
                          {count > 3 ? "..." : ""}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-4 w-full border-t border-slate-100 flex items-center justify-between text-xs text-primary font-medium">
                      <span>Xem các lựa chọn</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                )
              })}
            </div>
          </PageSection>
        )}

        {/* VIEW 2: Khi đã chọn một loại cụ thể (ví dụ: Cá hồi) -> HIỂN THỊ DẠNG 3 CỘT (CARD GRID) KHÔNG CHIA ROW */}
        {selectedFoodName && (
          <div className="space-y-6">
            <PageSection
              title={`Các lựa chọn của ${selectedFoodName}`}
              description="Mỗi biến thể kèm khuyến nghị cụ thể cho tim mạch."
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchParams({})
                    setGuidanceFilter("ALL")
                  }}
                  className="text-xs gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Xem các loại {currentCategory.name.toLowerCase()} khác</span>
                </Button>
              }
            />

            {/* Quick Filter Tabs (Tất cả / Ưu tiên / Cần lưu ý / Hạn chế) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setGuidanceFilter("ALL")}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                  guidanceFilter === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tất cả</span>
                <span className="text-[11px] opacity-80">({counts.all})</span>
              </button>

              {counts.prioritize > 0 && (
                <button
                  type="button"
                  onClick={() => setGuidanceFilter("PRIORITIZE")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                    guidanceFilter === "PRIORITIZE"
                      ? "bg-success-600 text-white shadow-xs"
                      : "bg-success-50/70 border border-success-200 text-success-800 hover:bg-success-100"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Nên ưu tiên</span>
                  <span className="text-[11px] opacity-80">({counts.prioritize})</span>
                </button>
              )}

              {counts.caution > 0 && (
                <button
                  type="button"
                  onClick={() => setGuidanceFilter("CAUTION")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                    guidanceFilter === "CAUTION"
                      ? "bg-warning-500 text-white shadow-xs"
                      : "bg-warning-50/70 border border-warning-200 text-warning-800 hover:bg-warning-100"
                  )}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cần lưu ý</span>
                  <span className="text-[11px] opacity-80">({counts.caution})</span>
                </button>
              )}

              {counts.limit > 0 && (
                <button
                  type="button"
                  onClick={() => setGuidanceFilter("LIMIT")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                    guidanceFilter === "LIMIT"
                      ? "bg-danger-600 text-white shadow-xs"
                      : "bg-danger-50/70 border border-danger-200 text-danger-800 hover:bg-danger-100"
                  )}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Nên hạn chế</span>
                  <span className="text-[11px] opacity-80">({counts.limit})</span>
                </button>
              )}
            </div>

            {/* 3 CỘT CARDS (GRID 3 CỘT NHƯ CŨ, KHÔNG CHIA ROW) */}
            {isFoodsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
              </div>
            ) : displayedVariants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedVariants.map((food) => (
                  <FoodCard key={food.id} food={food} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-muted-foreground text-sm">
                Không có món nào thuộc nhóm khuyến nghị này.
              </div>
            )}
          </div>
        )}

        {/* VIEW 1b: Mọi thực phẩm của nhóm trong cơ sở dữ liệu tham chiếu (Việt Nam + USDA), chỉ có số liệu */}
        {!selectedFoodName && (
          <PageSection
            title={`Tất cả thực phẩm trong nhóm (${(currentCategory.foodCount ?? 0).toLocaleString("vi-VN")})`}
            description="Số liệu trên 100 g phần ăn được từ Bảng thành phần thực phẩm Việt Nam và USDA FNDDS. Màu của từng món theo các quy tắc cho người rung nhĩ."
            className={cn(foodNames.length > 0 && "border-t border-border pt-6")}
          >
            <ReferenceFoodBrowser fixedGroup={currentCategory.id} layout="cards" />
          </PageSection>
        )}

      </PageBody>

      {/* Switch Group Quick Links */}
      <PageFooter>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Khám phá nhóm thực phẩm khác
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c.id !== currentCategory.id)
            .map((c) => (
              <Link
                key={c.id}
                to={`/app/general/nutrition/category/${c.slug || c.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <FoodGroupIcon icon={c.icon} className="w-3.5 h-3.5" />
                {c.name}
              </Link>
            ))}
        </div>
      </PageFooter>
    </Page>
  )
}
