import axiosClient from "@/lib/axiosClient"
import type { ApiResponse } from "@/types/base"
import type {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/authentication"

export const authApi = {
  register(payload: RegisterRequest) {
    return axiosClient.post<ApiResponse<RegisterResponse>, ApiResponse<RegisterResponse>>(
      "/api/auth/register",
      payload
    )
  },

  login(payload: LoginRequest) {
    return axiosClient.post<ApiResponse<LoginResponse>, ApiResponse<LoginResponse>>(
      "/api/auth/login",
      payload
    )
  },

  refresh() {
    return axiosClient.post<ApiResponse<LoginResponse>, ApiResponse<LoginResponse>>(
      "/api/auth/refresh"
    )
  },

  logout() {
    return axiosClient.post<ApiResponse<void>, ApiResponse<void>>("/api/auth/logout")
  },

  me() {
    return axiosClient.get<ApiResponse<CurrentUser>, ApiResponse<CurrentUser>>("/api/auth/me")
  },
}
