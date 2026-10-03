import { useState, useRef, useEffect } from "react"
import { Search, X, ChevronRight, Loader2 } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { GuidanceBadge } from "./GuidanceBadge"
import { useNutritionSearch } from "../hooks/use-nutrition"
import { useNutritionNav } from "../nutrition-nav"
import type { Food } from "@/types/nutrition"
import { cn } from "@/lib/utils"

interface FoodSearchBarProps {
  className?: string
  placeholder?: string
  onSelectFood?: (food: Food) => void
}

export function FoodSearchBar({
  className,
  placeholder,
  onSelectFood,
}: FoodSearchBarProps) {
  const { t } = useTranslation("nutrition")
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { openFood } = useNutritionNav()
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 250)
  const { data: searchResults = [], isFetching } = useNutritionSearch(debouncedQuery)
  const results = query.trim() ? searchResults : []
  // Chưa hết thời gian chờ gõ, hoặc đang gọi API: chưa được kết luận là "không tìm thấy"
  const isSearching = isFetching || query.trim() !== debouncedQuery.trim()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (food: Food) => {
    setIsOpen(false)
    setQuery("")
    if (onSelectFood) {
      onSelectFood(food)
    } else {
      openFood(food.id)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      e.preventDefault()
      handleSelect(results[0])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("search.placeholder")}
          className="pl-10 pr-9 h-11 rounded-2xl bg-white border-slate-200 shadow-xs focus-visible:ring-primary/20 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full"
            aria-label={t("search.clear")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown / Flyout */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl overflow-hidden max-h-[380px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                <span>{t("search.results", { count: results.length })}</span>
                <span className="text-[10px] text-primary">{t("search.enterHint")}</span>
              </div>
              {results.map((food) => {
                const guidanceType = food.guidance
                const title = food.foodNameSpecific
                const subtitle = food.foodName !== food.foodNameSpecific ? food.foodName : undefined
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelect(food)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900 group-hover:text-primary transition-colors truncate">
                          {title}
                        </span>
                        {subtitle && (
                          <span className="text-[11px] text-muted-foreground font-normal">
                            ({subtitle})
                          </span>
                        )}
                        {guidanceType && <GuidanceBadge type={guidanceType} size="sm" />}
                      </div>
                      {food.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {food.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                )
              })}
            </div>
          ) : isSearching ? (
            <div className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("search.searching")}</span>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p>{t("search.noResults", { query })}</p>
              <p className="text-xs mt-1 text-slate-400">
                <Trans t={t} i18nKey="search.suggestions" components={{ kw: <span className="text-primary font-medium" /> }} />
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
