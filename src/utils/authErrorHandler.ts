import { AxiosError } from "axios"

import type { ErrorResponse } from "@/types/base"
import { parseApiError } from "@/utils/errorHandler"

const fallbackMessages: Record<number, string> = {
  1001: "Email hoac mat khau khong dung.",
  1002: "Email nay da duoc dang ky.",
  1003: "Tai khoan da bi khoa.",
  1004: "Phien dang nhap da het han.",
  1005: "Khong tim thay phien dang nhap.",
  1006: "Phien dang nhap khong con hop le.",
  1007: "Token khong hop le hoac da het han.",
  1200: "Du lieu nhap chua hop le.",
  403: "Ban khong co quyen truy cap.",
  429: "Thao tac qua nhanh, vui long thu lai sau.",
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ErrorResponse | undefined
    if (body?.message) {
      return body.message
    }

    if (body?.code && fallbackMessages[body.code]) {
      return fallbackMessages[body.code]
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"]
      return retryAfter
        ? `Thao tac qua nhanh, thu lai sau ${retryAfter} giay.`
        : fallbackMessages[429]
    }
  }

  return parseApiError(error).userMessage
}
