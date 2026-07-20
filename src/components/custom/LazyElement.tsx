import { Suspense, type ReactNode } from "react"

import AppLoader from "@/components/custom/AppLoader"

type LazyElementProps = {
  children: ReactNode
}

export function LazyElement({ children }: LazyElementProps) {
  return <Suspense fallback={<AppLoader />}>{children}</Suspense>
}
