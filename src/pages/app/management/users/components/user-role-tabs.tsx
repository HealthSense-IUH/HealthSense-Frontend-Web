import { Users, Stethoscope, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"

interface UserRoleTabsProps {
  selectedRole: UserRole
  onSelectRole: (role: UserRole) => void
  loading?: boolean
  effectiveRole?: UserRole
}

interface RoleTabConfig {
  role: UserRole
  /** Khoá i18n (namespace management) cho nhãn + mô tả của tab */
  i18nKey: "member" | "doctor" | "admin"
  icon: React.ReactNode
  activeColor: string
}

const ROLE_TABS: RoleTabConfig[] = [
  {
    role: USER_ROLES.MEMBER,
    i18nKey: "member",
    icon: <Users className="w-4 h-4 text-primary-600 shrink-0" />,
    activeColor: "border-primary-600 bg-primary-50/70 text-primary-950 shadow-sm",
  },
  {
    role: USER_ROLES.DOCTOR,
    i18nKey: "doctor",
    icon: <Stethoscope className="w-4 h-4 text-success-600 shrink-0" />,
    activeColor: "border-success-600 bg-success-50/70 text-success-950 shadow-sm",
  },
  {
    role: USER_ROLES.ADMIN,
    i18nKey: "admin",
    icon: <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />,
    activeColor: "border-primary-600 bg-primary-50/70 text-primary-950 shadow-sm",
  },
]

export function UserRoleTabs({ selectedRole, onSelectRole, loading, effectiveRole }: UserRoleTabsProps) {
  const { t } = useTranslation("management")
  const visibleTabs = ROLE_TABS.filter(tab => {
    if (effectiveRole !== USER_ROLES.SUPER_ADMIN) {
      if (tab.role === USER_ROLES.ADMIN) {
        return false
      }
    }
    return true
  })

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleTabs.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-3.5`}>
      {visibleTabs.map((tab) => {
        const isSelected = selectedRole === tab.role
        return (
          <button
            key={tab.role}
            type="button"
            disabled={loading}
            onClick={() => onSelectRole(tab.role)}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 ${
              isSelected
                ? tab.activeColor + " ring-1 ring-black/5 font-bold"
                : "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-3xs"
            } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                isSelected ? "bg-white border-slate-200/60 shadow-xs" : "bg-slate-50 border-slate-100"
              }`}
            >
              {tab.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-black tracking-tight truncate">{t(`users.roleTabs.${tab.i18nKey}.label`)}</span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-primary-600 shrink-0" title={t("users.roleTabs.activeFilter")} />
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{t(`users.roleTabs.${tab.i18nKey}.description`)}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
