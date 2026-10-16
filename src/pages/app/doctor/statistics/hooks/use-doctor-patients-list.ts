import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { doctorStatisticsApi } from "@/services/statistics.service"
import type {
  DoctorPatientListParams,
  DoctorPatientListItem,
} from "@/types/statistics"
import type { PageResponse } from "@/types/base/apiResponse"
import { doctorStatisticsKeys } from "./doctor-statistics-keys"

export function useDoctorPatientsList(
  params: DoctorPatientListParams,
  options?: { enabled?: boolean }
) {
  return useQuery<PageResponse<DoctorPatientListItem> | undefined>({
    queryKey: doctorStatisticsKeys.patients(params),
    queryFn: async () => {
      const response = await doctorStatisticsApi.getPatients(params)
      return response.data
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
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
