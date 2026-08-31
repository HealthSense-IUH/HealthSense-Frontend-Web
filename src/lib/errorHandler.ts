import { AxiosError } from "axios"

import {
  AUTH_ERROR_FALLBACK_MESSAGES,
  HTTP_STATUS_MESSAGES,
} from "@/constants/errors"
import type { ErrorResponse } from "@/types/base"

export interface ParsedApiError {
  message: string
  userMessage: string
  statusCode?: number
  code?: number
  isServerError: boolean
  isNetworkError: boolean
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!(error instanceof AxiosError)) {
    return {
      message: error instanceof Error ? error.message : "Unknown error",
      userMessage: "Đã xảy ra lỗi. Vui lòng thử lại.",
      isServerError: false,
      isNetworkError: false,
    }
  }

  if (!error.response) {
    return {
      message: error.message || "Network error",
      userMessage: "Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối.",
      isServerError: false,
      isNetworkError: true,
    }
  }

  const body = error.response.data as ErrorResponse | undefined
  const statusCode = error.response.status
  const serverMessage = body?.message || error.message || "Unknown API error"
  const userMessage =
    body?.message ||
    HTTP_STATUS_MESSAGES[statusCode] ||
    "Đã xảy ra lỗi. Vui lòng thử lại."

  return {
    message: serverMessage,
    userMessage,
    statusCode,
    code: body?.code,
    isServerError: statusCode >= 500,
    isNetworkError: false,
  }
}

export function logError(context: string, error: unknown) {
  const parsedError = parseApiError(error)

  console.error(`[${context}]`, {
    message: parsedError.message,
    statusCode: parsedError.statusCode,
    code: parsedError.code,
    isServerError: parsedError.isServerError,
    isNetworkError: parsedError.isNetworkError,
    timestamp: new Date().toISOString(),
  })
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ErrorResponse | undefined
    if (body?.message) {
      return body.message
    }

    if (body?.code && AUTH_ERROR_FALLBACK_MESSAGES[body.code]) {
      return AUTH_ERROR_FALLBACK_MESSAGES[body.code]
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"]
      return retryAfter
        ? `Thao tác quá nhanh, thử lại sau ${retryAfter} giây.`
        : AUTH_ERROR_FALLBACK_MESSAGES[429]
    }
  }

  return parseApiError(error).userMessage
}
