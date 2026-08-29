import { useEffect, useState } from "react"
import { History, FileText, AlertCircle, RefreshCw, CheckCircle2, Stethoscope, Package, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { consultationApi } from "../services/consultation-api"
import type { CareContinuitySummaryResponse } from "../types"
import { formatDate } from "./shared"

interface DoctorContinuityTabProps {
  sessionId: string | number
}

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
  if (err.response?.status === 403) return "Bạn không có quyền xem tóm tắt chăm sóc liên tục cho phiên này."
  return err.response?.data?.message || err.message || fallback
}

export function DoctorContinuityTab({ sessionId }: DoctorContinuityTabProps) {
  const [summaries, setSummaries] = useState<CareContinuitySummaryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchContinuity = () => {
    setLoading(true)
    setErrorMsg(null)
    consultationApi
      .getDoctorContinuitySummaries(sessionId)
      .then((res) => {
        setSummaries(res.data || [])
      })
      .catch((err) => {
        setErrorMsg(readError(err, "Không thể tải tóm tắt liên tục chăm sóc."))
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
        <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-700 font-medium text-sm">{errorMsg}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchContinuity}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (summaries.length === 0) {
    return (
      <div className="py-12 text-center">
        <History className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground font-medium text-sm">Chưa có lịch sử chăm sóc trước đây cho bệnh nhân này.</p>
        <p className="text-muted-foreground/70 text-xs mt-1">
          Các bản tổng kết chăm sóc đã hoàn tất từ các đợt khám trước sẽ hiển thị tại đây để phục vụ theo dõi liên tục.
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
            Lịch sử chăm sóc trước ({summaries.length} đợt khám)
          </h4>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchContinuity} className="h-8 px-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Làm mới
        </Button>
      </div>

      <div className="space-y-4">
        {summaries.map((item, idx) => (
          <Card key={item.sessionId || idx} className="border-border shadow-2xs">
            <CardHeader className="p-4 pb-3 bg-muted/20 border-b">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>Đợt chăm sóc #{item.sessionId}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Đã hoàn tất
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
                        Bác sĩ: {item.doctorName}
                      </span>
                    )}
                    {item.packageName && (
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Gói: {item.packageName}
                      </span>
                    )}
                  </CardDescription>
                </div>
                {item.finalizedAt && (
                  <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                    Hoàn tất: {formatDate(item.finalizedAt)}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Tổng kết y tế:</span>
                <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {item.summary || "Không có tóm tắt"}
                </p>
              </div>

              {item.observations && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Ghi nhận / Triệu chứng:</span>
                  <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.observations}
                  </p>
                </div>
              )}

              {item.recommendations && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Khuyến nghị điều trị & lối sống:</span>
                  <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.recommendations}
                  </p>
                </div>
              )}

              {item.followUpRecommendation && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Kế hoạch tái khám / Theo dõi tiếp theo:</span>
                  <p className="p-2.5 rounded-lg bg-muted/30 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {item.followUpRecommendation}
                  </p>
                </div>
              )}

              {item.addenda && item.addenda.length > 0 && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                    <FileText className="w-3.5 h-3.5" />
                    Phụ lục & Đính chính sau hoàn tất ({item.addenda.length}):
                  </span>
                  <div className="space-y-2">
                    {item.addenda.map((addendum) => (
                      <div key={addendum.id} className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                        <div className="flex items-center justify-between font-medium text-amber-900 dark:text-amber-300 mb-1">
                          <span>Lý do: {addendum.reason}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(addendum.createdAt)}</span>
                        </div>
                        <p className="text-foreground/90 whitespace-pre-wrap">{addendum.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
