import axios from "axios"
import { env } from "@/config"

/**
 * Axios instance dùng chung cho toàn bộ app.
 * Sẽ được cấu hình interceptors ở đây (ví dụ: gắn JWT token).
 */
export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // TODO: Gắn token vào header nếu có
    // const token = useAuthStore.getState().token
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // TODO: Handle global error (ví dụ: 401 thì logout)
    console.error("API Error:", error)
    return Promise.reject(error)
  }
)
