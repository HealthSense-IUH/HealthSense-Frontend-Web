import type { MemberStatisticsParams } from "@/types/statistics"

export const memberStatisticsKeys = {
  all: ["member", "statistics"] as const,
  consultations: (params: MemberStatisticsParams) =>
    [...memberStatisticsKeys.all, "consultations", params] as const,
  payments: (params: MemberStatisticsParams) =>
    [...memberStatisticsKeys.all, "payments", params] as const,
  healthRecords: (params: MemberStatisticsParams) =>
    [...memberStatisticsKeys.all, "health-records", params] as const,
}
