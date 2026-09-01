import { History } from "lucide-react"
import { StatusIndicator } from "./status-indicator"
import type { ActivityLogItem } from "../data/super-admin-dashboard.mock"

export function RecentActivityTable({ activities }: { activities: ActivityLogItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between h-full">
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity Logs</h3>
            <p className="text-xs text-slate-500">Live system events and administrative overview</p>
          </div>
        </div>
      </div>

      {/* Table container with horizontal scroll for laptops/smaller views */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">User / Actor</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Action Event</th>
              <th className="py-3.5 px-4">Time</th>
              <th className="py-3.5 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {activities.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-extrabold text-slate-900 truncate max-w-[180px]">
                  {act.user}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {act.role}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-700 max-w-[280px] truncate">
                  {act.action}
                </td>
                <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                  {act.time}
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
