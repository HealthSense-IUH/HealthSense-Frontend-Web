import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { ConsultationRequestItem, ConsultationSessionItem } from "@/types/consultation"

export type AdminDialogMode = "approve" | "reject" | "close" | null

export function AdminActionDialog({
  mode,
  request,
  session,
  doctorId,
  reason,
  loading,
  onDoctorIdChange,
  onReasonChange,
  onSubmit,
  onOpenChange,
}: {
  mode: AdminDialogMode
  request: ConsultationRequestItem | null
  session: ConsultationSessionItem | null
  doctorId: string
  reason: string
  loading: boolean
  onDoctorIdChange: (value: string) => void
  onReasonChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onOpenChange: (open: boolean) => void
}) {
  const isOpen = mode !== null
  const title = mode === "approve" ? `Reserve doctor for request #${request?.id}` : mode === "reject" ? `Reject request #${request?.id}` : `Close session #${session?.id}`
  const needsReason = mode === "reject" || mode === "close"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Enter the required information for this action.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {mode === "approve" && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Doctor ID
              <Input required value={doctorId} onChange={(event) => onDoctorIdChange(event.target.value)} />
            </label>
          )}
          {needsReason && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Reason
              <Textarea required value={reason} onChange={(event) => onReasonChange(event.target.value)} />
            </label>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
