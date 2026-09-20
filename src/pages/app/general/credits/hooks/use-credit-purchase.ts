import { useCallback, useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { creditsApi } from "@/services/credits.service"
import { parseApiError } from "@/lib/errorHandler"
import { CREDIT_ERROR_CODE_MESSAGES } from "@/constants/credits"
import type {
  CreditOrderDetail,
  CreditPackage,
  CreditPurchaseIntent,
  PendingCreditPayment,
} from "@/types/credits"

export function getIntentStorageKey(userId: string | number) {
  return `healthsense.creditIntent.${userId}`
}

export function getPaymentStorageKey(userId: string | number) {
  return `healthsense.creditPayment.${userId}`
}

export function getStoredPurchaseIntent(userId: string | number): CreditPurchaseIntent | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = window.sessionStorage.getItem(getIntentStorageKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as CreditPurchaseIntent
  } catch {
    return null
  }
}

export function saveStoredPurchaseIntent(intent: CreditPurchaseIntent): void {
  if (typeof window === "undefined" || !intent.userId) return
  try {
    window.sessionStorage.setItem(getIntentStorageKey(intent.userId), JSON.stringify(intent))
  } catch (err) {
    console.error("Failed to save purchase intent to sessionStorage", err)
  }
}

export function clearStoredPurchaseIntent(userId: string | number): void {
  if (typeof window === "undefined" || !userId) return
  try {
    window.sessionStorage.removeItem(getIntentStorageKey(userId))
  } catch (err) {
    console.error("Failed to clear purchase intent from sessionStorage", err)
  }
}

export function getStoredPendingPayment(userId: string | number): PendingCreditPayment | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = window.sessionStorage.getItem(getPaymentStorageKey(userId))
    if (!raw) return null
    return JSON.parse(raw) as PendingCreditPayment
  } catch {
    return null
  }
}

export function saveStoredPendingPayment(payment: PendingCreditPayment): void {
  if (typeof window === "undefined" || !payment.userId) return
  try {
    window.sessionStorage.setItem(getPaymentStorageKey(payment.userId), JSON.stringify(payment))
  } catch (err) {
    console.error("Failed to save pending payment to sessionStorage", err)
  }
}

export function clearStoredPendingPayment(userId: string | number): void {
  if (typeof window === "undefined" || !userId) return
  try {
    window.sessionStorage.removeItem(getPaymentStorageKey(userId))
  } catch (err) {
    console.error("Failed to clear pending payment from sessionStorage", err)
  }
}

export interface UseCreditPurchaseReturn {
  selectedPackage: CreditPackage | null
  idempotencyKey: string | null
  isSubmitting: boolean
  isFeatureDisabled: boolean
  lastError: string | null
  errorCode: number | null
  successResult: CreditOrderDetail | null
  hasPendingRetry: boolean
  creatingNotice: string | null
  selectPackage: (pkg: CreditPackage) => void
  resetPurchaseState: () => void
  startNewTransaction: () => void
  executePurchase: () => Promise<CreditOrderDetail | null>
}

