import { Users, Stethoscope, ShieldCheck, Crown } from "lucide-react"
import { USER_ROLES, type UserRole } from "@/types/authentication"

interface UserRoleTabsProps {
  selectedRole: UserRole
  onSelectRole: (role: UserRole) => void
  loading?: boolean
}

interface RoleTabConfig {
  role: UserRole
  label: string
  description: string
  icon: React.ReactNode
  activeColor: string
}

export function UserRoleTabs({ selectedRole, onSelectRole, loading }: UserRoleTabsProps) {
  const tabs: RoleTabConfig[] = [
    {
      role: USER_ROLES.MEMBER,
      label: "Members / Patients",
      description: "Connected clinical health accounts",
      icon: <Users className="w-4 h-4 text-blue-600 shrink-0" />,
      activeColor: "border-blue-600 bg-blue-50/70 text-blue-950 shadow-sm",
    },
    {
      role: USER_ROLES.DOCTOR,
      label: "Doctors / Clinical",
      description: "Verified telemetry diagnostic doctors",
      icon: <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />,
      activeColor: "border-teal-600 bg-teal-50/70 text-teal-950 shadow-sm",
    },
    {
      role: USER_ROLES.ADMIN,
      label: "Hospital Admins",
      description: "Tenant operational account moderators",
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />,
      activeColor: "border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm",
    },
    {
      role: USER_ROLES.SUPER_ADMIN,
      label: "Super Admins",
      description: "System root & architecture control",
      icon: <Crown className="w-4 h-4 text-amber-600 shrink-0" />,
      activeColor: "border-amber-600 bg-amber-50/70 text-amber-950 shadow-sm",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {tabs.map((tab) => {
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
                <span className="text-sm font-black tracking-tight truncate">{tab.label}</span>
                {isSelected && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" title="Active Filter" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{tab.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
