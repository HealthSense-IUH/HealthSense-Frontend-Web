/**
 * Global Constants
 * Lưu trữ các hằng số dùng chung toàn app
 */

export const APP_INFO = {
  NAME: "HealthSense",
  VERSION: "1.0.0",
  DESCRIPTION: "AI-Powered Atrial Fibrillation Detection System",
}

export const ROUTES = {
  PUBLIC: {
    HOME: "/",
  },
  GENERAL: {
    DASHBOARD: "/general",
  },
  MANAGEMENT: {
    ADMIN: "/management",
  },
} as const

// Thresholds cho các chỉ số sức khỏe (Mock data)
export const HEALTH_THRESHOLDS = {
  HR_MIN: 60,
  HR_MAX: 100,
  SPO2_MIN: 95,
  SPO2_CRITICAL: 90,
  HRV_SDNN_MIN: 30, // Dưới 30ms có thể là báo động đỏ
}
