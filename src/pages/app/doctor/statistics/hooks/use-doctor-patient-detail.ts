import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { doctorStatisticsApi } from "@/services/statistics.service"
import type {
  DoctorPatientDetail,
  DoctorPatientConsultation,
  DoctorPatientMedicalHistory,
  DoctorPatientHealthRecord,
} from "@/types/statistics"
import type { PageResponse } from "@/types/base/apiResponse"
import { doctorStatisticsKeys } from "./doctor-statistics-keys"

export function useDoctorPatientDetail(
  memberId: string | null | undefined,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(memberId) && (options?.enabled ?? true)

  return useQuery<DoctorPatientDetail | undefined>({
    queryKey: doctorStatisticsKeys.patient(memberId ?? ""),
    queryFn: async () => {
      if (!memberId) return undefined
      const response = await doctorStatisticsApi.getPatient(memberId)
      return response.data
    },
    enabled: isEnabled,
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

export function useDoctorPatientConsultations(
  memberId: string | null | undefined,
  page = 1,
  size = 20,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(memberId) && (options?.enabled ?? true)

  return useQuery<PageResponse<DoctorPatientConsultation> | undefined>({
    queryKey: doctorStatisticsKeys.patientConsultations(memberId ?? "", page, size),
    queryFn: async () => {
      if (!memberId) return undefined
      const response = await doctorStatisticsApi.getPatientConsultations(memberId, page, size)
      return response.data
    },
    enabled: isEnabled,
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

export function useDoctorPatientMedicalHistory(
  memberId: string | null | undefined,
  page = 1,
  size = 20,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(memberId) && (options?.enabled ?? true)

  return useQuery<PageResponse<DoctorPatientMedicalHistory> | undefined>({
    queryKey: doctorStatisticsKeys.patientMedicalHistory(memberId ?? "", page, size),
    queryFn: async () => {
      if (!memberId) return undefined
      const response = await doctorStatisticsApi.getPatientMedicalHistory(memberId, page, size)
      return response.data
    },
    enabled: isEnabled,
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

export function useDoctorPatientHealthRecords(
  memberId: string | null | undefined,
  page = 1,
  size = 20,
  options?: { enabled?: boolean }
) {
  const isEnabled = Boolean(memberId) && (options?.enabled ?? true)

  return useQuery<PageResponse<DoctorPatientHealthRecord> | undefined>({
    queryKey: doctorStatisticsKeys.patientHealthRecords(memberId ?? "", page, size),
    queryFn: async () => {
      if (!memberId) return undefined
      const response = await doctorStatisticsApi.getPatientHealthRecords(memberId, page, size)
      return response.data
    },
    enabled: isEnabled,
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
