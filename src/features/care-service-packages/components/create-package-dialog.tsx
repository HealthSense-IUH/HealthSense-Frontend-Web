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

import { consultationApi } from "@/features/consultations/services/consultation-api"
import type { CreateCareServicePackagePayload, DoctorSpecialty } from "@/features/consultations/types"

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
    priceAmount: 0,
    durationDays: 30,
    renewable: false,
    specialty: "CARDIOLOGY",
    supportPolicy: "OFFICE_HOURS",
    limitations: "",
    maxExtensionsAllowed: 3,
    includedServiceTypes: [],
    excludedServiceTypes: [],
  })

  const [includedText, setIncludedText] = useState("")
  const [excludedText, setExcludedText] = useState("")

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
      await consultationApi.createCareServicePackage({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        limitations: formData.limitations?.trim() || null,
        includedServiceTypes: parsedIncluded.length > 0 ? parsedIncluded : null,
        excludedServiceTypes: parsedExcluded.length > 0 ? parsedExcluded : null,
      })
      toast({
        title: "Success",
        description: "Đã tạo gói. Gói đang ở trạng thái INACTIVE.",
      })
      onSuccess()
      onOpenChange(false)
      // reset form
      setFormData({
        code: "",
        name: "",
        description: "",
        priceAmount: 0,
        durationDays: 30,
        renewable: false,
        specialty: "CARDIOLOGY",
        supportPolicy: "OFFICE_HOURS",
        limitations: "",
        maxExtensionsAllowed: 3,
        includedServiceTypes: [],
        excludedServiceTypes: [],
      })
      setIncludedText("")
      setExcludedText("")
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
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Tạo Gói Dịch vụ Chăm sóc (V3)</DialogTitle>
            <DialogDescription>
              Tạo mới gói chăm sóc sức khỏe. Gói tạo mới sẽ ở trạng thái INACTIVE mặc định.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã gói (Code)</Label>
                <Input
                  id="code"
                  placeholder="VD: PKG_CARDIO_PREMIUM"
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Tên gói (Name)</Label>
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
                <Label>Chuyên khoa (Specialty)</Label>
                <Select
                  value={formData.specialty || "CARDIOLOGY"}
                  onValueChange={(v) => handleChange("specialty", v as DoctorSpecialty)}
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
                  value={formData.supportPolicy || "OFFICE_HOURS"}
                  onValueChange={(v) => handleChange("supportPolicy", v)}
                  disabled={loading}
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
              <Label htmlFor="description">Mô tả gói</Label>
              <Textarea
                id="description"
                placeholder="Thông tin giới thiệu chi tiết về gói..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priceAmount">Giá (VND)</Label>
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
                <Label htmlFor="durationDays">Thời hạn (Ngày)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={formData.durationDays || ""}
                  onChange={(e) => handleChange("durationDays", Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxExtensions">Số lần gia hạn tối đa</Label>
                <Input
                  id="maxExtensions"
                  type="number"
                  min="0"
                  value={formData.maxExtensionsAllowed ?? 3}
                  onChange={(e) => handleChange("maxExtensionsAllowed", Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="includedServices">Dịch vụ bao gồm (Mỗi dòng 1 dịch vụ)</Label>
                <Textarea
                  id="includedServices"
                  placeholder="Tầm soát Rung nhĩ định kỳ&#10;Tư vấn 1-1 qua chat&#10;Báo cáo y khoa cuối kỳ"
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="excludedServices">Dịch vụ không bao gồm (Mỗi dòng 1 dịch vụ)</Label>
                <Textarea
                  id="excludedServices"
                  placeholder="Cấp cứu khẩn cấp&#10;Điều trị nội trú"
                  value={excludedText}
                  onChange={(e) => setExcludedText(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="limitations">Giới hạn & Lưu ý y tế (Limitations)</Label>
              <Textarea
                id="limitations"
                placeholder="Dịch vụ không thay thế cấp cứu khẩn cấp tại bệnh viện..."
                value={formData.limitations || ""}
                onChange={(e) => handleChange("limitations", e.target.value)}
                disabled={loading}
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
