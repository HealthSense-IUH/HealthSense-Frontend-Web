import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface PaginationControlProps {
  currentPage: number
  totalPages: number
  totalElements?: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  isLoading?: boolean
  showPageSize?: boolean
  showTotalInfo?: boolean
  className?: string
}

export function PaginationControl({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 9,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 9, 12, 18, 24],
  isLoading = false,
  showPageSize = true,
  showTotalInfo = true,
  className = "",
}: PaginationControlProps) {
  // If no pages or only 1 page with no totalElements, don't show controls unless totalElements exists
  if (totalPages <= 0) return null

  // Calculate items range
  const startItem = totalElements === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = totalElements !== undefined ? Math.min(currentPage * pageSize, totalElements) : currentPage * pageSize

  // Smart page numbers calculation with ellipsis
  const getPageNumbers = () => {
    const delta = 1 // Number of pages before and after current page
    const range: (number | string)[] = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      range.unshift("ellipsis-start")
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("ellipsis-end")
    }

    range.unshift(1)
    if (totalPages > 1) {
      range.push(totalPages)
    }

    return range
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 sm:px-5 sm:py-3 bg-white dark:bg-card border border-border rounded-2xl shadow-xs ${className}`}>
      {/* Left: Total Records Info & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground order-2 sm:order-1">
        {showTotalInfo && totalElements !== undefined && (
          <span>
            Hiển thị{" "}
            <strong className="font-semibold text-foreground">
              {startItem}-{endItem}
            </strong>{" "}
            trong tổng số{" "}
            <strong className="font-semibold text-foreground">
              {totalElements}
            </strong>{" "}
            bản ghi
          </span>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>Hiển thị:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => onPageSizeChange(Number(val))}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-[72px] bg-white dark:bg-slate-800 border border-border shadow-2xs text-xs font-semibold rounded-xl">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs font-medium min-w-[72px]">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>/ trang</span>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="sm"
          title="Trang đầu tiên"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          title="Trang trước"
          disabled={currentPage <= 1 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (typeof p === "string") {
              return (
                <div
                  key={`ellipsis-${idx}`}
                  className="h-8 w-6 flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </div>
              )
            }

            const isActive = p === currentPage

            return (
              <Button
                key={p}
                size="sm"
                variant={isActive ? "default" : "outline"}
                disabled={isLoading}
                onClick={() => onPageChange(p)}
                className={`h-8 w-8 p-0 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground border border-primary shadow-xs pointer-events-none"
                    : "bg-white dark:bg-slate-800 border border-border shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 text-foreground"
                }`}
              >
                {p}
              </Button>
            )
          })}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          title="Trang sau"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="sm"
          title="Trang cuối cùng"
          disabled={currentPage >= totalPages || isLoading}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-40"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
