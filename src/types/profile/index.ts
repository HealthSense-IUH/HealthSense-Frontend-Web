import type { UserRole } from "@/types/auth"

export type ProfileAccountStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BANNED"
  | "LOCKED"
  | "PENDING_VERIFY"
  | string

export interface UserResponse {
  id?: string | number
  email?: string
  role?: UserRole
  status?: ProfileAccountStatus
  displayName?: string
  fullName?: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
  avatarUrl?: string
  citizenId?: string
  bankAccount?: string
  healthInsuranceNumber?: string
  healthData?: string
  biometricData?: string
  identityCardFrontUrl?: string
  identityCardBackUrl?: string
  identityCardFrontRotate?: number
  identityCardBackRotate?: number
  createdAt?: string | number
  updatedAt?: string | number
}

export interface ProfileUpdateRequest {
  displayName?: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
  avatarUrl?: string
  citizenId?: string
  bankAccount?: string
  healthInsuranceNumber?: string
  healthData?: string
  biometricData?: string
  identityCardFrontUrl?: string
  identityCardBackUrl?: string
  identityCardFrontRotate?: number
  identityCardBackRotate?: number
}

export interface AvatarPresignedUrlRequest {
  fileName: string
  contentType?: string
}

export interface AvatarPresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
  s3Key: string
}

export interface IdentityCardPresignedUrlRequest {
  fileName: string
  contentType?: string
  cardSide?: "FRONT" | "BACK"
}

export interface IdentityCardPresignedUrlResponse {
  uploadUrl: string
  publicUrl: string
  s3Key: string
  cardSide?: string
}

export interface MemberDetailResponse {
  user: UserResponse
  latestHealthRecord?: Record<string, unknown> | null
  totalHealthRecords?: number
}
