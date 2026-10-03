import { FilePlus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trans, useTranslation } from "react-i18next"
import type { UserItem } from "@/types/user"

interface UserFakeRecordDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: UserItem | null
  loading?: boolean
}

export function UserFakeRecordDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  loading = false,
}: UserFakeRecordDialogProps) {
  const { t } = useTranslation("management")
  if (!user && !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && !val && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="p-6 pb-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-success-50 border border-success-100 flex items-center justify-center text-success-600 mb-3 shadow-xs">
            <FilePlus className="w-6 h-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            {t("users.fakeRecordDialog.title")}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            <Trans
              t={t}
              i18nKey="users.fakeRecordDialog.description"
              values={{ name: user?.displayName || user?.email, id: user?.id }}
              components={{ name: <strong className="text-slate-900 font-extrabold underline decoration-success-300" /> }}
            />
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3.5 bg-success-50/50 border-y border-success-100 text-success-900 text-xs font-extrabold flex items-center justify-between">
          <span>{t("users.fakeRecordDialog.recipientLabel")}</span>
          <span className="font-mono bg-success-100 text-success-800 px-2 py-0.5 rounded-md border border-success-200/80">
            #{user?.id} - {user?.displayName || user?.email}
          </span>
        </div>

        <DialogFooter className="p-4 bg-slate-50 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="h-10 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-4.5 hover:bg-white cursor-pointer"
          >
            {t("users.fakeRecordDialog.cancel")}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-10 rounded-xl bg-success-600 hover:bg-success-700 font-extrabold text-white text-xs px-5 shadow-sm shadow-success-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
            <span>{t("users.fakeRecordDialog.confirm")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
