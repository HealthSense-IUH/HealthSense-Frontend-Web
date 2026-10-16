import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { doctorStatisticsApi } from "@/services/statistics.service"
import type {
  DoctorStatisticsRangeParams,
  DoctorConsultationStatisticsResponse,
} from "@/types/statistics"
import { doctorStatisticsKeys } from "./doctor-statistics-keys"

export function useDoctorConsultationStatistics(
  params: DoctorStatisticsRangeParams,
  options?: { enabled?: boolean }
) {
  return useQuery<DoctorConsultationStatisticsResponse | undefined>({
    queryKey: doctorStatisticsKeys.consultations(params),
    queryFn: async () => {
      const response = await doctorStatisticsApi.getConsultations(params)
      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status
        if (status === 400 || status === 401 || status === 403) {
          return false
        }
      }
      return failureCount < 2
    },
  })
}
