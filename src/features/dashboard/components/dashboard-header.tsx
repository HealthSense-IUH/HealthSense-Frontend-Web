import { Download, Plus, Filter, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface DashboardFilters {
  period: "7d" | "30d" | "90d" | "6m"
  organizationId: string
}

interface DashboardHeaderProps {
  filters: DashboardFilters
  onFilterChange: (newFilters: Partial<DashboardFilters>) => void
}

export function DashboardHeader({ filters, onFilterChange }: DashboardHeaderProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-slate-200/80">
      {/* Top row: Title + Action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Monitor HealthSense platform activity and system performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl font-bold text-xs bg-white border-slate-200 shadow-2xs hover:bg-slate-50 text-slate-700"
            onClick={() => alert("Preparing clinical report export...")}
          >
            <Download className="mr-2 h-4 w-4 text-slate-500" />
            Export Report
          </Button>

          <Button
            size="sm"
            className="h-10 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            onClick={() => alert("Opening Add User Dialog...")}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Bottom row: Interactive filter dropdowns */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters:</span>
        </div>

        <div className="relative">
          <select
            aria-label="Chọn khoảng thời gian"
            value={filters.period}
            onChange={(event) => onFilterChange({ period: event.target.value as DashboardFilters["period"] })}
            className="appearance-none rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 pr-8 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="6m">Last 6 months</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </span>
        </div>

        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Building className="h-3.5 w-3.5" />
          </div>
          <select
            aria-label="Chọn cơ sở y tế hoặc tổ chức"
            value={filters.organizationId}
            onChange={(event) => onFilterChange({ organizationId: event.target.value })}
            className="appearance-none rounded-xl border border-slate-200/80 bg-white pl-8 pr-8 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="all">All organizations</option>
            <option value="org-1">Chợ Rẫy Hospital</option>
            <option value="org-2">University Medical Center (Y Mọc)</option>
            <option value="org-3">Heart Center clinic</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
            ▼
          </span>
        </div>
      </div>
    </div>
  )
}
