import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Check, Plus, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { consultationApi } from "@/services"
import { CARE_SERVICE_CODE_LABELS } from "@/constants"
import type {
  CareServiceCode,
  CreateCareServicePackagePayload,
  DoctorSpecialty,
} from "@/types/consultation"

interface CreatePackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ALL_CARE_SERVICE_CODES: CareServiceCode[] = [
  "REMOTE_ONE_ON_ONE_CARE",
  "SECURE_MESSAGING",
  "HEALTH_RECORD_REVIEW",
  "AI_SCREENING_REVIEW",
  "CARE_MONITORING",
  "FINAL_CARE_SUMMARY",
  "VIDEO_CONSULTATION",
  "EMERGENCY_CARE",
  "TWENTY_FOUR_SEVEN_SUPPORT",
  "FORMAL_DIAGNOSIS",
  "PRESCRIPTION",
]

export function CreatePackageDialog({ open, onOpenChange, onSuccess }: CreatePackageDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCareServicePackagePayload>({
    code: "",
    name: "",
    description: "",
    shortDescription: "",
    detailedDescription: "",
    priceAmount: 0,
    currency: "VND",
    durationDays: 30,
    renewable: false,
    requiredSpecialty: "CARDIOLOGY",
    supportPolicy: "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE",
    termsPolicyReference: "",
    includedServices: ["REMOTE_ONE_ON_ONE_CARE", "SECURE_MESSAGING"],
    excludedServices: ["EMERGENCY_CARE"],
  })

  const handleChange = (field: keyof CreateCareServicePackagePayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleIncludedService = (code: CareServiceCode) => {
    setFormData((prev) => {
      const current = prev.includedServices || []
      const isIncluded = current.includes(code)
      const nextIncluded = isIncluded ? current.filter((c) => c !== code) : [...current, code]
      const nextExcluded = (prev.excludedServices || []).filter((c) => c !== code)
      return {
        ...prev,
        includedServices: nextIncluded,
        excludedServices: nextExcluded,
      }
    })
  }

  const toggleExcludedService = (code: CareServiceCode) => {
    setFormData((prev) => {
      const current = prev.excludedServices || []
      const isExcluded = current.includes(code)
      const nextExcluded = isExcluded ? current.filter((c) => c !== code) : [...current, code]
      const nextIncluded = (prev.includedServices || []).filter((c) => c !== code)
      return {
        ...prev,
        includedServices: nextIncluded,
        excludedServices: nextExcluded,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Mã gói không được để trống" })
      return
    }
    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Tên gói không được để trống" })
      return
    }
    if (formData.priceAmount <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Giá tiền phải lớn hơn 0" })
      return
    }
    if (formData.durationDays <= 0) {
      toast({ variant: "destructive", title: "Error", description: "Thời hạn phải lớn hơn 0" })
      return
    }

    setLoading(true)
    try {
      await consultationApi.createCareServicePackage({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        shortDescription: formData.shortDescription?.trim() || null,
        detailedDescription: formData.detailedDescription?.trim() || null,
        priceAmount: Number(formData.priceAmount),
        currency: "VND",
        durationDays: Number(formData.durationDays),
        renewable: Boolean(formData.renewable),
        requiredSpecialty: (formData.requiredSpecialty || "CARDIOLOGY") as DoctorSpecialty,
        supportPolicy: "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE",
        termsPolicyReference: formData.termsPolicyReference?.trim() || null,
        includedServices: (formData.includedServices || []).length > 0 ? formData.includedServices : null,
        excludedServices: (formData.excludedServices || []).length > 0 ? formData.excludedServices : null,
      })
      toast({
        title: "Success",
        description: "Đã tạo gói dịch vụ. Gói đang ở trạng thái INACTIVE mặc định.",
      })
      onSuccess()
      onOpenChange(false)
      // reset form
      setFormData({
        code: "",
        name: "",
        description: "",
        shortDescription: "",
        detailedDescription: "",
        priceAmount: 0,
        currency: "VND",
        durationDays: 30,
        renewable: false,
        requiredSpecialty: "CARDIOLOGY",
        supportPolicy: "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE",
        termsPolicyReference: "",
        includedServices: ["REMOTE_ONE_ON_ONE_CARE", "SECURE_MESSAGING"],
        excludedServices: ["EMERGENCY_CARE"],
      })
    } catch (error: unknown) {
      const anyErr = error as { response?: { data?: { code?: number; message?: string } } }
      let msg = anyErr.response?.data?.message || "Failed to create package"
      if (anyErr.response?.data?.code === 409 || msg.includes("CODE_ALREADY_EXISTS")) {
        msg = "Mã gói đã tồn tại."
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  const includedSet = new Set(formData.includedServices || [])
  const excludedSet = new Set(formData.excludedServices || [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Tạo Gói Dịch vụ Chăm sóc (V3)</DialogTitle>
            <DialogDescription>
              Tạo mới gói chăm sóc sức khỏe. Gói tạo mới sẽ ở trạng thái INACTIVE mặc định.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã gói (Code) *</Label>
                <Input
                  id="code"
                  placeholder="VD: PKG_CARDIO_PREMIUM"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên gói (Name) *</Label>
                <Input
                  id="name"
                  placeholder="VD: Chăm sóc Tim mạch Toàn diện"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Chuyên khoa yêu cầu (Required Specialty)</Label>
                <Select
                  value={formData.requiredSpecialty || "CARDIOLOGY"}
                  onValueChange={(v) => handleChange("requiredSpecialty", v as DoctorSpecialty)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chuyên khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CARDIOLOGY">Tim mạch (Cardiology)</SelectItem>
                    <SelectItem value="INTERNAL_MEDICINE">Nội khoa (Internal Medicine)</SelectItem>
                    <SelectItem value="GENERAL_PRACTICE">Đa khoa (General Practice)</SelectItem>
                    <SelectItem value="OTHER">Khác (Other)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Chính sách hỗ trợ (Support Policy)</Label>
                <Select
                  value="ASSIGNED_DOCTOR_SUPPORT_SCHEDULE"
                  disabled
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Theo lịch làm việc của bác sĩ phụ trách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSIGNED_DOCTOR_SUPPORT_SCHEDULE">
                      Theo lịch làm việc của bác sĩ phụ trách
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả gói</Label>
              <Textarea
                id="description"
                placeholder="Thông tin giới thiệu chi tiết về gói..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priceAmount">Giá (VND) *</Label>
                <Input
                  id="priceAmount"
                  type="number"
                  min="1"
                  value={formData.priceAmount || ""}
                  onChange={(e) => handleChange("priceAmount", Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationDays">Thời hạn (Ngày) *</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays || ""}
                  onChange={(e) => handleChange("durationDays", Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Included Services Selector */}
            <div className="space-y-2 border rounded-xl p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                  Dịch vụ bao gồm (Included Services)
                </Label>
                <span className="text-xs text-muted-foreground">
                  Đã chọn {includedSet.size} dịch vụ
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_CARE_SERVICE_CODES.map((code) => {
                  const isIncluded = includedSet.has(code)
                  return (
                    <Badge
                      key={code}
                      variant={isIncluded ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isIncluded
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-background hover:bg-muted text-muted-foreground"
                      }`}
                      onClick={() => !loading && toggleIncludedService(code)}
                    >
                      {isIncluded ? <Check className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {CARE_SERVICE_CODE_LABELS[code] || code}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Excluded Services Selector */}
            <div className="space-y-2 border rounded-xl p-4 bg-red-50/30 dark:bg-red-950/10 border-red-200/50">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-red-900 dark:text-red-300">
                  Dịch vụ không bao gồm (Excluded Services)
                </Label>
                <span className="text-xs text-muted-foreground">
                  Đã chọn {excludedSet.size} dịch vụ
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {ALL_CARE_SERVICE_CODES.map((code) => {
                  const isExcluded = excludedSet.has(code)
                  return (
                    <Badge
                      key={code}
                      variant={isExcluded ? "destructive" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isExcluded
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-background hover:bg-muted text-muted-foreground"
                      }`}
                      onClick={() => !loading && toggleExcludedService(code)}
                    >
                      {isExcluded ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {CARE_SERVICE_CODE_LABELS[code] || code}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="termsPolicyReference">Tham chiếu điều khoản & giới hạn (Terms Policy Reference)</Label>
              <Input
                id="termsPolicyReference"
                placeholder="VD: Dịch vụ không thay thế cấp cứu 115 hoặc bệnh viện..."
                value={formData.termsPolicyReference || ""}
                onChange={(e) => handleChange("termsPolicyReference", e.target.value)}
                disabled={loading}
                maxLength={255}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Cho phép gia hạn (Renewable)</Label>
                <p className="text-xs text-muted-foreground">
                  Cho phép hội viên gia hạn đợt chăm sóc khi gần hết hạn
                </p>
              </div>
              <Switch
                checked={formData.renewable}
                onCheckedChange={(c) => handleChange("renewable", c)}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo gói"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
