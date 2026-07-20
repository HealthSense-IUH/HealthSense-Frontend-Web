/**
 * Application Configuration
 * Khởi tạo các thiết lập chạy 1 lần khi boot app
 */

export const env = {
  // Base URL cho HealthSense API Service
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  
  // Môi trường chạy
  NODE_ENV: import.meta.env.MODE || "development",
  
  // Feature flags
  ENABLE_MOCK_DATA: true,
}

export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
}
