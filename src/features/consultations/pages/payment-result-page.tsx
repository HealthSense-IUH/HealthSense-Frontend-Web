import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ShieldAlert, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { consultationApi } from "../services/consultation-api"
import type { ConsultationPaymentResponse, ConsultationPaymentAttemptItem, ConsultationRenewalResponse } from "../types"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export default function PaymentResultPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isMissingTarget, setIsMissingTarget] = useState(false)
  const [isNotFound, setIsNotFound] = useState(false)

  // Payment states
  const [initialPayment, setInitialPayment] = useState<ConsultationPaymentResponse | null>(null)
  const [renewalAttempt, setRenewalAttempt] = useState<ConsultationPaymentAttemptItem | null>(null)
  const [renewalInfo, setRenewalInfo] = useState<ConsultationRenewalResponse | null>(null)

  // Detect payment target type
  const paramRenewalId = searchParams.get("renewalId") || searchParams.get("renId")
  const paramRequestId = searchParams.get("requestId") || searchParams.get("reqId")
  const storedPaymentType = localStorage.getItem("healthsense.pendingPaymentType")

  const isRenewal = !!paramRenewalId || storedPaymentType === "renewal"

  const targetRenewalId = paramRenewalId || localStorage.getItem("healthsense.pendingPaymentRenewalId")
  const targetSessionId = searchParams.get("sessionId") || localStorage.getItem("healthsense.pendingPaymentSessionId")
  const targetRequestId = paramRequestId || localStorage.getItem("healthsense.pendingPaymentRequestId")

  const clearStorage = () => {
    localStorage.removeItem("healthsense.pendingPaymentType")
    localStorage.removeItem("healthsense.pendingPaymentRequestId")
    localStorage.removeItem("healthsense.pendingPaymentRenewalId")
    localStorage.removeItem("healthsense.pendingPaymentSessionId")
  }

  const fetchInitialPayment = useCallback(async (reqId: string) => {
    try {
      setLoading(true)
      setErrorText(null)
      const response = await consultationApi.getConsultationPayment(reqId)
      const data = response.data
      setInitialPayment(data)

      // Clear localStorage if reaching terminal state
      if (data.status !== "PENDING") {
        clearStorage()
      }
    } catch (error: unknown) {
      const anyErr = error as { response?: { status?: number } }
      if (anyErr?.response?.status === 404) {
        setIsNotFound(true)
        clearStorage()
      } else {
        setErrorText(readError(error, "Lỗi kiểm tra trạng thái thanh toán."))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRenewalPayment = useCallback(async (renId: string) => {
    try {
      setLoading(true)
      setErrorText(null)

      // Fetch payment attempts for renewal
      const attemptsRes = await consultationApi.getRenewalPaymentAttempts(renId)
      const attempts = attemptsRes.data || []
      const latestAttempt = attempts.length > 0 ? attempts[0] : null
      setRenewalAttempt(latestAttempt)

      // If sessionId is known, also refresh renewal state
      if (targetSessionId) {
        try {
          const renewalsRes = await consultationApi.listSessionRenewals(targetSessionId)
          const matched = (renewalsRes.data || []).find((r) => String(r.id) === String(renId))
          if (matched) {
            setRenewalInfo(matched)
          }
        } catch {
          // Non-blocking
        }
      }

      if (latestAttempt && latestAttempt.status !== "PENDING") {
        clearStorage()
      }
    } catch (error: unknown) {
      const anyErr = error as { response?: { status?: number } }
      if (anyErr?.response?.status === 404) {
        setIsNotFound(true)
        clearStorage()
      } else {
        setErrorText(readError(error, "Lỗi kiểm tra trạng thái thanh toán gia hạn."))
      }
    } finally {
      setLoading(false)
    }
  }, [targetSessionId])

  useEffect(() => {
    if (isRenewal) {
      if (!targetRenewalId) {
        setIsMissingTarget(true)
        setLoading(false)
        return
      }
      void fetchRenewalPayment(targetRenewalId)
    } else {
      if (!targetRequestId) {
        setIsMissingTarget(true)
        setLoading(false)
        return
      }
      void fetchInitialPayment(targetRequestId)
    }
  }, [isRenewal, targetRenewalId, targetRequestId, fetchInitialPayment, fetchRenewalPayment])

  const handleRefresh = () => {
    if (isRenewal && targetRenewalId) {
      void fetchRenewalPayment(targetRenewalId)
    } else if (targetRequestId) {
      void fetchInitialPayment(targetRequestId)
    }
  }

  const handleBackToConsultations = () => {
    if (targetSessionId) {
      navigate(`/app/consultations?tab=chat&sessionId=${targetSessionId}`)
    } else {
      navigate("/app/consultations?tab=sessions")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Đang kiểm tra giao dịch thanh toán...</p>
      </div>
    )
  }

  if (isMissingTarget) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-neutral-400 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Không tìm thấy yêu cầu</h2>
        <p className="text-neutral-500 mb-6">Không tìm thấy mã giao dịch hoặc yêu cầu thanh toán hợp lệ trong phiên của bạn.</p>
        <Button onClick={() => navigate("/app/consultations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
        </Button>
      </div>
    )
  }

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Không có giao dịch</h2>
        <p className="text-neutral-500 mb-6">Chưa có giao dịch thanh toán nào được ghi nhận cho yêu cầu này.</p>
        <Button onClick={() => navigate("/app/consultations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
        </Button>
      </div>
    )
  }

  if (errorText) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">{errorText}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
          </Button>
          <Button onClick={() => navigate("/app/consultations")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </div>
      </div>
    )
  }

  // RENEWAL PAYMENT VIEW
  if (isRenewal) {
    // Authoritative backend renewal status takes priority over webhook delay
    const status = renewalInfo?.status === "REQUIRES_REVIEW"
      ? "REQUIRES_REVIEW"
      : renewalInfo?.status === "PAID"
        ? "PAID"
        : renewalAttempt?.status || renewalInfo?.status

    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto p-4">
        {status === "PAID" && (
          <>
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2">Gia hạn thành công!</h2>
            {renewalAttempt && (
              <p className="text-emerald-700/80 dark:text-emerald-400/80 mb-2">
                Mã giao dịch #{renewalAttempt.orderCode} &bull; Số tiền: {renewalAttempt.amount?.toLocaleString("vi-VN")} {renewalAttempt.currency || "VND"}
              </p>
            )}
            <p className="text-muted-foreground text-xs mb-8">
              Thời hạn chăm sóc của bạn đã được nối dài thành công cùng bác sĩ phụ trách. Toàn bộ dữ liệu trao đổi và hồ sơ theo dõi được giữ nguyên vẹn.
            </p>
            <Button onClick={handleBackToConsultations} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Quay lại phiên tư vấn
            </Button>
          </>
        )}

        {status === "PENDING" && (
          <>
            <Clock className="h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-2">Đang xác nhận thanh toán gia hạn</h2>
            <p className="text-blue-700/80 dark:text-blue-400/80 mb-8">Vui lòng chờ trong giây lát. Hệ thống đang đồng bộ giao dịch từ PayOS.</p>
            <Button onClick={handleRefresh} variant="outline" className="w-full mb-3 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
              <RefreshCw className="mr-2 h-4 w-4" /> Làm mới trạng thái
            </Button>
            <Button variant="ghost" onClick={() => navigate("/app/consultations")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại sau
            </Button>
          </>
        )}

        {status === "EXPIRED" && (
          <>
            <Clock className="h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-300 mb-2">Thanh toán gia hạn đã hết hạn</h2>
            <p className="text-orange-700/80 dark:text-orange-400/80 mb-8">Thời hạn thanh toán cho yêu cầu gia hạn đã kết thúc. Bạn có thể gửi lại yêu cầu gia hạn mới nếu phiên vẫn còn hoạt động.</p>
            <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về phiên tư vấn
            </Button>
          </>
        )}

        {status === "CANCELLED" && (
          <>
            <XCircle className="h-16 w-16 text-neutral-500 mb-4" />
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-300 mb-2">Gia hạn đã bị hủy</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">Yêu cầu gia hạn hoặc giao dịch thanh toán đã bị hủy. Thời hạn phiên chăm sóc hiện tại không đổi.</p>
            <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về phiên tư vấn
            </Button>
          </>
        )}

        {status === "FAILED" && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-2">Thanh toán gia hạn thất bại</h2>
            <p className="text-red-700/80 dark:text-red-400/80 mb-8">Đã xảy ra lỗi trong quá trình xử lý giao dịch. Vui lòng thử lại sau.</p>
            <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về phiên tư vấn
            </Button>
          </>
        )}

        {status === "REQUIRES_REVIEW" && (
          <>
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mb-2">Thanh toán cần được kiểm tra</h2>
            <p className="text-yellow-700/80 dark:text-yellow-400/80 mb-8">
              Giao dịch thanh toán gia hạn đã được ghi nhận nhưng cần điều phối viên kiểm tra thủ công. Thời hạn phiên sẽ được cập nhật sau khi hoàn tất xác thực.
            </p>
            <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Về phiên tư vấn
            </Button>
          </>
        )}
      </div>
    )
  }

  // INITIAL CONSULTATION PAYMENT VIEW
  if (!initialPayment) return null

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto p-4">
      {initialPayment.status === "PAID" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mb-2">Thanh toán thành công!</h2>
          <p className="text-emerald-700/80 dark:text-emerald-400/80 mb-2">
            Mã giao dịch #{initialPayment.orderCode} &bull; Số tiền: {initialPayment.amount?.toLocaleString("vi-VN")} {initialPayment.currency || "VND"}
          </p>
          <p className="text-muted-foreground text-xs mb-8">
            Phiên tư vấn đã được kích hoạt thành công. Bác sĩ đã được phân công và sẵn sàng hỗ trợ bạn.
          </p>
          <Button onClick={handleBackToConsultations} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Xem phiên tư vấn của tôi
          </Button>
        </>
      )}

      {initialPayment.status === "PENDING" && (
        <>
          <Clock className="h-16 w-16 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-2">Đang xác nhận thanh toán</h2>
          <p className="text-blue-700/80 dark:text-blue-400/80 mb-8">Vui lòng chờ trong giây lát. Hệ thống đang đồng bộ giao dịch từ cổng thanh toán.</p>
          <Button onClick={handleRefresh} variant="outline" className="w-full mb-3 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới trạng thái
          </Button>
          <Button variant="ghost" onClick={() => navigate("/app/consultations")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại sau
          </Button>
        </>
      )}

      {initialPayment.status === "EXPIRED" && (
        <>
          <Clock className="h-16 w-16 text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-300 mb-2">Thanh toán đã hết hạn</h2>
          <p className="text-orange-700/80 dark:text-orange-400/80 mb-8">Thời hạn thanh toán cho yêu cầu này đã kết thúc. Vui lòng tạo lại yêu cầu nếu cần.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {initialPayment.status === "CANCELLED" && (
        <>
          <XCircle className="h-16 w-16 text-neutral-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-300 mb-2">Thanh toán đã bị hủy</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">Giao dịch đã bị hủy bởi người dùng hoặc hệ thống thanh toán.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {initialPayment.status === "FAILED" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-2">Thanh toán thất bại</h2>
          <p className="text-red-700/80 dark:text-red-400/80 mb-8">Đã có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại sau.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {initialPayment.status === "REQUIRES_REVIEW" && (
        <>
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mb-2">Thanh toán cần được kiểm tra</h2>
          <p className="text-yellow-700/80 dark:text-yellow-400/80 mb-8">Giao dịch đang cần kiểm tra thủ công. Vui lòng liên hệ bộ phận hỗ trợ.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}
    </div>
  )
}
