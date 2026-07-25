import { Search, Plus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserTableHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenCreate: () => void
  totalElements?: number
  currentRoleLabel: string
  loading?: boolean
}

export function UserTableHeader({
  searchQuery,
  onSearchChange,
  onOpenCreate,
  totalElements = 0,
  currentRoleLabel,
  loading,
}: UserTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 shadow-2xs">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{currentRoleLabel} Account Registry</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalElements} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage administrative status, credentials, and HIPAA compliance details.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter table by email, name or phone..."
            className="pl-9 h-10 bg-white border-slate-200/80 rounded-xl text-xs font-medium shadow-3xs focus:border-blue-500 transition-all"
          />
        </div>

        <Button
          onClick={onOpenCreate}
          disabled={loading}
          className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4.5 shadow-sm shadow-blue-500/25 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Add New Account</span>
        </Button>
      </div>
    </div>
  )
}
