import { useTranslation } from "react-i18next"
import { Users, UserPlus, UserCheck, Stethoscope } from "lucide-react"
import type { UserStatisticsSummary } from "@/types/statistics"

interface UserSummaryCardsProps {
  summary: UserStatisticsSummary
  startDateStr: string
  endDateStr: string
}

export function UserSummaryCards({
  summary,
  startDateStr,
  endDateStr,
}: UserSummaryCardsProps) {
  const { t } = useTranslation("management")

  const cards = [
    {
      id: "totalUsers",
      title: t("statistics.summary.totalUsers"),
      value: summary.totalUsers.toLocaleString("vi-VN"),
      description: t("statistics.summary.totalUsersDesc"),
      icon: Users,
      iconColor: "text-primary-600 bg-primary-50",
      accentBorder: "border-primary-100",
    },
    {
      id: "newUsers",
      title: t("statistics.summary.newUsers"),
      value: summary.newUsers.toLocaleString("vi-VN"),
      description: t("statistics.summary.newUsersDesc", {
        from: startDateStr,
        to: endDateStr,
      }),
      icon: UserPlus,
      iconColor: "text-success-600 bg-success-50",
      accentBorder: "border-success-100",
    },
    {
      id: "activeAccounts",
      title: t("statistics.summary.activeAccounts"),
      value: summary.activeAccounts.toLocaleString("vi-VN"),
      description: t("statistics.summary.activeAccountsDesc"),
      icon: UserCheck,
      iconColor: "text-cyan-600 bg-cyan-50",
      accentBorder: "border-cyan-100",
    },
    {
      id: "totalDoctors",
      title: t("statistics.summary.totalDoctors"),
      value: summary.totalDoctors.toLocaleString("vi-VN"),
      description: t("statistics.summary.totalDoctorsDesc"),
      icon: Stethoscope,
      iconColor: "text-warning-600 bg-warning-50",
      accentBorder: "border-warning-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`rounded-2xl border ${card.accentBorder} bg-white p-5 shadow-xs flex flex-col justify-between transition hover:shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconColor} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {card.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
