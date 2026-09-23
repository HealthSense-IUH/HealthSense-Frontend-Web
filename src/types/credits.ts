export type CreditOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "REQUIRES_REVIEW"

export type CreditPackageStatus = "ACTIVE" | "INACTIVE"

export type CreditPaymentStatus =
  | "CREATING"
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED"
  | "REQUIRES_REVIEW"

export type CreditPaymentProvider = "MOCK" | "PAYOS"

export type CreditOperation =
  | "PURCHASE"
  | "RESERVE"
  | "CAPTURE"
  | "RELEASE"
  | "SESSION_CHARGE"
  | "ADJUSTMENT"
  | "SESSION_REFUND"

export type CreditSourceType =
  | "PURCHASE_ORDER"
  | "CONSULTATION_REQUEST"
  | "CONSULTATION_SESSION"
  | "ADMIN_ADJUSTMENT"

export type ConsultationCreditPolicy =
  | "FREE_EXISTING"
  | "FREE_DISABLED"
  | "PER_SESSION_V1"
  | "PER_SESSION_CONFIRM_V2"

export type CreditReservationStatus = "HELD" | "CAPTURED" | "RELEASED"

export interface ConsultationCreditSnapshot {
  creditPolicy: ConsultationCreditPolicy
  creditCost: number
  creditReservationStatus?: CreditReservationStatus | null
}

export interface CreditWallet {
  id?: string
  memberId?: string
  balance: number   // tổng lượt còn lại, gồm lượt đang giữ
  reserved: number  // lượt đang được giữ
  available: number // balance - reserved
  version?: number
  updatedAt?: string
}

export type AdminMemberWallet = CreditWallet

export interface CreditPackage {
  id: string
  code: string
  name: string
  description?: string | null
  creditQuantity: number
  priceVnd: number
}

export interface AdminCreditPackage extends CreditPackage {
  status: CreditPackageStatus
  version: number
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateAdminCreditPackageRequest {
  code: string
  name: string
  description?: string
  creditQuantity: number
  priceVnd: number
}

export interface UpdateAdminCreditPackageRequest {
  name?: string
  description?: string
  creditQuantity?: number
  priceVnd?: number
  status?: CreditPackageStatus
  version: number
}

export interface CreditLedgerEntry {
  id: string
  operation: CreditOperation
  quantity: number
  deltaBalance: number
  deltaReserved: number
  balanceAfter: number
  reservedAfter: number
  sourceType: CreditSourceType
  sourceId: string
  createdAt: string
}

export interface AdminCreditLedgerEntry extends CreditLedgerEntry {
  relatedEntryId?: string | null
  actorId?: string | null
  reason?: string | null
}

export interface CreateCreditOrderRequest {
  packageId: string
}

export interface CreditOrderSummary {
  id: string
  packageId: string
  packageCode: string
  packageName: string
  creditQuantity: number
  amountVnd: number
  currency: "VND"
  status: CreditOrderStatus
  createdAt: string
  paidAt?: string | null
}

export interface AdminCreditOrderSummary extends CreditOrderSummary {
  memberId: string
}

export interface CreditPaymentSummary {
  attemptId: string
  provider: CreditPaymentProvider
  status: CreditPaymentStatus
  orderCode?: string | null
  paymentLinkId?: string | null
  checkoutUrl?: string | null
  expiresAt?: string | null
}

export interface CreditOrderDetail {
  order: CreditOrderSummary
  payment: CreditPaymentSummary
  wallet: CreditWallet
}

export interface AdminCreditOrderDetail {
  memberId: string
  order: CreditOrderSummary
  attempts: CreditPaymentSummary[]
}

export interface CreditMutationResponse {
  entry: AdminCreditLedgerEntry
  wallet: CreditWallet
}

export interface CreditAdjustmentRequest {
  delta: number
  reason: string
}

export interface CreditSessionRefundRequest {
  sessionId: string
  reason: string
}

export interface CreditWalletReconciliation {
  memberId: string
  walletBalance: number
  walletReserved: number
  ledgerBalance: number
  ledgerReserved: number
  heldQuantity: number
  consistent: boolean
}

export interface CreditRecoveryResult {
  examined: number
  released: number
  alreadyTerminal: number
  integrityIssues: string[]
}

export interface AdminCreditLedgerFilterParams {
  page?: number
  size?: number
  operation?: CreditOperation
  sourceType?: CreditSourceType
  from?: string
  to?: string
}

export interface AdminCreditOrdersFilterParams {
  page?: number
  size?: number
  memberId?: string
  status?: CreditOrderStatus
  provider?: CreditPaymentProvider
  from?: string
  to?: string
}

export interface ConsultationCreditSnapshot {
  creditPolicy: ConsultationCreditPolicy
  creditCost: number
  creditReservationStatus?: CreditReservationStatus | null
}

export interface CreditPurchaseIntent {
  userId: string
  packageId: string
  idempotencyKey: string
  packageName?: string
  creditQuantity?: number
  priceVnd?: number
  createdAt: string
  lastError?: string
}

export interface PendingCreditPayment {
  userId: string
  orderId: string
  attemptId: string
  packageId: string
  orderCode?: string | null
  checkoutUrl?: string | null
  expiresAt?: string | null
  createdAt: string
}

// Giữ alias tương thích ngược tạm thời nếu có code cũ tham chiếu
export type PendingCreditPurchaseIntent = CreditPurchaseIntent

export type MemberAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFY"

export interface AdminMemberCreditSummary {
  memberId: string
  displayName: string
  email: string
  phone: string | null
  accountStatus: MemberAccountStatus
  avatarUrl: string | null
  walletInitialized: boolean
  balance: number
  reserved: number
  available: number
  walletUpdatedAt: string | null
}

export interface AdminMemberCreditsFilterParams {
  keyword?: string
  status?: MemberAccountStatus
  page?: number
  size?: number
}

