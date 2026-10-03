import { useTranslation } from "react-i18next"
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

/** Nút thao tác cấp trang của dashboard quản trị, đặt vào `actions` của PageHeader */
export function DashboardHeaderActions() {
  return (
    <>
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
        className="h-10 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/20"
        onClick={() => alert("Opening Add User Dialog...")}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add User
      </Button>
    </>
  )
}

/** Cơ sở y tế trong bộ lọc mẫu của dashboard quản trị (tên riêng, không dịch). */
const MOCK_ORGANIZATIONS = [
  { value: "org-1", label: "Chợ Rẫy Hospital" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
  { value: "org-2", label: "University Medical Center (Y Mọc)" }, // i18n-ignore: tên riêng trong dữ liệu mẫu
]

/** Hàng bộ lọc ở đầu nội dung dashboard. Tiêu đề và nút thao tác nằm ở PageHeader của trang. */
export function DashboardHeader({ filters, onFilterChange }: DashboardHeaderProps) {
  const { t } = useTranslation("health")
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>Filters:</span>
      </div>

      <div className="relative">
        <select
          aria-label={t("adminDashboard.selectPeriod")}
          value={filters.period}
          onChange={(event) => onFilterChange({ period: event.target.value as DashboardFilters["period"] })}
          className="appearance-none rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 pr-8 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
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
          aria-label={t("adminDashboard.selectOrganization")}
          value={filters.organizationId}
          onChange={(event) => onFilterChange({ organizationId: event.target.value })}
          className="appearance-none rounded-xl border border-slate-200/80 bg-white pl-8 pr-8 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
        >
          <option value="all">All organizations</option>
          {MOCK_ORGANIZATIONS.map((org) => (
            <option key={org.value} value={org.value}>
              {org.label}
            </option>
          ))}
          <option value="org-3">Heart Center clinic</option>
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
          ▼
        </span>
      </div>
    </div>
  )
}
