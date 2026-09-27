import { Search, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserTableHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  totalElements?: number
  currentRoleLabel: string
}

/** Tiêu đề khu vực bảng + ô tìm kiếm, lọc trạng thái. Nút "Thêm tài khoản" nằm ở PageHeader của trang. */
export function UserTableHeader({
  searchQuery,
  onSearchChange,
  statusFilter = "ALL",
  onStatusFilterChange,
  totalElements = 0,
  currentRoleLabel,
}: UserTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 shadow-2xs">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Danh sách tài khoản {currentRoleLabel}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalElements} Tổng số
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý trạng thái tài khoản, thông tin định danh và bảo mật.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo ID, email hoặc SĐT..."
            className="pl-9 h-10 bg-white border-slate-200/80 rounded-xl text-xs font-medium shadow-3xs focus:border-blue-500 transition-all"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger className="w-[170px] h-10 bg-white border-slate-200/80 rounded-xl text-xs font-medium shadow-3xs">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            <SelectItem value="PENDING_VERIFY">Chờ xác thực</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
