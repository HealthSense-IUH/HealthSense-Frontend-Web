import { useAppShell } from "./app-shell-context"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { LanguageSwitcher } from "./language-switcher"
import { UserMenu } from "./user-menu"

export function Topbar() {
  const { effectiveRole } = useAppShell()

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-[0_1px_12px_-4px_rgba(15,23,42,0.06)]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-primary-600 via-cyan-400 to-success-500"
        aria-hidden="true"
      />
      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}
        <LanguageSwitcher />
        <UserMenu role={effectiveRole} />
      </div>
    </header>
  )
}
