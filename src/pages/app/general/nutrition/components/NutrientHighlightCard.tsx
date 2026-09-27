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
  // If highlightCodes provided, pick those; otherwise pick isKey nutrients (up to 4)
  const displayedNutrients = highlightCodes && highlightCodes.length > 0
    ? highlightCodes
        .map((code) => nutrients.find((n) => n.nutrientCode === code))
        .filter((n): n is NutrientValue => Boolean(n))
    : nutrients.filter((n) => n.isKey).slice(0, 4)

  if (displayedNutrients.length === 0) return null

  // Short labels for compact card display
  const shortLabels: Partial<Record<NutrientCode, string>> = {
    energy: "Năng lượng",
    protein: "Đạm (Protein)",
    carbohydrate: "Carbs",
    fiber: "Chất xơ",
    fiber_crude: "Xơ thô",
    sugars: "Đường",
    fat_total: "Tổng chất béo",
    fat_saturated: "Béo bão hòa",
    fat_monounsaturated: "Béo không bão hòa đơn",
    fat_polyunsaturated: "Béo không bão hòa đa",
    cholesterol: "Cholesterol",
    sodium: "Natri (Sodium)",
    potassium: "Kali (Potassium)",
    magnesium: "Magie",
    caffeine: "Caffeine",
    alcohol: "Cồn",
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
          className="rounded-lg bg-slate-50 dark:bg-muted/40 px-2.5 py-1.5 flex flex-col justify-between border border-slate-100 dark:border-muted/50"
        >
          <span className="text-[11px] text-muted-foreground truncate font-normal">
            {shortLabels[item.nutrientCode] || item.name}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
            {item.amount} <span className="text-[10px] font-normal text-muted-foreground">{item.unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
