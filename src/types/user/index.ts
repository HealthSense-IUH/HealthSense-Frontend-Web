import type { UserRole } from "@/types/auth"

export type UserAccountStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFY" | "DISABLED" | "LOCKED" | "BANNED" | string

export interface UserItem {
  id: string | number
  email: string
  displayName: string
  role: UserRole
  status?: UserAccountStatus
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
  createdAt?: string | number
  updatedAt?: string | number
}

export interface UserCreateRequest {
  email: string
  role: UserRole
  displayName: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
}

export interface UserUpdateRequest {
  email?: string
  status?: UserAccountStatus
  displayName?: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
}

export interface UserListFilterParams {
  role: UserRole // REQUIRED by Backend specification
  status?: UserAccountStatus // OPTIONAL filter by status
  keyword?: string // OPTIONAL search by id, email, or phone
  page?: number // default 1
  size?: number // default 10
}

export interface UserPageResponse {
  content?: UserItem[]
  items?: UserItem[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  hasMore?: boolean
}

export interface AdminMemberDetailResponse {
  user: UserItem
  latestHealthRecord?: {
    id: string | number
    predictionLabel?: string
    status?: string
    confidence?: number
    createdAt?: string | null
  } | null
  totalHealthRecords?: number
}
