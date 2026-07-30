import { type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { ConsultationRequestItem, ConsultationSessionItem } from "../types"

export type AdminDialogMode = "approve" | "reject" | "extend" | "close" | null

export function AdminActionDialog({
  mode,
  request,
  session,
  doctorId,
  endsAt,
  supportEndsAt,
  reason,
  loading,
  onDoctorIdChange,
  onEndsAtChange,
  onSupportEndsAtChange,
  onReasonChange,
  onSubmit,
  onOpenChange,
}: {
  mode: AdminDialogMode
  request: ConsultationRequestItem | null
  session: ConsultationSessionItem | null
  doctorId: string
  endsAt: string
  supportEndsAt: string
  reason: string
  loading: boolean
  onDoctorIdChange: (value: string) => void
  onEndsAtChange: (value: string) => void
  onSupportEndsAtChange: (value: string) => void
  onReasonChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onOpenChange: (open: boolean) => void
}) {
  const isOpen = mode !== null
  const title = mode === "approve" ? `Approve request #${request?.id}` : mode === "reject" ? `Reject request #${request?.id}` : mode === "extend" ? `Extend session #${session?.id}` : `Close session #${session?.id}`
  const needsDate = mode === "approve" || mode === "extend"
  const needsReason = mode === "reject" || mode === "extend" || mode === "close"

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
          {needsDate && (
            <>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Ends at
                <Input type="datetime-local" required value={endsAt} onChange={(event) => onEndsAtChange(event.target.value)} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Support ends at
                <Input type="datetime-local" value={supportEndsAt} onChange={(event) => onSupportEndsAtChange(event.target.value)} />
              </label>
            </>
          )}
          {needsReason && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              Reason
              <Textarea required={mode === "reject" || mode === "close"} value={reason} onChange={(event) => onReasonChange(event.target.value)} />
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