export function useCreditPurchase(
  onPurchaseSuccess?: (detail: CreditOrderDetail) => void
): UseCreditPurchaseReturn {
  const userSession = useAuthStore((state) => state.userSession)
  const userId = userSession?.userId ? String(userSession.userId) : ""

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [successResult, setSuccessResult] = useState<CreditOrderDetail | null>(null)
  const [hasPendingRetry, setHasPendingRetry] = useState(false)
  const [creatingNotice, setCreatingNotice] = useState<string | null>(null)

  // Khoá đồng bộ chống double-click ngay lập tức trước khi React re-render
  const inFlightRef = useRef(false)

  // Khôi phục intent dở dang từ sessionStorage khi hook khởi tạo hoặc đổi user
  useEffect(() => {
    if (!userId) {
      setSelectedPackage(null)
      setIdempotencyKey(null)
      setHasPendingRetry(false)
      setCreatingNotice(null)
      return
    }

    const saved = getStoredPurchaseIntent(userId)
    if (saved && saved.packageId) {
      setIdempotencyKey(saved.idempotencyKey)
      setHasPendingRetry(true)
      if (saved.lastError) {
        setLastError(saved.lastError)
      }
      setSelectedPackage({
        id: saved.packageId,
        code: "",
        name: saved.packageName || `Gói #${saved.packageId}`,
        creditQuantity: saved.creditQuantity || 0,
        priceVnd: saved.priceVnd || 0,
      })
    }
  }, [userId])

  /**
   * Chọn gói để bắt đầu mua.
   * Nếu đã có intent dở dang cho gói này, tái sử dụng key cũ.
   * Nếu chọn gói khác, sinh key mới bằng crypto.randomUUID().
   */
  const selectPackage = useCallback(
    (pkg: CreditPackage) => {
      setSuccessResult(null)
      setLastError(null)
      setErrorCode(null)
      setIsFeatureDisabled(false)
      setCreatingNotice(null)

      const saved = userId ? getStoredPurchaseIntent(userId) : null
      if (saved && saved.packageId === pkg.id && saved.idempotencyKey) {
        // Tái sử dụng key của intent chưa hoàn tất
        setSelectedPackage(pkg)
        setIdempotencyKey(saved.idempotencyKey)
        setHasPendingRetry(true)
        if (saved.lastError) {
          setLastError(saved.lastError)
        }
      } else {
        // Sinh key mới cho ý định mua mới
        const newKey = crypto.randomUUID()
        setSelectedPackage(pkg)
        setIdempotencyKey(newKey)
        setHasPendingRetry(false)

        if (userId) {
          saveStoredPurchaseIntent({
            userId,
            packageId: pkg.id,
            packageName: pkg.name,
            creditQuantity: pkg.creditQuantity,
            priceVnd: pkg.priceVnd,
            idempotencyKey: newKey,
            createdAt: new Date().toISOString(),
          })
        }
      }
    },
    [userId]
  )

  /**
   * Người dùng chủ động huỷ intent cũ khi order cũ đã terminal hoặc đã được xác nhận
   */
  const startNewTransaction = useCallback(() => {
    // Chỉ cho phép sinh key mới khi không bị kẹt retry chưa rõ kết quả
    if (hasPendingRetry && isSubmitting) {
      console.warn("Cannot start new transaction while request is pending/unresolved.")
      return
    }

    if (selectedPackage && userId) {
      const newKey = crypto.randomUUID()
      setIdempotencyKey(newKey)
      setLastError(null)
      setErrorCode(null)
      setHasPendingRetry(false)
      setIsFeatureDisabled(false)
      setCreatingNotice(null)
      saveStoredPurchaseIntent({
        userId,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        creditQuantity: selectedPackage.creditQuantity,
        priceVnd: selectedPackage.priceVnd,
        idempotencyKey: newKey,
        createdAt: new Date().toISOString(),
      })
    }
  }, [selectedPackage, userId, hasPendingRetry, isSubmitting])

  /**
   * Reset trạng thái hiển thị (ví dụ khi đóng dialog).
   * Lưu ý: KHÔNG xoá intent trong sessionStorage nếu giao dịch đang bị lỗi mạng dở dang,
   * để người dùng mở lại hoặc reload vẫn có thể retry đúng key.
   */
  const resetPurchaseState = useCallback(() => {
    setIsSubmitting(false)
    inFlightRef.current = false
    setSuccessResult(null)
    setLastError(null)
    setErrorCode(null)
    setIsFeatureDisabled(false)
    setCreatingNotice(null)
  }, [])

  /**
   * Thực hiện POST mua gói lượt
   */
  const executePurchase = useCallback(async (): Promise<CreditOrderDetail | null> => {
    if (!selectedPackage || !idempotencyKey || !userId) {
      setLastError("Thiếu thông tin gói hoặc phiên đăng nhập.")
      return null
    }

    // Chặn double-click bằng khoá đồng bộ useRef
    if (inFlightRef.current) {
      console.warn("Purchase request already in flight, ignoring duplicate click.")
      return null
    }

    inFlightRef.current = true
    setIsSubmitting(true)
    setLastError(null)
    setErrorCode(null)
    setIsFeatureDisabled(false)
    setCreatingNotice(null)

    try {
      // FE luôn gửi packageId dạng string
      const response = await creditsApi.createOrder(
        { packageId: String(selectedPackage.id) },
        idempotencyKey
      )

      const result = response.data
      const { order, payment } = result

      // 1. Trường hợp: MOCK + PAID
      if (payment.provider === "MOCK" && order.status === "PAID") {
        setSuccessResult(result)
        setHasPendingRetry(false)
        clearStoredPurchaseIntent(userId)
        clearStoredPendingPayment(userId)

        if (onPurchaseSuccess) {
          try {
            onPurchaseSuccess(result)
          } catch (cbErr) {
            console.error("Error in onPurchaseSuccess callback:", cbErr)
          }
        }
        return result
      }

      // 2. Trường hợp: PAYOS + PENDING_PAYMENT
      if (payment.provider === "PAYOS" && order.status === "PENDING_PAYMENT") {
        // Nếu payment đang CREATING: chưa có link checkout
        if (payment.status === "CREATING") {
          setCreatingNotice("Giao dịch đang được khởi tạo. Vui lòng kiểm tra lại sau.")
          setHasPendingRetry(true)
          // Lưu pending payment để trang sau có thể nhận diện order
          saveStoredPendingPayment({
            userId,
            orderId: String(order.id),
            attemptId: String(payment.attemptId),
            packageId: String(order.packageId),
            orderCode: payment.orderCode,
            checkoutUrl: payment.checkoutUrl,
            expiresAt: payment.expiresAt,
            createdAt: new Date().toISOString(),
          })
          return result
        }

        // Nếu payment đã PENDING và có checkoutUrl
        if (payment.status === "PENDING" && payment.checkoutUrl) {
          // Kiểm tra URL HTTPS hợp lệ
          if (payment.checkoutUrl.startsWith("https://")) {
            // Lưu pending payment cho member
            saveStoredPendingPayment({
              userId,
              orderId: String(order.id),
              attemptId: String(payment.attemptId),
              packageId: String(order.packageId),
              orderCode: payment.orderCode,
              checkoutUrl: payment.checkoutUrl,
              expiresAt: payment.expiresAt,
              createdAt: new Date().toISOString(),
            })
            // Xóa pre-POST intent vì đã có orderId thành công
            clearStoredPurchaseIntent(userId)

            // Điều hướng sang trang thanh toán PayOS
            window.location.assign(payment.checkoutUrl)
            return result
          } else {
            setLastError("Liên kết thanh toán từ cổng thanh toán không an toàn (yêu cầu HTTPS).")
            return null
          }
        }
      }

      // 3. Trường hợp: PAYOS + PAID (ví dụ retry đơn đã được webhook xác nhận)
      if (order.status === "PAID") {
        setSuccessResult(result)
        setHasPendingRetry(false)
        clearStoredPurchaseIntent(userId)
        clearStoredPendingPayment(userId)

        if (onPurchaseSuccess) {
          try {
            onPurchaseSuccess(result)
          } catch (cbErr) {
            console.error("Error in onPurchaseSuccess callback:", cbErr)
          }
        }
        return result
      }

      // 4. Trường hợp: REQUIRES_REVIEW
      if (order.status === "REQUIRES_REVIEW") {
        setLastError("Giao dịch đã được ghi nhận và đang được hệ thống kiểm tra.")
        setHasPendingRetry(false)
        clearStoredPurchaseIntent(userId)
        return result
      }

      // Fallback
      setSuccessResult(result)
      return result
    } catch (err) {
      const parsed = parseApiError(err)
      const errCode = parsed.code ?? parsed.statusCode ?? null
      setErrorCode(errCode)

      // Xử lý riêng các mã lỗi theo contract
      if (parsed.statusCode === 503 || errCode === 4108) {
        setIsFeatureDisabled(true)
        setLastError(CREDIT_ERROR_CODE_MESSAGES[4108] || "Chức năng mua lượt tư vấn tạm thời chưa khả dụng.")
      } else if (errCode === 4103) {
        setLastError("Xung đột khóa giao dịch (Idempotency). Vui lòng thử lại với cùng gói hoặc kiểm tra lại lịch sử đơn.")
      } else if (errCode === 4105) {
        setLastError("Gói lượt tư vấn đã ngừng mở bán. Vui lòng tải lại danh sách gói.")
      } else if (errCode === 4106) {
        setLastError("Không tìm thấy thông tin đơn mua lượt hoặc đơn không thuộc về bạn.")
      } else if (errCode === 4107) {
        setLastError("Bằng chứng hoặc trạng thái thanh toán không hợp lệ.")
      } else if (errCode === 4020 || parsed.statusCode === 500 && String(parsed.userMessage).includes("PayOS")) {
        setLastError("Cổng thanh toán PayOS chưa được cấu hình trên hệ thống.")
      } else if (errCode === 4021 || parsed.statusCode === 502) {
        setLastError("Cổng thanh toán PayOS không phản hồi hoặc từ chối thao tác. Vui lòng thử lại sau.")
        setHasPendingRetry(true)
      } else if (errCode && CREDIT_ERROR_CODE_MESSAGES[errCode]) {
        setLastError(CREDIT_ERROR_CODE_MESSAGES[errCode])
      } else if (parsed.isNetworkError || (parsed.statusCode != null && parsed.statusCode >= 500)) {
        setLastError("Không thể kết nối tới máy chủ. Trạng thái giao dịch chưa được xác nhận; vui lòng bấm Thử lại để kiểm tra với cùng mã yêu cầu.")
        setHasPendingRetry(true)
      } else {
        setLastError(parsed.userMessage || "Giao dịch mua không thành công. Vui lòng thử lại.")
      }

      // Lưu thông tin lỗi vào intent để reload vẫn giữ key
      if (userId && idempotencyKey) {
        saveStoredPurchaseIntent({
          userId,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          creditQuantity: selectedPackage.creditQuantity,
          priceVnd: selectedPackage.priceVnd,
          idempotencyKey,
          createdAt: new Date().toISOString(),
          lastError: parsed.userMessage,
        })
      }

      return null
    } finally {
      inFlightRef.current = false
      setIsSubmitting(false)
    }
  }, [selectedPackage, idempotencyKey, userId, onPurchaseSuccess])

  return {
    selectedPackage,
    idempotencyKey,
    isSubmitting,
    isFeatureDisabled,
    lastError,
    errorCode,
    successResult,
    hasPendingRetry,
    creatingNotice,
    selectPackage,
    resetPurchaseState,
    startNewTransaction,
    executePurchase,
  }
}
