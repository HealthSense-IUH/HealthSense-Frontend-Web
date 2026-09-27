import { Link, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNutrientAmount } from "../format"
import { useReferenceCategories, useReferenceFoods } from "../hooks/use-nutrition"

const PAGE_SIZE = 20
const ALL_CATEGORIES = "__all__"
const FILTER_KEYS = ["q", "category", "page"] as const

const SUMMARY_COLUMNS = [
  { key: "energyKcal", label: "Năng lượng", unit: "kcal" },
  { key: "proteinG", label: "Đạm", unit: "g" },
  { key: "carbohydrateG", label: "Tinh bột", unit: "g" },
  { key: "fatTotalG", label: "Chất béo", unit: "g" },
] as const

/**
 * Tra cứu dữ liệu dinh dưỡng USDA FNDDS: ô tìm, lọc nhóm, danh sách và phân trang.
 * Từ khóa, nhóm và trang nằm trên URL để Back giữ được kết quả; các tham số khác của
 * trang chứa nó (ví dụ `tab`) được giữ nguyên.
 */
export function ReferenceFoodBrowser() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""
  const page = Math.max(1, Number(searchParams.get("page")) || 1)

  const { data: categories = [] } = useReferenceCategories()
  const { data, isLoading, isError, isFetching, refetch } = useReferenceFoods({
    q: q || undefined,
    category: category || undefined,
    page,
    size: PAGE_SIZE,
  })

  const updateParams = (next: { q?: string; category?: string; page?: number }) => {
    const merged = { q, category, page, ...next }
    const params = new URLSearchParams(searchParams)
    FILTER_KEYS.forEach((key) => params.delete(key))
    if (merged.q) params.set("q", merged.q)
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              key={q}
              name="q"
              defaultValue={q}
              placeholder="Tên tiếng Anh, ví dụ: salmon, brown rice, pho..."
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
            {categories.map((c) => (
              <SelectItem key={c.name} value={c.name}>
                {c.name} ({c.foodCount})
              </SelectItem>
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
        {(q || category) && (
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
          <p className="text-xs">Dữ liệu dùng tên tiếng Anh của USDA, hãy thử từ khóa như: chicken, rice, noodle, tofu.</p>
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
                    <p className="font-medium text-sm text-slate-900 dark:text-foreground group-hover:text-primary truncate">
                      {food.name}
                    </p>
                    {food.category && <p className="text-[11px] text-muted-foreground truncate">{food.category}</p>}
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
