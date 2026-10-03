import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminStatisticsApi } from "@/services/statistics.service"
import type {
  PaymentStatisticsQuery,
  PaymentStatisticsResponse,
} from "@/types/statistics"
import { statisticsKeys } from "./statistics-keys"

export function usePaymentStatistics(
  params: PaymentStatisticsQuery,
  enabled = true
) {
  return useQuery<PaymentStatisticsResponse | undefined>({
    queryKey: statisticsKeys.payments(params),
    queryFn: async () => {
      const response = await adminStatisticsApi.getPaymentStatistics(params)
      return response.data
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
