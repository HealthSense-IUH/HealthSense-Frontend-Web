import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES } from "@/constants"
import type { UserRole } from "@/types/auth"
import { userManagementApi } from "@/services"
import type { UserItem, UserCreateRequest, UserUpdateRequest, UserPageResponse, UserAccountStatus as AccountStatus } from "@/types/user"
import { UserRoleTabs } from "@/pages/app/management/users/components/user-role-tabs"
import { UserTableHeader } from "@/pages/app/management/users/components/user-table-header"
import { UserTable } from "@/pages/app/management/users/components/user-table"
import { UserFormModal } from "@/pages/app/management/users/components/user-form-modal"
import { UserDetailDrawer } from "@/pages/app/management/users/components/user-detail-drawer"
import { UserDeleteDialog } from "@/pages/app/management/users/components/user-delete-dialog"
import { UserFakeRecordDialog } from "@/pages/app/management/users/components/user-fake-record-dialog"
import { DoctorCareProfileDialog } from "@/pages/app/general/consultations/components/doctor-care-profile-dialog"

function normalizeUserPage(pageData: UserPageResponse | undefined, selectedRole: UserRole, size: number) {
  const serverList = pageData?.content ?? pageData?.items ?? []
  const userList = selectedRole
    ? serverList.filter((user) => user.role === selectedRole)
    : serverList
  const hasMixedRoles = userList.length !== serverList.length
  const total = hasMixedRoles ? userList.length : pageData?.totalElements ?? userList.length
  const pages = hasMixedRoles
    ? Math.ceil(total / size) || 1
    : pageData?.totalPages ?? (Math.ceil(total / size) || 1)

  return { userList, total, pages }
}

