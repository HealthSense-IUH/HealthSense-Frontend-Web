import { Link, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ReferenceFoodSource } from "@/types/nutrition"
import { formatNutrientAmount } from "../format"
import { useReferenceCategories, useReferenceFoods } from "../hooks/use-nutrition"
import { REFERENCE_SOURCES } from "../sources"

const PAGE_SIZE = 20
const ALL_CATEGORIES = "__all__"
const FILTER_KEYS = ["q", "source", "category", "page"] as const
const SOURCE_ORDER: ReferenceFoodSource[] = ["VN_FCT", "USDA_FNDDS"]

function parseSource(value: string | null): ReferenceFoodSource | undefined {
  return value === "VN_FCT" || value === "USDA_FNDDS" ? value : undefined
}

const SUMMARY_COLUMNS = [
  { key: "energyKcal", label: "Năng lượng", unit: "kcal" },
  { key: "proteinG", label: "Đạm", unit: "g" },
  { key: "carbohydrateG", label: "Tinh bột", unit: "g" },
  { key: "fatTotalG", label: "Chất béo", unit: "g" },
] as const

/**
 * Tra cứu dữ liệu dinh dưỡng tham chiếu (Bảng TPTP Việt Nam 2007 + USDA FNDDS): chọn nguồn, ô tìm,
 * lọc nhóm, danh sách và phân trang. Từ khóa, nguồn, nhóm và trang nằm trên URL để Back giữ được
 * kết quả; các tham số khác của trang chứa nó (ví dụ `tab`) được giữ nguyên.
 */
export function ReferenceFoodBrowser() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const source = parseSource(searchParams.get("source"))
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data: categories = [] } = useReferenceCategories()
  const { data, isLoading, isError, isFetching, refetch } = useReferenceFoods({
    q: q || undefined,
    category: category || undefined,
    source,
    page,
    size: PAGE_SIZE,
  })

  const updateParams = (next: { q?: string; source?: ReferenceFoodSource; category?: string; page?: number }) => {
    const merged = { q, source, category, page, ...next }
    const params = new URLSearchParams(searchParams)
    FILTER_KEYS.forEach((key) => params.delete(key))
    if (merged.q) params.set("q", merged.q)
    if (merged.source) params.set("source", merged.source)
    if (merged.category) params.set("category", merged.category)
    if (merged.page > 1) params.set("page", String(merged.page))
    setSearchParams(params)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    FILTER_KEYS.forEach((key) => params.delete(key))
    setSearchParams(params)
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get("q")
    updateParams({ q: typeof value === "string" ? value.trim() : "", page: 1 })
  }

  const foods = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const countBySource = (s: ReferenceFoodSource) =>
    categories.filter((c) => c.source === s).reduce((sum, c) => sum + c.foodCount, 0)
  const sourceOptions: { value?: ReferenceFoodSource; label: string; count: number }[] = [
    { label: "Tất cả", count: categories.reduce((sum, c) => sum + c.foodCount, 0) },
    ...SOURCE_ORDER.map((s) => ({ value: s, label: REFERENCE_SOURCES[s].short, count: countBySource(s) })),
  ]
  const visibleSources = source ? [source] : SOURCE_ORDER

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {sourceOptions.map((option) => (
          <button
            key={option.label}
            type="button"
            // Đổi nguồn thì bỏ lọc nhóm, vì nhóm của hai nguồn khác nhau
            onClick={() => updateParams({ source: option.value, category: "", page: 1 })}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors",
              source === option.value
                ? "bg-slate-900 text-white border-slate-900 dark:bg-primary dark:text-primary-foreground dark:border-primary"
                : "bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
            {option.count > 0 && <span className="ml-1 opacity-70">({option.count.toLocaleString("vi-VN")})</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              key={q}
              name="q"
              defaultValue={q}
              placeholder="Tên tiếng Việt hoặc tiếng Anh, ví dụ: rau muống, giò lụa, salmon..."
              className="pl-10 h-11 rounded-2xl bg-white dark:bg-card"
            />
          </div>
          <Button type="submit" className="h-11 rounded-2xl px-5">
            Tìm
          </Button>
        </form>
        <Select
          value={category || ALL_CATEGORIES}
          onValueChange={(value) => updateParams({ category: value === ALL_CATEGORIES ? "" : value, page: 1 })}
        >
          <SelectTrigger className="h-11 rounded-2xl md:w-72 bg-white dark:bg-card">
            <SelectValue placeholder="Tất cả nhóm" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectItem value={ALL_CATEGORIES}>Tất cả nhóm</SelectItem>
            {visibleSources.map((s) => (
              <SelectGroup key={s}>
                <SelectLabel>{REFERENCE_SOURCES[s].label}</SelectLabel>
                {categories
                  .filter((c) => c.source === s)
                  .map((c) => (
                    <SelectItem key={`${s}:${c.name}`} value={c.name}>
                      {c.name} ({c.foodCount})
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {data ? `${data.totalElements.toLocaleString("vi-VN")} kết quả` : "Đang tải..."}
          {q && (
            <>
              {" cho "}
              <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span>
            </>
          )}
        </span>
        {(q || category || source) && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {isError ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-border p-8 text-center text-sm text-muted-foreground space-y-2">
          <p>Không tải được dữ liệu dinh dưỡng.</p>
          <button type="button" onClick={() => refetch()} className="text-primary font-medium hover:underline cursor-pointer">
            Thử lại
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-border p-8 text-center text-sm text-muted-foreground space-y-1">
          <p>Không tìm thấy thực phẩm phù hợp.</p>
          <p className="text-xs">
            Thử tên tiếng Việt (có hoặc không dấu) hoặc tiếng Anh, ví dụ: rau muong, gio lua, chicken, rice.
          </p>
        </div>
      ) : (
        <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <div className="hidden md:grid grid-cols-[1fr_repeat(4,6.5rem)] gap-3 px-4 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>Thực phẩm</span>
            {SUMMARY_COLUMNS.map((col) => (
              <span key={col.key} className="text-right">
                {col.label} ({col.unit})
              </span>
            ))}
          </div>
          <ul className="space-y-2">
            {foods.map((food) => (
              <li key={food.id}>
                <Link
                  to={`/app/general/nutrition/database/${food.id}`}
                  className="group grid grid-cols-2 md:grid-cols-[1fr_repeat(4,6.5rem)] gap-x-3 gap-y-2 items-center rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs hover:border-primary/50 dark:border-border dark:bg-card"
                >
                  <div className="col-span-2 md:col-span-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-foreground group-hover:text-primary truncate">
                        {food.nameVi ?? food.name}
                      </p>
                      <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-muted dark:text-slate-300">
                        {REFERENCE_SOURCES[food.source].short}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[food.nameVi && food.nameVi !== food.name ? food.name : null, food.category]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {SUMMARY_COLUMNS.map((col) => (
                    <p key={col.key} className="text-xs md:text-sm md:text-right text-slate-700 dark:text-slate-300">
                      <span className="md:hidden text-muted-foreground">{col.label}: </span>
                      <span className="font-semibold">{formatNutrientAmount(food[col.key])}</span>
                      <span className="md:hidden text-muted-foreground"> {col.unit}</span>
                    </p>
                  ))}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: page - 1 })}
            className="rounded-xl gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </Button>
          <span className="text-xs text-muted-foreground">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: page + 1 })}
            className="rounded-xl gap-1"
          >
            Sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
