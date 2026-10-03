import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ShieldAlert, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import i18n, { currentIntlLocale } from "@/lib/i18n"
import { consultationApi } from "@/services"
import type { ConsultationPaymentResponse, ConsultationPaymentAttemptItem, ConsultationRenewalResponse } from "@/types/consultation"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export default function PaymentResultPage() {
  const { t } = useTranslation("credits")
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
        setErrorText(readError(error, i18n.t("credits:consultationPaymentResult.errors.checkStatus")))
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
        setErrorText(readError(error, i18n.t("credits:consultationPaymentResult.errors.checkRenewalStatus")))
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
      navigate(`/app/general/consultations/${targetSessionId}`)
    } else {
      navigate("/app/general/consultations?tab=sessions")
    }
  }

  const pageHeader = (
    <PageHeader
      breadcrumbs={[
        { label: t("paymentResult.breadcrumbs.consultations"), to: "/app/general/consultations" },
        { label: t("paymentResult.title") },
      ]}
      title={t("paymentResult.title")}
    />
  )

  if (loading) {
    return (
      <Page>
        {pageHeader}
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">{t("consultationPaymentResult.loading")}</p>
          </div>
        </PageBody>
      </Page>
    )
  }

  if (isMissingTarget) {
    return (
      <Page>
        {pageHeader}
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <ShieldAlert className="h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t("consultationPaymentResult.missingTitle")}</h2>
            <p className="text-slate-500 mb-6">{t("consultationPaymentResult.missingDescription")}</p>
            <Button onClick={() => navigate("/app/general/consultations")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
            </Button>
          </div>
        </PageBody>
      </Page>
    )
  }

  if (isNotFound) {
    return (
      <Page>
        {pageHeader}
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <AlertTriangle className="h-12 w-12 text-warning-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t("consultationPaymentResult.notFoundTitle")}</h2>
            <p className="text-slate-500 mb-6">{t("consultationPaymentResult.notFoundDescription")}</p>
            <Button onClick={() => navigate("/app/general/consultations")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
            </Button>
          </div>
        </PageBody>
      </Page>
    )
  }

  if (errorText) {
    return (
      <Page>
        {pageHeader}
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <XCircle className="h-12 w-12 text-danger-500 mb-4" />
            <h2 className="text-xl font-bold text-danger-900 mb-2">{t("paymentResult.errorTitle")}</h2>
            <p className="text-slate-600 mb-6">{errorText}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" /> {t("shared.retry")}
              </Button>
              <Button onClick={() => navigate("/app/general/consultations")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
              </Button>
            </div>
          </div>
        </PageBody>
      </Page>
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
      <Page>
        {pageHeader}
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center w-full max-w-md">
            {status === "PAID" && (
              <>
                <CheckCircle2 className="h-16 w-16 text-success-500 mb-4" />
                <h2 className="text-2xl font-bold text-success-900 mb-2">{t("consultationPaymentResult.renewal.paidTitle")}</h2>
                {renewalAttempt && (
                  <p className="text-success-700/80 mb-2">
                    {t("consultationPaymentResult.txSummary", { code: renewalAttempt.orderCode, amount: renewalAttempt.amount?.toLocaleString(currentIntlLocale()), currency: renewalAttempt.currency || "VND" })}
                  </p>
                )}
                <p className="text-muted-foreground text-xs mb-8">
                  {t("consultationPaymentResult.renewal.paidDescription")}
                </p>
                <Button onClick={handleBackToConsultations} className="w-full bg-success-600 hover:bg-success-700">
                  {t("consultationPaymentResult.renewal.backToSession")}
                </Button>
              </>
            )}

            {status === "PENDING" && (
              <>
                <Clock className="h-16 w-16 text-primary-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary-900 mb-2">{t("consultationPaymentResult.renewal.pendingTitle")}</h2>
                <p className="text-primary-700/80 mb-8">{t("consultationPaymentResult.renewal.pendingDescription")}</p>
                <Button onClick={handleRefresh} variant="outline" className="w-full mb-3 text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100">
                  <RefreshCw className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.refreshStatus")}
                </Button>
                <Button variant="ghost" onClick={() => navigate("/app/general/consultations")} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.comeBackLater")}
                </Button>
              </>
            )}

            {status === "EXPIRED" && (
              <>
                <Clock className="h-16 w-16 text-warning-500 mb-4" />
                <h2 className="text-2xl font-bold text-warning-900 mb-2">{t("consultationPaymentResult.renewal.expiredTitle")}</h2>
                <p className="text-warning-700/80 mb-8">{t("consultationPaymentResult.renewal.expiredDescription")}</p>
                <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.renewal.toSession")}
                </Button>
              </>
            )}

            {status === "CANCELLED" && (
              <>
                <XCircle className="h-16 w-16 text-slate-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("consultationPaymentResult.renewal.cancelledTitle")}</h2>
                <p className="text-slate-600 mb-8">{t("consultationPaymentResult.renewal.cancelledDescription")}</p>
                <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.renewal.toSession")}
                </Button>
              </>
            )}

            {status === "FAILED" && (
              <>
                <XCircle className="h-16 w-16 text-danger-500 mb-4" />
                <h2 className="text-2xl font-bold text-danger-900 mb-2">{t("consultationPaymentResult.renewal.failedTitle")}</h2>
                <p className="text-danger-700/80 mb-8">{t("consultationPaymentResult.renewal.failedDescription")}</p>
                <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.renewal.toSession")}
                </Button>
              </>
            )}

            {status === "REQUIRES_REVIEW" && (
              <>
                <AlertTriangle className="h-16 w-16 text-warning-500 mb-4" />
                <h2 className="text-2xl font-bold text-warning-900 mb-2">{t("consultationPaymentResult.reviewTitle")}</h2>
                <p className="text-warning-700/80 mb-8">
                  {t("consultationPaymentResult.renewal.reviewDescription")}
                </p>
                <Button onClick={handleBackToConsultations} variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.renewal.toSession")}
                </Button>
              </>
            )}
          </div>
        </PageBody>
      </Page>
    )
  }

  // INITIAL CONSULTATION PAYMENT VIEW
  if (!initialPayment) return null

  return (
    <Page>
      {pageHeader}
      <PageBody className="items-center justify-center text-center">
        <div className="flex flex-col items-center w-full max-w-md">
          {initialPayment.status === "PAID" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-success-500 mb-4" />
              <h2 className="text-2xl font-bold text-success-900 mb-2">{t("consultationPaymentResult.initial.paidTitle")}</h2>
              <p className="text-success-700/80 mb-2">
                {t("consultationPaymentResult.txSummary", { code: initialPayment.orderCode, amount: initialPayment.amount?.toLocaleString(currentIntlLocale()), currency: initialPayment.currency || "VND" })}
              </p>
              <p className="text-muted-foreground text-xs mb-8">
                {t("consultationPaymentResult.initial.paidDescription")}
              </p>
              <Button onClick={handleBackToConsultations} className="w-full bg-success-600 hover:bg-success-700">
                {t("consultationPaymentResult.initial.viewMySessions")}
              </Button>
            </>
          )}

          {initialPayment.status === "PENDING" && (
            <>
              <Clock className="h-16 w-16 text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-primary-900 mb-2">{t("consultationPaymentResult.initial.pendingTitle")}</h2>
              <p className="text-primary-700/80 mb-8">{t("consultationPaymentResult.initial.pendingDescription")}</p>
              <Button onClick={handleRefresh} variant="outline" className="w-full mb-3 text-primary-600 border-primary-200 bg-primary-50 hover:bg-primary-100">
                <RefreshCw className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.refreshStatus")}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/app/general/consultations")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.comeBackLater")}
              </Button>
            </>
          )}

          {initialPayment.status === "EXPIRED" && (
            <>
              <Clock className="h-16 w-16 text-warning-500 mb-4" />
              <h2 className="text-2xl font-bold text-warning-900 mb-2">{t("consultationPaymentResult.initial.expiredTitle")}</h2>
              <p className="text-warning-700/80 mb-8">{t("consultationPaymentResult.initial.expiredDescription")}</p>
              <Button onClick={() => navigate("/app/general/consultations")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
              </Button>
            </>
          )}

          {initialPayment.status === "CANCELLED" && (
            <>
              <XCircle className="h-16 w-16 text-slate-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("consultationPaymentResult.initial.cancelledTitle")}</h2>
              <p className="text-slate-600 mb-8">{t("consultationPaymentResult.initial.cancelledDescription")}</p>
              <Button onClick={() => navigate("/app/general/consultations")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
              </Button>
            </>
          )}

          {initialPayment.status === "FAILED" && (
            <>
              <XCircle className="h-16 w-16 text-danger-500 mb-4" />
              <h2 className="text-2xl font-bold text-danger-900 mb-2">{t("consultationPaymentResult.initial.failedTitle")}</h2>
              <p className="text-danger-700/80 mb-8">{t("consultationPaymentResult.initial.failedDescription")}</p>
              <Button onClick={() => navigate("/app/general/consultations")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
              </Button>
            </>
          )}

          {initialPayment.status === "REQUIRES_REVIEW" && (
            <>
              <AlertTriangle className="h-16 w-16 text-warning-500 mb-4" />
              <h2 className="text-2xl font-bold text-warning-900 mb-2">{t("consultationPaymentResult.reviewTitle")}</h2>
              <p className="text-warning-700/80 mb-8">{t("consultationPaymentResult.initial.reviewDescription")}</p>
              <Button onClick={() => navigate("/app/general/consultations")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("consultationPaymentResult.backToConsultations")}
              </Button>
            </>
          )}
        </div>
      </PageBody>
    </Page>
  )
}
