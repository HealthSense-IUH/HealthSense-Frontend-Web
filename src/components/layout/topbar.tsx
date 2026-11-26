import { useAppShell } from "./app-shell-context"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { LanguageSwitcher } from "./language-switcher"
import { UserMenu } from "./user-menu"

export function Topbar() {
  const { effectiveRole } = useAppShell()

  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6"
    >
      <div className="flex-1" />

      <div className="flex items-center gap-2.5">
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}
        <LanguageSwitcher />
        <UserMenu role={effectiveRole} />
      </div>
    </header>
  )
}
