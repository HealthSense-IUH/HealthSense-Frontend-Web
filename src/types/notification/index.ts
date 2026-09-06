export type NotificationType =
  | "REQUEST_RECEIVED"
  | "DOCTOR_OFFER_AVAILABLE"
  | "MEMBER_CONFIRMATION_REQUIRED"
  | "MEMBER_CONFIRMATION_EXPIRED"
  | "REQUEST_NEEDS_INFO"
  | "REQUEST_REJECTED"
  | "AGREEMENT_READY"
  | "AGREEMENT_INVALIDATED"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REQUIRES_REVIEW"
  | "CARE_ACTIVATED"
  | "CONTINUATION_CONFIRMATION_REQUIRED"
  | "CARE_ENDING"
  | "CARE_COMPLETED"
  | "CARE_CANCELLED"
  | "CARE_TERMINATION_REQUESTED"
  | "NEW_MESSAGE"
  | "HEALTH_RECORD_AUTHORIZED"
  | "HEALTH_ATTENTION_REQUIRED"
  | "RENEWAL_STATUS_CHANGED"
  | "REFUND_STATUS_CHANGED"
  | "FINAL_SUMMARY_AVAILABLE"
  | "SUMMARY_ACTION_REQUIRED"
  | "DOCTOR_SUMMARY_DEADLINE_EXPIRED"
  | "OPERATIONAL_REVIEW_REQUIRED"
  | string

export type NotificationDeliveryStatus = "AVAILABLE" | "FAILED" | string

export interface NotificationResponse {
  id: number | string
  userId?: number | string
  type: NotificationType
  title: string
  message: string
  linkUrl?: string | null
  referenceType?: string | null
  referenceId?: string | number | null
  deliveryStatus?: NotificationDeliveryStatus
  createdAt: string
  readAt?: string | null
  read: boolean
}

export interface UnreadNotificationCountResponse {
  unreadCount: number
}
