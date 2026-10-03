import { History } from "lucide-react"
import { useTranslation } from "react-i18next"
import { StatusIndicator } from "./status-indicator"
import { roleLabel } from "@/constants"
import { formatMinutesAgo } from "../data/admin-format"
import type { ActivityLogItem, DashboardRole } from "../data/super-admin-dashboard.mock"

/** Mỗi dòng là một người nên dùng tên vai trò số ít ("Bác sĩ" / "Doctor") */
const USER_ROLE_OF: Partial<Record<DashboardRole, string>> = {
  members: "MEMBER",
  doctors: "DOCTOR",
  admins: "ADMIN",
  superAdmins: "SUPER_ADMIN",
}

export function RecentActivityTable({ activities }: { activities: ActivityLogItem[] }) {
  const { t } = useTranslation("health")
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between h-full">
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t("adminDashboard.activity.title")}</h3>
            <p className="text-xs text-slate-500">{t("adminDashboard.activity.description")}</p>
          </div>
        </div>
      </div>

      {/* Table container with horizontal scroll for laptops/smaller views */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">{t("adminDashboard.activity.columns.actor")}</th>
              <th className="py-3.5 px-4">{t("adminDashboard.activity.columns.role")}</th>
              <th className="py-3.5 px-4">{t("adminDashboard.activity.columns.action")}</th>
              <th className="py-3.5 px-4">{t("adminDashboard.activity.columns.time")}</th>
              <th className="py-3.5 px-6 text-right">{t("adminDashboard.activity.columns.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {activities.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-extrabold text-slate-900 truncate max-w-[180px]">
                  {act.actor ?? t("adminDashboard.activity.systemActor")}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {USER_ROLE_OF[act.role] ? roleLabel(USER_ROLE_OF[act.role]) : t(`adminDashboard.roles.${act.role}`)}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-700 max-w-[280px] truncate">
                  {t(`adminDashboard.activity.actions.${act.action}`, act.actionValues)}
                </td>
                <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                  {formatMinutesAgo(act.minutesAgo)}
                </td>
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <StatusIndicator status={act.status} showText={false} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
