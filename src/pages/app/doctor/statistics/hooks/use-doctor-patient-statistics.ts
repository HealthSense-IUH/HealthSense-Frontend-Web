import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { doctorStatisticsApi } from "@/services/statistics.service"
import type {
  DoctorStatisticsRangeParams,
  DoctorPatientStatisticsResponse,
} from "@/types/statistics"
import { doctorStatisticsKeys } from "./doctor-statistics-keys"

export function useDoctorPatientStatistics(
  params: DoctorStatisticsRangeParams,
  options?: { enabled?: boolean }
) {
  return useQuery<DoctorPatientStatisticsResponse | undefined>({
    queryKey: doctorStatisticsKeys.patientOverview(params),
    queryFn: async () => {
      const response = await doctorStatisticsApi.getPatientOverview(params)
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
