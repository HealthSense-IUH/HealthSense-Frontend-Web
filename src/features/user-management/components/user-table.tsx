import { Eye, Edit3, Trash2, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserStatusBadge } from "./user-status-badge"
import type { UserItem } from "../types"

interface UserTableProps {
  users: UserItem[]
  loading?: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
  onPageChange: (newPage: number) => void
  onSizeChange: (newSize: number) => void
  onView: (user: UserItem) => void
  onEdit: (user: UserItem) => void
  onDelete: (user: UserItem) => void
}

export function UserTable({
  users,
  loading,
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  onView,
  onEdit,
  onDelete,
}: UserTableProps) {
  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1
  const endItem = Math.min(page * size, totalElements)

  const formatDate = (val?: string | number) => {
    if (!val) return "—"
    try {
      const d = typeof val === "number" ? new Date(val) : new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return String(val)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table responsive scrolling viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-5 w-16">ID</th>
              <th className="py-3.5 px-5">Account Member</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-5 text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading && users.length === 0 ? (
              /* Loading State */
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-700">Retrieving user accounts from backend...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              /* Empty State */
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-200">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800">No matching accounts found</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      There are currently no registered users matching your search query or selected role category.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-slate-500 text-xs">
                    #{item.id}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black flex items-center justify-center text-xs shrink-0">
                        {item.displayName ? item.displayName.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 truncate text-xs">
                          {item.displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50/80 text-blue-800 border border-blue-200/60">
                      {item.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <UserStatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700 text-[11px]">
                    {item.phone || "—"}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(item)}
                        title="View account details"
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50/80 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Edit account credentials & status"
                        className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50/80 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title="Revoke & delete account"
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Row size controller bar */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong className="text-slate-800">{startItem}</strong> -{" "}
            <strong className="text-slate-800">{endItem}</strong> of{" "}
            <strong className="text-slate-800">{totalElements}</strong> rows
          </span>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span>Rows per page:</span>
            <select
              aria-label="Rows per page selector"
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              disabled={loading}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs mr-2">
            Page <strong className="text-slate-800">{page}</strong> of{" "}
            <strong className="text-slate-800">{Math.max(1, totalPages)}</strong>
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Prev</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
