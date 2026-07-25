import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import type { UserDistributionItem } from "../data/super-admin-dashboard.mock"

export function UserDistributionChart({ data }: { data: UserDistributionItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-bold text-slate-900">User Distribution</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Proportion of accounts by active role.
        </p>
      </div>

      {/* Donut chart wrapped in ResponsiveContainer with fixed height */}
      <div className="h-[210px] w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
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
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell key={`cell-${index}`} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clean list breakdown legend */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-500">{item.value.toLocaleString()}</span>
              <span className="font-extrabold text-slate-900 w-9 text-right">{item.percentage}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
