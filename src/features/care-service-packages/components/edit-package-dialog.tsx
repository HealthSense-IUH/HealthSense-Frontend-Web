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

import { consultationApi } from "@/features/consultations/services/consultation-api"
import type { CareServicePackage, UpdateCareServicePackagePayload } from "@/features/consultations/types"

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
  })

  // Sync state if pkg changes while open
  useEffect(() => {
    if (open) {
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        priceAmount: pkg.priceAmount,
        durationDays: pkg.durationDays,
        renewable: pkg.renewable,
      })
    }
  }, [open, pkg])

  const handleChange = (field: keyof UpdateCareServicePackagePayload, value: any) => {
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

    setLoading(true)
    try {
      await consultationApi.updateCareServicePackage(pkg.id, {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
      })
      toast({
        title: "Success",
        description: "Package updated successfully.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update package",
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
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update care service package details.
            </DialogDescription>
          </DialogHeader>

          {isRetired && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                Gói đã ngừng vĩnh viễn và không thể chỉnh sửa.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Code</Label>
                <Input value={pkg.code} disabled className="bg-slate-50" />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Input value={pkg.status} disabled className="bg-slate-50" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isDisabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priceAmount">Price ({pkg.currency || "VND"})</Label>
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
                <Label htmlFor="edit-durationDays">Duration (Days)</Label>
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
                disabled={isDisabled}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {isRetired ? "Close" : "Cancel"}
            </Button>
            {!isRetired && (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
