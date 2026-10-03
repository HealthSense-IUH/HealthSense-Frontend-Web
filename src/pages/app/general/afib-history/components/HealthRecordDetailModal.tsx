import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Clock,
  FileText,
  X,
  Download,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  getPredictionMeta, 
  formatHrvNumber, 
  formatRecordDate 
} from "@/lib"
import { healthRecordApi } from "@/services"
import type { MemberHealthRecord } from "@/types/health-record"
import { MeasurementVisuals } from "./MeasurementVisuals"

interface HealthRecordDetailModalProps {
  record: MemberHealthRecord | null
  isOpen: boolean
  onClose: () => void
}

export function HealthRecordDetailModal({ record, isOpen, onClose }: HealthRecordDetailModalProps) {
  const { t } = useTranslation("health")
  const { toast } = useToast()
  const [downloading, setDownloading] = useState(false)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !record) return null

  const meta = getPredictionMeta(record.predictionLabel, record.status)
  const features = record.hrvFeatures || {}

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full bg-white rounded-2xl p-6 sm:p-6 flex flex-col gap-6 shadow-xl border border-border max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {t("recordDetail.title")}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t("recordDetail.measuredAt", { date: formatRecordDate(record.createdAt) })}</span>
              <span>•</span>
              <span>{t("recordDetail.file", { name: record.fileName })}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnosis Assessment */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">{t("recordDetail.aiConclusion")}</span>
              <span className={`inline-flex items-center justify-center w-32 py-1 rounded-full text-xs font-bold border shadow-xs ${meta.badgeClass}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {meta.advice}
            </p>
          </div>

          {record.confidence !== undefined && record.confidence !== null && (
            <div className="shrink-0 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <span className="text-xs text-muted-foreground block">{t("recordDetail.afibProbability")}</span>
              <span className="text-lg font-bold text-foreground">{(record.confidence * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Waveform + Poincaré + SQI */}
        <MeasurementVisuals features={features} />

        {/* 4 Core Physiological Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-medium block">{t("recordDetail.avgHeartRate")}</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {features.HR_mean ? formatHrvNumber(features.HR_mean, 0) : "--"}{" "}
              <span className="text-xs font-normal text-muted-foreground">BPM</span>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">60 - 100 BPM</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-medium block">SDNN</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {features.SDNN ? formatHrvNumber(features.SDNN, 1) : "--"}{" "}
              <span className="text-xs font-normal text-muted-foreground">ms</span>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">30 - 100 ms</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-medium block">RMSSD</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {features.RMSSD ? formatHrvNumber(features.RMSSD, 1) : "--"}{" "}
              <span className="text-xs font-normal text-muted-foreground">ms</span>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">20 - 50 ms</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-border">
            <span className="text-xs text-muted-foreground font-medium block">{t("recordDetail.lfHfRatio")}</span>
            <div className="text-xl font-bold text-foreground mt-1">
              {features.LF_HF_Ratio ? formatHrvNumber(features.LF_HF_Ratio, 2) : "--"}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">0.5 - 2.0</span>
          </div>
        </div>

        {/* Detailed HRV Features Table */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            {t("recordDetail.hrvTitle")}
          </h4>

          <div className="rounded-2xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border font-semibold text-muted-foreground">
                  <th className="py-2.5 px-4">{t("recordDetail.table.metric")}</th>
                  <th className="py-2.5 px-4 text-right sm:text-left">{t("recordDetail.table.value")}</th>
                  <th className="py-2.5 px-4 hidden md:table-cell">{t("recordDetail.table.referenceRange")}</th>
                  <th className="py-2.5 px-4 hidden sm:table-cell">{t("recordDetail.table.meaning")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-normal text-foreground">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">Mean_NN</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.Mean_NN, 1)} ms
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">600 - 1200 ms</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.meanNn")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">SDNN</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.SDNN, 1)} ms
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">30 - 100 ms</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.sdnn")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">RMSSD</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.RMSSD, 1)} ms
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">20 - 50 ms</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.rmssd")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">pNN50</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.pNN50, 1)}%
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">3% - 30%</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.pnn50")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">CV</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.CV, 4)}
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">0.05 - 0.15</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.cv")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">LF</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.LF, 3)}
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">0.04 - 0.15 Hz</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.lf")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">HF</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.HF, 3)}
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">0.15 - 0.40 Hz</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.hf")}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2 px-4 font-semibold">{t("recordDetail.lfHfRatio")}</td>
                  <td className="py-2 px-4 text-right sm:text-left font-medium">
                    {formatHrvNumber(features.LF_HF_Ratio, 2)}
                  </td>
                  <td className="py-2 px-4 text-muted-foreground hidden md:table-cell">0.5 - 2.0</td>
                  <td className="py-2 px-4 text-muted-foreground hidden sm:table-cell">
                    {t("recordDetail.meaning.lfHf")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>{t("recordDetail.fileSize", { size: formatHrvNumber(record.fileSize ? record.fileSize / 1024 : 0, 1) })}</span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={downloading}
              onClick={async () => {
                try {
                  setDownloading(true)
                  const res = await healthRecordApi.getDownloadUrl(record.id)
                  const downloadUrl = res.data?.uploadUrl
                  if (!downloadUrl) {
                    toast({ variant: "destructive", title: t("common:toast.error"), description: t("recordDetail.downloadUrlNotFound") })
                    return
                  }
                  const link = document.createElement("a")
                  link.href = downloadUrl
                  link.download = record.fileName || `health-record-${record.id}.csv`
                  link.target = "_blank"
                  link.rel = "noopener noreferrer"
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                } catch {
                  toast({ variant: "destructive", title: t("common:toast.error"), description: t("recordDetail.downloadUrlFailed") })
                } finally {
                  setDownloading(false)
                }
              }}
              className="h-9 px-3 rounded-xl border-border text-foreground font-medium text-xs cursor-pointer"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> {t("recordDetail.downloading")}
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> {t("recordDetail.downloadCsv")}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="h-9 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs cursor-pointer shadow-xs"
            >
              {t("common:actions.close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
