import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  Package,
  Stethoscope,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CareHistoryEpisodeResponse } from "@/types/consultation"

interface CareHistoryDetailDialogProps {
  episode: CareHistoryEpisodeResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CareHistoryDetailDialog({
  episode,
  open,
  onOpenChange,
}: CareHistoryDetailDialogProps) {
  if (!episode) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Đang diễn ra</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Đã hoàn thành</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Đã hủy</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">Đã lên lịch</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (val?: string | null) => {
    if (!val) return "Chưa xác định"
    try {
      return new Date(val).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return String(val)
    }
  }

  const finalSummary = episode.finalSummary

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">
                Chi tiết Đợt Chăm sóc #{episode.sessionId}
              </DialogTitle>
            </div>
            {getStatusBadge(episode.status)}
          </div>
          <DialogDescription>
            Bác sĩ phụ trách: <span className="font-semibold text-foreground">{episode.doctorName || `Bác sĩ #${episode.doctorId}`}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="summary">Tổng kết Y khoa</TabsTrigger>
              <TabsTrigger value="records">Hồ sơ đã chia sẻ ({episode.authorizedHealthRecords?.length || 0})</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Package className="h-4 w-4 text-primary" />
                    Gói dịch vụ
                  </div>
                  <p className="font-medium text-foreground">
                    {episode.packageNameSnapshot || "Gói tư vấn cơ bản"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mã gói: <span className="font-mono">{episode.packageCodeSnapshot || "N/A"}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-primary" />
                    Thời gian chăm sóc
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bắt đầu: <span className="font-medium text-foreground">{formatDate(episode.startedAt)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kết thúc: <span className="font-medium text-foreground">{formatDate(episode.endsAt)}</span>
                  </p>
                  {episode.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      Hoàn tất: <span className="font-medium text-foreground">{formatDate(episode.completedAt)}</span>
                    </p>
                  )}
                </div>
              </div>

              {episode.closureStatus && (
                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/40 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Trạng thái đóng hồ sơ:</span>
                  <Badge variant="outline">{episode.closureStatus}</Badge>
                </div>
              )}
            </TabsContent>

            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="m-0 space-y-4">
              {finalSummary ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                      <FileText className="h-4 w-4" />
                      Tóm tắt chung
                    </div>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {finalSummary.summary}
                    </p>
                  </div>

                  {finalSummary.observations && (
                    <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        Quan sát & Đánh giá lâm sàng
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.observations}
                      </p>
                    </div>
                  )}

                  {finalSummary.recommendations && (
                    <div className="p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Khuyến nghị điều trị & Lối sống
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.recommendations}
                      </p>
                    </div>
                  )}

                  {finalSummary.followUpRecommendation && (
                    <div className="p-4 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <Calendar className="h-4 w-4" />
                        Kế hoạch tái khám / Theo dõi
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.followUpRecommendation}
                      </p>
                    </div>
                  )}

                  {finalSummary.addenda && finalSummary.addenda.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Phụ lục bổ sung ({finalSummary.addenda.length})
                      </h4>
                      {finalSummary.addenda.map((addendum, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-muted/40 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-semibold text-foreground">Lý do: {addendum.reason}</span>
                            <span>{formatDate(addendum.createdAt)}</span>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{addendum.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium">Chưa có tổng kết y khoa chính thức cho đợt chăm sóc này.</p>
                  <p className="text-xs text-muted-foreground">Tổng kết sẽ được bác sĩ phụ trách hoàn tất sau khi phiên kết thúc.</p>
                </div>
              )}
            </TabsContent>

            {/* RECORDS TAB */}
            <TabsContent value="records" className="m-0 space-y-3">
              {episode.authorizedHealthRecords && episode.authorizedHealthRecords.length > 0 ? (
                <div className="space-y-2">
                  {episode.authorizedHealthRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                          <HeartPulse className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {rec.originalFileName || `Hồ sơ #${rec.id}`}
                          </p>
                          <p className="text-muted-foreground">
                            Ngày đo: {formatDate(rec.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{rec.predictionLabel || rec.status || "Đã lưu"}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <XCircle className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium">Không có hồ sơ nào được chia sẻ trong đợt này.</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
