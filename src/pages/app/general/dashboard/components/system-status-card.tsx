import { Server, RefreshCw } from "lucide-react"
import { StatusIndicator } from "./status-indicator"
import type { SystemServiceStatus } from "../data/super-admin-dashboard.mock"

export function SystemStatusCard({ services }: { services: SystemServiceStatus[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100/80 text-slate-700">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Status</h3>
              <p className="text-xs text-slate-500">Core clinical infrastructure health</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert("Pinging infrastructure health nodes...")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50"
            >
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{srv.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>Uptime: <strong className="text-slate-700">{srv.uptime}</strong></span>
                  {srv.latency && <span>Ping: <strong className="text-slate-700">{srv.latency}</strong></span>}
                </div>
              </div>

              <StatusIndicator status={srv.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Global SLA: <strong>99.96%</strong></span>
        <span className="text-emerald-600 font-bold">All nodes active</span>
      </div>
    </div>
  )
}
