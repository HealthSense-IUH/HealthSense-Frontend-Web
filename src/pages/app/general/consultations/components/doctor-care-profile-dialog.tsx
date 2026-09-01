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
              title: "Lỗi",
              description: "Không thể tải hồ sơ chăm sóc của bác sĩ.",
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
        toast({ variant: "destructive", description: "Vui lòng chọn chuyên khoa khi tiếp nhận tư vấn 1-1." })
        return
      }
      if (profile.availability.weekly.length === 0) {
        toast({ variant: "destructive", description: "Cần có ít nhất một khung giờ làm việc." })
        return
      }
    }

    if (profile.maxActiveConsultations <= 0) {
      toast({ variant: "destructive", description: "Số ca tư vấn tối đa phải lớn hơn 0." })
      return
    }

    if (!profile.timezone?.trim()) {
      toast({ variant: "destructive", description: "Múi giờ không được để trống." })
      return
    }

    // Row validation
    for (let i = 0; i < profile.availability.weekly.length; i++) {
      const row = profile.availability.weekly[i]
      if (!row.dayOfWeek || !row.start || !row.end) {
        toast({ variant: "destructive", description: `Dòng ${i + 1} thiếu thông tin bắt buộc.` })
        return
      }
      if (row.start >= row.end) {
        toast({ variant: "destructive", description: `Dòng ${i + 1}: Giờ bắt đầu phải trước giờ kết thúc.` })
        return
      }
    }

    const DAY_NAMES_VN: Record<string, string> = {
      MONDAY: "Thứ Hai",
      TUESDAY: "Thứ Ba",
      WEDNESDAY: "Thứ Tư",
      THURSDAY: "Thứ Năm",
      FRIDAY: "Thứ Sáu",
      SATURDAY: "Thứ Bảy",
      SUNDAY: "Chủ Nhật",
    }

    // Overlap validation
    for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]) {
      const daySlots = profile.availability.weekly.filter(s => s.dayOfWeek === day)
      // sort by start time
      daySlots.sort((a, b) => a.start.localeCompare(b.start))
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].end > daySlots[i + 1].start) {
          toast({ variant: "destructive", description: `Phát hiện khung giờ bị trùng lặp vào ${DAY_NAMES_VN[day] || day}.` })
          return
        }
      }
    }

    try {
      setLoading(true)
      await consultationApi.updateDoctorCareProfile(doctorId, profile)
      toast({
        title: "Thành công",
        description: "Đã cập nhật hồ sơ chăm sóc bác sĩ.",
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật hồ sơ chăm sóc",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Hồ sơ chăm sóc của Bác sĩ</DialogTitle>
          <DialogDescription>
            Quản lý điều kiện tiếp nhận và lịch làm việc hàng tuần cho tư vấn 1-1.
          </DialogDescription>
        </DialogHeader>
        
        {loading && !profile ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Đang tải hồ sơ...</div>
        ) : profile ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="flex flex-col gap-6 py-4 pr-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <Label className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-semibold text-base">Tiếp nhận tư vấn 1-1</span>
                  <span className="font-normal text-xs text-muted-foreground">Bật để cho phép điều phối viên chỉ định yêu cầu tư vấn</span>
                </Label>
                <Switch
                  checked={profile.acceptsOneOnOneCare}
                  onCheckedChange={(c) => setProfile(p => p ? ({ ...p, acceptsOneOnOneCare: c }) : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Chuyên khoa</Label>
                  <Select value={profile.specialty} onValueChange={(v: DoctorSpecialty) => setProfile(p => p ? ({ ...p, specialty: v }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL_PRACTICE">Đa khoa</SelectItem>
                      <SelectItem value="CARDIOLOGY">Tim mạch</SelectItem>
                      <SelectItem value="INTERNAL_MEDICINE">Nội khoa</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Số ca phụ trách tối đa</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    value={profile.maxActiveConsultations} 
                    onChange={(e) => setProfile(p => p ? ({ ...p, maxActiveConsultations: Number(e.target.value) }) : null)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Múi giờ</Label>
                <Input 
                  value={profile.timezone} 
                  onChange={(e) => setProfile(p => p ? ({ ...p, timezone: e.target.value }) : null)}
                  placeholder="VD: Asia/Ho_Chi_Minh"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>Lịch làm việc trong tuần</Label>
                  <Button variant="outline" size="sm" onClick={addRow} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Thêm khung giờ
                  </Button>
                </div>
                
                {profile.availability.weekly.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg border-dashed text-sm text-muted-foreground">
                    Chưa cấu hình khung giờ làm việc.
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
                            <SelectItem value="MONDAY">Thứ Hai</SelectItem>
                            <SelectItem value="TUESDAY">Thứ Ba</SelectItem>
                            <SelectItem value="WEDNESDAY">Thứ Tư</SelectItem>
                            <SelectItem value="THURSDAY">Thứ Năm</SelectItem>
                            <SelectItem value="FRIDAY">Thứ Sáu</SelectItem>
                            <SelectItem value="SATURDAY">Thứ Bảy</SelectItem>
                            <SelectItem value="SUNDAY">Chủ Nhật</SelectItem>
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
          <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy hồ sơ.</div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={loading || !profile}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
