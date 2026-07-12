
import { Link } from "react-router-dom"
import { Activity, Shield, User, LogIn } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Activity className="h-6 w-6 text-red-500" />
            <span>HealthSense</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link to="/general" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors">
              <span className="flex items-center gap-2"><User className="h-4 w-4" /> Dashboard</span>
            </Link>
            <Link to="/management" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50 transition-colors">
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Management</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/general">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In Mock
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
