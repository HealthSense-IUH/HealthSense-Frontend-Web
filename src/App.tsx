import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/toaster"

import { MainLayout } from "@/components/layout/main-layout"
import { PublicLayout } from "@/components/layout/public-layout"
import LandingPage from "@/pages/public/LandingPage"
import DashboardPage from "@/pages/general/DashboardPage"
import AdminPage from "@/pages/management/AdminPage"

function App() {
  return (
    <BrowserRouter>
      <ScrollArea className="h-screen w-screen">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/general" element={<DashboardPage />} />
            <Route path="/management" element={<AdminPage />} />
          </Route>
        </Routes>
        <Toaster />
      </ScrollArea>
    </BrowserRouter>
  )
}

export default App