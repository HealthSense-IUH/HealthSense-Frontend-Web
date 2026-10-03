import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useTranslation } from "react-i18next"
import { UploadCloud, FileText, Loader2, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { healthRecordApi } from "@/services"

interface UploadMeasurementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UploadMeasurementModal({ isOpen, onClose, onSuccess }: UploadMeasurementModalProps) {
  const { t } = useTranslation("health")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUploading) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isUploading, onClose])

  if (!isOpen) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith(".csv") && !file.name.toLowerCase().endsWith(".txt")) {
      setErrorMsg(t("uploadMeasurement.errors.invalidFormat"))
      setSelectedFile(null)
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg(t("uploadMeasurement.errors.tooLarge"))
      setSelectedFile(null)
      return
    }

    setErrorMsg(null)
    setSelectedFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg(t("uploadMeasurement.errors.noFile"))
      return
    }

    setIsUploading(true)
    setErrorMsg(null)

    try {
      await healthRecordApi.uploadDirect(selectedFile)
      toast({
        title: t("uploadMeasurement.success.title"),
        description: t("uploadMeasurement.success.description"),
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || t("uploadMeasurement.errors.uploadFailed"))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 cursor-pointer"
      onClick={() => !isUploading && onClose()}
    >
      <div 
        className="relative max-w-lg w-full bg-white rounded-2xl p-6 sm:p-6 flex flex-col gap-6 shadow-2xl border border-slate-100 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary-50 text-primary-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {t("uploadMeasurement.title")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("uploadMeasurement.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-danger-50 border border-danger-200 text-danger-800 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              selectedFile
                ? "border-primary-500 bg-primary-50/40"
                : "border-slate-200 hover:border-primary-400 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2 text-primary-600">
                <FileText className="w-12 h-12" />
                <span className="font-extrabold text-sm text-slate-900">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-500">
                  {t("uploadMeasurement.selectedHint", { size: (selectedFile.size / 1024).toFixed(1) })}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="p-4 rounded-full bg-primary-50 text-primary-600">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {t("uploadMeasurement.dropzone")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t("uploadMeasurement.supportedFormats")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={onClose}
              className="h-10 rounded-xl border-slate-200 text-xs font-bold"
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-6 shadow-md shadow-primary-500/20 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("uploadMeasurement.uploading")}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>{t("uploadMeasurement.submit")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
