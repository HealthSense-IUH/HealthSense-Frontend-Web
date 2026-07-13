import { Outlet } from "react-router-dom"
import { Navbar } from "./navbar"

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 text-center text-sm text-muted-foreground bg-white dark:bg-card">
        <p>© 2026 HealthSense. All rights reserved.</p>
      </footer>
    </div>
  )
}
