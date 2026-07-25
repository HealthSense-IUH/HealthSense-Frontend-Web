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
          <span className="rounded-lg bg-blue-50 text-blue-700 font-bold px-2.5 py-1 text-[11px] border border-blue-100">
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
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                borderColor: "#e2e8f0",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "12px", fontWeight: 600 }} />
            <Area
              type="monotone"
              dataKey="Members"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMembers)"
            />
            <Area
              type="monotone"
              dataKey="Doctors"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorDoctors)"
            />
            <Area
              type="monotone"
              dataKey="Admins"
              stroke="#6366f1"
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
