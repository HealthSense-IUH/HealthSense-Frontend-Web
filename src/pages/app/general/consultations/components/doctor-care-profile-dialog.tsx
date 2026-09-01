import { useEffect, useState } from "react"
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
}: {
  doctorId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
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
            } catch (e) {
              // Ignore parse error
            }
          }

          setProfile({
            specialty: res.data.specialty || "GENERAL_PRACTICE",
            acceptsOneOnOneCare: res.data.acceptsOneOnOneCare,
            maxActiveConsultations: res.data.maxActiveConsultations || 3,
            timezone: res.data.timezone || "Asia/Ho_Chi_Minh",
            availability: parsedAvailability || { weekly: [] }
          })
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            // Open blank template
            setProfile({
              specialty: "GENERAL_PRACTICE",
              acceptsOneOnOneCare: false,
              maxActiveConsultations: 3,
              timezone: "Asia/Ho_Chi_Minh",
              availability: {
                weekly: [{ ...DEFAULT_SLOT }]
              }
            })
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load doctor care profile.",
            })
            onOpenChange(false)
          }
        })
        .finally(() => setLoading(false))
    } else {
      setProfile(null)
    }
  }, [open, doctorId, onOpenChange, toast])

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
        toast({ variant: "destructive", description: "Specialty is required when accepting 1-on-1 care." })
        return
      }
      if (profile.availability.weekly.length === 0) {
        toast({ variant: "destructive", description: "At least one availability row is required." })
        return
      }
    }

    if (profile.maxActiveConsultations <= 0) {
      toast({ variant: "destructive", description: "Max active consultations must be > 0." })
      return
    }

    if (!profile.timezone?.trim()) {
      toast({ variant: "destructive", description: "Timezone is required." })
      return
    }

    // Row validation
    for (let i = 0; i < profile.availability.weekly.length; i++) {
      const row = profile.availability.weekly[i]
      if (!row.dayOfWeek || !row.start || !row.end) {
        toast({ variant: "destructive", description: `Row ${i + 1} is missing required fields.` })
        return
      }
      if (row.start >= row.end) {
        toast({ variant: "destructive", description: `Row ${i + 1}: Start time must be before end time.` })
        return
      }
    }

    // Overlap validation
    for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]) {
      const daySlots = profile.availability.weekly.filter(s => s.dayOfWeek === day)
      // sort by start time
      daySlots.sort((a, b) => a.start.localeCompare(b.start))
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].end > daySlots[i + 1].start) {
          toast({ variant: "destructive", description: `Overlapping intervals detected on ${day}.` })
          return
        }
      }
    }

    try {
      setLoading(true)
      await consultationApi.updateDoctorCareProfile(doctorId, profile)
      toast({
        title: "Success",
        description: "Doctor care profile updated.",
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Doctor Care Profile</DialogTitle>
          <DialogDescription>
            Manage doctor eligibility and weekly availability for 1-on-1 consultations.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !profile ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading profile...</div>
        ) : profile ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-6 py-4 pr-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <Label className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-semibold text-base">Accepts 1-on-1 Care</span>
                  <span className="font-normal text-xs text-muted-foreground">Enable to allow coordinator to assign requests</span>
                </Label>
                <Switch
                  checked={profile.acceptsOneOnOneCare}
                  onCheckedChange={(c) => setProfile(p => p ? ({ ...p, acceptsOneOnOneCare: c }) : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Specialty</Label>
                  <Select value={profile.specialty} onValueChange={(v: DoctorSpecialty) => setProfile(p => p ? ({ ...p, specialty: v }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL_PRACTICE">General Practice</SelectItem>
                      <SelectItem value="CARDIOLOGY">Cardiology</SelectItem>
                      <SelectItem value="INTERNAL_MEDICINE">Internal Medicine</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Max Active Consultations</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={profile.maxActiveConsultations} 
                    onChange={(e) => setProfile(p => p ? ({ ...p, maxActiveConsultations: Number(e.target.value) }) : null)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Timezone</Label>
                <Input 
                  value={profile.timezone} 
                  onChange={(e) => setProfile(p => p ? ({ ...p, timezone: e.target.value }) : null)}
                  placeholder="e.g. Asia/Ho_Chi_Minh"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>Weekly Availability</Label>
                  <Button variant="outline" size="sm" onClick={addRow} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Slot
                  </Button>
                </div>
                
                {profile.availability.weekly.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg border-dashed text-sm text-muted-foreground">
                    No availability configured.
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
                            <SelectItem value="MONDAY">Monday</SelectItem>
                            <SelectItem value="TUESDAY">Tuesday</SelectItem>
                            <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                            <SelectItem value="THURSDAY">Thursday</SelectItem>
                            <SelectItem value="FRIDAY">Friday</SelectItem>
                            <SelectItem value="SATURDAY">Saturday</SelectItem>
                            <SelectItem value="SUNDAY">Sunday</SelectItem>
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
                        
                        <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0">
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
          <div className="p-4 text-center text-sm text-muted-foreground">Profile not found.</div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !profile}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
