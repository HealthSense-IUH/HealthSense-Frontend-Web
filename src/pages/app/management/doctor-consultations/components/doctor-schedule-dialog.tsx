import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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

// labelKey: khoá i18n trong namespace "management", dịch lúc render
const DAYS_OF_WEEK: { labelKey: string; value: DayOfWeek }[] = [
  { labelKey: "doctorConsultations.scheduleDialog.days.monday", value: "MONDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.tuesday", value: "TUESDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.wednesday", value: "WEDNESDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.thursday", value: "THURSDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.friday", value: "FRIDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.saturday", value: "SATURDAY" },
  { labelKey: "doctorConsultations.scheduleDialog.days.sunday", value: "SUNDAY" },
]

export function DoctorScheduleDialog({
  isOpen,
  onClose,
  onSuccess,
  currentProfile,
}: DoctorScheduleDialogProps) {
  const { t } = useTranslation("management")
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
      return t("doctorConsultations.scheduleDialog.validation.requireSlot")
    }

    // Time format regex: HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

    for (let i = 0; i < weekly.length; i++) {
      const slot = weekly[i]
      if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
        return t("doctorConsultations.scheduleDialog.validation.invalidTimeFormat", { index: i + 1 })
      }
      if (slot.start >= slot.end) {
        return t("doctorConsultations.scheduleDialog.validation.endBeforeStart", { index: i + 1, start: slot.start, end: slot.end })
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
            return t("doctorConsultations.scheduleDialog.validation.overlap", { first: i + 1, second: j + 1, day: weekly[i].dayOfWeek })
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
        title: t("doctorConsultations.scheduleDialog.toast.successTitle"),
        description: t("doctorConsultations.scheduleDialog.toast.successDescription"),
      })
      onSuccess?.()
      onClose()
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { code?: number; message?: string } }; message?: string }
      const errCode = error.response?.data?.code

      if (errCode === 4015) {
        setErrorMessage(t("doctorConsultations.scheduleDialog.errors.invalidSchedule"))
      } else {
        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          t("doctorConsultations.scheduleDialog.errors.updateFailed")
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
            <Calendar className="w-5 h-5 text-primary-600" />
            <DialogTitle>{t("doctorConsultations.scheduleDialog.title")}</DialogTitle>
          </div>
          <DialogDescription>
            {t("doctorConsultations.scheduleDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manager-controlled fields (Read-Only) */}
        {!currentProfile ? (
          <div className="p-4 bg-warning-500/10 border border-warning-300 rounded-xl space-y-2 text-warning-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-warning-600" />
              <span>{t("doctorConsultations.scheduleDialog.noProfile.title")}</span>
            </div>
            <p className="leading-relaxed">
              {t("doctorConsultations.scheduleDialog.noProfile.description")}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-success-600" />
                <span>{t("doctorConsultations.scheduleDialog.managedProfile.title")}</span>
              </div>
              <Badge variant="outline" className="text-slate-500 text-[10px]">{t("doctorConsultations.scheduleDialog.managedProfile.readOnly")}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">{t("doctorConsultations.scheduleDialog.managedProfile.specialty")}</span>
                <strong className="text-slate-800 font-medium">
                  {currentProfile?.specialty || "GENERAL_PRACTICE"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">{t("doctorConsultations.scheduleDialog.managedProfile.oneOnOne")}</span>
                <strong className={currentProfile?.acceptsOneOnOneCare ? "text-success-700 font-medium" : "text-slate-600 font-medium"}>
                  {currentProfile?.acceptsOneOnOneCare ? t("doctorConsultations.scheduleDialog.managedProfile.accepts") : t("doctorConsultations.scheduleDialog.managedProfile.notAccepts")}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">{t("doctorConsultations.scheduleDialog.managedProfile.maxConcurrent")}</span>
                <strong className="text-slate-800 font-medium">
                  {t("doctorConsultations.scheduleDialog.managedProfile.sessionsCount", { count: currentProfile?.maxActiveConsultations ?? 1 })}
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
              <span>{t("doctorConsultations.scheduleDialog.timezone")}</span>
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
                  {t("doctorConsultations.scheduleDialog.weeklySlots.title")}
                </span>
                <span className="text-[11px] text-slate-500">
                  {t("doctorConsultations.scheduleDialog.weeklySlots.hint")}
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
                <span>{t("doctorConsultations.scheduleDialog.weeklySlots.add")}</span>
              </Button>
            </div>

            {weekly.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                {t("doctorConsultations.scheduleDialog.weeklySlots.empty")}
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
                        aria-label={t("doctorConsultations.scheduleDialog.weeklySlots.dayOfWeekAria")}
                        value={slot.dayOfWeek}
                        onChange={(e) => handleUpdateSlot(index, "dayOfWeek", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-800"
                      >
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d.value} value={d.value}>
                            {t(d.labelKey)}
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
                        className="p-1.5 text-slate-400 hover:text-danger-600 rounded-md hover:bg-danger-50 ml-auto sm:ml-0"
                        title={t("doctorConsultations.scheduleDialog.weeklySlots.remove")}
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
              {t("doctorConsultations.scheduleDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="text-xs bg-primary-600 hover:bg-primary-700 text-white"
            >
              {submitting ? t("doctorConsultations.scheduleDialog.saving") : t("doctorConsultations.scheduleDialog.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}