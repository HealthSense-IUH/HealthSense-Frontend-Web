import { useTranslation } from "react-i18next"
import { Clock, type LucideIcon } from "lucide-react"

interface ComingSoonTabProps {
  title: string
  description: string
  icon?: LucideIcon
}

export function ComingSoonTab({
  title,
  description,
  icon: Icon = Clock,
}: ComingSoonTabProps) {
  const { t } = useTranslation("health")

  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[360px]">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-8 ring-primary-50/50">
        <Icon className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500" />
        </span>
      </div>

      <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/20 mb-3">
        {t("memberStatistics.comingSoon.badge")}
      </span>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>

      <p className="max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
