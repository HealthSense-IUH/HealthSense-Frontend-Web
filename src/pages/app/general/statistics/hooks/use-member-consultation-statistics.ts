import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { memberStatisticsApi } from "@/services/statistics.service"
import type {
  MemberConsultationStatisticsParams,
  MemberConsultationStatisticsResponse,
} from "@/types/statistics"
import { memberStatisticsKeys } from "./member-statistics-keys"

export function useMemberConsultationStatistics(
  params: MemberConsultationStatisticsParams,
  options?: { enabled?: boolean }
) {
  return useQuery<MemberConsultationStatisticsResponse | undefined>({
    queryKey: memberStatisticsKeys.consultations(params),
    queryFn: async () => {
      const response = await memberStatisticsApi.getConsultationStatistics(params)
      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
