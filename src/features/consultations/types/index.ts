import type { PageResponse } from "@/types/base"

export type ConsultationRequestStatus = "PENDING_REVIEW" | "NEED_MORE_INFO" | "WAITING_PAYMENT" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXPIRED" | "PENDING" | string
export type ConsultationStatus = "ACTIVE" | "EXPIRED" | "CLOSED" | "CANCELLED" | "PENDING" | string
export type ConsultationSourceType = "REQUEST" | "ADMIN_DIRECT" | string
export type ConsultationMessageType = "TEXT" | "IMAGE" | "FILE" | string
export type ConsultationParticipantRole = "MEMBER" | "DOCTOR" | "ADMIN" | "SYSTEM" | string
export type CareServicePackageStatus = "ACTIVE" | "INACTIVE" | "RETIRED" | string

export interface CareServicePackage {
  id: number
  code: string
  name: string
  description?: string | null
  priceAmount: number
  currency?: string | null
  durationDays: number
  renewable: boolean
  status: CareServicePackageStatus
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
  packageId: number
  reason: string
  preferredDoctorId?: number | null
  healthRecordId?: number | null
}

export interface ApproveConsultationRequestPayload {
  doctorId: number
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
