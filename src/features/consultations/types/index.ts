import type { PageResponse } from "@/types/base"

export type ConsultationRequestStatus =
  | "PENDING_REVIEW"
  | "NEED_MORE_INFO"
  | "WAITING_ACCEPTANCE"
  | "WAITING_PAYMENT"
  | "FULFILLED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "PENDING"
  | string

export type ConsultationStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | string
export type ConsultationSessionStatus = ConsultationStatus
export type ConsultationSourceType = "REQUEST" | "ADMIN_DIRECT" | string
export type ConsultationMessageType = "TEXT" | "IMAGE" | "FILE" | string
export type ConsultationParticipantRole = "MEMBER" | "DOCTOR" | "ADMIN" | "SYSTEM" | string
export type CareServicePackageStatus = "ACTIVE" | "INACTIVE" | "RETIRED" | string
export type DoctorSpecialty = "CARDIOLOGY" | "INTERNAL_MEDICINE" | "GENERAL_PRACTICE" | "OTHER" | string
export type ConsultationFinalSummaryStatus = "DRAFT" | "FINALIZED" | string

export type ConsultationPaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED" | "REQUIRES_REVIEW" | string

export type ConsultationRenewalStatus =
  | "REQUESTED"
  | "UNDER_REVIEW"
  | "PENDING_ACCEPTANCE"
  | "WAITING_PAYMENT"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "REQUIRES_REVIEW"
  | string

export type CareServiceAgreementStatus = "PENDING_ACCEPTANCE" | "ACCEPTED" | "REJECTED" | "EXPIRED" | string

export interface CareServiceAgreementPackageSnapshot {
  code?: string
  name?: string
  description?: string
  priceAmount?: number
  currency?: string
  durationDays?: number
  renewable?: boolean
  specialty?: string
  supportPolicy?: string
  limitations?: string
  includedServiceTypes?: string[]
  excludedServiceTypes?: string[]
  maxExtensionsAllowed?: number
}

export interface CareServiceAgreementDoctorSnapshot {
  doctorId?: number
  displayName?: string
  email?: string
  specialty?: string
  declaredSupportSchedule?: string
  timezone?: string
}

export interface CareServiceAgreementMemberSnapshot {
  memberId?: number
  displayName?: string
  email?: string
  phone?: string
}

