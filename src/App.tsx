import { RouterProvider } from "react-router-dom"

import { Toaster } from "@/components/ui/toaster"
import { AuthBootstrap } from "@/pages/commons/AuthBootstrap"
import { router } from "@/router"

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
