import { Clock, Users, ArrowRight } from "lucide-react"
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold">
            Bạn đang có yêu cầu tư vấn chưa hoàn thành
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Mỗi tài khoản hội viên chỉ được tham gia một phiên tư vấn tại một thời điểm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-950 dark:text-amber-200 leading-relaxed">
            Hệ thống ghi nhận bạn <strong>đang có một yêu cầu tư vấn trong hàng đợi</strong>
            {queueNumber ? ` (Số thứ tự #${String(queueNumber).padStart(3, "0")})` : ""} hoặc đang chờ bác sĩ tiếp nhận.
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Để đảm bảo tính liên tục và chất lượng theo dõi nhịp tim, bạn vui lòng theo dõi tiến trình của hàng đợi hiện tại hoặc hủy yêu cầu cũ trước khi tạo yêu cầu mới.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Đóng
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
            <span>Xem hàng đợi hiện tại</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
