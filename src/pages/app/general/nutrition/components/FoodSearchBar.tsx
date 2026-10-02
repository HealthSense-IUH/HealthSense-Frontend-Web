import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X, ChevronRight, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { GuidanceBadge } from "./GuidanceBadge"
import { useNutritionSearch } from "../hooks/use-nutrition"
import type { Food } from "@/types/nutrition"
import { cn } from "@/lib/utils"

interface FoodSearchBarProps {
  className?: string
  placeholder?: string
  onSelectFood?: (food: Food) => void
}

export function FoodSearchBar({
  className,
  placeholder = "Tìm thực phẩm (ví dụ: cà phê, sữa ít béo, cá hồi, chuối, bia)...",
  onSelectFood,
}: FoodSearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
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
      navigate(`/app/general/nutrition/food/${food.id}`)
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
          placeholder={placeholder}
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
            aria-label="Xóa từ khóa tìm kiếm"
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
                <span>Kết quả thực phẩm ({results.length})</span>
                <span className="text-[10px] text-primary">Bấm Enter để chọn món đầu tiên</span>
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
              <span>Đang tìm...</span>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p>Không tìm thấy món ăn nào phù hợp với &ldquo;{query}&rdquo;.</p>
              <p className="text-xs mt-1 text-slate-400">
                Thử tìm theo từ khóa như: <span className="text-primary font-medium">sữa</span>,{" "}
                <span className="text-primary font-medium">cá hồi</span>,{" "}
                <span className="text-primary font-medium">cà phê</span>,{" "}
                <span className="text-primary font-medium">chuối</span>...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Chips */}
      {!query && (
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 shrink-0 text-[11px] font-medium">
            <Sparkles className="w-3 h-3 text-primary" />
            Tìm nhanh:
          </span>
          {["Cá hồi nướng", "Sữa ít béo 1%", "Cà phê", "Rau chân vịt", "Chuối", "Bia"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag)
                setIsOpen(true)
              }}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
