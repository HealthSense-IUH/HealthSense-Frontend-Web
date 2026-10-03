import { useTranslation } from "react-i18next"
import type { NutrientValue, NutrientCode } from "@/types/nutrition"
import { cn } from "@/lib/utils"

interface NutrientHighlightCardProps {
  nutrients: NutrientValue[]
  highlightCodes?: NutrientCode[]
  className?: string
  layout?: "grid" | "row"
}

export function NutrientHighlightCard({
  nutrients,
  highlightCodes,
  className,
  layout = "grid",
}: NutrientHighlightCardProps) {
  const { t } = useTranslation("nutrition")
  // If highlightCodes provided, pick those; otherwise pick isKey nutrients (up to 4)
  const displayedNutrients = highlightCodes && highlightCodes.length > 0
    ? highlightCodes
        .map((code) => nutrients.find((n) => n.nutrientCode === code))
        .filter((n): n is NutrientValue => Boolean(n))
    : nutrients.filter((n) => n.isKey).slice(0, 4)

  if (displayedNutrients.length === 0) return null

  // Short labels for compact card display
  const shortLabels: Partial<Record<NutrientCode, string>> = {
    energy: t("nutrientShort.energy"),
    protein: t("nutrientShort.protein"),
    carbohydrate: "Carbs",
    fiber: t("nutrientShort.fiber"),
    fiber_crude: t("nutrientShort.fiberCrude"),
    sugars: t("nutrientShort.sugars"),
    fat_total: t("nutrientShort.fatTotal"),
    fat_saturated: t("nutrientShort.fatSaturated"),
    fat_monounsaturated: t("nutrientShort.fatMonounsaturated"),
    fat_polyunsaturated: t("nutrientShort.fatPolyunsaturated"),
    cholesterol: "Cholesterol",
    sodium: t("nutrientShort.sodium"),
    potassium: t("nutrientShort.potassium"),
    magnesium: t("nutrientShort.magnesium"),
    caffeine: "Caffeine",
    alcohol: t("nutrientShort.alcohol"),
    vitamin_k: "Vitamin K",
    epa: "Omega-3 EPA",
    dha: "Omega-3 DHA",
  }

  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-2 gap-2 text-xs"
          : "flex flex-wrap items-center gap-2 text-xs",
        className
      )}
    >
      {displayedNutrients.map((item) => (
        <div
          key={item.nutrientCode}
          className="rounded-lg bg-slate-50 px-2.5 py-1.5 flex flex-col justify-between border border-slate-100"
        >
          <span className="text-[11px] text-muted-foreground truncate font-normal">
            {shortLabels[item.nutrientCode] || item.name}
          </span>
          <span className="font-semibold text-slate-800 mt-0.5">
            {item.amount} <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