export interface CareServiceAgreementResponse {
  agreementId: string | number
  requestId: string | number
  packageSnapshot?: CareServiceAgreementPackageSnapshot | null
  doctorSnapshot?: CareServiceAgreementDoctorSnapshot | null
  memberSnapshot?: CareServiceAgreementMemberSnapshot | null
  limitations?: string | null
  policyRefs?: string[] | null
  validUntil?: string | null
  status: CareServiceAgreementStatus
  acceptedAt?: string | null
  rejectedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface AcceptCareServiceAgreementRequest {
  agreementId: string | number
  accepted: boolean
}

export interface ConsultationPaymentAttemptItem {
  id?: string | number
  orderCode: number
  amount: number
  currency: string
  status: ConsultationPaymentStatus
  checkoutUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

export interface ConsultationPaymentResponse {
  id: string
  requestId: string | number
  orderCode: number
  paymentLinkId: string
  checkoutUrl: string
  amount: number
  currency: string
  status: ConsultationPaymentStatus
  expiresAt: string
}

export interface CareServicePackage {
  id: number
  code: string
  name: string
  description?: string | null
  priceAmount: number
  currency: string
  durationDays: number
  renewable: boolean
  specialty?: DoctorSpecialty | null
  supportPolicy?: string | null
  limitations?: string | null
  maxExtensionsAllowed?: number | null
  includedServiceTypes?: string[] | null
  excludedServiceTypes?: string[] | null
  status: CareServicePackageStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateCareServicePackagePayload {
  code: string
  name: string
  description?: string | null
  priceAmount: number
  durationDays: number
  renewable: boolean
  specialty?: DoctorSpecialty | null
  supportPolicy?: string | null
  limitations?: string | null
  maxExtensionsAllowed?: number | null
  includedServiceTypes?: string[] | null
  excludedServiceTypes?: string[] | null
}

export interface UpdateCareServicePackagePayload {
  name: string
  description?: string | null
  priceAmount: number
  durationDays: number
  renewable: boolean
  specialty?: DoctorSpecialty | null
  supportPolicy?: string | null
  limitations?: string | null
  maxExtensionsAllowed?: number | null
  includedServiceTypes?: string[] | null
  excludedServiceTypes?: string[] | null
}

export interface CareHistoryEpisodeResponse {
  sessionId: number | string
  memberId: number | string
  doctorId: number | string
  doctorName?: string | null
  packageId?: number | string | null
  packageCodeSnapshot?: string | null
  packageNameSnapshot?: string | null
  packagePriceSnapshot?: number | null
  status: ConsultationSessionStatus
  startedAt?: string | null
  endsAt?: string | null
  completedAt?: string | null
  closureStatus?: string | null
  finalSummary?: ConsultationFinalSummaryResponse | null
  authorizedHealthRecords?: HealthRecordItem[] | null
  createdAt?: string | null
}

export interface ConsultationRequestItem {
  id: string | number
  memberId: string | number
  healthRecordId?: string | number | null
  selectedHealthRecordIds?: (number | string)[]
  reason?: string | null
  reasonForCare?: string | null
  currentConcern?: string | null
  careGoal?: string | null
  memberNote?: string | null
  relevantSelfReportedContext?: string | null
  preferredDoctorId?: string | number | null
  status: ConsultationRequestStatus
  assignedDoctorId?: string | number | null
  consultationSessionId?: string | number | null
  reviewedByAdminId?: string | number | null
  reviewedAt?: string | null
  rejectionReason?: string | null
  packageId?: number | null
  moreInfoReason?: string | null
  memberAdditionalNote?: string | null
  paymentDeadline?: string | null
  doctorReservedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ConsultationSessionItem {
  id: string | number
  memberId: string | number
  doctorId: string | number
  createdByAdminId?: string | number | null
  sourceType?: ConsultationSourceType
  status: ConsultationStatus
  startedAt?: string | null
  endsAt?: string | null
  supportEndsAt?: string | null
  closedAt?: string | null
  closeReason?: string | null
  healthRecordId?: string | number | null
  requestId?: string | number | null
  lastMessageId?: string | null
  lastMessagePreview?: string | null
  lastMessageAt?: string | null
  unreadCount?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ConsultationMessageItem {
  id: string
  sessionId: string | number
  senderId: string | number
  senderRole: ConsultationParticipantRole
  type: ConsultationMessageType
  content?: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentSize?: number | null
  attachmentContentType?: string | null
  active?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ConsultationParticipantItem {
  id: string | number
  sessionId: string | number
  userId: string | number
  role: ConsultationParticipantRole
  lastReadMessageId?: string | null
  lastReadAt?: string | null
  joinedAt?: string | null
  active?: boolean
}

export interface HealthRecordItem {
  id: string | number
  status?: string
  predictionLabel?: string
  originalFileName?: string
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateConsultationRequestPayload {
  packageId: number | string
  reasonForCare: string
  currentConcern: string
  careGoal?: string | null
  memberNote?: string | null
  relevantSelfReportedContext?: string | null
  selectedHealthRecordIds?: (number | string)[]
  preferredDoctorId?: number | string | null
  // Legacy / deprecated compatibility
  healthRecordId?: number | string | null
  reason?: string | null
}

export interface SubmitConsultationMoreInfoPayload {
  additionalNote?: string | null
  responseNote?: string | null
  healthRecordId?: number | string | null
  selectedHealthRecordIds?: (number | string)[]
}

export interface ApproveConsultationRequestPayload {
  doctorId: number | string
}

export interface AdminListRequestsParams {
  status?: string
  memberId?: number
  preferredDoctorId?: number
  assignedDoctorId?: number
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}

export interface DoctorCandidateResponse {
  doctorId: number
  displayName: string
  email: string
  phone?: string | null
  specialty?: string | null
  acceptsOneOnOneCare: boolean
  effectiveLoad: number
  maxActiveConsultations: number | null
  declaredSupportSchedule?: string | null
  timezone?: string | null
  preferredByMember: boolean
  eligible: boolean
  ineligibleReasons: string[]
}

export interface DoctorAvailabilitySlot {
  dayOfWeek: DayOfWeek
  start: string // HH:mm
  end: string   // HH:mm
}

export interface DoctorAvailability {
  weekly: DoctorAvailabilitySlot[]
}

export interface DoctorCareProfilePayload {
  specialty: DoctorSpecialty
  acceptsOneOnOneCare: boolean
  maxActiveConsultations: number
  timezone: string
  availability: DoctorAvailability
}

export interface DoctorCareProfileResponse {
  id?: number
  doctorId: number
  specialty?: DoctorSpecialty | null
  acceptsOneOnOneCare: boolean
  maxActiveConsultations: number
  timezone: string
  availability?: DoctorAvailability | null
  availabilityJson?: string | null // legacy fallback
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ConsultationRequestReviewResponse {
  id: number
  memberId: number
  packageId?: number | null
  packageCodeSnapshot?: string | null
  packageNameSnapshot?: string | null
  packagePriceSnapshot?: number | null
  packageDurationDaysSnapshot?: number | null
  reasonForCare?: string | null
  currentConcern?: string | null
  careGoal?: string | null
  memberNote?: string | null
  relevantSelfReportedContext?: string | null
  reason?: string | null
  status: ConsultationRequestStatus
  member?: any
  preferredDoctor?: any
  assignedDoctor?: any
  healthRecord?: any
  healthRecords?: any[]
  selectedHealthRecordIds?: (number | string)[]
  moreInfoReason?: string | null
  memberAdditionalNote?: string | null
  assignedDoctorId?: number | null
  doctorReservedAt?: string | null
  paymentDeadline?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface RejectConsultationRequestPayload {
  rejectionReason: string
}

export interface AdminCreateConsultationSessionPayload {
  memberId: string | number
  doctorId: string | number
  healthRecordId?: string | number | null
  startedAt?: string | null
  endsAt: string
  supportEndsAt?: string | null
  initialSystemMessage?: string | null
  overrideReason: string
  packageId?: number | string | null
}

export interface ConsultationRenewalResponse {
  id: number | string
  sessionId: number | string
  memberId: number | string
  doctorId: number | string
  packageId?: number | string | null
  packageCodeSnapshot?: string | null
  packageNameSnapshot?: string | null
  packagePriceSnapshot?: number | null
  packageDurationDaysSnapshot?: number | null
  status: ConsultationRenewalStatus
  previousEndsAt?: string | null
  proposedEndsAt?: string | null
  requestedAt?: string | null
  reviewedAt?: string | null
  reviewedByUserId?: number | string | null
  rejectionReason?: string | null
  paymentDeadline?: string | null
  appliedAt?: string | null
  failureReason?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface RequestConsultationRenewalPayload {
  packageFamilyId?: number
}

export interface DecideConsultationRenewalPayload {
  approved: boolean
  rejectionReason?: string | null
}

export interface SessionExtensionResponse {
  id: number | string
  sessionId: number | string
  renewalId?: number | string | null
  previousEndsAt: string
  newEndsAt: string
  packageCodeSnapshot?: string | null
  packageNameSnapshot?: string | null
  packagePriceSnapshot?: number | null
  appliedAt: string
  createdAt?: string | null
}

export interface CloseConsultationPayload {
  closeReason: string
}

export interface SendConsultationMessagePayload {
  type: ConsultationMessageType
  content?: string
  attachmentUrl?: string
  attachmentName?: string
  attachmentSize?: number
  attachmentContentType?: string
  clientMessageId?: string
}

export type ConsultationRequestPage = PageResponse<ConsultationRequestItem>
export type ConsultationSessionPage = PageResponse<ConsultationSessionItem>
export type ConsultationMessagePage = PageResponse<ConsultationMessageItem>
export type HealthRecordPage = PageResponse<HealthRecordItem>

export interface DoctorConsultationSessionResponse {
  id: string | number
  requestId: string | number
  memberId: string | number
  status: ConsultationSessionStatus
  startedAt?: string | null
  endsAt?: string | null
  supportEndsAt?: string | null
  lastMessageAt?: string | null
  supportScheduleSnapshotJson?: string | null
  supportTimezoneSnapshot?: string | null
  unresolvedAttentionCount: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface DoctorConsultationDetailResponse {
  session: DoctorConsultationSessionResponse
  member?: any
  request?: any
  packageSnapshot?: any
  initialHealthRecord?: HealthRecordItem | null
  attentions?: any[]
  unresolvedAttentionCount?: number
}

export interface EpisodeHealthRecordAuthorizationResponse {
  id: number | string
  sessionId: number | string
  healthRecordId: number | string
  authorizedByUserId?: number | string
  authorizedByRole?: string
  source?: string
  createdAt?: string
}

export interface FinalSummaryAddendumResponse {
  id: string | number
  finalSummaryId: string | number
  reason: string
  content: string
  createdByDoctorId?: string | number
  doctorName?: string | null
  createdAt: string
}

export interface CreateFinalSummaryAddendumPayload {
  reason: string
  content: string
}

export interface CareContinuitySummaryResponse {
  sessionId: number | string
  startedAt?: string | null
  endsAt?: string | null
  completedAt?: string | null
  doctorName?: string | null
  doctorId?: number | string | null
  packageName?: string | null
  packageCode?: string | null
  summary: string
  observations?: string | null
  recommendations?: string | null
  followUpRecommendation?: string | null
  finalizedAt?: string | null
  addenda?: FinalSummaryAddendumResponse[] | null
}

export interface DoctorRawArtifactResponse {
  recordId: number | string
  uploadUrl?: string
  downloadUrl?: string
  s3Key?: string
}

export interface ConsultationFinalSummaryResponse {
  id: string | number
  sessionId: string | number
  status: ConsultationFinalSummaryStatus
  summary: string
  observations?: string | null
  recommendations?: string | null
  followUpRecommendation?: string | null
  referencedHealthRecordIds?: (number | string)[] | null
  referencedHealthRecords?: HealthRecordItem[] | null
  addenda?: FinalSummaryAddendumResponse[] | null
  createdByDoctorId: string | number
  doctorName?: string | null
  finalizedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface UpsertConsultationFinalSummaryPayload {
  summary: string
  observations?: string | null
  recommendations?: string | null
  followUpRecommendation?: string | null
  referencedHealthRecordIds?: (number | string)[] | null
}

export interface ConsultationAttentionResponse {
  id: string | number
  sessionId: string | number
  healthRecordId: string | number
  status: "REQUIRES_ATTENTION" | "REVIEWED" | string
  reason: string
  reviewedAt?: string | null
  reviewedByDoctorId?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface DoctorScopedHealthRecordResponse {
  record: HealthRecordItem & {
    userId?: string | number
    fileName?: string
    fileSize?: number
    predictionLabel?: string
    confidence?: number
  }
  initialAttachedRecord: boolean
  attention?: ConsultationAttentionResponse | null
}
