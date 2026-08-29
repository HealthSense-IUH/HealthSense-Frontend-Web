import { useEffect, useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { consultationApi } from "@/features/consultations/services/consultation-api"
import type { CareServicePackage, DoctorSpecialty, UpdateCareServicePackagePayload } from "@/features/consultations/types"

interface EditPackageDialogProps {
  pkg: CareServicePackage
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPackageDialog({ pkg, open, onOpenChange, onSuccess }: EditPackageDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateCareServicePackagePayload>({
    name: pkg.name,
    description: pkg.description || "",
    priceAmount: pkg.priceAmount,
    durationDays: pkg.durationDays,
    renewable: pkg.renewable,
    specialty: pkg.specialty || "CARDIOLOGY",
    supportPolicy: pkg.supportPolicy || "OFFICE_HOURS",
    limitations: pkg.limitations || "",
    maxExtensionsAllowed: pkg.maxExtensionsAllowed ?? 3,
    includedServiceTypes: pkg.includedServiceTypes || [],
    excludedServiceTypes: pkg.excludedServiceTypes || [],
  })

  const [includedText, setIncludedText] = useState((pkg.includedServiceTypes || []).join("\n"))
  const [excludedText, setExcludedText] = useState((pkg.excludedServiceTypes || []).join("\n"))

  useEffect(() => {
    if (open) {
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        priceAmount: pkg.priceAmount,
        durationDays: pkg.durationDays,
        renewable: pkg.renewable,
        specialty: pkg.specialty || "CARDIOLOGY",
        supportPolicy: pkg.supportPolicy || "OFFICE_HOURS",
        limitations: pkg.limitations || "",
        maxExtensionsAllowed: pkg.maxExtensionsAllowed ?? 3,
        includedServiceTypes: pkg.includedServiceTypes || [],
        excludedServiceTypes: pkg.excludedServiceTypes || [],
      })
      setIncludedText((pkg.includedServiceTypes || []).join("\n"))
      setExcludedText((pkg.excludedServiceTypes || []).join("\n"))
    }
  }, [open, pkg])

  const handleChange = (field: keyof UpdateCareServicePackagePayload, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

    const parsedIncluded = includedText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    const parsedExcluded = excludedText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    setLoading(true)
    try {
      await consultationApi.updateCareServicePackage(pkg.id, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        limitations: formData.limitations?.trim() || null,
        includedServiceTypes: parsedIncluded.length > 0 ? parsedIncluded : null,
        excludedServiceTypes: parsedExcluded.length > 0 ? parsedExcluded : null,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
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

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
              <Label htmlFor="edit-name">Tên gói (Name)</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Chuyên khoa (Specialty)</Label>
                <Select
                  value={formData.specialty || "CARDIOLOGY"}
                  onValueChange={(v) => handleChange("specialty", v as DoctorSpecialty)}
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
                  value={formData.supportPolicy || "OFFICE_HOURS"}
                  onValueChange={(v) => handleChange("supportPolicy", v)}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chính sách hỗ trợ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFICE_HOURS">Giờ hành chính (Office Hours)</SelectItem>
                    <SelectItem value="BUSINESS_HOURS">Giờ mở rộng (Business Hours)</SelectItem>
                    <SelectItem value="EXTENDED">Mở rộng & Cuối tuần (Extended)</SelectItem>
                    <SelectItem value="CONTINUOUS">Liên tục 24/7 (Continuous)</SelectItem>
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
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priceAmount">Giá ({pkg.currency || "VND"})</Label>
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
                <Label htmlFor="edit-durationDays">Thời hạn (Ngày)</Label>
                <Input
                  id="edit-durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays || ""}
                  onChange={(e) => handleChange("durationDays", Number(e.target.value))}
                  disabled={isDisabled}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-maxExtensions">Số lần gia hạn tối đa</Label>
                <Input
                  id="edit-maxExtensions"
                  type="number"
                  min="0"
                  value={formData.maxExtensionsAllowed ?? 3}
                  onChange={(e) => handleChange("maxExtensionsAllowed", Number(e.target.value))}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-includedServices">Dịch vụ bao gồm (Mỗi dòng 1 dịch vụ)</Label>
                <Textarea
                  id="edit-includedServices"
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  disabled={isDisabled}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-excludedServices">Dịch vụ không bao gồm (Mỗi dòng 1 dịch vụ)</Label>
                <Textarea
                  id="edit-excludedServices"
                  value={excludedText}
                  onChange={(e) => setExcludedText(e.target.value)}
                  disabled={isDisabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-limitations">Giới hạn & Lưu ý y tế (Limitations)</Label>
              <Textarea
                id="edit-limitations"
                value={formData.limitations || ""}
                onChange={(e) => handleChange("limitations", e.target.value)}
                disabled={isDisabled}
                rows={2}
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
