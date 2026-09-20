import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  User,
  Activity,
  MessagesSquare,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"
import { userManagementApi } from "@/services"
import type { UserItem, AdminMemberDetailResponse, UserUpdateRequest } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MemberPersonalTab } from "./components/member-personal-tab"
import { MemberHealthRecordsTab } from "./components/member-health-records-tab"
import { MemberConsultationsTab } from "./components/member-consultations-tab"
import { UserFormModal } from "./components/user-form-modal"

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { effectiveRole } = useAppShell()

  const currentTab = searchParams.get("tab") || "personal"

  const isAuthorized =
    effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.ADMIN

  const [user, setUser] = useState<UserItem | null>(null)
  const [memberDetail, setMemberDetail] = useState<AdminMemberDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchMemberInfo = useCallback(async () => {
    if (!id || !isAuthorized) return
    setLoading(true)
    try {
      const res = await userManagementApi.getAdminMemberDetail(id)
      if (res.data) {
        setMemberDetail(res.data)
        setUser(res.data.user)
      } else {
        // Fallback to basic user detail if admin detail is empty
        const fallbackUser = await userManagementApi.getUserDetail(id)
        setUser(fallbackUser.data || null)
      }
    } catch {
      try {
        const fallbackUser = await userManagementApi.getUserDetail(id)
        setUser(fallbackUser.data || null)
      } catch (err) {
        console.error("Failed to load user details:", err)
        setStatusAlert({
          type: "error",
          text: "Không thể lấy thông tin chi tiết của người dùng từ hệ thống.",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [id, isAuthorized])

  useEffect(() => {
    void fetchMemberInfo()
  }, [fetchMemberInfo])

  const handleTabChange = (tabValue: string) => {
    setSearchParams({ tab: tabValue })
  }

  const handleSaveUser = async (payload: UserUpdateRequest) => {
    if (!user) return
    setActionLoading(true)
    setStatusAlert(null)
    try {
      await userManagementApi.updateUser(user.id, payload)
      setStatusAlert({
        type: "success",
        text: `Tài khoản #${user.id} đã được cập nhật thành công.`,
      })
      setIsEditOpen(false)
      await fetchMemberInfo()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Cập nhật thông tin thất bại.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFakeRecord = async () => {
    if (!user) return
    setActionLoading(true)
    setStatusAlert(null)
    try {
      await userManagementApi.createFakeHealthRecord({ memberId: user.id })
      setStatusAlert({
        type: "success",
        text: `Đã sinh dữ liệu bản đo mẫu cho ${user.displayName || user.email}.`,
      })
      await fetchMemberInfo()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Tạo bản đo mẫu thất bại.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto">
        <div className="p-5 rounded-3xl bg-red-50 text-red-600 border border-red-200/80 shadow-xs mb-5">
          <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied: Protected Route</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          The <strong className="text-slate-800">User Detail</strong> view is restricted solely to tenant <strong className="text-blue-600">ADMIN</strong> and <strong className="text-amber-600">SUPER_ADMIN</strong> authorities.
        </p>
      </div>
    )
  }

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <span className="text-sm font-bold text-slate-700">Đang tải thông tin hồ sơ Member #{id}...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/management/users")}
            className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 font-extrabold text-xs cursor-pointer shadow-3xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Quay lại danh sách</span>
          </Button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <nav className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 truncate">
            <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate("/app/management/users")}>
              Quản lý tài khoản
            </span>
            <span>/</span>
            <span className="text-slate-800 font-extrabold truncate">
              Chi tiết Member: {user?.displayName || `#${id}`}
            </span>
          </nav>
        </div>
      </div>

      {/* Status Feedback Alert */}
      {statusAlert && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
            statusAlert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-3xs shadow-emerald-500/10"
              : "bg-red-50 border-red-200 text-red-900 shadow-3xs shadow-red-500/10"
          }`}
        >
          <div className="flex items-center gap-3">
            {statusAlert.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusAlert.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusAlert(null)}
            className="text-slate-400 hover:text-slate-700 font-extrabold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 3 Tabs Navigation */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 h-auto flex flex-wrap gap-1.5">
          <TabsTrigger
            value="personal"
            className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>1. Thông tin cá nhân</span>
          </TabsTrigger>

          <TabsTrigger
            value="records"
            className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>2. Lịch sử các bản đo</span>
            {memberDetail?.totalHealthRecords != null && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                {memberDetail.totalHealthRecords}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="consultations"
            className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <MessagesSquare className="w-4 h-4" />
            <span>3. Lịch sử các lần tư vấn</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info */}
        <TabsContent value="personal" className="mt-0 outline-none">
          <MemberPersonalTab
            user={user}
            memberDetail={memberDetail}
            loading={loading}
            onEdit={() => setIsEditOpen(true)}
            onFakeRecord={handleFakeRecord}
          />
        </TabsContent>

        {/* Tab 2: Health Records History */}
        <TabsContent value="records" className="mt-0 outline-none">
          {id && <MemberHealthRecordsTab memberId={id} memberDisplayName={user?.displayName} />}
        </TabsContent>

        {/* Tab 3: Consultation Sessions History */}
        <TabsContent value="consultations" className="mt-0 outline-none">
          {id && <MemberConsultationsTab memberId={id} memberDisplayName={user?.displayName} />}
        </TabsContent>
      </Tabs>

      {/* Edit User Modal */}
      <UserFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveUser}
        initialData={user}
        defaultRole={USER_ROLES.MEMBER}
        loading={actionLoading}
        effectiveRole={effectiveRole}
      />
    </div>
  )
}
