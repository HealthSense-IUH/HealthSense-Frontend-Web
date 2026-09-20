import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldCheck, Mail, Phone, Calendar, MapPin, Edit3, X, Clock, UserCheck, Activity, HeartPulse, FolderHeart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserStatusBadge } from "./user-status-badge"
import { userManagementApi } from "@/services"
import type { UserItem, AdminMemberDetailResponse } from "@/types/user"

interface UserDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: UserItem | null
  onEdit: (user: UserItem) => void
}

export function UserDetailDrawer({ isOpen, onClose, user, onEdit }: UserDetailDrawerProps) {
  const navigate = useNavigate()
  const [memberDetail, setMemberDetail] = useState<AdminMemberDetailResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoadingDetail(true)
      userManagementApi
        .getAdminMemberDetail(user.id)
        .then((res) => {
          setMemberDetail(res.data || null)
        })
        .catch(() => {
          setMemberDetail(null)
        })
        .finally(() => {
          setLoadingDetail(false)
        })
    } else {
      setMemberDetail(null)
    }
  }, [isOpen, user?.id])

  if (!user && !isOpen) return null

  const formatDate = (val?: string | number) => {
    if (!val) return "Chưa ghi nhận"
    try {
      const d = typeof val === "number" ? new Date(val) : new Date(val)
      if (isNaN(d.getTime())) return String(val)
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return String(val)
    }
  }

  const formatGender = (g?: string) => {
    if (!g) return "Chưa cập nhật"
    const upper = g.toUpperCase()
    if (upper === "MALE") return "Nam"
    if (upper === "FEMALE") return "Nữ"
    if (upper === "OTHER") return "Khác"
    return g
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl w-[95vw] p-0 overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col">
        <DialogHeader className="p-6 bg-slate-50/90 border-b border-slate-100 flex flex-row items-center justify-between text-left space-y-0 pr-12">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-blue-600 text-lg font-black shrink-0">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 font-bold">#{user?.id || "N/A"}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  {user?.role || "MEMBER"}
                </span>
              </div>
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                {user?.displayName || "Tài khoản chưa có tên"}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs min-w-0">
          {/* Status Section */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-slate-600 font-extrabold shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Trạng thái hoạt động</span>
            </div>
            <div className="shrink-0">
              <UserStatusBadge status={user?.status} />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Thông tin liên lạc</h4>
            <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden font-medium">
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Địa chỉ Email</span>
                </span>
                <span className="font-mono font-bold text-slate-800 select-all truncate text-right">{user?.email || "—"}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 flex items-center gap-2 shrink-0">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Số điện thoại</span>
                </span>
                <span className="font-mono font-bold text-slate-800">{user?.phone || "Chưa liên kết SĐT"}</span>
              </div>
              <div className="p-3.5 flex items-center justify-between gap-3">
                <span className="text-slate-500 flex items-center gap-2 shrink-0">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Địa chỉ cư trú</span>
                </span>
                <span className="text-slate-800 max-w-[220px] text-right truncate">{user?.address || "Chưa cập nhật địa chỉ"}</span>
              </div>
            </div>
          </div>

          {/* Clinical Demographics */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-400 uppercase tracking-wider text-[11px]">Thông tin cá nhân</h4>
            <div className="grid grid-cols-2 gap-3 font-medium">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày sinh</span>
                </span>
                <span className="font-extrabold font-mono text-slate-800 text-sm">{user?.dateOfBirth || "Chưa cập nhật"}</span>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/40">
                <span className="text-slate-400 text-[11px] flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Giới tính</span>
                </span>
                <span className="font-extrabold text-slate-800 text-sm">{formatGender(user?.gender)}</span>
              </div>
            </div>
          </div>

          {/* Member Health Records Overview if applicable */}
          {loadingDetail ? (
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 text-center text-xs">
              Đang tải dữ liệu hồ sơ sức khỏe...
            </div>
          ) : memberDetail && (
            <div className="space-y-3">
              <h4 className="font-black text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Tổng quan hồ sơ sức khỏe</span>
              </h4>
              <div className="p-4 rounded-2xl border border-slate-100 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-600 font-medium">Tổng số bản ghi sức khỏe:</span>
                  <Badge variant="secondary" className="font-bold shrink-0">
                    {memberDetail.totalHealthRecords ?? 0} bản ghi
                  </Badge>
                </div>
                {memberDetail.latestHealthRecord && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 shrink-0">
                      <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                      Lần đo gần nhất:
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="font-bold">
                        {memberDetail.latestHealthRecord.predictionLabel || memberDetail.latestHealthRecord.status || "Đã lưu"}
                      </Badge>
                      {memberDetail.latestHealthRecord.confidence != null && (
                        <span className="font-mono text-[11px] text-slate-500">
                          ({(memberDetail.latestHealthRecord.confidence * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-500 text-[11px] font-medium flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày đăng ký:</span>
            </span>
            <strong className="text-slate-700 text-right">{formatDate(user?.createdAt)}</strong>
          </div>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="shrink-0">
            {user && user.role === "MEMBER" && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose()
                  navigate(`/app/management/users/${user.id}`)
                }}
                className="h-9 rounded-xl border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 font-extrabold text-xs px-3.5 flex items-center gap-1.5 cursor-pointer shadow-3xs w-full sm:w-auto justify-center"
              >
                <FolderHeart className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Xem hồ sơ chi tiết (Bản đo & Tư vấn)</span>
              </Button>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-xl border-slate-200 font-bold text-slate-600 text-xs px-4 hover:bg-white cursor-pointer"
            >
              <X className="w-4 h-4 mr-1.5 shrink-0" />
              <span>Đóng</span>
            </Button>
            {user && (
              <Button
                onClick={() => {
                  onClose()
                  onEdit(user)
                }}
                className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 font-extrabold text-white text-xs px-4 shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>Chỉnh sửa</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
