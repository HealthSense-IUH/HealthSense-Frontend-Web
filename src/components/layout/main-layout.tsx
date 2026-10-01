import { Outlet } from "react-router-dom"
import { AppSidebar } from "./app-sidebar"
import { Topbar } from "./topbar"
import { AppShellProvider } from "./app-shell-provider"

/**
 * Khung chung của mọi trang trong app: sidebar + topbar + vùng nội dung có khoảng đệm thống nhất.
 * Nội dung từng trang dựng bằng Page / PageHeader / PageBody / PageFooter (./page.tsx).
 * --app-topbar-h và --app-page-pad để trang `fill` tính chiều cao còn lại.
 */
function AppShellInner() {
  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans [--app-topbar-h:4rem]">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col pl-[92px]">
        <Topbar />
        <main className="flex-1 flex flex-col w-full min-w-0 p-(--app-page-pad) [--app-page-pad:0.75rem] sm:[--app-page-pad:1rem]">
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
