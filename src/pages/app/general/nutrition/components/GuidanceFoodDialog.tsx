import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Heart,
  Pill,
  Scale,
  Sparkles,
  Zap,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DetailDialog, DetailDialogSkeleton } from "./DetailDialog"
import { GuidanceBadge } from "./GuidanceBadge"
import { useNutritionFood } from "../hooks/use-nutrition"
import { useNutritionNav, useRetainedId } from "../nutrition-nav"
import type { EvidenceSourceType, NutrientValue } from "@/types/nutrition"
import { cn } from "@/lib/utils"

const KEY_NUTRIENT_CODES = [
  "energy",
  "protein",
  "carbohydrate",
  "fat_total",
  "fat_saturated",
  "sodium",
  "potassium",
  "magnesium",
]

/** Popup chi tiết một món có khuyến nghị tim mạch (mở bằng ?food=<id> trên trang dinh dưỡng). */
export function GuidanceFoodDialog() {
  const { t } = useTranslation("nutrition")
  const nav = useNutritionNav()
  const open = nav.foodId != null
  const foodId = useRetainedId(nav.foodId)
  // Mở rộng theo từng món: mở món khác thì danh sách vi chất thu gọn lại
  const [expandedFoodId, setExpandedFoodId] = useState<string | null>(null)

  const { data: food, isLoading } = useNutritionFood(foodId ?? undefined)

  if (!foodId) return null

  if (isLoading || !food) {
    return (
      // Luôn là cùng một DetailDialog (đang tải / không tìm thấy / có dữ liệu) để popup không mở lại lần nữa khi tải xong
      <DetailDialog
        open={open}
        onClose={nav.closeDetail}
        title={isLoading ? t("detail.loading") : t("foodDetail.notFoundTitle")}
        description={isLoading ? undefined : t("foodDetail.notFoundDescription")}
      >
        {isLoading && <DetailDialogSkeleton />}
      </DetailDialog>
    )
  }

  const guidanceType = food.guidance
  const showAllNutrients = expandedFoodId === food.id
  const keyNutrients = food.nutrients.filter((n) => KEY_NUTRIENT_CODES.includes(n.nutrientCode))
  const otherNutrients = food.nutrients.filter((n) => !KEY_NUTRIENT_CODES.includes(n.nutrientCode))

  const sourceTypeLabels: Record<EvidenceSourceType, { label: string; cls: string }> = {
    GUIDELINE: {
      label: t("foodDetail.evidenceType.GUIDELINE"),
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    SYSTEMATIC_REVIEW: {
      label: t("foodDetail.evidenceType.SYSTEMATIC_REVIEW"),
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    META_ANALYSIS: {
      label: t("foodDetail.evidenceType.META_ANALYSIS"),
      cls: "bg-primary-50 text-primary-700 border-primary-200",
    },
    RCT: {
      label: t("foodDetail.evidenceType.RCT"),
      cls: "bg-success-50 text-success-700 border-success-200",
    },
    OTHER: {
      label: t("foodDetail.evidenceType.OTHER"),
      cls: "bg-slate-50 text-slate-700 border-slate-200",
    },
  }

  return (
    <DetailDialog
      open={open}
      onClose={nav.closeDetail}
      title={food.foodNameSpecific}
      description={food.sourceDescription ? t("foodDetail.fnddsSource", { source: food.sourceDescription }) : undefined}
      meta={
        <>
          <button
            type="button"
            onClick={() => nav.openCategory(food.group)}
            className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md hover:bg-primary/15 transition-colors cursor-pointer"
          >
            {food.groupName}
          </button>
          {food.foodName !== food.foodNameSpecific && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              {t("foodDetail.type", { name: food.foodName })}
            </span>
          )}
          {guidanceType && <GuidanceBadge type={guidanceType} size="md" />}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
            <Scale className="w-3 h-3 text-primary" />
            {t("foodDetail.standardServing")}
          </span>
        </>
      }
      footer={t("foodDetail.footer")}
    >
      {/* Basic Info Card: mô tả + tóm tắt khuyến nghị */}
      {(food.description || food.guidanceTitle || food.guidanceReason) && (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-6 shadow-xs space-y-4">
        {/* Member-Friendly Description */}
        {food.description && (
          <p className="text-sm text-slate-600 leading-relaxed">
            {food.description}
          </p>
        )}

        {/* Guidance Summary Callout */}
        {(food.guidanceTitle || food.guidanceReason) && (
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-primary/5 p-4 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>{food.guidanceTitle}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {food.guidanceReason}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Section: Key Nutrition (Bảng thành phần dinh dưỡng) */}
      <Card className="rounded-2xl border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{t("foodDetail.nutritionTitle")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("foodDetail.nutritionSubtitle")}
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              {t("foodDetail.per100g")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Key Nutrients Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {keyNutrients.map((item: NutrientValue) => (
              <div
                key={item.nutrientCode}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <span className="text-xs text-muted-foreground font-normal line-clamp-1">
                  {item.name}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">
                    {item.amount}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable Other Nutrients */}
          {otherNutrients.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedFoodId(showAllNutrients ? null : food.id)}
                className="w-full text-xs text-primary font-medium hover:bg-primary/5 flex items-center justify-center gap-1.5 h-9"
              >
                <span>
                  {showAllNutrients
                    ? t("foodDetail.collapseNutrients")
                    : t("foodDetail.showMoreNutrients", { count: otherNutrients.length })}
                </span>
                {showAllNutrients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {showAllNutrients && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 animate-in fade-in duration-200">
                  {otherNutrients.map((item: NutrientValue) => (
                    <div
                      key={item.nutrientCode}
                      className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-slate-800">
                        {item.amount} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section: Why This Matters (Ý nghĩa đối với sức khỏe) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-danger-500 fill-danger-500" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {t("foodDetail.healthMeaning")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Cardiovascular Health */}
          {food.cardiovascularContext && (
            <Card className="rounded-2xl border-danger-100 bg-gradient-to-br from-danger-50/40 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base font-semibold text-danger-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-danger-600" />
                  <span>{t("foodDetail.cardiovascular")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {food.cardiovascularContext}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Card 2: AF / Atrial Fibrillation Context */}
          {food.afContext && (
            <Card className="rounded-2xl border-warning-100 bg-gradient-to-br from-warning-50/40 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base font-semibold text-warning-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning-600" />
                  <span>{t("foodDetail.af")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {food.afContext}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Medication Context (e.g. Warfarin / Vitamin K) */}
          {food.medicationContext && (
            <Card className="rounded-2xl border-primary-100 bg-gradient-to-br from-primary-50/40 to-transparent md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base font-semibold text-primary-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary-600" />
                  <span>{t("foodDetail.medication")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {food.medicationContext}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Section: Evidence Sources (Cơ sở nghiên cứu & Hướng dẫn y khoa) */}
      {food.evidenceSources && food.evidenceSources.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">
              {t("foodDetail.evidenceTitle")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            {t("foodDetail.evidenceDescription")}
          </p>

          <div className="space-y-3">
            {food.evidenceSources.map((source) => {
              const meta = sourceTypeLabels[source.sourceType] || sourceTypeLabels.OTHER
              return (
                <div
                  key={source.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-0.5 rounded-full border",
                        meta.cls
                      )}
                    >
                      {meta.label}
                    </span>
                    {source.year && (
                      <span className="text-xs text-muted-foreground">{t("foodDetail.year", { year: source.year })}</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                    {source.title}
                  </h3>

                  {(source.authors || source.journal) && (
                    <p className="text-xs text-muted-foreground">
                      {source.authors && <span>{source.authors}</span>}
                      {source.journal && (
                        <span className="font-medium italic text-slate-600">
                          {" "}
                          — {source.journal}
                        </span>
                      )}
                    </p>
                  )}

                  {source.summary && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {source.summary}
                    </p>
                  )}

                  {source.url && (
                    <div className="pt-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>{t("foodDetail.viewSource")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </DetailDialog>
  )
}
