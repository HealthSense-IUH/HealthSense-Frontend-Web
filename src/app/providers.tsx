import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { queryClientConfig } from "@/config"
// Nap cau hinh i18n mot lan, truoc khi bat ky component nao goi useTranslation()
import i18n from "@/lib/i18n"

const queryClient = new QueryClient(queryClientConfig)

// Backend trả nội dung theo header `lang` (tên nhóm, món, lý do đánh giá...): đổi ngôn ngữ thì tải lại dữ liệu đang có
// trong cache để cả trang cùng một ngôn ngữ, không chờ hết staleTime.
i18n.on("languageChanged", () => {
  void queryClient.invalidateQueries()
})

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
