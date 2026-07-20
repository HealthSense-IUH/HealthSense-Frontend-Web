import { AxiosError } from "axios"

import type { ErrorResponse } from "@/types/base"

export interface ParsedApiError {
  message: string
  userMessage: string
  statusCode?: number
  code?: number
  isServerError: boolean
  isNetworkError: boolean
}

const statusMessages: Record<number, string> = {
  400: "Yeu cau khong hop le. Vui long kiem tra lai du lieu.",
  401: "Vui long dang nhap de tiep tuc.",
  403: "Ban khong co quyen truy cap tai nguyen nay.",
  404: "Khong tim thay tai nguyen duoc yeu cau.",
  409: "Du lieu da ton tai hoac bi trung.",
  429: "Qua nhieu yeu cau. Vui long doi mot lat roi thu lai.",
  500: "May chu dang gap loi. Vui long thu lai sau.",
  502: "Dich vu tam thoi khong kha dung. Vui long thu lai sau.",
  503: "Dich vu tam thoi khong kha dung. Vui long thu lai sau.",
  504: "Dich vu tam thoi khong kha dung. Vui long thu lai sau.",
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!(error instanceof AxiosError)) {
    return {
      message: error instanceof Error ? error.message : "Unknown error",
      userMessage: "Da xay ra loi. Vui long thu lai.",
      isServerError: false,
      isNetworkError: false,
    }
  }

  if (!error.response) {
    return {
      message: error.message || "Network error",
      userMessage: "Khong the ket noi may chu. Vui long kiem tra ket noi.",
      isServerError: false,
      isNetworkError: true,
    }
  }

  const body = error.response.data as ErrorResponse | undefined
  const statusCode = error.response.status
  const serverMessage = body?.message || error.message || "Unknown API error"
  const userMessage = body?.message || statusMessages[statusCode] || "Da xay ra loi. Vui long thu lai."

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
