import type {
  DoctorStatisticsRangeParams,
  DoctorPatientListParams,
} from "@/types/statistics"

export const doctorStatisticsKeys = {
  all: ["doctor", "statistics"] as const,

  consultations: (params: DoctorStatisticsRangeParams) =>
    [...doctorStatisticsKeys.all, "consultations", params] as const,

  patientOverview: (params: DoctorStatisticsRangeParams) =>
    [...doctorStatisticsKeys.all, "patients", "overview", params] as const,

  patients: (params: DoctorPatientListParams) =>
    [...doctorStatisticsKeys.all, "patients", "list", params] as const,

  patient: (memberId: string) =>
    [...doctorStatisticsKeys.all, "patients", memberId, "detail"] as const,

  patientConsultations: (memberId: string, page: number, size: number) =>
    [
      ...doctorStatisticsKeys.all,
      "patients",
      memberId,
      "consultations",
      page,
      size,
    ] as const,

  patientMedicalHistory: (memberId: string, page: number, size: number) =>
    [
      ...doctorStatisticsKeys.all,
      "patients",
      memberId,
      "medical-history",
      page,
      size,
    ] as const,

  patientHealthRecords: (memberId: string, page: number, size: number) =>
    [
      ...doctorStatisticsKeys.all,
      "patients",
      memberId,
      "health-records",
      page,
      size,
    ] as const,
}
