import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-background text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-[112px] sm:pl-[128px]">
        <main className="flex-1 container mx-auto px-4 py-8 max-w-[1600px]">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 HealthSense. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
