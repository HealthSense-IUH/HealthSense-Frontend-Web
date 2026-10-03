import type { UserRoleConst } from "@/constants/roles"
import type { CreditOrderStatus } from "./credits"

export type StatisticsGroupBy = "DAY" | "WEEK" | "MONTH"

export type StatisticsUserRole = UserRoleConst

export type StatisticsAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFY"

export type StatisticsConsultationStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"

export type StatisticsPredictionLabel =
  | "NORMAL"
  | "AFIB"
  | "UNCERTAIN"
  | "AFIB_SUSPECTED"

export interface UserStatisticsQuery {
  from: string
  to: string
  groupBy?: StatisticsGroupBy
  timezone?: string
}

export interface ConsultationStatisticsQuery {
  from: string
  to: string
  groupBy?: StatisticsGroupBy
  timezone?: string
}

export interface HealthRecordStatisticsQuery {
  from: string
  to: string
  groupBy?: StatisticsGroupBy
  timezone?: string
}

export interface StatisticsPeriod {
  from: string
  to: string
  timezone: string
  groupBy: StatisticsGroupBy
}

export interface StatisticsCountBucket {
  bucketStart: string // YYYY-MM-DD (local date representation, keep as string)
  count: number
}

export interface CategoryCount<K extends string> {
  key: K
  count: number
}

export interface HourCount {
  hour: number // 0..23
  count: number
}

export interface UserStatisticsSummary {
  totalUsers: number
  newUsers: number
  activeAccounts: number
  totalDoctors: number
}

export interface UserStatisticsResponse {
  period: StatisticsPeriod
  summary: UserStatisticsSummary
  registrationTrend: StatisticsCountBucket[]
  byRole: CategoryCount<StatisticsUserRole>[]
  byStatus: CategoryCount<StatisticsAccountStatus>[]
}

export interface ConsultationStatisticsSummary {
  totalConsultations: number
  consultationsInPeriod: number
  completedInPeriod: number
  cancelledInPeriod: number
}

export interface ConsultationStatisticsResponse {
  period: StatisticsPeriod
  summary: ConsultationStatisticsSummary
  consultationTrend: StatisticsCountBucket[]
  byStatus: CategoryCount<StatisticsConsultationStatus>[]
}

export interface HealthRecordStatisticsSummary {
  totalRecords: number
  recordsInPeriod: number
  uniqueUsersInPeriod: number
  afDetectedOrSuspectedInPeriod: number
}

export interface HealthRecordStatisticsResponse {
  period: StatisticsPeriod
  summary: HealthRecordStatisticsSummary
  recordTrend: StatisticsCountBucket[]
  resultDistribution: CategoryCount<StatisticsPredictionLabel>[]
  recordedHourDistribution: HourCount[]
}

export type DirectPaymentStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED"
  | "REQUIRES_REVIEW"

export type StatisticsCreditOrderStatus = CreditOrderStatus

export type PaymentRevenueSource = "DIRECT_CARE" | "CREDIT_PURCHASE"

export interface PaymentStatisticsQuery {
  from: string
  to: string
  groupBy?: StatisticsGroupBy
  timezone?: string
}

export interface PaymentStatisticsSummary {
  totalRevenueVnd: number
  revenueInPeriodVnd: number
  totalBusinessTransactions: number
  averagePaidTransactionValueVnd: number
}

export interface PaymentRevenueTrendBucket {
  bucketStart: string
  totalVnd: number
  directCareVnd: number
  creditPurchaseVnd: number
}

export interface PaymentRevenueBySourceItem {
  key: PaymentRevenueSource
  amountVnd: number
}

export interface PaymentStatisticsResponse {
  period: StatisticsPeriod
  summary: PaymentStatisticsSummary
  revenueTrend: PaymentRevenueTrendBucket[]
  transactionTrend: StatisticsCountBucket[]
  statusDistributionBySource: {
    directCare: CategoryCount<DirectPaymentStatus>[]
    creditPurchase: CategoryCount<CreditOrderStatus>[]
  }
  revenueBySource: PaymentRevenueBySourceItem[]
}

