import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { History, FileText, AlertCircle, RefreshCw, CheckCircle2, Stethoscope, Package, Calendar, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import i18n from "@/lib/i18n"
import { consultationApi } from "@/services"
import type { CareContinuitySummaryResponse } from "@/types/consultation"
import { formatDate } from "./shared"

interface DoctorContinuityTabProps {
  sessionId: string | number
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return i18n.t("consultation:continuityTab.errors.forbidden")
  return err.response?.data?.message || err.message || fallback
}

export function DoctorContinuityTab({ sessionId }: DoctorContinuityTabProps) {
  const { t } = useTranslation("consultation")
  const [summaries, setSummaries] = useState<CareContinuitySummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }))
  }

  const fetchContinuity = () => {
    setLoading(true)
    setErrorMsg(null)
    consultationApi
      .getDoctorContinuitySummaries(sessionId)
      .then((res) => {
        console.log("[Continuity Summaries Response]", res.data)
        setSummaries(res.data || [])
      })
      .catch((err) => {
        setErrorMsg(readError(err, t("continuityTab.errors.loadFailed")))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchContinuity()
  }, [sessionId])

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger-500 mb-2" />
        <p className="text-danger-700 font-medium text-sm">{errorMsg}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchContinuity}>
          {t("continuityTab.retry")}
        </Button>
      </div>
    )
  }

  const pastSummaries = summaries.filter((item) => String(item.sessionId) !== String(sessionId))

  if (pastSummaries.length === 0) {
    return (
      <div className="py-12 text-center">
        <History className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium text-sm">{t("continuityTab.empty.title")}</p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          {t("continuityTab.empty.description")}
        </p>
      </div>
    )
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">
            {t("continuityTab.header.title", { count: pastSummaries.length })}
          </h4>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchContinuity} className="h-8 px-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> {t("continuityTab.refresh")}
        </Button>
      </div>

      <div className="space-y-4">
        {pastSummaries.map((item) => {
          const summaryText = item.finalizedSummary?.summary || item.summary || t("continuityTab.noSummary")
          const observationsText = item.finalizedSummary?.observations || item.observations
          const recommendationsText = item.finalizedSummary?.recommendations || item.recommendations
          const followUpText = item.finalizedSummary?.followUpRecommendation || item.followUpRecommendation
          const finalizedAtDate = item.finalizedSummary?.finalizedAt || item.finalizedAt
          const addendaList = item.finalizedSummary?.addenda || item.addenda || []

          const isExpanded = !!expandedIds[String(item.sessionId)]

          return (
            <Card key={item.sessionId} className="border-border shadow-2xs overflow-hidden transition-all">
              <CardHeader 
                className="p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors select-none"
                onClick={() => toggleExpand(item.sessionId)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span>{t("continuityTab.item.title", { id: item.sessionId })}</span>
                      <Badge variant="outline" className="text-[10px] bg-success-50 text-success-700 border-success-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t("continuityTab.item.completedBadge")}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.startedAt)} &bull; {formatDate(item.completedAt || item.endsAt)}
                      </span>
                      {item.doctorName && (
                        <span className="flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {t("continuityTab.item.doctor", { name: item.doctorName })}
                        </span>
                      )}
                      {item.packageName && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {t("continuityTab.item.package", { name: item.packageName })}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {finalizedAtDate && (
                      <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
                        {t("continuityTab.item.finalizedAt", { date: formatDate(finalizedAtDate) })}
                      </span>
                    )}
                    <div className="p-1 rounded-full text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="p-4 border-t space-y-3 text-xs animate-in fade-in-50 duration-200">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">{t("continuityTab.sections.summary")}</span>
                    <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {summaryText}
                    </p>
                  </div>

                  {observationsText && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">{t("continuityTab.sections.observations")}</span>
                      <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {observationsText}
                      </p>
                    </div>
                  )}

                  {recommendationsText && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">{t("continuityTab.sections.recommendations")}</span>
                      <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {recommendationsText}
                      </p>
                    </div>
                  )}

                  {followUpText && (
                    <div className="space-y-1">
                      <span className="font-semibold text-foreground">{t("continuityTab.sections.followUp")}</span>
                      <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {followUpText}
                      </p>
                    </div>
                  )}

                  {addendaList.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs text-warning-700">
                        <FileText className="w-3.5 h-3.5" />
                        {t("continuityTab.sections.addenda", { count: addendaList.length })}
                      </span>
                      <div className="space-y-2">
                        {addendaList.map((addendum) => (
                          <div key={addendum.id} className="p-2.5 rounded-lg bg-warning-50/50 border border-warning-200/60 text-xs">
                            <div className="flex items-center justify-between font-medium text-warning-900 mb-1">
                              <span>{t("continuityTab.sections.reason", { reason: addendum.reason })}</span>
                              <span className="text-[10px] text-muted-foreground">{formatDate(addendum.createdAt)}</span>
                            </div>
                            <p className="text-foreground/90 whitespace-pre-wrap">{addendum.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
