import { useState, useMemo } from "react"
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Database,
  AlertTriangle,
  Ban,
  LayoutGrid,
} from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Có khuyến nghị cho tim mạch ({foodNames.length})
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Chọn một loại để xem chi tiết các biến thể và khuyến nghị dinh dưỡng.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isFoodsLoading &&
                Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
              {foodNames.map((fn) => {
                const variants = foods.filter((f) => f.foodName === fn)
                const count = variants.length
                const sampleVariants = variants.map((v) => v.foodNameSpecific).slice(0, 3).join(", ")
                const thumbnail = variants.find((v) => v.imageUrl)?.imageUrl

                return (
                  <button
                    key={fn}
                    type="button"
                    onClick={() => {
                      setSearchParams({ food: fn })
                      setGuidanceFilter("ALL")
                    }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all hover:border-primary/50 hover:shadow-md cursor-pointer overflow-hidden"
                  >
                    <div className="w-full">
                      {/* Thumbnail Image / Placeholder */}
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 mb-3.5 border border-slate-200/60">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={fn}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-3 text-center bg-gradient-to-b from-slate-50 to-slate-100/80 group-hover:from-primary/5 group-hover:to-primary/10 transition-colors">
                            <div className="p-2 rounded-xl bg-white shadow-2xs text-slate-400 group-hover:text-primary transition-colors border border-slate-200/50">
                              {defaultIcon}
                            </div>
                            <span className="text-[11px] font-medium text-slate-400">
                              Hình ảnh thực phẩm
                            </span>
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 text-xs font-semibold text-primary bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs border border-slate-200/60">
                          {count} món
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base sm:text-lg">
                          {fn}
                        </h3>
                        {sampleVariants && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            Gồm có: {sampleVariants}
                            {count > 3 ? "..." : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 w-full border-t border-slate-100 flex items-center justify-between text-xs text-primary font-medium">
                      <span>Xem các lựa chọn</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Khi đã chọn một loại cụ thể (ví dụ: Cá hồi) -> HIỂN THỊ DẠNG 3 CỘT (CARD GRID) KHÔNG CHIA ROW */}
        {selectedFoodName && (
          <div className="space-y-6">
            {/* Top Bar with title, quick back and counts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Lựa chọn cho: <span className="text-primary">{selectedFoodName}</span>
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Hiển thị dạng 3 cột với khuyến nghị cụ thể trên từng món
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchParams({})
                  setGuidanceFilter("ALL")
                }}
                className="self-start text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Xem các loại {currentCategory.name.toLowerCase()} khác</span>
              </Button>
            </div>

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
          <section className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Tất cả thực phẩm trong nhóm ({currentCategory.foodCount.toLocaleString("vi-VN")})
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Số liệu trên 100 g phần ăn được từ Bảng thành phần thực phẩm Việt Nam và USDA FNDDS, không kèm khuyến
                  nghị.
                </p>
              </div>
            </div>
            <ReferenceFoodBrowser fixedGroup={currentCategory.id} />
          </section>
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
