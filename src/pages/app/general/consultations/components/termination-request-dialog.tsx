import { useState } from "react"
import { useTranslation } from "react-i18next"
import { AlertTriangle, LogOut, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import i18n from "@/lib/i18n"
import { consultationApi } from "@/services"
import type { CareTerminationReason } from "@/types/consultation"

interface TerminationRequestDialogProps {
  sessionId: string | number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TERMINATION_REASONS: { value: CareTerminationReason; label: string }[] = [
  {
    value: "MEMBER_REQUESTED",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.memberRequested")
    },
  },
  {
    value: "DOCTOR_UNAVAILABLE",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.doctorUnavailable")
    },
  },
  {
    value: "MEMBER_UNAVAILABLE",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.memberUnavailable")
    },
  },
  {
    value: "SAFETY_OR_SCOPE_REASON",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.safetyOrScopeReason")
    },
  },
  {
    value: "ACCOUNT_SUSPENDED",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.accountSuspended")
    },
  },
  {
    value: "SERVICE_VIOLATION",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.serviceViolation")
    },
  },
  {
    value: "TECHNICAL_FAILURE",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.technicalFailure")
    },
  },
  {
    value: "ADMINISTRATIVE_CLOSURE",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.administrativeClosure")
    },
  },
  {
    value: "OTHER",
    get label() {
      return i18n.t("consultation:terminationDialog.reasons.other")
    },
  },
]

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

export function TerminationRequestDialog({
  sessionId,
  open,
  onOpenChange,
  onSuccess,
}: TerminationRequestDialogProps) {
  const { t } = useTranslation("consultation")
  const { toast } = useToast()
  const [reason, setReason] = useState<CareTerminationReason>("MEMBER_REQUESTED")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !details.trim()) {
      toast({
        variant: "destructive",
        title: t("terminationDialog.toast.missingInfoTitle"),
        description: t("terminationDialog.toast.missingInfoDescription"),
      })
      return
    }

    setLoading(true)
    try {
      await consultationApi.requestSessionTermination(sessionId, {
        reason,
        details: details.trim(),
      })
      toast({
        title: t("terminationDialog.toast.successTitle"),
        description: t("terminationDialog.toast.successDescription"),
      })
      setDetails("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("terminationDialog.toast.errorTitle"),
        description: readError(error, t("terminationDialog.toast.errorDescription")),
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
            <div className="flex items-center gap-2.5 text-danger-600 mb-1">
              <div className="p-2 rounded-xl bg-danger-50 border border-danger-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {t("terminationDialog.title")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              {t("terminationDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="termination-reason" className="text-xs font-semibold text-slate-700">
                {t("terminationDialog.reasonLabel")} <span className="text-danger-500">*</span>
              </Label>
              <Select
                value={reason}
                onValueChange={(val) => setReason(val as CareTerminationReason)}
                disabled={loading}
              >
                <SelectTrigger id="termination-reason" className="h-9 text-xs">
                  <SelectValue placeholder={t("terminationDialog.reasonPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {TERMINATION_REASONS.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-xs">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="termination-details" className="text-xs font-semibold text-slate-700">
                {t("terminationDialog.detailsLabel")} <span className="text-danger-500">*</span>
              </Label>
              <Textarea
                id="termination-details"
                required
                maxLength={500}
                rows={4}
                placeholder={t("terminationDialog.detailsPlaceholder")}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={loading}
                className="resize-none text-xs"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {t("terminationDialog.charCount", { count: details.trim().length, max: 500 })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              {t("terminationDialog.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !details.trim()}
              className="bg-danger-600 hover:bg-danger-700 text-white text-xs font-bold gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("terminationDialog.actions.submitting")}
                </>
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  {t("terminationDialog.actions.submit")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
