import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { consultationApi } from "../services/consultation-api"
import type { ConsultationPaymentResponse } from "../types"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export default function PaymentResultPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [payment, setPayment] = useState<ConsultationPaymentResponse | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)
  const isMissingRequestId = useRef(false)
  const isNotFound = useRef(false)

  const fetchPaymentStatus = async (reqId: string) => {
    try {
      setLoading(true)
      setErrorText(null)
      const response = await consultationApi.getConsultationPayment(reqId)
      const data = response.data
      setPayment(data)
      
      // Clear localStorage if not pending
      if (data.status !== "PENDING") {
        localStorage.removeItem("healthsense.pendingPaymentRequestId")
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        isNotFound.current = true
        localStorage.removeItem("healthsense.pendingPaymentRequestId")
      } else {
        setErrorText(readError(error, "Lỗi kiểm tra trạng thái thanh toán."))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const requestId = localStorage.getItem("healthsense.pendingPaymentRequestId")
    if (!requestId) {
      isMissingRequestId.current = true
      setLoading(false)
      return
    }
    void fetchPaymentStatus(requestId)
  }, [])

  const handleRefresh = () => {
    const requestId = localStorage.getItem("healthsense.pendingPaymentRequestId") || payment?.requestId
    if (requestId) {
      void fetchPaymentStatus(String(requestId))
    }
  }

  const handleBackToConsultations = () => {
    navigate("/app/consultations?tab=sessions")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 text-neutral-400 animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Đang kiểm tra giao dịch...</p>
      </div>
    )
  }

  if (isMissingRequestId.current) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
        <ShieldAlert className="h-12 w-12 text-neutral-400 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Không tìm thấy yêu cầu</h2>
        <p className="text-neutral-500 mb-6">Không tìm thấy yêu cầu thanh toán đang chờ trong phiên của bạn.</p>
        <Button onClick={() => navigate("/app/consultations")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
        </Button>
      </div>
    )
  }

  if (isNotFound.current) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Không có giao dịch</h2>
        <p className="text-neutral-500 mb-6">Chưa có giao dịch thanh toán cho yêu cầu này.</p>
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
        <h2 className="text-xl font-bold text-red-900 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-neutral-600 mb-6">{errorText}</p>
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

  if (!payment) return null

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center max-w-md mx-auto">
      {payment.status === "PAID" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-emerald-700/80 mb-8">Phiên tư vấn đã được kích hoạt. Bác sĩ sẽ sớm liên hệ với bạn.</p>
          <Button onClick={handleBackToConsultations} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Xem phiên tư vấn
          </Button>
        </>
      )}

      {payment.status === "PENDING" && (
        <>
          <Clock className="h-16 w-16 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Đang xác nhận thanh toán</h2>
          <p className="text-blue-700/80 mb-8">Vui lòng chờ trong giây lát. Hệ thống đang ghi nhận giao dịch của bạn.</p>
          <Button onClick={handleRefresh} variant="outline" className="w-full mb-3 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới trạng thái
          </Button>
          <Button variant="ghost" onClick={() => navigate("/app/consultations")} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại sau
          </Button>
        </>
      )}

      {payment.status === "EXPIRED" && (
        <>
          <Clock className="h-16 w-16 text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold text-orange-900 mb-2">Thanh toán đã hết hạn</h2>
          <p className="text-orange-700/80 mb-8">Thời gian thanh toán cho yêu cầu này đã kết thúc. Vui lòng tạo lại yêu cầu nếu cần.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {payment.status === "CANCELLED" && (
        <>
          <XCircle className="h-16 w-16 text-neutral-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Thanh toán đã bị hủy</h2>
          <p className="text-neutral-600 mb-8">Giao dịch đã bị hủy bởi người dùng hoặc hệ thống.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {payment.status === "FAILED" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Thanh toán thất bại</h2>
          <p className="text-red-700/80 mb-8">Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}

      {payment.status === "REQUIRES_REVIEW" && (
        <>
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Thanh toán cần được kiểm tra</h2>
          <p className="text-yellow-700/80 mb-8">Giao dịch cần được kiểm tra thủ công. Vui lòng liên hệ bộ phận hỗ trợ.</p>
          <Button onClick={() => navigate("/app/consultations")} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Quản lý Tư vấn
          </Button>
        </>
      )}
    </div>
  )
}
