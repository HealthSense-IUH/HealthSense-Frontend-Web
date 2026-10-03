import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminStatisticsApi } from "@/services/statistics.service"
import type {
  ConsultationStatisticsQuery,
  ConsultationStatisticsResponse,
} from "@/types/statistics"
import { statisticsKeys } from "./statistics-keys"

export function useConsultationStatistics(
  params: ConsultationStatisticsQuery,
  enabled = true
) {
  return useQuery<ConsultationStatisticsResponse | undefined>({
    queryKey: statisticsKeys.consultations(params),
    queryFn: async () => {
      const response =
        await adminStatisticsApi.getConsultationStatistics(params)
      return response.data
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
