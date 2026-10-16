import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { memberStatisticsApi } from "@/services/statistics.service"
import type {
  MemberStatisticsParams,
  MemberHealthRecordStatisticsResponse,
} from "@/types/statistics"
import { memberStatisticsKeys } from "./member-statistics-keys"

export function useMemberHealthRecordStatistics(
  params: MemberStatisticsParams,
  options?: { enabled?: boolean }
) {
  return useQuery<MemberHealthRecordStatisticsResponse | undefined>({
    queryKey: memberStatisticsKeys.healthRecords(params),
    queryFn: async () => {
      const response = await memberStatisticsApi.getHealthRecordStatistics(params)
      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
