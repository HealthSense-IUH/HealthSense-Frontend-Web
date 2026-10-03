import { Server, RefreshCw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { StatusIndicator } from "./status-indicator"
import { formatMs, formatPercent } from "../data/admin-format"
import type { SystemServiceStatus } from "../data/super-admin-dashboard.mock"

export function SystemStatusCard({ services }: { services: SystemServiceStatus[] }) {
  const { t } = useTranslation("health")
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100/80 text-slate-700">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t("adminDashboard.system.title")}</h3>
              <p className="text-xs text-slate-500">{t("adminDashboard.system.description")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert(t("adminDashboard.system.refreshing"))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            title={t("adminDashboard.system.refresh")}
            aria-label={t("adminDashboard.system.refresh")}
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
                <h4 className="text-xs font-extrabold text-slate-900">{t(`adminDashboard.system.services.${srv.id}`)}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <span>{t("adminDashboard.system.uptime")} <strong className="text-slate-700">{formatPercent(srv.uptime)}</strong></span>
                  {srv.latencyMs != null && (
                    <span>{t("adminDashboard.system.ping")} <strong className="text-slate-700">{formatMs(srv.latencyMs)}</strong></span>
                  )}
                </div>
              </div>

              <StatusIndicator status={srv.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>{t("adminDashboard.system.sla")} <strong>{formatPercent(99.96)}</strong></span>
        <span className="text-success-600 font-bold">{t("adminDashboard.system.allActive")}</span>
      </div>
    </div>
  )
}
