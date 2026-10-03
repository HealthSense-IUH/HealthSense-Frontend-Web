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
import { useTranslation } from "react-i18next"

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
import { currentIntlLocale } from "@/lib/i18n"
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
  const { t } = useTranslation("health")
  if (!episode) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-success-600 hover:bg-success-700 text-white">{t("careHistory.status.active")}</Badge>
      case "COMPLETED":
        return <Badge className="bg-primary-600 hover:bg-primary-700 text-white">{t("careHistory.status.completed")}</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">{t("careHistory.status.cancelled")}</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">{t("careHistory.status.scheduled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (val?: string | null) => {
    if (!val) return t("careHistory.undetermined")
    try {
      return new Date(val).toLocaleString(currentIntlLocale(), {
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
                {t("careHistory.detail.title", { id: episode.sessionId })}
              </DialogTitle>
            </div>
            {getStatusBadge(episode.status)}
          </div>
          <DialogDescription>
            {t("careHistory.detail.attendingDoctor")} <span className="font-semibold text-foreground">{episode.doctorName || t("careHistory.doctorFallback", { id: episode.doctorId })}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t("careHistory.detail.tabs.overview")}</TabsTrigger>
              <TabsTrigger value="summary">{t("careHistory.detail.tabs.summary")}</TabsTrigger>
              <TabsTrigger value="records">{t("careHistory.detail.tabs.records", { count: episode.authorizedHealthRecords?.length || 0 })}</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="m-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Package className="h-4 w-4 text-primary" />
                    {t("careHistory.detail.package")}
                  </div>
                  <p className="font-medium text-foreground">
                    {episode.packageNameSnapshot || t("careHistory.detail.defaultPackageName")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("careHistory.detail.packageCode")} <span className="font-mono">{episode.packageCodeSnapshot || "N/A"}</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-primary" />
                    {t("careHistory.detail.carePeriod")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("careHistory.detail.startedAt")} <span className="font-medium text-foreground">{formatDate(episode.startedAt)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("careHistory.detail.endsAt")} <span className="font-medium text-foreground">{formatDate(episode.endsAt)}</span>
                  </p>
                  {episode.completedAt && (
                    <p className="text-xs text-muted-foreground">
                      {t("careHistory.detail.completedAt")} <span className="font-medium text-foreground">{formatDate(episode.completedAt)}</span>
                    </p>
                  )}
                </div>
              </div>

              {episode.closureStatus && (
                <div className="p-4 rounded-xl border bg-slate-50 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">{t("careHistory.detail.closureStatus")}</span>
                  <Badge variant="outline">{episode.closureStatus}</Badge>
                </div>
              )}
            </TabsContent>

            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="m-0 space-y-4">
              {finalSummary ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border bg-primary-50/50 border-primary-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary-800">
                      <FileText className="h-4 w-4" />
                      {t("careHistory.detail.summary.general")}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {finalSummary.summary}
                    </p>
                  </div>

                  {finalSummary.observations && (
                    <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase">
                        {t("careHistory.detail.summary.observations")}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.observations}
                      </p>
                    </div>
                  )}

                  {finalSummary.recommendations && (
                    <div className="p-4 rounded-xl border bg-success-50/50 border-success-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-success-800">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("careHistory.detail.summary.recommendations")}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.recommendations}
                      </p>
                    </div>
                  )}

                  {finalSummary.followUpRecommendation && (
                    <div className="p-4 rounded-xl border bg-warning-50/50 border-warning-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-warning-800">
                        <Calendar className="h-4 w-4" />
                        {t("careHistory.detail.summary.followUp")}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {finalSummary.followUpRecommendation}
                      </p>
                    </div>
                  )}

                  {finalSummary.addenda && finalSummary.addenda.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("careHistory.detail.summary.addenda", { count: finalSummary.addenda.length })}
                      </h4>
                      {finalSummary.addenda.map((addendum) => (
                        <div key={addendum.id ?? `${addendum.createdAt}-${addendum.reason}`} className="p-3 rounded-lg border bg-muted/40 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="font-semibold text-foreground">{t("careHistory.detail.summary.reason", { reason: addendum.reason })}</span>
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
                  <p className="text-sm font-medium">{t("careHistory.detail.summary.emptyTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("careHistory.detail.summary.emptyDescription")}</p>
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
                        <div className="h-8 w-8 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center font-bold">
                          <HeartPulse className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {rec.originalFileName || t("careHistory.detail.records.fallbackName", { id: rec.id })}
                          </p>
                          <p className="text-muted-foreground">
                            {t("careHistory.detail.records.measuredAt", { date: formatDate(rec.createdAt) })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{rec.predictionLabel || rec.status || t("careHistory.detail.records.saved")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <XCircle className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium">{t("careHistory.detail.records.empty")}</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:actions.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
