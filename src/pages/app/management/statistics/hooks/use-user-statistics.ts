import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminStatisticsApi } from "@/services/statistics.service"
import type { UserStatisticsQuery, UserStatisticsResponse } from "@/types/statistics"
import { statisticsKeys } from "./statistics-keys"

export function useUserStatistics(params: UserStatisticsQuery, enabled = true) {
  return useQuery<UserStatisticsResponse | undefined>({
    queryKey: statisticsKeys.users(params),
    queryFn: async () => {
      const response = await adminStatisticsApi.getUserStatistics(params)
      return response.data
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
