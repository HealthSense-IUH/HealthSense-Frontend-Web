import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { memberStatisticsApi } from "@/services/statistics.service"
import type {
  MemberStatisticsParams,
  MemberPaymentStatisticsResponse,
} from "@/types/statistics"
import { memberStatisticsKeys } from "./member-statistics-keys"

export function useMemberPaymentStatistics(
  params: MemberStatisticsParams,
  options?: { enabled?: boolean }
) {
  return useQuery<MemberPaymentStatisticsResponse | undefined>({
    queryKey: memberStatisticsKeys.payments(params),
    queryFn: async () => {
      const response = await memberStatisticsApi.getPaymentStatistics(params)
      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
