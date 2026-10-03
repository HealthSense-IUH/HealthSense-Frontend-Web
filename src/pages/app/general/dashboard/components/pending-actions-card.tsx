import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import type { PendingActionItem } from "../data/super-admin-dashboard.mock"

export function PendingActionsCard({ actions }: { actions: PendingActionItem[] }) {
  const { t } = useTranslation("health")
  const getSeverityStyle = (severity: PendingActionItem["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-danger-50/80 border-danger-200 text-danger-900",
          icon: <AlertCircle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />,
          btn: "bg-danger-600 hover:bg-danger-700 text-white shadow-danger-500/20",
        }
      case "warning":
        return {
          bg: "bg-warning-50/80 border-warning-200 text-warning-900",
          icon: <Clock className="h-4 w-4 text-warning-600 shrink-0 mt-0.5" />,
          btn: "bg-warning-600 hover:bg-warning-700 text-white shadow-warning-500/20",
        }
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-800",
          icon: <CheckCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />,
          btn: "bg-slate-900 hover:bg-slate-800 text-white",
        }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">{t("adminDashboard.pending.title")}</h3>
            <p className="text-xs text-slate-500">{t("adminDashboard.pending.description")}</p>
          </div>
          <span className="rounded-full bg-danger-100 text-danger-700 font-bold px-2.5 py-0.5 text-xs">
            {t("adminDashboard.pending.count", { count: actions.length })}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {actions.map((item) => {
            const styles = getSeverityStyle(item.severity)
            const title = t(`adminDashboard.pending.items.${item.id}`, { count: item.count })
            const actionLabel = t(`adminDashboard.pending.actions.${item.action}`)
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div>
                    <h4 className="text-xs font-black tracking-tight">{title}</h4>
                    <p className="text-[11px] opacity-75 font-medium mt-0.5">{t(`adminDashboard.pending.categories.${item.category}`)}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => alert(t("adminDashboard.pending.starting", { action: actionLabel, title }))}
                  className={`h-8 rounded-lg text-[11px] font-bold px-3 shadow-xs transition-transform active:scale-95 ${styles.btn}`}
                >
                  {actionLabel}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
