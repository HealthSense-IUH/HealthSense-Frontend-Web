import { useState, useEffect } from "react"
import { Calendar, Clock, Plus, Trash2, Globe, AlertCircle, ShieldCheck } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { consultationApi } from "@/services"
import type {
  DoctorCareProfileResponse,
  DoctorAvailabilitySlot,
  DayOfWeek,
  UpdateDoctorAvailabilityPayload,
} from "@/types/consultation"

interface DoctorScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentProfile: DoctorCareProfileResponse | null
}

const DAYS_OF_WEEK: { label: string; value: DayOfWeek }[] = [
  { label: "Thứ Hai (Monday)", value: "MONDAY" },
  { label: "Thứ Ba (Tuesday)", value: "TUESDAY" },
  { label: "Thứ Tư (Wednesday)", value: "WEDNESDAY" },
  { label: "Thứ Năm (Thursday)", value: "THURSDAY" },
  { label: "Thứ Sáu (Friday)", value: "FRIDAY" },
  { label: "Thứ Bảy (Saturday)", value: "SATURDAY" },
  { label: "Chủ Nhật (Sunday)", value: "SUNDAY" },
]

export function DoctorScheduleDialog({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
}: DoctorScheduleDialogProps) {
  const { toast } = useToast()
  const [weekly, setWeekly] = useState<DoctorAvailabilitySlot[]>([])
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && currentProfile) {
      setWeekly(currentProfile.availability?.weekly ? [...currentProfile.availability.weekly] : [])
      setTimezone(currentProfile.timezone || "Asia/Ho_Chi_Minh")
      setErrorMessage(null)
    }
  }, [isOpen, currentProfile])

  const handleAddSlot = () => {
    setWeekly((prev) => [
      ...prev,
      {
        dayOfWeek: "MONDAY",
        start: "08:00",
        end: "17:00",
      },
    ])
  }

  const handleRemoveSlot = (index: number) => {
    setWeekly((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleUpdateSlot = (index: number, field: keyof DoctorAvailabilitySlot, value: string) => {
    setWeekly((prev) =>
      prev.map((slot, idx) => {
        if (idx !== index) return slot
        return {
          ...slot,
          [field]: value,
        }
      })
    )
  }

  const validateSlots = (): string | null => {
    if (currentProfile?.acceptsOneOnOneCare && weekly.length === 0) {
      return "Bác sĩ đang được cấu hình nhận tư vấn 1-1. Vui lòng thiết lập ít nhất 1 khung giờ trực trong tuần."
    }

    // Time format regex: HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

    for (let i = 0; i < weekly.length; i++) {
      const slot = weekly[i]
      if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
        return `Khung giờ thứ ${i + 1} có định dạng thời gian không hợp lệ (yêu cầu định dạng HH:mm, ví dụ 08:00).`
      }
      if (slot.start >= slot.end) {
        return `Khung giờ thứ ${i + 1} có giờ kết thúc (${slot.end}) phải lớn hơn giờ bắt đầu (${slot.start}).`
      }
    }

    // Check for overlaps on the same day
    for (let i = 0; i < weekly.length; i++) {
      for (let j = i + 1; j < weekly.length; j++) {
        if (weekly[i].dayOfWeek === weekly[j].dayOfWeek) {
          const aStart = weekly[i].start
          const aEnd = weekly[i].end
          const bStart = weekly[j].start
          const bEnd = weekly[j].end

          if (aStart < bEnd && aEnd > bStart) {
            return `Khung giờ thứ ${i + 1} và ${j + 1} bị trùng lặp thời gian trong ngày ${weekly[i].dayOfWeek}.`
          }
        }
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateSlots()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage(null)

      const payload: UpdateDoctorAvailabilityPayload = {
        availability: {
          weekly,
        },
        timezone: timezone.trim() || "Asia/Ho_Chi_Minh",
      }

      await consultationApi.updateMyDoctorAvailability(payload)

      toast({
        title: "Thành công",
        description: "Đã cập nhật lịch trực cá nhân thành công.",
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { code?: number; message?: string } }; message?: string }
      const errCode = error.response?.data?.code

      if (errCode === 4015) {
        setErrorMessage("Lịch hỗ trợ không hợp lệ. Vui lòng kiểm tra múi giờ, thời gian và các khung giờ bị trùng.")
      } else {
        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật lịch trực cá nhân. Vui lòng thử lại."
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <DialogTitle>Quản lý lịch làm việc & Khung giờ trực</DialogTitle>
          </div>
          <DialogDescription>
            Bác sĩ có thể tự chủ động cập nhật các khung giờ sẵn sàng tiếp nhận tư vấn và múi giờ làm việc của mình.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manager-controlled fields (Read-Only) */}
        {!currentProfile ? (
          <div className="p-4 bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-xl space-y-2 text-amber-800 dark:text-amber-300 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Chưa có hồ sơ tiếp nhận tư vấn (Care Profile)</span>
            </div>
            <p className="leading-relaxed">
              Tài khoản Bác sĩ chưa được Quản trị viên khởi tạo hồ sơ điều phối ban đầu trên hệ thống. Vui lòng liên hệ Người quản lý hoặc Điều phối viên để thiết lập Chuyên khoa trước khi lưu lịch trực.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cấu hình hồ sơ chuyên môn do Điều phối viên / Quản trị viên quản lý:</span>
              </div>
              <Badge variant="outline" className="text-slate-500 text-[10px]">Chỉ xem</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Chuyên khoa:</span>
                <strong className="text-slate-800 font-medium">
                  {currentProfile?.specialty || "GENERAL_PRACTICE"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nhận tư vấn 1-1:</span>
                <strong className={currentProfile?.acceptsOneOnOneCare ? "text-emerald-700 font-medium" : "text-slate-600 font-medium"}>
                  {currentProfile?.acceptsOneOnOneCare ? "Có tiếp nhận" : "Không tiếp nhận"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Số ca đồng thời tối đa:</span>
                <strong className="text-slate-800 font-medium">
                  {currentProfile?.maxActiveConsultations ?? 1} ca
                </strong>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Múi giờ (Timezone):</span>
            </label>
            <Input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Ho_Chi_Minh"
              className="text-xs"
              required
            />
          </div>

          {/* Weekly Schedule Slots */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">
                  Khung giờ trực hàng tuần:
                </span>
                <span className="text-[11px] text-slate-500">
                  Hệ thống chỉ điều phối bệnh nhân vào các khung giờ này khi bác sĩ bật trực.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddSlot}
                className="h-8 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm khung giờ</span>
              </Button>
            </div>

            {weekly.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                Chưa cấu hình khung giờ nào. Bác sĩ sẽ không được điều phối tự động nếu không có lịch trực.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {weekly.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <select
                        aria-label="Thứ trong tuần"
                        value={slot.dayOfWeek}
                        onChange={(e) => handleUpdateSlot(index, "dayOfWeek", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-800"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => handleUpdateSlot(index, "start", e.target.value)}
                          className="w-24 h-8 text-xs bg-white"
                          required
                        />
                      </div>
                      <span className="text-slate-400">-</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleUpdateSlot(index, "end", e.target.value)}
                        className="w-24 h-8 text-xs bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 ml-auto sm:ml-0"
                        title="Xóa khung giờ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}