export default function UserManagementPage() {
  const navigate = useNavigate()
  const { effectiveRole } = useAppShell()

  // Strict RBAC Verification at page level
  const isAuthorized =
    effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.ADMIN

  // Filter & Pagination State (Default to MEMBER as 'role' query parameter is REQUIRED)
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.MEMBER)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 400)

  // Data & Loading state
  const [rawUsers, setRawUsers] = useState<UserItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusAlert, setStatusAlert] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Target User & Modal open state
  const [targetUser, setTargetUser] = useState<UserItem | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isFakeRecordOpen, setIsFakeRecordOpen] = useState(false)
  const [careProfileDoctorId, setCareProfileDoctorId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!isAuthorized) return
    try {
      const filterStatus = statusFilter !== "ALL" ? (statusFilter as AccountStatus) : undefined
      const filterKeyword = debouncedSearchQuery.trim() || undefined
      const response = await userManagementApi.listUsers({ role: selectedRole, status: filterStatus, keyword: filterKeyword, page, size })
      const pageData: UserPageResponse | undefined = response.data
      const { userList, total, pages } = normalizeUserPage(pageData, selectedRole, size)

      setRawUsers(userList)
      setTotalElements(total)
      setTotalPages(pages)
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      console.error("Failed to fetch user list:", err)
      // When backend endpoint is offline during UI testing or returns errors, prevent crashing
      setRawUsers([])
      setTotalElements(0)
      setTotalPages(1)
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Không thể tải danh sách tài khoản từ máy chủ. Vui lòng kiểm tra kết nối mạng.",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedRole, statusFilter, debouncedSearchQuery, page, size, isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return
    let isMounted = true
    const filterStatus = statusFilter !== "ALL" ? (statusFilter as AccountStatus) : undefined
    const filterKeyword = debouncedSearchQuery.trim() || undefined
    userManagementApi
      .listUsers({ role: selectedRole, status: filterStatus, keyword: filterKeyword, page, size })
      .then((response) => {
        if (isMounted) {
          const pageData: UserPageResponse | undefined = response.data
          const { userList, total, pages } = normalizeUserPage(pageData, selectedRole, size)
          setRawUsers(userList)
          setTotalElements(total)
          setTotalPages(pages)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          const err = error as { message?: string; response?: { data?: { message?: string } } }
          console.error("Failed to fetch user list:", err)
          setRawUsers([])
          setTotalElements(0)
          setTotalPages(1)
          setStatusAlert({
            type: "error",
            text: err?.response?.data?.message || "Không thể tải danh sách tài khoản từ máy chủ. Vui lòng kiểm tra kết nối mạng.",
          })
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [selectedRole, statusFilter, debouncedSearchQuery, page, size, isAuthorized])

  // Role Tab switch handler
  const handleSelectRole = (role: UserRole) => {
    if (role === selectedRole) return
    setLoading(true)
    setSelectedRole(role)
    setPage(1)
    setSearchQuery("")
    setStatusFilter("ALL")
    setStatusAlert(null)
  }

  // Create & Edit Modal Actions
  const handleOpenCreate = () => {
    setTargetUser(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (user: UserItem) => {
    setTargetUser(user)
    setIsFormOpen(true)
  }

  const handleOpenView = (user: UserItem) => {
    setTargetUser(user)
    setIsDetailOpen(true)
  }

  const handleOpenDelete = (user: UserItem) => {
    setTargetUser(user)
    setIsDeleteOpen(true)
  }

  const handleSaveUser = async (payload: UserCreateRequest | UserUpdateRequest) => {
    setActionLoading(true)
    setStatusAlert(null)
    try {
      if (targetUser) {
        // Update mode (PATCH)
        await userManagementApi.updateUser(targetUser.id, payload as UserUpdateRequest)
        setStatusAlert({ type: "success", text: `Đã cập nhật thông tin tài khoản cho ${targetUser.displayName || targetUser.email} thành công.` })
      } else {
        // Create mode (POST)
        const created = await userManagementApi.createUser(payload as UserCreateRequest)
        const newEmail = (payload as UserCreateRequest).email
        setStatusAlert({
          type: "success",
          text: `Đã khởi tạo tài khoản cho ${created.data?.displayName || newEmail} thành công! Mật khẩu tạm thời đã được gửi qua email.`,
        })
      }
      setIsFormOpen(false)
      await fetchUsers()
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!targetUser) return
    setActionLoading(true)
    setStatusAlert(null)
    try {
      await userManagementApi.deleteUser(targetUser.id)
      setStatusAlert({ type: "success", text: `Đã xóa vĩnh viễn tài khoản #${targetUser.id} (${targetUser.email}).` })
      setIsDeleteOpen(false)
      await fetchUsers()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Không thể xóa tài khoản. Máy chủ từ chối yêu cầu xóa.",
      })
      setIsDeleteOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenFakeRecord = (user: UserItem) => {
    setTargetUser(user)
    setIsFakeRecordOpen(true)
  }

  const handleFakeRecordConfirm = async () => {
    if (!targetUser) return
    setActionLoading(true)
    setStatusAlert(null)
    try {
      await userManagementApi.createFakeHealthRecord({ memberId: targetUser.id })
      setStatusAlert({ type: "success", text: `Đã tạo hồ sơ sức khỏe mẫu cho ${targetUser.displayName || targetUser.email} thành công.` })
      setIsFakeRecordOpen(false)
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Không thể tạo hồ sơ sức khỏe mẫu.",
      })
      setIsFakeRecordOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  // Unauthorized screen for DOCTOR and MEMBER roles
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto">
        <div className="p-5 rounded-3xl bg-red-50 text-red-600 border border-red-200/80 shadow-xs mb-5">
          <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Từ chối truy cập: Trang được bảo vệ</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          Phân hệ <strong className="text-slate-800">Quản lý người dùng & tài khoản</strong> chỉ dành riêng cho quyền <strong className="text-blue-600">ADMIN</strong> và <strong className="text-amber-600">SUPER_ADMIN</strong>. Vai trò hiện tại của bạn là <strong className="text-slate-900">{effectiveRole}</strong>.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Vui lòng chuyển đổi vai trò sang ADMIN hoặc SUPER_ADMIN để truy cập trang này.</span>
        </div>
      </div>
    )
  }

  const getRoleDisplayLabel = () => {
    switch (selectedRole) {
      case USER_ROLES.MEMBER: return "Bệnh nhân"
      case USER_ROLES.DOCTOR: return "Bác sĩ"
      case USER_ROLES.CARE_COORDINATOR: return "Điều phối viên"
      case USER_ROLES.ADMIN: return "Quản trị viên bệnh viện"
      default: return String(selectedRole)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Role Switcher Tabs (Fulfilling required API role parameter) */}
      <UserRoleTabs selectedRole={selectedRole} onSelectRole={handleSelectRole} loading={loading} effectiveRole={effectiveRole} />

      {/* Status Alert feedback box */}
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

      {/* Table Section with Header Controls */}
      <section aria-label="Account Registry Data Table" className="space-y-4">
        <UserTableHeader
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val)
            setPage(1)
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val)
            setPage(1)
          }}
          onOpenCreate={handleOpenCreate}
          totalElements={totalElements}
          currentRoleLabel={getRoleDisplayLabel()}
          loading={loading}
        />

        <UserTable
          users={rawUsers}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          onSizeChange={(s) => {
            setSize(s)
            setPage(1)
          }}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onFakeRecord={handleOpenFakeRecord}
          onManageCareProfile={(user) => setCareProfileDoctorId(String(user.id))}
          onMemberDetail={(user) => navigate(`/app/management/users/${user.id}`)}
        />
      </section>

      {/* Modals & Dialogs */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveUser}
        initialData={targetUser}
        defaultRole={selectedRole}
        loading={actionLoading}
        effectiveRole={effectiveRole}
      />

      <UserDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={targetUser}
        onEdit={(u) => {
          setIsDetailOpen(false)
          handleOpenEdit(u)
        }}
      />

      <UserDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={targetUser}
        loading={actionLoading}
      />

      <UserFakeRecordDialog
        isOpen={isFakeRecordOpen}
        onClose={() => setIsFakeRecordOpen(false)}
        onConfirm={handleFakeRecordConfirm}
        user={targetUser}
        loading={actionLoading}
      />

      <DoctorCareProfileDialog
        open={Boolean(careProfileDoctorId)}
        onOpenChange={(open) => {
          if (!open) setCareProfileDoctorId(null)
        }}
        doctorId={careProfileDoctorId}
        onSuccess={() => {
          setStatusAlert({
            type: "success",
            text: "Đã cập nhật hồ sơ điều phối và lịch tư vấn của bác sĩ thành công.",
          })
        }}
      />
    </div>
  )
}
