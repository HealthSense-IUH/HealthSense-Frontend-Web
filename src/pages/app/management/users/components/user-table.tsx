import { Eye, Edit3, Trash2, ChevronLeft, ChevronRight, Inbox, Loader2, FilePlus, Stethoscope, FolderHeart } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { UserStatusBadge } from "./user-status-badge"
import { USER_ROLES, roleLabel } from "@/constants"
import type { UserItem } from "@/types/user"
import { formatShortDate } from "@/lib/formatters"

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
  onFakeRecord?: (user: UserItem) => void
  onManageCareProfile?: (user: UserItem) => void
  onMemberDetail?: (user: UserItem) => void
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
  onFakeRecord,
  onManageCareProfile,
  onMemberDetail,
}: UserTableProps) {
  const { t } = useTranslation("management")
  const startItem = totalElements === 0 ? 0 : (page - 1) * size + 1
  const endItem = Math.min(page * size, totalElements)

  const formatDate = (val?: string | number) => {
    return formatShortDate(val, "—")
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Table responsive scrolling viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-5 w-16">{t("users.table.columns.id")}</th>
              <th className="py-3.5 px-5">{t("users.table.columns.user")}</th>
              <th className="py-3.5 px-4">{t("users.table.columns.role")}</th>
              <th className="py-3.5 px-4">{t("users.table.columns.status")}</th>
              <th className="py-3.5 px-4">{t("users.table.columns.phone")}</th>
              <th className="py-3.5 px-4">{t("users.table.columns.createdAt")}</th>
              <th className="py-3.5 px-5 text-right w-36">{t("users.table.columns.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading && users.length === 0 ? (
              /* Loading State */
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 text-primary-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-700">{t("users.table.loading")}</span>
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
                    <h4 className="text-base font-extrabold text-slate-800">{t("users.table.emptyTitle")}</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {t("users.table.emptyDescription")}
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-primary-50/80 text-primary-800 border border-primary-200/60">
                      {roleLabel(item.role)}
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
                        title={t("users.table.actions.view")}
                        className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50/80 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.role === USER_ROLES.MEMBER && onMemberDetail && (
                        <button
                          type="button"
                          onClick={() => onMemberDetail(item)}
                          title={t("users.table.actions.memberDetail")}
                          className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50/80 transition-colors cursor-pointer"
                        >
                          <FolderHeart className="w-4 h-4" />
                        </button>
                      )}
                      {item.role === USER_ROLES.MEMBER && onFakeRecord && (
                        <button
                          type="button"
                          onClick={() => onFakeRecord(item)}
                          title={t("users.table.actions.fakeRecord")}
                          className="p-2 rounded-lg text-slate-500 hover:text-success-600 hover:bg-success-50/80 transition-colors cursor-pointer"
                        >
                          <FilePlus className="w-4 h-4" />
                        </button>
                      )}
                      {item.role === USER_ROLES.DOCTOR && onManageCareProfile && (
                        <button
                          type="button"
                          onClick={() => onManageCareProfile(item)}
                          title={t("users.table.actions.careProfile")}
                          className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50/80 transition-colors cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title={t("users.table.actions.edit")}
                        className="p-2 rounded-lg text-slate-500 hover:text-warning-600 hover:bg-warning-50/80 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        title={t("users.table.actions.delete")}
                        className="p-2 rounded-lg text-slate-500 hover:text-danger-600 hover:bg-danger-50/80 transition-colors cursor-pointer"
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
            <Trans
              t={t}
              i18nKey="users.table.pagination.showing"
              values={{ start: startItem, end: endItem, total: totalElements }}
              components={{ b: <strong className="text-slate-800" /> }}
            />
          </span>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span>{t("users.table.pagination.rowsPerPage")}</span>
            <select
              aria-label={t("users.table.pagination.rowsPerPageAria")}
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              disabled={loading}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs mr-2">
            <Trans
              t={t}
              i18nKey="users.table.pagination.page"
              values={{ page, totalPages: Math.max(1, totalPages) }}
              components={{ b: <strong className="text-slate-800" /> }}
            />
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>{t("users.table.pagination.prev")}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 px-2.5 rounded-lg border-slate-200 font-bold hover:bg-white text-xs cursor-pointer disabled:opacity-50"
          >
            <span>{t("users.table.pagination.next")}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
