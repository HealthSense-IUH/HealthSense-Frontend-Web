import type { ReactNode } from "react"
import { Info } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface DetailDialogProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  /** Nhãn nhỏ dưới tiêu đề: nhóm, nguồn, khuyến nghị... */
  meta?: ReactNode
  /** Ghi chú nguồn / miễn trừ ở cuối popup */
  footer?: ReactNode
  children: ReactNode
}

/** Khung popup chi tiết thực phẩm dùng chung: tiêu đề cố định, thân cuộn được. */
export function DetailDialog({ open, onClose, title, description, meta, footer, children }: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 pr-12 border-b border-slate-100 space-y-2">
          <DialogTitle className="text-xl font-bold leading-snug">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          {meta && <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">{meta}</div>}
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {children}
          {footer && (
            <div className="pt-4 border-t border-slate-100 text-xs text-muted-foreground space-y-1.5">
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                <span>{footer}</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Popup khi đang tải (tiêu đề "Đang tải...") hoặc không tìm thấy thực phẩm. */
export function DetailDialogPlaceholder({
  open,
  onClose,
  loading,
  title,
  description,
}: {
  open: boolean
  onClose: () => void
  loading: boolean
  title: string
  description?: string
}) {
  return (
    <DetailDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : null}
    </DetailDialog>
  )
}
