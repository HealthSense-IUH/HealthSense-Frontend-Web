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

import { consultationApi } from "@/features/consultations/services/consultation-api"
import type { CreateCareServicePackagePayload } from "@/features/consultations/types"

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
    durationDays: 0,
    renewable: false,
  })

  const handleChange = (field: keyof CreateCareServicePackagePayload, value: any) => {
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
        ...formData,
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
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
        durationDays: 0,
        renewable: false,
      })
    } catch (error: any) {
      let msg = error.response?.data?.message || "Failed to create package"
      if (error.response?.data?.code === 409 || msg.includes("CODE_ALREADY_EXISTS")) {
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
            <DialogDescription>
              Create a new care service package. It will be created as INACTIVE by default.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. PKG_BASIC"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Basic Care"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Details about the package..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priceAmount">Price (VND)</Label>
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
                <Label htmlFor="durationDays">Duration (Days)</Label>
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
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Renewable</Label>
                <p className="text-sm text-muted-foreground">
                  Allow members to renew this package automatically
                </p>
              </div>
              <Switch
                checked={formData.renewable}
                onCheckedChange={(c) => handleChange("renewable", c)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
