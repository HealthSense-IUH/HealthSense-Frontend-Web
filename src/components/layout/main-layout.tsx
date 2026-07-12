
import { Outlet } from "react-router-dom"
import { Navbar } from "./navbar"

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-sm text-neutral-500">
        <p>© 2026 HealthSense. All rights reserved.</p>
      </footer>
    </div>
  )
}
