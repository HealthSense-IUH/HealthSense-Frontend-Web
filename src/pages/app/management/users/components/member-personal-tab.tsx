import {
  Activity,
  Calendar,
  Clock,
  Edit3,
  FilePlus,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserStatusBadge } from "./user-status-badge"
import type { UserItem, AdminMemberDetailResponse } from "@/types/user"
import { formatRecordDate } from "@/lib/formatters"

interface MemberPersonalTabProps {
  user: UserItem | null
  memberDetail: AdminMemberDetailResponse | null
  loading?: boolean
  onEdit?: (user: UserItem) => void
  onFakeRecord?: () => void
}

export function MemberPersonalTab({
  user,
  memberDetail,
  loading,
  onEdit,
  onFakeRecord,
}: MemberPersonalTabProps) {
  if (!user && loading) {
    return (
      <div className="py-16 text-center text-slate-400 font-medium text-xs">
        Đang tải thông tin cá nhân của Member...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-16 text-center text-slate-400 font-medium text-xs">
        Không tìm thấy thông tin tài khoản.
      </div>
    )
  }

  const latestRecord = memberDetail?.latestHealthRecord
  const totalHealthRecords = memberDetail?.totalHealthRecords ?? 0

  return (
    <div className="space-y-6">
      {/* Overview Profile Card */}
      <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : "M"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {user.displayName || "Member chưa cập nhật tên"}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{user.id}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {user.role}
                </span>
                <UserStatusBadge status={user.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{user.phone}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onFakeRecord && (
              <Button
                variant="outline"
                size="sm"
                onClick={onFakeRecord}
                className="h-9 rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100 font-extrabold text-xs cursor-pointer"
              >
                <FilePlus className="w-4 h-4 mr-1.5 text-emerald-600" />
                Tạo bản đo giả lập
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                onClick={() => onEdit(user)}
                className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Demographics + Clinical Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Contact & Demographics */}
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>Thông tin nhân khẩu học & Liên hệ</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Ngày sinh</span>
              </span>
              <span className="font-extrabold text-slate-800 font-mono">
                {user.dateOfBirth || "Chưa thiết lập"}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Giới tính</span>
              </span>
              <span className="font-extrabold text-slate-800">
                {user.gender || "Chưa xác định"}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Số điện thoại</span>
              </span>
              <span className="font-extrabold font-mono text-slate-800">
                {user.phone || "Chưa liên kết"}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Địa chỉ thường trú</span>
              </span>
              <span className="text-slate-800 text-right max-w-[240px] truncate">
                {user.address || "Chưa cấu hình"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Account & Health Snapshot */}
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-black text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Trạng thái tài khoản & Dữ liệu sức khỏe</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs font-medium">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500">Trạng thái vận hành:</span>
              <UserStatusBadge status={user.status} />
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Ngày đăng ký tài khoản</span>
              </span>
              <span className="font-mono text-slate-800">
                {formatRecordDate(user.createdAt)}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Tổng số bản đo sức khỏe</span>
              </span>
              <Badge variant="secondary" className="font-extrabold text-blue-700 bg-blue-50">
                {totalHealthRecords} bản đo
              </Badge>
            </div>
            {latestRecord && (
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-red-500" />
                  <span>Kết quả đo gần nhất</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="font-bold">
                    {latestRecord.predictionLabel || latestRecord.status || "Đã lưu"}
                  </Badge>
                  {latestRecord.confidence != null && (
                    <span className="font-mono text-[11px] text-slate-500">
                      ({(latestRecord.confidence * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
