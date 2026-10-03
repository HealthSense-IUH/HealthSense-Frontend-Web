import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

import { consultationApi } from "@/services"
import type { DoctorCareProfilePayload, DoctorAvailabilitySlot, DoctorSpecialty, DayOfWeek } from "@/types/consultation"

const DEFAULT_SLOT: DoctorAvailabilitySlot = {
  dayOfWeek: "MONDAY",
  start: "07:00",
  end: "11:00",
}

export function DoctorCareProfileDialog({
  doctorId,
  open,
  onOpenChange,
  onSuccess,
}: {
  doctorId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<DoctorCareProfilePayload | null>(null)
  
  useEffect(() => {
    if (open && doctorId) {
      setLoading(true)
      consultationApi.getDoctorCareProfile(doctorId)
        .then((res) => {
          let parsedAvailability = res.data.availability
          
          // Fallback to availabilityJson if availability object is missing
          if (!parsedAvailability && res.data.availabilityJson) {
            try {
              parsedAvailability = JSON.parse(res.data.availabilityJson)
            } catch {
              // Ignore parse error
            }
          }

          setProfile({
            specialty: res.data.specialty || "GENERAL_PRACTICE",
            acceptsOneOnOneCare: res.data.acceptsOneOnOneCare,
            maxActiveConsultations: res.data.maxActiveConsultations || 1,
            timezone: res.data.timezone || "Asia/Ho_Chi_Minh",
            availability: parsedAvailability || { weekly: [] }
          })
        })
        .catch((err) => {
          const code = err?.response?.data?.code
          if (code === 4013) {
            // Error code 4013: Doctor care profile not found -> initialize blank form with empty schedule
            setProfile({
              specialty: "GENERAL_PRACTICE",
              acceptsOneOnOneCare: false,
              maxActiveConsultations: 1,
              timezone: "Asia/Ho_Chi_Minh",
              availability: {
                weekly: []
              }
            })
          } else if (code === 4007) {
            toast({
              variant: "destructive",
              title: t("careProfileDialog.toast.invalidAccountTitle"),
              description: err?.response?.data?.message || t("careProfileDialog.toast.invalidAccountDescription"),
            })
            onOpenChange(false)
          } else {
            toast({
              variant: "destructive",
              title: t("careProfileDialog.toast.errorTitle"),
              description: err?.response?.data?.message || t("careProfileDialog.toast.loadError"),
            })
            onOpenChange(false)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setProfile(null)
    }
  }, [open, doctorId, onOpenChange, toast, t])

  const addRow = () => {
    if (!profile) return
    setProfile({
      ...profile,
      availability: {
        weekly: [...profile.availability.weekly, { ...DEFAULT_SLOT }]
      }
    })
  }

  const removeRow = (index: number) => {
    if (!profile) return
    const newWeekly = [...profile.availability.weekly]
    newWeekly.splice(index, 1)
    setProfile({
      ...profile,
      availability: {
        weekly: newWeekly
      }
    })
  }

  const updateRow = (index: number, field: keyof DoctorAvailabilitySlot, value: string) => {
    if (!profile) return
    const newWeekly = [...profile.availability.weekly]
    newWeekly[index] = { ...newWeekly[index], [field]: value }
    setProfile({
      ...profile,
      availability: {
        weekly: newWeekly
      }
    })
  }

  const handleSubmit = async () => {
    if (!doctorId || !profile) return

    // Validation
    if (profile.acceptsOneOnOneCare) {
      if (!profile.specialty) {
        toast({ variant: "destructive", description: t("careProfileDialog.validation.specialtyRequired") })
        return
      }
      if (profile.availability.weekly.length === 0) {
        toast({ variant: "destructive", description: t("careProfileDialog.validation.slotRequired") })
        return
      }
    }

    if (profile.maxActiveConsultations <= 0) {
      toast({ variant: "destructive", description: t("careProfileDialog.validation.maxConsultationsPositive") })
      return
    }

    if (!profile.timezone?.trim()) {
      toast({ variant: "destructive", description: t("careProfileDialog.validation.timezoneRequired") })
      return
    }

    // If acceptsOneOnOneCare is true, at least one slot is required
    if (profile.acceptsOneOnOneCare && profile.availability.weekly.length === 0) {
      toast({
        variant: "destructive",
        description: t("careProfileDialog.validation.slotRequiredWhenAccepting"),
      })
      return
    }

    // Row validation
    for (let i = 0; i < profile.availability.weekly.length; i++) {
      const row = profile.availability.weekly[i]
      if (!row.dayOfWeek || !row.start || !row.end) {
        toast({ variant: "destructive", description: t("careProfileDialog.validation.rowMissingFields", { row: i + 1 }) })
        return
      }
      if (row.start >= row.end) {
        toast({ variant: "destructive", description: t("careProfileDialog.validation.rowStartBeforeEnd", { row: i + 1 }) })
        return
      }
    }

    const DAY_NAMES_VN: Record<string, string> = {
      MONDAY: t("days.monday"),
      TUESDAY: t("days.tuesday"),
      WEDNESDAY: t("days.wednesday"),
      THURSDAY: t("days.thursday"),
      FRIDAY: t("days.friday"),
      SATURDAY: t("days.saturday"),
      SUNDAY: t("days.sunday"),
    }

    // Overlap validation
    for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]) {
      const daySlots = profile.availability.weekly.filter(s => s.dayOfWeek === day)
      // sort by start time
      daySlots.sort((a, b) => a.start.localeCompare(b.start))
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].end > daySlots[i + 1].start) {
          toast({ variant: "destructive", description: t("careProfileDialog.validation.overlap", { day: DAY_NAMES_VN[day] || day }) })
          return
        }
      }
    }

    try {
      setLoading(true)
      await consultationApi.updateDoctorCareProfile(doctorId, profile)
      toast({
        title: t("careProfileDialog.toast.successTitle"),
        description: t("careProfileDialog.toast.successDescription"),
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("careProfileDialog.toast.errorTitle"),
        description: error.response?.data?.message || t("careProfileDialog.toast.updateError"),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("careProfileDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("careProfileDialog.description")}
          </DialogDescription>
        </DialogHeader>
        
        {loading && !profile ? (
          <div className="p-4 text-center text-sm text-muted-foreground">{t("careProfileDialog.loading")}</div>
        ) : profile ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-6 py-4 pr-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <Label className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-semibold text-base">{t("careProfileDialog.acceptsOneOnOneCare")}</span>
                  <span className="font-normal text-xs text-muted-foreground">{t("careProfileDialog.acceptsOneOnOneCareHint")}</span>
                </Label>
                <Switch
                  checked={profile.acceptsOneOnOneCare}
                  onCheckedChange={(c) => setProfile(p => p ? ({ ...p, acceptsOneOnOneCare: c }) : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t("careProfileDialog.specialtyLabel")}</Label>
                  <Select value={profile.specialty} onValueChange={(v: DoctorSpecialty) => setProfile(p => p ? ({ ...p, specialty: v }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL_PRACTICE">{t("careProfileDialog.specialties.generalPractice")}</SelectItem>
                      <SelectItem value="CARDIOLOGY">{t("careProfileDialog.specialties.cardiology")}</SelectItem>
                      <SelectItem value="INTERNAL_MEDICINE">{t("careProfileDialog.specialties.internalMedicine")}</SelectItem>
                      <SelectItem value="OTHER">{t("careProfileDialog.specialties.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t("careProfileDialog.maxConsultationsLabel")}</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={profile.maxActiveConsultations} 
                    onChange={(e) => setProfile(p => p ? ({ ...p, maxActiveConsultations: Number(e.target.value) }) : null)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t("careProfileDialog.timezoneLabel")}</Label>
                <Input 
                  value={profile.timezone} 
                  onChange={(e) => setProfile(p => p ? ({ ...p, timezone: e.target.value }) : null)}
                  placeholder={t("careProfileDialog.timezonePlaceholder")}
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>{t("careProfileDialog.weeklyScheduleLabel")}</Label>
                  <Button variant="outline" size="sm" onClick={addRow} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> {t("careProfileDialog.addSlot")}
                  </Button>
                </div>
                
                {profile.availability.weekly.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg border-dashed text-sm text-muted-foreground">
                    {t("careProfileDialog.noSlots")}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {profile.availability.weekly.map((row, index) => (
                      <div key={`${row.dayOfWeek}-${row.start}-${row.end}-${index}`} className="flex items-center gap-2">
                        <Select value={row.dayOfWeek} onValueChange={(v: DayOfWeek) => updateRow(index, "dayOfWeek", v)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONDAY">{t("days.monday")}</SelectItem>
                            <SelectItem value="TUESDAY">{t("days.tuesday")}</SelectItem>
                            <SelectItem value="WEDNESDAY">{t("days.wednesday")}</SelectItem>
                            <SelectItem value="THURSDAY">{t("days.thursday")}</SelectItem>
                            <SelectItem value="FRIDAY">{t("days.friday")}</SelectItem>
                            <SelectItem value="SATURDAY">{t("days.saturday")}</SelectItem>
                            <SelectItem value="SUNDAY">{t("days.sunday")}</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input 
                          type="time" 
                          value={row.start} 
                          onChange={(e) => updateRow(index, "start", e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input 
                          type="time" 
                          value={row.end} 
                          onChange={(e) => updateRow(index, "end", e.target.value)}
                          className="flex-1"
                        />
                        
                        <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-danger-500 hover:text-danger-600 hover:bg-danger-50 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">{t("careProfileDialog.notFound")}</div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("careProfileDialog.cancel")}</Button>
          <Button onClick={handleSubmit} disabled={loading || !profile}>{t("careProfileDialog.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
