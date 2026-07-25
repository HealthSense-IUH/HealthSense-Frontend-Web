import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { UserItem } from "../types"

interface UserDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  user: UserItem | null
  loading?: boolean
}

export function UserDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  loading = false,
}: UserDeleteDialogProps) {
  if (!user && !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !loading && !val && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-200">
        <DialogHeader className="p-6 pb-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-3 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Revoke Account Credentials?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            You are initiating a permanent account deletion for{" "}
            <strong className="text-slate-900 font-extrabold underline decoration-red-300">
              {user?.displayName || user?.email}
            </strong>{" "}
            (ID: #{user?.id}). This action will immediately terminate all active sessions, medical record associations, and telemetry permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3.5 bg-red-50/50 border-y border-red-100 text-red-900 text-xs font-extrabold flex items-center justify-between">
          <span>Target Role:</span>
          <span className="font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded-md border border-red-200/80">
            {user?.role}
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
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-10 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs px-5 shadow-sm shadow-red-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Confirm Deletion</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
