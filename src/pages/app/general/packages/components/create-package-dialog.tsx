import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { consultationApi } from "@/services"
import type {
  CreateCareServicePackagePayload,
  DoctorSpecialty,
} from "@/types/consultation"

interface CreatePackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

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
