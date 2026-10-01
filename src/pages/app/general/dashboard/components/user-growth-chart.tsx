import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

import type { UserGrowthItem } from "../data/super-admin-dashboard.mock"

export function UserGrowthChart({ data }: { data: UserGrowthItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">User Growth</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly onboarding trend across all platform roles.
            </p>
          </div>
          <span className="rounded-lg bg-primary-50 text-primary-700 font-bold px-2.5 py-1 text-[11px] border border-primary-100">
            +8.2% Total Rate
          </span>
        </div>
      </div>

      {/* Chart wrapper with explicit minimum height and ResponsiveContainer */}
      <div className="h-[320px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary-600)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success-600)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-success-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning-500)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-warning-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-100)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--color-slate-400)" fontSize={12} tickLine={false} axisLine={false} />
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
            <Area
              type="monotone"
              dataKey="Members"
              stroke="var(--color-primary-600)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMembers)"
            />
            <Area
              type="monotone"
              dataKey="Doctors"
              stroke="var(--color-success-600)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorDoctors)"
            />
            <Area
              type="monotone"
              dataKey="Admins"
              stroke="var(--color-warning-500)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAdmins)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
