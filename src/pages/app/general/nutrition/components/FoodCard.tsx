import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Food } from "@/types/nutrition"
import { GuidanceBadge } from "./GuidanceBadge"
import { NutrientHighlightCard } from "./NutrientHighlightCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDetailLink } from "../nutrition-nav"

interface FoodCardProps {
  food: Food
  className?: string
  showDescription?: boolean
  showGuidanceTitle?: boolean
}

export function FoodCard({
  food,
  className,
  showDescription = true,
}: FoodCardProps) {
  const { t } = useTranslation("nutrition")
  const detailLink = useDetailLink()
  const guidanceType = food.guidance
  const title = food.foodNameSpecific
  const subtitle = food.foodName !== food.foodNameSpecific ? food.foodName : undefined

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md overflow-hidden",
        className
      )}
    >
      <div>
        {/* Title & Subtitle */}
        <div className="space-y-1 mb-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base leading-snug line-clamp-2">
              {title}
            </h4>
            {guidanceType && <GuidanceBadge type={guidanceType} size="sm" className="shrink-0" />}
          </div>
          {subtitle && (
            <span className="text-[11px] font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md inline-block">
              {subtitle}
            </span>
          )}
        </div>

        {showDescription && food.description && (
          <p className="text-xs text-slate-600 line-clamp-2 my-2 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
            {food.description}
          </p>
        )}

        <div className="my-2.5">
          <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>{t("foodCard.highlights")}</span>
          </div>
          <NutrientHighlightCard
            nutrients={food.nutrients}
            highlightCodes={food.highlightNutrientCodes}
          />
        </div>
      </div>

      <div className="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {t("foodCard.per100g")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2.5 text-xs text-primary font-medium hover:text-primary hover:bg-primary/10 gap-1 rounded-lg cursor-pointer"
        >
          <Link {...detailLink("food", food.id)}>
            <span>{t("foodCard.viewDetail")}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
