import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { UserItem } from "@/types/user"

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
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="p-6 pb-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-danger-50 border border-danger-100 flex items-center justify-center text-danger-600 mb-3 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Xác nhận xóa tài khoản người dùng?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
            Bạn đang thực hiện thao tác xóa vĩnh viễn tài khoản của{" "}
            <strong className="text-slate-900 font-extrabold underline decoration-danger-300">
              {user?.displayName || user?.email}
            </strong>{" "}
            (Mã ID: #{user?.id}). Hành động này sẽ ngay lập tức hủy phiên đăng nhập, liên kết hồ sơ bệnh án và thu hồi toàn bộ quyền truy cập hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3.5 bg-danger-50/50 border-y border-danger-100 text-danger-900 text-xs font-extrabold flex items-center justify-between">
          <span>Vai trò tài khoản:</span>
          <span className="font-mono bg-danger-100 text-danger-800 px-2 py-0.5 rounded-md border border-danger-200/80">
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
            Hủy bỏ
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-10 rounded-xl bg-danger-600 hover:bg-danger-700 font-extrabold text-white text-xs px-5 shadow-sm shadow-danger-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Xác nhận xóa</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
