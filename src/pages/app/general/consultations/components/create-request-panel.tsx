import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Send, Activity, AlertCircle, Coins, Stethoscope, ChevronRight, CheckCircle2, Clock, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { HealthRecordItem, CareServicePackage, ConsultationQueueStatisticsResponse } from "@/types/consultation"
import { formatDate } from "./shared"

export interface RequestFormData {
  packageId?: string
  reasonForCare: string
  currentConcern: string
  careGoal: string
  memberNote: string
  relevantSelfReportedContext: string
  selectedHealthRecordIds: string[]
  preferredDoctorId?: string
  // legacy fallback
  healthRecordId?: string
  reason?: string
}

export function CreateRequestPanel({
  form,
  healthRecords,
  availableCredits,
  hasActiveQueue,
  loading,
  insufficientCredits,
  queueStatistics,
  onChange,
  onSubmit,
  onPendingConflict,
}: {
  form: RequestFormData
  healthRecords: HealthRecordItem[]
  packages?: CareServicePackage[]
  availableCredits?: number
  hasActiveQueue?: boolean
  loading: boolean
  insufficientCredits?: boolean
  queueStatistics?: ConsultationQueueStatisticsResponse | null
  onChange: (form: RequestFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onPendingConflict?: () => void
}) {
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const latestRecord = healthRecords.length > 0 ? healthRecords[0] : null
  const hasNoRecords = healthRecords.length === 0
  const isZeroCredits = availableCredits !== undefined && availableCredits <= 0
  const hasInsufficientCredits = Boolean(insufficientCredits || isZeroCredits)

  const isValid =
    !!form.reasonForCare.trim() &&
    !!form.currentConcern.trim() &&
    !hasNoRecords &&
    !hasInsufficientCredits &&
    !hasActiveQueue

  const handleOpenConfirm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (hasActiveQueue) {
      if (onPendingConflict) {
        onPendingConflict()
      }
      return
    }
    if (!isValid) return
    setIsConfirmOpen(true)
  }

  const handleConfirmSubmit = () => {
    setIsConfirmOpen(false)
    const syntheticEvent = {
      preventDefault: () => {},
    } as unknown as FormEvent<HTMLFormElement>
    onSubmit(syntheticEvent)
  }

  return (
    <>
      <Card className="shadow-sm border rounded-2xl max-w-2xl mx-auto">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Đăng ký Tư vấn Sức khỏe</CardTitle>
              <CardDescription>
                Yêu cầu của bạn sẽ được xếp vào hàng đợi trực tiếp (FIFO) và ghép nối tự động với bác sĩ đang trực.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="flex flex-col gap-6" onSubmit={handleOpenConfirm}>
            {hasActiveQueue && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl gap-3 text-amber-950 dark:text-amber-200">
                <div className="flex items-start sm:items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Bạn đang có yêu cầu tư vấn trong hàng đợi</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hệ thống ghi nhận bạn đã có yêu cầu tư vấn đang chờ xử lý. Mỗi hội viên chỉ có thể tham gia 1 yêu cầu tư vấn tại một thời điểm.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                  onClick={() => navigate("/app/general/consultations?tab=queue")}
                >
                  <Users className="w-3.5 h-3.5" />
                  Xem hàng đợi hiện tại
                </Button>
              </div>
            )}

            {hasInsufficientCredits && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl gap-3 text-amber-950 dark:text-amber-200">
                <div className="flex items-start sm:items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Bạn không đủ lượt tư vấn để vào hàng đợi</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Số dư khả dụng hiện tại: <span className="font-bold text-foreground">{availableCredits ?? 0} lượt</span>. Vui lòng mua thêm gói lượt để tiếp tục.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 bg-primary text-primary-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-xs cursor-pointer"
                  onClick={() => navigate("/app/general/consultations?tab=credits")}
                >
                  <Coins className="w-3.5 h-3.5" />
                  Mua thêm lượt tư vấn
                </Button>
              </div>
            )}

            {/* Section 2: Health Records (Auto Latest or Warning) */}
            <div className="space-y-3 border-t pt-5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  Hồ sơ đo đạc tim mạch đính kèm
                </Label>
              </div>

              {hasNoRecords ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Chưa có dữ liệu đo điện tim (ECG)</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Để bác sĩ có cơ sở chẩn đoán tình trạng tim mạch của bạn, bạn cần thực hiện ít nhất một lần đo điện tim bằng thiết bị trước khi đăng ký tư vấn.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto h-9 text-xs font-medium border-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/40 gap-1.5 cursor-pointer"
                    onClick={() => navigate("/app/general/dashboard")}
                  >
                    <span>Đi đến bảng điều khiển & kết nối thiết bị</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        #{latestRecord?.id} {latestRecord?.originalFileName ? `- ${latestRecord.originalFileName}` : ""}
                      </span>
                      {latestRecord?.predictionLabel && (
                        <Badge
                          variant="outline"
                          className="text-[11px] py-0.5 px-2 bg-background font-medium border-primary/40 text-primary"
                        >
                          {latestRecord.predictionLabel}
                        </Badge>
                      )}
                    </div>
                    <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-0 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Tự động đính kèm mới nhất
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-primary/10">
                    <span>Thời gian đo: {formatDate(latestRecord?.createdAt)}</span>
                    <span className="italic">Dữ liệu dạng sóng ECG này sẽ được chia sẻ cho bác sĩ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: V3 Clinical Intake Details */}
            <div className="space-y-4 border-t pt-5">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reasonForCare" className="text-sm font-semibold">
                    Lý do đăng ký chăm sóc / tư vấn <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="reasonForCare"
                    required
                    placeholder="VD: Nhịp tim không đều sau khi tập thể dục, cần tư vấn chuyên khoa tim mạch..."
                    value={form.reasonForCare}
                    onChange={(e) => onChange({ ...form, reasonForCare: e.target.value, reason: e.target.value })}
                    className="rounded-xl h-11"
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentConcern" className="text-sm font-semibold">
                    Triệu chứng & Vấn đề lo ngại hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="currentConcern"
                    required
                    rows={3}
                    placeholder="Mô tả cụ thể triệu chứng: thời điểm xuất hiện, tần suất, cảm giác hồi hộp, khó thở, chóng mặt..."
                    value={form.currentConcern}
                    onChange={(e) => onChange({ ...form, currentConcern: e.target.value })}
                    className="rounded-xl resize-none"
                    maxLength={2000}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start sm:items-center gap-2.5 p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
              <span>
                {queueStatistics?.creditPolicy === "PER_SESSION_CONFIRM_V2"
                  ? `Phiên tư vấn cần ${queueStatistics.creditCost ?? 1} lượt. Lượt chỉ được trừ khi bạn xác nhận bắt đầu phiên.`
                  : queueStatistics?.creditPolicy === "PER_SESSION_V1"
                  ? `Mỗi phiên tư vấn sử dụng ${queueStatistics.creditCost ?? 1} lượt. Lượt sẽ được tạm giữ khi vào hàng đợi và chỉ trừ khi bắt đầu phiên khám.`
                  : queueStatistics?.creditPolicy === "FREE_EXISTING" || queueStatistics?.creditPolicy === "FREE_DISABLED"
                  ? "Phiên tư vấn miễn phí, không trừ lượt."
                  : "Yêu cầu của bạn sẽ nhận số thứ tự cố định và được xếp vào hàng đợi trực tiếp (FIFO)."}
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading || !isValid}
              className="w-full h-11 rounded-xl text-base font-semibold gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu & Vào hàng đợi"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog before entering queue */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="w-5 h-5 text-primary" />
              Xác nhận vào hàng đợi tư vấn
            </DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin trước khi hệ thống xếp bạn vào hàng đợi gặp bác sĩ.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Lý do tư vấn:</span>
                <span className="font-semibold text-foreground text-right line-clamp-2">{form.reasonForCare}</span>
              </div>
              {latestRecord && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                  <span className="text-muted-foreground shrink-0">Bản ghi ECG đính kèm:</span>
                  <span className="font-medium text-foreground">
                    #{latestRecord.id} {latestRecord.predictionLabel ? `[${latestRecord.predictionLabel}]` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Lượt tư vấn khả dụng:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {availableCredits !== undefined ? `${availableCredits} lượt` : "1 lượt"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-950 dark:text-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Để tham gia hàng đợi, bạn cần có tối thiểu <strong>1 lượt tư vấn</strong>.
                <br />
                <span className="font-medium text-foreground">Quy định trừ lượt:</span> Lượt của bạn chỉ được trừ khi bác sĩ tiếp nhận và bạn bấm <strong>Xác nhận bắt đầu phiên tư vấn</strong>.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Kiểm tra lại
            </Button>
            <Button
              type="button"
              disabled={loading}
              className="font-semibold gap-1.5 cursor-pointer"
              onClick={handleConfirmSubmit}
            >
              <Send className="w-4 h-4" />
              {loading ? "Đang gửi..." : "Xác nhận & Vào hàng đợi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
