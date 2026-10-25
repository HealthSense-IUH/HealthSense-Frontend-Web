import { EcgLine } from "@/components/illustrations"
import { AreaSwitcher } from "./area-switcher"
import { useAppShell } from "./app-shell-context"
import { DemoRoleSwitcher } from "./demo-role-switcher"
import { LanguageSwitcher } from "./language-switcher"
import { UserMenu } from "./user-menu"

/**
 * Thanh trên cùng của app: nền kính mờ với dải màu nhẹ và đường điện tim mờ bên trái làm điểm nhấn thương hiệu;
 * bên phải là công cụ (chuyển vai trò khi dev, chuyển phân hệ, ngôn ngữ, tài khoản).
 */
export function Topbar() {
  const { effectiveRole } = useAppShell()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/85 px-3 backdrop-blur-md sm:px-5">
      {/* Trang trí: dải màu + điện tim mờ, không bắt sự kiện chuột */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50/80 via-white/0 to-warning-50/50" />
        <div className="absolute -left-6 top-1/2 w-[28rem] -translate-y-1/2 text-primary-400/35">
          <EcgLine className="h-12" animated />
        </div>
        <div className="absolute right-[12%] top-1/2 h-10 w-72 -translate-y-1/2 rounded-full bg-primary-200/30 blur-2xl" />
      </div>

      <div className="relative z-10 flex-1" />

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        {import.meta.env.DEV ? <DemoRoleSwitcher /> : null}
        <AreaSwitcher />
        <LanguageSwitcher />
        <UserMenu role={effectiveRole} />
      </div>
    </header>
  )
}
