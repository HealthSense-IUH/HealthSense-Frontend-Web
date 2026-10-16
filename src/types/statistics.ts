import type { UserRoleConst } from "@/constants/roles"
import type { CreditOrderStatus } from "./credits"
import type { FinalSummaryClosureStatus } from "./consultation"
export type { CreditOrderStatus, FinalSummaryClosureStatus }

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

export interface MemberConsultationStatisticsParams {
  from: string
  to: string
  groupBy?: StatisticsGroupBy
  timezone?: string
}

export interface MemberConsultationStatisticsSummary {
  totalConsultations: number
  consultationsInPeriod: number
  completedInPeriod: number
  cancelledInPeriod: number
}

export interface MemberConsultationStatisticsResponse {
  period: StatisticsPeriod
  summary: MemberConsultationStatisticsSummary
  consultationTrend: StatisticsCountBucket[]
  byStatus: CategoryCount<StatisticsConsultationStatus>[]
}

export type MemberStatisticsParams = MemberConsultationStatisticsParams

export interface MemberPaymentStatisticsSummary {
  totalPaidVnd: number
  paidInPeriodVnd: number
  totalPurchasedCredits: number
  purchasedCreditsInPeriod: number
  totalSuccessfulOrders: number
  successfulOrdersInPeriod: number
  totalOrdersInPeriod: number
  averagePaidOrderValueInPeriodVnd: number
}

export interface MemberWalletSummary {
  balance: number
  reserved: number
  available: number
}

export interface MemberPaymentTrendBucket {
  bucketStart: string
  paidVnd: number
  purchasedCredits: number
  successfulOrders: number
}

export interface MemberPaymentStatisticsResponse {
  period: StatisticsPeriod
  summary: MemberPaymentStatisticsSummary
  wallet: MemberWalletSummary
  paymentTrend: MemberPaymentTrendBucket[]
  orderStatusDistribution: CategoryCount<CreditOrderStatus>[]
}

export type MemberRecordStatus = "PENDING_UPLOAD" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface MemberHealthRecordStatisticsSummary {
  totalRecords: number
  recordsInPeriod: number
  completedInPeriod: number
  failedInPeriod: number
  afDetectedOrSuspectedInPeriod: number
  latestRecordAt: string | null
}

export interface MemberHealthRecordStatisticsResponse {
  period: StatisticsPeriod
  summary: MemberHealthRecordStatisticsSummary
  recordTrend: StatisticsCountBucket[]
  resultDistribution: CategoryCount<StatisticsPredictionLabel>[]
  statusDistribution: CategoryCount<MemberRecordStatus>[]
  recordedHourDistribution: HourCount[]
}

// -------------------------------------------------------------
// Doctor Consultation & Patient Statistics Types
// -------------------------------------------------------------

export interface DoctorStatisticsRangeParams {
  from: string
  to: string
}

export interface DoctorStatisticsPeriod {
  from: string
  to: string
}

export interface DoctorConsultationStatisticsSummary {
  totalConsultations: number
  consultationsInPeriod: number
  scheduledInPeriod: number
  activeInPeriod: number
  completedInPeriod: number
  cancelledInPeriod: number
  completionRate: number
  cancellationRate: number
}

export interface DoctorConsultationStatisticsResponse {
  period: DoctorStatisticsPeriod
  summary: DoctorConsultationStatisticsSummary
}

export interface DoctorPatientStatisticsSummary {
  totalPatients: number
  patientsInPeriod: number
  newPatientsInPeriod: number
  returningPatientsInPeriod: number
  averageConsultationsPerPatientInPeriod: number
}

export interface DoctorPatientStatisticsResponse {
  period: DoctorStatisticsPeriod
  summary: DoctorPatientStatisticsSummary
}

export interface DoctorPatientListParams extends DoctorStatisticsRangeParams {
  keyword?: string
  page?: number
  size?: number
}

export interface DoctorPatientListItem {
  memberId: string
  displayName: string
  avatarUrl: string | null
  totalConsultations: number
  completedConsultations: number
  firstConsultationAt: string
  latestConsultationAt: string
  latestConsultationStatus: StatisticsConsultationStatus
}

export interface DoctorPatientDetail {
  memberId: string
  email: string
  displayName: string
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  avatarUrl: string | null
  address: string | null
  timezone: string | null
  healthInsuranceNumber: string | null
}

export interface DoctorPatientConsultation {
  sessionId: string
  status: StatisticsConsultationStatus
  createdAt: string
  startedAt: string | null
  activatedAt: string
  endsAt: string
  completedAt: string | null
  summaryClosureStatus: FinalSummaryClosureStatus | null
}

export interface DoctorPatientMedicalHistory {
  summaryId: string
  sessionId: string
  summary: string | null
  observations: string | null
  recommendations: string | null
  followUpRecommendation: string | null
  finalizedAt: string
  referencedHealthRecordIds: string[]
}

export type EpisodeHealthRecordAuthorizationSource =
  | "INITIAL_SHARED"
  | "SHARED_DURING_CARE"
  | "CREATED_DURING_CARE"

export interface DoctorPatientHealthRecord {
  recordId: string
  sessionId: string
  fileName: string
  fileSize: number | null
  status: MemberRecordStatus
  predictionLabel: StatisticsPredictionLabel | null
  confidence: number | null
  recordedAt: string
  authorizationSource: EpisodeHealthRecordAuthorizationSource
  authorizedAt: string
}
