import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { queryClientConfig } from "@/config"
// Nap cau hinh i18n mot lan, truoc khi bat ky component nao goi useTranslation()
import "@/lib/i18n"

const queryClient = new QueryClient(queryClientConfig)

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
