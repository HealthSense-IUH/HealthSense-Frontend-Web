import { Outlet } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"
import { AppShellProvider } from "./app-shell-provider"
import { useAppShell } from "./app-shell-context"

function AppShellInner() {
  const { isCollapsed } = useAppShell()

  return (
    <div className="min-h-screen flex bg-slate-50/80 text-slate-900 font-sans transition-colors">
      <AppSidebar />
      <div
        className={`flex-1 flex flex-col transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? "pl-[76px]" : "pl-64"
        }`}
      >
        <Topbar />
        <main className="flex-1 flex flex-col container mx-auto px-6 py-8 max-w-[1600px]">
          <Outlet />
        </main>
        <footer className="py-6 px-6 text-left text-xs font-medium text-slate-400 border-t border-slate-200/60 bg-white/50 flex items-center justify-between">
          <p>© 2026 HealthSense Platform Inc. Clinical Grade Healthcare SaaS.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">HIPAA & GDPR Compliance</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">System Security Status</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Clinical Support Desk</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export function MainLayout() {
  return (
    <AppShellProvider>
      <AppShellInner />
    </AppShellProvider>
  )
}
