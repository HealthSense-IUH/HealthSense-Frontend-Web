import type { QueryClientConfig } from "@tanstack/react-query"

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // 5 phút
      staleTime: 5 * 60 * 1000,
    },
  },
}
