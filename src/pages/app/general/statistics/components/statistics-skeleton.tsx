import { Skeleton } from "@/components/ui/skeleton"

export function StatisticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between h-[128px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-8 w-20 rounded-md mb-1" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Trend Chart Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-5 w-44 rounded-md mb-1.5" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </div>

      {/* Distribution Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <Skeleton className="h-5 w-40 rounded-md mb-1.5" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <div className="h-[200px] my-4 flex items-center justify-center">
            <Skeleton className="h-36 w-36 rounded-full" />
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
