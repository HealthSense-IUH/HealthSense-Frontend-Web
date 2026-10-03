import { Clock, Users, ArrowRight } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PendingConflictDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoToQueue: () => void
  queueNumber?: number | string | null
}

export function PendingConflictDialog({
  open,
  onOpenChange,
  onGoToQueue,
  queueNumber,
}: PendingConflictDialogProps) {
  const { t } = useTranslation("consultation")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-warning-500/10 border border-warning-500/20 text-warning-600 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold">
            {t("pendingConflictDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t("pendingConflictDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-xl border border-warning-500/20 bg-warning-500/10 p-3.5 text-warning-950 leading-relaxed">
            {queueNumber ? (
              <Trans
                t={t}
                i18nKey="pendingConflictDialog.bodyWithNumber"
                values={{ number: String(queueNumber).padStart(3, "0") }}
                components={{ strong: <strong /> }}
              />
            ) : (
              <Trans t={t} i18nKey="pendingConflictDialog.body" components={{ strong: <strong /> }} />
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {t("pendingConflictDialog.hint")}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            {t("pendingConflictDialog.close")}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onGoToQueue()
            }}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>{t("pendingConflictDialog.viewQueue")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
