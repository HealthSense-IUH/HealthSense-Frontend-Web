import { Link } from "react-router-dom"
import { ArrowRight, Sparkles, Image as ImageIcon } from "lucide-react"
import type { Food } from "@/types/nutrition"
import { GuidanceBadge } from "./GuidanceBadge"
import { NutrientHighlightCard } from "./NutrientHighlightCard"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const guidanceType = food.guidance
  const title = food.foodNameSpecific
  const subtitle = food.foodName !== food.foodNameSpecific ? food.foodName : undefined

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md dark:border-border dark:bg-card overflow-hidden",
        className
      )}
    >
      <div>
        {/* Image / Image Placeholder Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-muted/50 mb-3.5 border border-slate-200/60 dark:border-border/60">
          {food.imageUrl ? (
            <img
              src={food.imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-muted-foreground gap-1.5 p-4 text-center select-none bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-muted/20 dark:to-muted/50 group-hover:from-primary/5 group-hover:to-primary/10 transition-colors">
              <div className="p-2.5 rounded-xl bg-white dark:bg-card shadow-2xs text-slate-400 group-hover:text-primary transition-colors border border-slate-200/50 dark:border-border/50">
                <ImageIcon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-muted-foreground tracking-tight">
                Chưa có hình ảnh
              </span>
            </div>
          )}

          {/* Floating Guidance Badge on top-right of image */}
          {guidanceType && (
            <div className="absolute top-2.5 right-2.5 shadow-xs">
              <GuidanceBadge type={guidanceType} size="sm" />
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1 mb-2">
          <h4 className="font-semibold text-slate-900 dark:text-foreground group-hover:text-primary transition-colors text-sm sm:text-base leading-snug line-clamp-1">
            {title}
          </h4>
          {subtitle && (
            <span className="text-[11px] font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md inline-block">
              {subtitle}
            </span>
          )}
        </div>

        {showDescription && food.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 my-2 bg-slate-50 dark:bg-muted/30 p-2 rounded-lg border border-slate-100 dark:border-muted/50 leading-relaxed">
            {food.description}
          </p>
        )}

        <div className="my-2.5">
          <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Thành phần dinh dưỡng nổi bật (trên 100g):</span>
          </div>
          <NutrientHighlightCard
            nutrients={food.nutrients}
            highlightCodes={food.highlightNutrientCodes}
          />
        </div>
      </div>

      <div className="pt-2 mt-auto border-t border-slate-100 dark:border-border/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Chuẩn 100g
        </span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2.5 text-xs text-primary font-medium hover:text-primary hover:bg-primary/10 gap-1 rounded-lg cursor-pointer"
        >
          <Link to={`/app/general/nutrition/food/${food.id}`}>
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
