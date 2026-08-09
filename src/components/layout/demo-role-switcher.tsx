import { ShieldAlert, Check } from "lucide-react"

import { USER_ROLES, type UserRole } from "@/types/authentication"
import { useAppShell } from "./app-shell-context"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function DemoRoleSwitcher() {
  const { effectiveRole, demoRole, setDemoRole, realRole } = useAppShell()

  const roles: { value: UserRole; label: string; color: string }[] = [
    { value: USER_ROLES.SUPER_ADMIN, label: "Super Admin", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: USER_ROLES.ADMIN, label: "Admin", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: USER_ROLES.CARE_COORDINATOR, label: "Care Coordinator", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
    { value: USER_ROLES.DOCTOR, label: "Doctor", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { value: USER_ROLES.MEMBER, label: "Member", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ]

  const currentConfig = roles.find((r) => r.value === effectiveRole) || roles[0]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-2 px-2.5 font-semibold text-xs border rounded-lg shadow-2xs transition-all hover:opacity-90 ${currentConfig.color}`}
          title="DEV ONLY: Demo Role Switcher"
        >
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-500" />
          <span className="hidden sm:inline-block text-slate-500 font-normal">Dev View:</span>
          <span>{currentConfig.label}</span>
          {demoRole && (
            <span className="ml-1 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-bold text-amber-700">
              OVERRIDE
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 rounded-2xl border-slate-200 shadow-xl bg-white">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Demo Role Switcher
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">DEV ONLY utility. Real token unchanged.</p>
            </div>
          </div>

          <div className="space-y-1 py-1">
            {roles.map((role) => {
              const isSelected = effectiveRole === role.value
              const isReal = realRole === role.value
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setDemoRole(role.value === realRole ? null : role.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate">{role.label}</span>
                    {isReal && (
                      <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                        ACTUAL
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              )
            })}
          </div>

          {demoRole && (
            <div className="border-t border-slate-100 pt-2">
              <button
                type="button"
                onClick={() => setDemoRole(null)}
                className="w-full rounded-lg bg-amber-50 py-1.5 text-center text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Reset to Actual Role
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
