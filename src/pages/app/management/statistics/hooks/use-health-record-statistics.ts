import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminStatisticsApi } from "@/services/statistics.service"
import type {
  HealthRecordStatisticsQuery,
  HealthRecordStatisticsResponse,
} from "@/types/statistics"
import { statisticsKeys } from "./statistics-keys"

export function useHealthRecordStatistics(
  params: HealthRecordStatisticsQuery,
  enabled = true
) {
  return useQuery<HealthRecordStatisticsResponse | undefined>({
    queryKey: statisticsKeys.healthRecords(params),
    queryFn: async () => {
      const response =
        await adminStatisticsApi.getHealthRecordStatistics(params)
      return response.data
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
