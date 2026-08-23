import { Outlet } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"
import { AppShellProvider } from "./app-shell-provider"

function AppShellInner() {
  return (
    <div className="min-h-screen flex bg-slate-50/80 text-slate-900 font-sans transition-colors">
      <AppSidebar />
      <div className="flex-1 flex flex-col pl-[92px]">
        <Topbar />
        <main className="flex-1 flex flex-col w-full p-2">
          <Outlet />
        </main>
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
