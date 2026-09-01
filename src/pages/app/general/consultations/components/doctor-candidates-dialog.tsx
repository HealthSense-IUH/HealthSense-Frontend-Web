import { useEffect, useState, useCallback } from "react"
import { Search, Star, AlertTriangle, UserCog, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import { consultationApi } from "@/services"
import type { DoctorCandidateResponse } from "@/types/consultation"

export function DoctorCandidatesDialog({
  requestId,
  open,
  onOpenChange,
  onReserveDoctor,
  onOpenCareProfile,
  isReserving = false,
  reservingDoctorId = null,
}: {
  requestId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReserveDoctor: (doctorId: number | string) => void
  onOpenCareProfile: (doctorId: number | string) => void
  isReserving?: boolean
  reservingDoctorId?: number | string | null
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [candidates, setCandidates] = useState<DoctorCandidateResponse[]>([])
  
  const [keyword, setKeyword] = useState("")
  const [specialty, setSpecialty] = useState<string>("ALL")
  const [eligibleOnly, setEligibleOnly] = useState(true)

  const fetchCandidates = useCallback(() => {
    if (!requestId || !open) return
    setLoading(true)
    consultationApi.listDoctorCandidates(requestId, {
      keyword: keyword.trim() || undefined,
      specialty: specialty === "ALL" ? undefined : specialty,
      eligibleOnly: eligibleOnly || undefined,
      page: 1,
      size: 10, // Avoid too large size in case backend throws 500
    })
      .then(res => setCandidates(res.data?.content || []))
      .catch(() => toast({ variant: "destructive", description: "Không thể tải danh sách bác sĩ." }))
      .finally(() => setLoading(false))
  }, [requestId, open, keyword, specialty, eligibleOnly, toast])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Handle Enter to search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchCandidates()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn bác sĩ cho yêu cầu #{requestId}</DialogTitle>
          <DialogDescription>
            Tìm kiếm và phân công bác sĩ đủ điều kiện cho buổi tư vấn này.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên hoặc email..." 
              className="pl-8" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chuyên khoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chuyên khoa</SelectItem>
              <SelectItem value="GENERAL_PRACTICE">Đa khoa</SelectItem>
              <SelectItem value="CARDIOLOGY">Tim mạch</SelectItem>
              <SelectItem value="INTERNAL_MEDICINE">Nội khoa</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="eligibleOnly" 
              checked={eligibleOnly} 
              onCheckedChange={(c) => setEligibleOnly(!!c)} 
            />
            <label htmlFor="eligibleOnly" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Chỉ BS đủ điều kiện
            </label>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchCandidates} disabled={loading}>
            Tìm kiếm
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 pr-2 space-y-3">
          {loading ? (
            <div className="text-center text-sm text-muted-foreground py-8">Đang tải danh sách bác sĩ...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">Không tìm thấy bác sĩ phù hợp.</div>
          ) : (
            candidates.map((doctor) => (
              <div key={doctor.doctorId} className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-lg ${doctor.preferredByMember ? 'border-primary/50 bg-primary/5' : ''} ${!doctor.eligible ? 'opacity-80' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{doctor.displayName}</span>
                    {doctor.preferredByMember && (
                      <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">
                        <Star className="w-3 h-3 mr-1" /> Ưu tiên
                      </Badge>
                    )}
                    {!doctor.eligible && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">
                        Không đủ điều kiện
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-0.5">
                    <span>{doctor.email} &bull; {doctor.phone || "Chưa có SĐT"}</span>
                    <span>Chuyên khoa: {doctor.specialty || "Chưa cập nhật"} &bull; Múi giờ: {doctor.timezone || "Chưa đặt"}</span>
                    <span>Tải công việc: {doctor.effectiveLoad} / {doctor.maxActiveConsultations != null ? doctor.maxActiveConsultations : "Chưa cấu hình"}</span>
                  </div>
                  
                  {!doctor.eligible && Array.isArray(doctor.ineligibleReasons) && doctor.ineligibleReasons.length > 0 && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex gap-1.5 items-start">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <ul className="list-disc list-inside">
                        {doctor.ineligibleReasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {doctor.declaredSupportSchedule && doctor.eligible && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded font-mono">
                      Đã có lịch làm việc công bố
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 justify-start sm:justify-start">
                  <Button 
                    size="sm" 
                    disabled={!doctor.eligible || isReserving}
                    onClick={() => onReserveDoctor(doctor.doctorId)}
                  >
                    {isReserving && String(reservingDoctorId) === String(doctor.doctorId) ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Đang giữ chỗ...
                      </>
                    ) : (
                      "Giữ chỗ bác sĩ"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isReserving}
                    onClick={() => onOpenCareProfile(doctor.doctorId)}
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    Hồ sơ chăm sóc
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
