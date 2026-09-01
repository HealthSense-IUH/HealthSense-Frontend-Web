import { type FormEvent } from "react"
import { CalendarClock, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface AdminSessionFormData {
  memberId: string
  doctorId: string
  healthRecordId: string
  endsAt: string
  supportEndsAt: string
  initialSystemMessage: string
  overrideReason: string
  serviceScope: string
}

export function CreateAdminSessionPanel({
  form,
  loading,
  onChange,
  onSubmit,
}: {
  form: AdminSessionFormData
  loading: boolean
  onChange: (form: AdminSessionFormData) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const isValid =
    !!form.memberId.trim() &&
    !!form.doctorId.trim() &&
    !!form.endsAt &&
    !!form.overrideReason.trim() &&
    !!form.serviceScope.trim() &&
    form.serviceScope.trim().length <= 2000

  return (
    <Card className="shadow-sm border rounded-2xl">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Tạo Phiên Tư Vấn Đặc Biệt</CardTitle>
            <CardDescription>
              Tạo phiên tư vấn trực tiếp do Quản trị viên chỉ định (vượt qua quy trình thanh toán thông thường). Bắt buộc phải có lý do ghi đè (overrideReason).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="memberId" className="text-sm font-medium">
              Member ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="memberId"
              required
              placeholder="VD: 101"
              value={form.memberId}
              onChange={(event) => onChange({ ...form, memberId: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorId" className="text-sm font-medium">
              Doctor ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="doctorId"
              required
              placeholder="VD: 202"
              value={form.doctorId}
              onChange={(event) => onChange({ ...form, doctorId: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthRecordId" className="text-sm font-medium">
              Mã hồ sơ sức khỏe (Tùy chọn)
            </Label>
            <Input
              id="healthRecordId"
              placeholder="Mã hồ sơ đo đạc (nếu có)"
              value={form.healthRecordId}
              onChange={(event) => onChange({ ...form, healthRecordId: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endsAt" className="text-sm font-medium">
              Thời gian kết thúc phiên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endsAt"
              type="datetime-local"
              required
              value={form.endsAt}
              onChange={(event) => onChange({ ...form, endsAt: event.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="supportEndsAt" className="text-sm font-medium">
              Thời gian kết thúc hỗ trợ tin nhắn (Tùy chọn)
            </Label>
            <Input
              id="supportEndsAt"
              type="datetime-local"
              value={form.supportEndsAt}
              onChange={(event) => onChange({ ...form, supportEndsAt: event.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="overrideReason" className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              Lý do ghi đè của Quản trị viên (Override Reason) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="overrideReason"
              required
              rows={2}
              placeholder="Nhập lý do tạo phiên đặc biệt (VD: Bổ sung ca cấp cứu đặc biệt theo chỉ đạo chuyên môn, tài trợ dịch vụ...)"
              value={form.overrideReason}
              onChange={(event) => onChange({ ...form, overrideReason: event.target.value })}
              className="resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="serviceScope" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Phạm vi dịch vụ chỉ định (Service Scope) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="serviceScope"
              required
              maxLength={2000}
              rows={2}
              placeholder="Nhập phạm vi chăm sóc/hướng dẫn chuyên môn cho phiên này (tối đa 2000 ký tự)..."
              value={form.serviceScope}
              onChange={(event) => onChange({ ...form, serviceScope: event.target.value })}
              className="resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="initialSystemMessage" className="text-sm font-medium">
              Tin nhắn hệ thống khởi tạo (Tùy chọn)
            </Label>
            <Textarea
              id="initialSystemMessage"
              rows={2}
              value={form.initialSystemMessage}
              onChange={(event) => onChange({ ...form, initialSystemMessage: event.target.value })}
              className="resize-none text-xs"
            />
          </div>

          <Button
            type="submit"
            className="md:col-span-2 h-11 text-base font-semibold gap-2"
            disabled={loading || !isValid}
          >
            <CalendarClock className="w-4 h-4" />
            {loading ? "Đang khởi tạo phiên..." : "Tạo phiên tư vấn đặc biệt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
