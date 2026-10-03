import { useState } from "react"
import { Database, Scale } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"

import i18n from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { formatNutrientAmount } from "../format"
import { useReferenceFood } from "../hooks/use-nutrition"
import { useNutritionNav, useRetainedId } from "../nutrition-nav"
import { REFERENCE_SOURCES } from "../sources"
import { DetailDialog, DetailDialogPlaceholder } from "./DetailDialog"
import { DietAdviceNote } from "./DietAdvice"
import type { ReferenceFoodPortion } from "@/types/nutrition"

const PER_100_GRAMS = "per-100g"

function portionLabel(portion: ReferenceFoodPortion) {
  // USDA ghi "Quantity not specified" cho khẩu phần dùng khi không rõ số lượng
  return portion.isDefault ? i18n.t("nutrition:databaseFood.defaultPortion") : portion.description
}

/** Popup chi tiết một thực phẩm tham chiếu (mở bằng ?ref=<id>); số liệu tính lại theo khẩu phần người dùng chọn. */
export function ReferenceFoodDialog() {
  const { t } = useTranslation("nutrition")
  const nav = useNutritionNav()
  const open = nav.refId != null
  const foodId = useRetainedId(nav.refId)
  const { data: food, isLoading } = useReferenceFood(foodId ?? undefined)
  // Khẩu phần chọn theo từng món: mở món khác thì quay về 100 g
  const [portionChoice, setPortionChoice] = useState({ foodId: "", value: PER_100_GRAMS })

  if (!foodId) return null

  if (isLoading || !food) {
    return (
      <DetailDialogPlaceholder
        open={open}
        onClose={nav.closeDetail}
        loading={isLoading}
        title={isLoading ? t("detail.loading") : t("databaseFood.notFoundTitle")}
        description={isLoading ? undefined : t("databaseFood.notFoundDescription")}
      />
    )
  }

  const selectedPortion = portionChoice.foodId === food.id ? portionChoice.value : PER_100_GRAMS
  const setSelectedPortion = (value: string) => setPortionChoice({ foodId: food.id, value })
  const sourceInfo = REFERENCE_SOURCES[food.source]
  const portionIndex = selectedPortion === PER_100_GRAMS ? -1 : Number(selectedPortion)
  const portion = food.portions[portionIndex]
  const grams = portion ? portion.gramWeight : 100
  const factor = grams / 100
  const keyNutrients = food.nutrients.filter((n) => n.isKey)
  const otherNutrients = food.nutrients.filter((n) => !n.isKey)

  return (
    <DetailDialog
      open={open}
      onClose={nav.closeDetail}
      title={food.displayName}
      description={food.localName && food.localName !== food.displayName ? food.localName : undefined}
      meta={
        <>
          <button
            type="button"
            onClick={() => nav.openCategory(food.group)}
            className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md hover:bg-primary/15 transition-colors cursor-pointer"
          >
            {food.groupName}
          </button>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
            <Database className="w-3 h-3" />
            {t("databaseFood.sourceCode", { source: sourceInfo.label, code: food.sourceFoodCode })}
          </span>
          {food.sourceCategory && (
            <span className="text-xs text-muted-foreground">
              {t("databaseFood.sourceCategory", { category: food.sourceCategory })}
            </span>
          )}
        </>
      }
      footer={
        <>
          {food.source === "VN_FCT" ? t("databaseFood.footer.vnFct") : t("databaseFood.footer.usda")}{" "}
          {t("databaseFood.footer.disclaimer")}
          <span className="block mt-1.5 italic">{t("databaseFood.citation", { citation: sourceInfo.citation })}</span>
        </>
      }
    >
      <DietAdviceNote advice={food.advice} />
      {food.wastePct != null && food.wastePct > 0 && (
        <p className="text-xs text-slate-600">
          <Trans
            t={t}
            i18nKey="databaseFood.wastePct"
            values={{ value: formatNutrientAmount(food.wastePct) }}
            components={{ strong: <span className="font-semibold" /> }}
          />
        </p>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="bg-slate-50/60 border-b border-slate-100 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-bold">{t("databaseFood.nutritionTitle")}</h2>
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
            <Trans
              t={t}
              i18nKey={portion ? "databaseFood.calculatingForPortion" : "databaseFood.calculatingFor"}
              values={{ grams: formatNutrientAmount(grams), portion: portion ? portionLabel(portion) : "" }}
              components={{ strong: <span className="font-semibold text-foreground" /> }}
            />
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
    </DetailDialog>
  )
}
