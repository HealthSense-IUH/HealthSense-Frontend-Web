import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

import type { healthAlertsOverview } from "../data/super-admin-dashboard.mock"

export function HealthAlertsChart({
  data,
}: {
  data: typeof healthAlertsOverview
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-bold text-slate-900">Health Alerts Overview</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time patient monitoring alert classification by severity.
        </p>

        {/* 3 Summary Badges */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl bg-danger-50/70 border border-danger-200/80 p-3 text-center">
            <span className="block text-xl sm:text-2xl font-black text-danger-600">
              {data.summary.critical}
            </span>
            <span className="text-[11px] font-bold text-danger-700 uppercase tracking-wide">
              Critical
            </span>
          </div>
          <div className="rounded-xl bg-warning-50/70 border border-warning-200/80 p-3 text-center">
            <span className="block text-xl sm:text-2xl font-black text-warning-600">
              {data.summary.warning}
            </span>
            <span className="text-[11px] font-bold text-warning-700 uppercase tracking-wide">
              Warning
            </span>
          </div>
          <div className="rounded-xl bg-success-50/70 border border-success-200/80 p-3 text-center">
            <span className="block text-xl sm:text-2xl font-black text-success-600">
              {data.summary.resolved}
            </span>
            <span className="text-[11px] font-bold text-success-700 uppercase tracking-wide">
              Resolved
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart wrapper with ResponsiveContainer */}
      <div className="h-[250px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-100)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--color-slate-400)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-slate-400)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                borderColor: "var(--color-slate-200)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "12px", fontWeight: 600 }} />
            <Bar dataKey="Critical" fill="var(--color-danger-500)" radius={[6, 6, 0, 0]} barSize={12} />
            <Bar dataKey="Warning" fill="var(--color-warning-500)" radius={[6, 6, 0, 0]} barSize={12} />
            <Bar dataKey="Resolved" fill="var(--color-success-500)" radius={[6, 6, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
