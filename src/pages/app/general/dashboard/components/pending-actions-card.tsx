import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PendingActionItem } from "../data/super-admin-dashboard.mock"

export function PendingActionsCard({ actions }: { actions: PendingActionItem[] }) {
  const getSeverityStyle = (severity: PendingActionItem["severity"]) => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-50/80 border-red-200 text-red-900",
          icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,
          btn: "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
        }
      case "warning":
        return {
          bg: "bg-amber-50/80 border-amber-200 text-amber-900",
          icon: <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,
          btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20",
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
            <h3 className="text-base font-bold text-slate-900">Pending Actions</h3>
            <p className="text-xs text-slate-500">Items requiring administrative interventions</p>
          </div>
          <span className="rounded-full bg-red-100 text-red-700 font-bold px-2.5 py-0.5 text-xs">
            {actions.length} Reqs
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {actions.map((item) => {
            const styles = getSeverityStyle(item.severity)
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  {styles.icon}
                  <div>
                    <h4 className="text-xs font-black tracking-tight">{item.title}</h4>
                    <p className="text-[11px] opacity-75 font-medium mt-0.5">{item.category}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => alert(`Initiating action: ${item.actionLabel} for ${item.title}`)}
                  className={`h-8 rounded-lg text-[11px] font-bold px-3 shadow-xs transition-transform active:scale-95 ${styles.btn}`}
                >
                  {item.actionLabel}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
