import type {
  UserStatisticsQuery,
  ConsultationStatisticsQuery,
  HealthRecordStatisticsQuery,
  PaymentStatisticsQuery,
} from "@/types/statistics"

export const statisticsKeys = {
  all: ["admin", "statistics"] as const,
  users: (params: UserStatisticsQuery) =>
    [...statisticsKeys.all, "users", params] as const,
  consultations: (params: ConsultationStatisticsQuery) =>
    [...statisticsKeys.all, "consultations", params] as const,
  healthRecords: (params: HealthRecordStatisticsQuery) =>
    [...statisticsKeys.all, "health-records", params] as const,
  payments: (params: PaymentStatisticsQuery) =>
    [...statisticsKeys.all, "payments", params] as const,
}
