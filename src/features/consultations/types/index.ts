import type { PageResponse } from "@/types/base"

export type ConsultationRequestStatus = "PENDING_REVIEW" | "NEED_MORE_INFO" | "WAITING_PAYMENT" | "FULFILLED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "PENDING" | string
export type ConsultationStatus = "ACTIVE" | "EXPIRED" | "CLOSED" | "CANCELLED" | "PENDING" | string
export type ConsultationSourceType = "REQUEST" | "ADMIN_DIRECT" | string
export type ConsultationMessageType = "TEXT" | "IMAGE" | "FILE" | string
export type ConsultationParticipantRole = "MEMBER" | "DOCTOR" | "ADMIN" | "SYSTEM" | string
export type CareServicePackageStatus = "ACTIVE" | "INACTIVE" | "RETIRED" | string
export type DoctorSpecialty = "CARDIOLOGY" | "INTERNAL_MEDICINE" | "GENERAL_PRACTICE" | "OTHER" | string

export type ConsultationPaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED" | "REQUIRES_REVIEW" | string

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
}

export interface UpdateCareServicePackagePayload {
  name: string
  description?: string | null
  priceAmount: number
  durationDays: number
  renewable: boolean
}

export interface ConsultationRequestItem {
  id: string | number
  memberId: string | number
  healthRecordId?: string | number | null
  reason: string
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
  reason: string
  preferredDoctorId?: number | string | null
  healthRecordId?: number | string | null
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

export type DoctorSpecialty =
  | "CARDIOLOGY"
  | "INTERNAL_MEDICINE"
  | "GENERAL_PRACTICE"
  | "OTHER"

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

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
  reason: string
  status: ConsultationRequestStatus
  member?: any
  preferredDoctor?: any
  assignedDoctor?: any
  healthRecord?: any
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
}

export interface ExtendConsultationPayload {
  endsAt: string
  supportEndsAt?: string | null
  reason?: string | null
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
