import { Link, useLocation, useNavigate } from "react-router-dom"
import { Activity, Calendar, Home, LogOut, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const userSession = useAuthStore((state) => state.userSession)

  const navItems = [
    { icon: Activity, path: "/app/dashboard", label: "Dashboard" },
    { icon: Calendar, path: "/calendar", label: "Calendar" },
    { icon: User, path: "/app/management", label: "Management" },
    { icon: Home, path: "/", label: "Home" },
    { icon: Settings, path: "/settings", label: "Settings" },
  ]

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      navigate("/login", { replace: true })
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex flex-col items-center justify-between bg-primary py-8 text-primary-foreground w-20 sm:w-24 m-4 rounded-[2rem] h-[calc(100vh-32px)] shadow-xl">
      <div className="flex flex-col items-center gap-12 w-full">
        {/* Logo */}
        <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white transition-colors hover:bg-white/30">
          <Activity className="h-6 w-6" />
        </Link>

        {/* Navigation */}
        <nav className="flex w-full flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && item.path !== "/" || (item.path === "/" && location.pathname === "/")
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-white text-primary shadow-md"
                    : "text-primary-foreground/70 hover:bg-white/10 hover:text-white"
                }`}
                title={item.label}
              >
                <item.icon className="h-6 w-6" />
                {isActive && item.label === "Dashboard" && (
                  <span className="absolute -right-1 top-2 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-2xl text-primary-foreground/80 hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut />
        </Button>

        <Avatar className="h-12 w-12 border-2 border-white/20">
          <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="User" />
          <AvatarFallback>
            {userSession?.fullName?.slice(0, 2).toUpperCase() ?? "HS"}
          </AvatarFallback>
        </Avatar>
      </div>
    </aside>
  )
}
