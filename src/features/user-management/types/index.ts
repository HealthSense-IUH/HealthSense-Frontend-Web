import type { UserRole } from "@/types/authentication"

export type AccountStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFY"

export interface UserItem {
  id: string | number
  email: string
  displayName: string
  role: UserRole
  status?: AccountStatus
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
  status?: AccountStatus
  displayName?: string
  phone?: string
  dateOfBirth?: string // Format: yyyy-MM-dd
  gender?: string
  address?: string
}

export interface UserListFilterParams {
  role: UserRole // REQUIRED by Backend specification
  status?: AccountStatus // OPTIONAL filter by status
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
