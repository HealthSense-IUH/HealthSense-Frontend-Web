import { useState, useMemo } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Ban,
  LayoutGrid,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { PageBreadcrumb, PageSection } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FoodCard } from "./FoodCard"
import { ReferenceFoodBrowser } from "./ReferenceFoodBrowser"
import { FoodGroupIcon } from "../group-icons"
import { useNutritionGroup, useNutritionGroupFoods, useNutritionGroups } from "../hooks/use-nutrition"
import { nutritionUrl, useNutritionNav } from "../nutrition-nav"
import type { GuidanceType } from "@/types/nutrition"
import { currentIntlLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/**
 * Một nhóm thực phẩm, hiện ngay trong tab "Tra cứu thực phẩm" (?category=<slug>): các loại có khuyến nghị,
 * biến thể của loại đang chọn (?type=<tên loại>) và toàn bộ thực phẩm tham chiếu của nhóm.
 */
export function CategoryView({ categoryId }: { categoryId: string }) {
  const { t } = useTranslation("nutrition")
  const nav = useNutritionNav()
  const selectedFoodName = nav.type

  // Filter tab for selected food variants: ALL, PRIORITIZE, CAUTION, LIMIT
  const [guidanceFilter, setGuidanceFilter] = useState<"ALL" | GuidanceType>("ALL")
  const selectType = (type: string | null) => {
    nav.selectType(type)
    setGuidanceFilter("ALL")
  }

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
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!currentCategory) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <p className="text-muted-foreground">{t("category.notFound")}</p>
        <Button onClick={nav.closeCategory}>{t("category.backToGroups")}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3">
        <PageBreadcrumb
          items={[
            { label: t("category.allGroups"), onClick: nav.closeCategory },
            selectedFoodName
              ? { label: currentCategory.name, onClick: () => selectType(null) }
              : { label: currentCategory.name },
            ...(selectedFoodName ? [{ label: selectedFoodName }] : []),
          ]}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <FoodGroupIcon icon={currentCategory.icon} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-xs font-semibold text-primary">{t("category.eyebrow")}</div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">
                {selectedFoodName ?? currentCategory.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                {selectedFoodName
                  ? t("category.variantsDescription", { food: selectedFoodName, group: currentCategory.name.toLowerCase() })
                  : currentCategory.description}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={nav.closeCategory} className="text-xs gap-1.5 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("category.backToGroups")}</span>
          </Button>
        </div>
      </header>

      {/* VIEW 1: Khi chưa chọn món cụ thể -> SHOW DANH SÁCH CÁC LOẠI CÓ KHUYẾN NGHỊ (Cá hồi, Cá thu, Cá ngừ...) */}
      {!selectedFoodName && (isFoodsLoading || foodNames.length > 0) && (
        <PageSection
          title={t("category.recommendedTitle", { count: foodNames.length })}
          description={t("category.recommendedDescription")}
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
                  onClick={() => selectType(fn)}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 text-left shadow-xs transition-all hover:border-primary-300 hover:shadow-md cursor-pointer"
                >
                  <div className="w-full space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                        {fn}
                      </h3>
                      <span className="shrink-0 text-[11px] font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        {t("category.itemCount", { count })}
                      </span>
                    </div>
                    {sampleVariants && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {t("category.includes", { items: sampleVariants })}
                        {count > 3 ? "..." : ""}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-4 w-full border-t border-slate-100 flex items-center justify-between text-xs text-primary font-medium">
                    <span>{t("category.viewOptions")}</span>
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
            title={t("category.optionsTitle", { food: selectedFoodName })}
            description={t("category.optionsDescription")}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectType(null)}
                className="text-xs gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t("category.otherTypes", { group: currentCategory.name.toLowerCase() })}</span>
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
              <span>{t("common.all")}</span>
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
                <span>{t("guidance.PRIORITIZE")}</span>
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
                <span>{t("guidance.CAUTION")}</span>
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
                <span>{t("guidance.LIMIT")}</span>
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
              {t("category.noVariants")}
            </div>
          )}
        </div>
      )}

      {/* VIEW 1b: Mọi thực phẩm của nhóm trong cơ sở dữ liệu tham chiếu (Việt Nam + USDA), chỉ có số liệu */}
      {!selectedFoodName && (
        <PageSection
          title={t("category.allFoodsTitle", {
            value: (currentCategory.foodCount ?? 0).toLocaleString(currentIntlLocale()),
          })}
          description={t("category.allFoodsDescription")}
          className={cn(foodNames.length > 0 && "border-t border-border pt-6")}
        >
          <ReferenceFoodBrowser fixedGroup={currentCategory.id} layout="cards" />
        </PageSection>
      )}

      {/* Chuyển nhanh sang nhóm khác */}
      <section className="flex flex-col gap-3 border-t border-border pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("category.otherGroups")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c.id !== currentCategory.id)
            .map((c) => (
              <Link
                key={c.id}
                to={nutritionUrl({ category: c.slug || c.id })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                <FoodGroupIcon icon={c.icon} className="w-3.5 h-3.5" />
                {c.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}
