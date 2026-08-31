import { useEffect, useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { consultationApi } from "@/services"
import { CARE_SERVICE_CODE_LABELS } from "@/constants"
import type {
  CareServiceCode,
  CareServicePackage,
  DoctorSpecialty,
  UpdateCareServicePackagePayload,
} from "@/types/consultation"

interface EditPackageDialogProps {
  pkg: CareServicePackage
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

export function EditPackageDialog({ pkg, open, onOpenChange, onSuccess }: EditPackageDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateCareServicePackagePayload>({
    name: pkg.name,
    description: pkg.description || "",
    shortDescription: pkg.shortDescription || "",
    detailedDescription: pkg.detailedDescription || "",
    priceAmount: pkg.priceAmount,
    currency: pkg.currency || "VND",
    durationDays: pkg.durationDays,
    renewable: pkg.renewable,
    requiredSpecialty: pkg.requiredSpecialty || pkg.specialty || "CARDIOLOGY",
    supportPolicy: "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE",
    termsPolicyReference: pkg.termsPolicyReference || pkg.limitations || "",
    includedServices: pkg.includedServices || (pkg.includedServiceTypes as CareServiceCode[]) || [],
    excludedServices: pkg.excludedServices || (pkg.excludedServiceTypes as CareServiceCode[]) || [],
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        shortDescription: pkg.shortDescription || "",
        detailedDescription: pkg.detailedDescription || "",
        priceAmount: pkg.priceAmount,
        currency: pkg.currency || "VND",
        durationDays: pkg.durationDays,
        renewable: pkg.renewable,
        requiredSpecialty: pkg.requiredSpecialty || pkg.specialty || "CARDIOLOGY",
        supportPolicy: "ASSIGNED_DOCTOR_SUPPORT_SCHEDULE",
        termsPolicyReference: pkg.termsPolicyReference || pkg.limitations || "",
        includedServices: pkg.includedServices || (pkg.includedServiceTypes as CareServiceCode[]) || [],
        excludedServices: pkg.excludedServices || (pkg.excludedServiceTypes as CareServiceCode[]) || [],
      })
    }
  }, [open, pkg])

  const handleChange = (field: keyof UpdateCareServicePackagePayload, value: unknown) => {
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

  const isRetired = pkg.status === "RETIRED"
  const isDisabled = loading || isRetired

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRetired) return

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
      await consultationApi.updateCareServicePackage(pkg.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        shortDescription: formData.shortDescription?.trim() || null,
        detailedDescription: formData.detailedDescription?.trim() || null,
        priceAmount: Number(formData.priceAmount),
        currency: pkg.currency || "VND",
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
        description: "Cập nhật gói thành công.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      const anyErr = error as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Error",
        description: anyErr.response?.data?.message || "Failed to update package",
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
            <DialogTitle>Chỉnh sửa Gói Dịch vụ (V3)</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin gói chăm sóc sức khỏe.
            </DialogDescription>
          </DialogHeader>

          {isRetired && (
            <Alert variant="destructive" className="m-6 mb-0">
              <AlertDescription>
                Gói đã ngừng vĩnh viễn (RETIRED) và không thể chỉnh sửa.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Mã gói (Code)</Label>
                <Input value={pkg.code} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>Trạng thái (Status)</Label>
                <Input value={pkg.status} disabled className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên gói (Name) *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Chuyên khoa yêu cầu (Required Specialty)</Label>
                <Select
                  value={formData.requiredSpecialty || "CARDIOLOGY"}
                  onValueChange={(v) => handleChange("requiredSpecialty", v as DoctorSpecialty)}
                  disabled={isDisabled}
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
              <Label htmlFor="edit-description">Mô tả gói</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isDisabled}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priceAmount">Giá ({pkg.currency || "VND"}) *</Label>
                <Input
                  id="edit-priceAmount"
                  type="number"
                  min="1"
                  value={formData.priceAmount || ""}
                  onChange={(e) => handleChange("priceAmount", Number(e.target.value))}
                  disabled={isDisabled}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-durationDays">Thời hạn (Ngày) *</Label>
                <Input
                  id="edit-durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays || ""}
                  onChange={(e) => handleChange("durationDays", Number(e.target.value))}
                  disabled={isDisabled}
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
                      } ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
                      onClick={() => !isDisabled && toggleIncludedService(code)}
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
                      } ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
                      onClick={() => !isDisabled && toggleExcludedService(code)}
                    >
                      {isExcluded ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {CARE_SERVICE_CODE_LABELS[code] || code}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-termsPolicyReference">Tham chiếu điều khoản & giới hạn (Terms Policy Reference)</Label>
              <Input
                id="edit-termsPolicyReference"
                value={formData.termsPolicyReference || ""}
                onChange={(e) => handleChange("termsPolicyReference", e.target.value)}
                disabled={isDisabled}
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
                disabled={isDisabled}
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {isRetired ? "Đóng" : "Hủy"}
            </Button>
            {!isRetired && (
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
