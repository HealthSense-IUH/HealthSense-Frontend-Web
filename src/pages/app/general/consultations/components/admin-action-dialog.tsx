import { type FormEvent } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import i18n from "@/lib/i18n"

import type { CareTerminationReason, ConsultationRequestItem, ConsultationSessionItem } from "@/types/consultation"

const TERMINATION_REASONS: { value: CareTerminationReason; label: string }[] = [
  { value: "ADMINISTRATIVE_CLOSURE", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.administrativeClosure") } },
  { value: "MEMBER_REQUESTED", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.memberRequested") } },
  { value: "DOCTOR_UNAVAILABLE", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.doctorUnavailable") } },
  { value: "MEMBER_UNAVAILABLE", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.memberUnavailable") } },
  { value: "SAFETY_OR_SCOPE_REASON", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.safetyOrScopeReason") } },
  { value: "SERVICE_VIOLATION", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.serviceViolation") } },
  { value: "TECHNICAL_FAILURE", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.technicalFailure") } },
  { value: "OTHER", get label() { return i18n.t("consultation:adminActionDialog.terminationReasons.other") } },
]

export type AdminDialogMode = "approve" | "reject" | "close" | null

export function AdminActionDialog({
  mode,
  request,
  session,
  doctorId,
  reason,
  terminationReason,
  meaningfulCareOccurred,
  loading,
  onDoctorIdChange,
  onReasonChange,
  onTerminationReasonChange,
  onMeaningfulCareOccurredChange,
  onSubmit,
  onOpenChange,
}: {
  mode: AdminDialogMode
  request: ConsultationRequestItem | null
  session: ConsultationSessionItem | null
  doctorId: string
  reason: string
  terminationReason: CareTerminationReason | null
  meaningfulCareOccurred: boolean
  loading: boolean
  onDoctorIdChange: (value: string) => void
  onReasonChange: (value: string) => void
  onTerminationReasonChange: (value: CareTerminationReason | null) => void
  onMeaningfulCareOccurredChange: (value: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation("consultation")
  const isOpen = mode !== null
  const title =
    mode === "approve"
      ? t("adminActionDialog.approve.title", { id: request?.id })
      : mode === "reject"
        ? t("adminActionDialog.reject.title", { id: request?.id })
        : t("adminActionDialog.close.title", { id: session?.id })
  const description =
    mode === "approve"
      ? t("adminActionDialog.approve.description")
      : mode === "reject"
        ? t("adminActionDialog.reject.description")
        : t("adminActionDialog.close.description")
  const needsReason = mode === "reject" || mode === "close"

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {mode === "approve" && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              {t("adminActionDialog.doctorIdLabel")} <span className="text-destructive">*</span>
              <Input
                required
                placeholder={t("adminActionDialog.doctorIdPlaceholder")}
                value={doctorId}
                onChange={(event) => onDoctorIdChange(event.target.value)}
              />
            </label>
          )}

          {mode === "close" && (
            <>
              <div className="flex items-start space-x-3 rounded-lg border p-3 bg-muted/30">
                <Checkbox
                  id="meaningful-care"
                  checked={meaningfulCareOccurred}
                  onCheckedChange={(checked) => onMeaningfulCareOccurredChange(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="meaningful-care"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {t("adminActionDialog.meaningfulCareLabel")}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {session?.status === "ACTIVE"
                      ? t("adminActionDialog.meaningfulCareHintActive")
                      : t("adminActionDialog.meaningfulCareHintScheduled")}
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium">
                {t("adminActionDialog.terminationReasonLabel")}
                <Select
                  value={terminationReason || "ADMINISTRATIVE_CLOSURE"}
                  onValueChange={(val) => onTerminationReasonChange(val as CareTerminationReason)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("adminActionDialog.terminationReasonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TERMINATION_REASONS.map((tr) => (
                      <SelectItem key={tr.value} value={tr.value}>
                        {tr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </>
          )}

          {needsReason && (
            <label className="flex flex-col gap-2 text-sm font-medium">
              {mode === "close" ? t("adminActionDialog.closeReasonLabel") : t("adminActionDialog.rejectReasonLabel")} <span className="text-destructive">*</span>
              <Textarea
                required
                rows={3}
                placeholder={mode === "close" ? t("adminActionDialog.closeReasonPlaceholder") : t("adminActionDialog.rejectReasonPlaceholder")}
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
              />
            </label>
          )}

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {t("adminActionDialog.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("adminActionDialog.processing") : t("adminActionDialog.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
