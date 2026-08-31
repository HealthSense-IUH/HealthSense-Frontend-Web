import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react"
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
      setErrorMsg("Vui lòng chọn file dữ liệu định dạng CSV (.csv) hoặc TXT.")
      setSelectedFile(null)
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Kích thước file không được vượt quá 20MB.")
      setSelectedFile(null)
      return
    }

    setErrorMsg(null)
    setSelectedFile(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setErrorMsg("Vui lòng chọn một file dữ liệu đo.")
      return
    }

    setIsUploading(true)
    setErrorMsg(null)

    try {
      await healthRecordApi.uploadDirect(selectedFile)
      toast({
        title: "Tải lên thành công!",
        description: "Bản ghi đo đã được gửi lên hệ thống và đang được AI phân tích.",
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      setErrorMsg(anyErr?.response?.data?.message || anyErr?.message || "Không thể tải lên file đo.")
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
        className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl border border-slate-100 dark:border-slate-800 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Tải lên Bản ghi Đo Mới
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hỗ trợ file CSV chứa tín hiệu PPG / Nhịp tim
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              selectedFile
                ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
                : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30"
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
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <FileText className="w-12 h-12" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB - Bấm để chọn file khác
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Bấm để chọn file hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Định dạng hỗ trợ: .CSV (Tối đa 20MB)
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
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Bắt đầu Phân tích AI</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
