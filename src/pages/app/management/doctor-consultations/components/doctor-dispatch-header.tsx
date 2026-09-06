import { useState } from "react"
import { Clock, PauseCircle, PlayCircle, Power, Sparkles, AlertCircle, RefreshCw, Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { DoctorDispatchStatusResponse } from "@/types/consultation"

interface DoctorDispatchHeaderProps {
  dispatchStatus: DoctorDispatchStatusResponse | null
  loading: boolean
  actionLoading: boolean
  hasProfile: boolean
  profileLoading: boolean
  onToggleStatus: (newStatus: "AVAILABLE" | "UNAVAILABLE") => Promise<void>
  onToggleStopAfterCurrentSession: (stop: boolean) => Promise<void>
  onRetryProfile?: () => void
  onOpenScheduleDialog?: () => void
}

export function DoctorDispatchHeader({
  dispatchStatus,
  loading,
  actionLoading,
  hasProfile,
  profileLoading,
  onToggleStatus,
  onToggleStopAfterCurrentSession,
  onRetryProfile,
  onOpenScheduleDialog,
}: DoctorDispatchHeaderProps) {
  const [prefLoading, setPrefLoading] = useState(false)

  const isBusy = dispatchStatus?.dispatchStatus === "BUSY"
  const isAvailable = dispatchStatus?.dispatchStatus === "AVAILABLE"
  const isUnavailable = dispatchStatus?.dispatchStatus === "UNAVAILABLE"
  const effectivelyDispatchable = dispatchStatus?.effectivelyDispatchable ?? false
  const stopAfterCurrentSession = dispatchStatus?.stopAfterCurrentSession ?? false

  const handleStatusChange = async () => {
    if (isBusy || actionLoading) return
    const nextStatus = isAvailable ? "UNAVAILABLE" : "AVAILABLE"
    await onToggleStatus(nextStatus)
  }

  const handlePrefChange = async (checked: boolean) => {
    try {
      setPrefLoading(true)
      await onToggleStopAfterCurrentSession(checked)
    } finally {
      setPrefLoading(false)
    }
  }

  return (
    <Card className="border-border bg-gradient-to-r from-card via-card to-muted/30 shadow-sm">
      <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
        {/* Missing Care Profile Alert Banner */}
        {!hasProfile && !profileLoading && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
              <span>
                <strong>Tài khoản chưa được thiết lập hồ sơ trực:</strong> Vui lòng liên hệ Người quản lý hoặc Điều phối viên để thiết lập hồ sơ chuyên khoa và kích hoạt nhận bệnh trước khi bật chế độ trực.
              </span>
            </div>
            {onRetryProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryProfile}
                disabled={profileLoading}
                className="h-7 text-xs border-amber-300 hover:bg-amber-100 dark:border-amber-700 text-amber-900 dark:text-amber-200 shrink-0 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${profileLoading ? "animate-spin" : ""}`} />
                <span>Thử lại</span>
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Indicator & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                isBusy
                  ? "bg-amber-500/10 border-amber-300 text-amber-600 dark:border-amber-700"
                  : isAvailable
                  ? "bg-emerald-500/10 border-emerald-300 text-emerald-600 dark:border-emerald-700"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              {isBusy ? (
                <Clock className="h-6 w-6 animate-pulse" />
              ) : isAvailable ? (
                <PlayCircle className="h-6 w-6" />
              ) : (
                <PauseCircle className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Trạng thái Trực điều phối
                </h2>
                {isBusy && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-medium border-none shadow-sm">
                    Đang bận phiên khám
                  </Badge>
                )}
                {isAvailable && effectivelyDispatchable && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-none shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Sẵn sàng nhận bệnh
                  </Badge>
                )}
                {isAvailable && !effectivelyDispatchable && (
                  <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-medium">
                    Đang phân phối lượt chờ
                  </Badge>
                )}
                {isUnavailable && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">
                    Nghỉ trực (Tạm dừng)
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                {!hasProfile
                  ? "Bạn cần có hồ sơ tư vấn hợp lệ trước khi có thể tham gia hàng đợi phân phối."
                  : isBusy
                  ? "Bác sĩ đang trong phiên khám tư vấn trực tuyến (BUSY). Trạng thái sẽ tự động cập nhật khi phiên kết thúc."
                  : isAvailable && effectivelyDispatchable
                  ? "Hệ thống sẽ tự động gán ca khám mới từ hàng đợi tới bạn ngay khi có bệnh nhân phù hợp."
                  : isAvailable && !effectivelyDispatchable
                  ? "Bạn đang có lời mời tư vấn hoặc bệnh nhân đang xác nhận. Tạm thời không nhận ca mới."
                  : "Bạn đang ở chế độ nghỉ. Bật sẵn sàng để bắt đầu tiếp nhận bệnh nhân từ hàng đợi chung."}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            {/* Self Schedule Button */}
            {onOpenScheduleDialog && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenScheduleDialog}
                className="text-xs font-medium shadow-xs border-border hover:bg-muted cursor-pointer"
              >
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                <span>Lịch làm việc</span>
              </Button>
            )}

            {/* Stop after current session toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background shadow-xs text-xs">
              <Switch
                id="stop-after"
                checked={stopAfterCurrentSession}
                onCheckedChange={handlePrefChange}
                disabled={!hasProfile || prefLoading || actionLoading || loading}
              />
              <label htmlFor="stop-after" className="cursor-pointer text-muted-foreground font-medium select-none">
                Nghỉ sau phiên này
              </label>
            </div>

            {/* Toggle Available/Unavailable Button */}
            <Button
              variant={isAvailable ? "outline" : "default"}
              size="sm"
              onClick={handleStatusChange}
              disabled={!hasProfile || isBusy || actionLoading || loading}
              className={`font-medium shadow-xs cursor-pointer ${
                !isAvailable && !isBusy && hasProfile ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
            >
              <Power className="mr-1.5 h-4 w-4" />
              {isBusy ? "Đang trong phiên" : isAvailable ? "Tạm nghỉ trực" : "Bắt đầu trực"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
