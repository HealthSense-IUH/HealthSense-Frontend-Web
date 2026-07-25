import type { UserRole } from "@/types/authentication"

export type ProfileAccountStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BANNED"
  | "LOCKED"
  | "PENDING_VERIFY"

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
  createdAt?: string | number
  updatedAt?: string | number
}

export interface ProfileUpdateRequest {
  displayName?: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
}
