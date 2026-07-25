import { useState, useEffect, useCallback, useMemo } from "react"
import { ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { USER_ROLES, type UserRole } from "@/types/authentication"

import { userManagementApi } from "../services/user-api"
import type { UserItem, UserCreateRequest, UserUpdateRequest, UserPageResponse } from "../types"
import { UserRoleTabs } from "../components/user-role-tabs"
import { UserTableHeader } from "../components/user-table-header"
import { UserTable } from "../components/user-table"
import { UserFormModal } from "../components/user-form-modal"
import { UserDetailDrawer } from "../components/user-detail-drawer"
import { UserDeleteDialog } from "../components/user-delete-dialog"

export function UserManagementPage() {
  const { effectiveRole } = useAppShell()

  // Strict RBAC Verification at page level
  const isAuthorized =
    effectiveRole === USER_ROLES.SUPER_ADMIN || effectiveRole === USER_ROLES.ADMIN

  // Filter & Pagination State (Default to MEMBER as 'role' query parameter is REQUIRED)
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.MEMBER)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")

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

  const fetchUsers = useCallback(async () => {
    if (!isAuthorized) return
    try {
      const response = await userManagementApi.listUsers({ role: selectedRole, page, size })
      const pageData: UserPageResponse | undefined = response.data

      // Defensive pagination unwrapping
      const userList = pageData?.content ?? pageData?.items ?? []
      const total = pageData?.totalElements ?? userList.length
      const pages = pageData?.totalPages ?? (Math.ceil(total / size) || 1)

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
        text: err?.response?.data?.message || "Could not retrieve accounts from API server. Verify backend connectivity.",
      })
    } finally {
      setLoading(false)
    }
  }, [selectedRole, page, size, isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return
    let isMounted = true
    userManagementApi
      .listUsers({ role: selectedRole, page, size })
      .then((response) => {
        if (isMounted) {
          const pageData: UserPageResponse | undefined = response.data
          const userList = pageData?.content ?? pageData?.items ?? []
          const total = pageData?.totalElements ?? userList.length
          const pages = pageData?.totalPages ?? (Math.ceil(total / size) || 1)
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
            text: err?.response?.data?.message || "Could not retrieve accounts from API server. Verify backend connectivity.",
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
  }, [selectedRole, page, size, isAuthorized])

  // Local UI Text Search filtering
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return rawUsers
    const q = searchQuery.toLowerCase()
    return rawUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q))
    )
  }, [rawUsers, searchQuery])

  // Role Tab switch handler
  const handleSelectRole = (role: UserRole) => {
    if (role === selectedRole) return
    setLoading(true)
    setSelectedRole(role)
    setPage(1)
    setSearchQuery("")
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
        setStatusAlert({ type: "success", text: `Account for ${targetUser.displayName || targetUser.email} successfully updated.` })
      } else {
        // Create mode (POST)
        const created = await userManagementApi.createUser(payload as UserCreateRequest)
        const newEmail = (payload as UserCreateRequest).email
        setStatusAlert({
          type: "success",
          text: `Account for ${created.data?.displayName || newEmail} provisioned successfully! Temporary credentials dispatched via email.`,
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
      setStatusAlert({ type: "success", text: `Account #${targetUser.id} (${targetUser.email}) permanently revoked.` })
      setIsDeleteOpen(false)
      await fetchUsers()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || "Failed to terminate user account. Backend server rejected deletion.",
      })
      setIsDeleteOpen(false)
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
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied: Protected Route</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          The <strong className="text-slate-800">User & Account Management</strong> subsystem is restricted solely to tenant <strong className="text-blue-600">ADMIN</strong> and <strong className="text-amber-600">SUPER_ADMIN</strong> authorities. Your current effective role is <strong className="text-slate-900">{effectiveRole}</strong>.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Use the Topbar Dev Role Switcher to toggle to SUPER_ADMIN to test this page.</span>
        </div>
      </div>
    )
  }

  const getRoleDisplayLabel = () => {
    switch (selectedRole) {
      case USER_ROLES.MEMBER: return "Patient Member"
      case USER_ROLES.DOCTOR: return "Clinical Doctor"
      case USER_ROLES.ADMIN: return "Tenant Admin"
      case USER_ROLES.SUPER_ADMIN: return "Super Admin"
      default: return String(selectedRole)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Role Switcher Tabs (Fulfilling required API role parameter) */}
      <UserRoleTabs selectedRole={selectedRole} onSelectRole={handleSelectRole} loading={loading} />

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
          onSearchChange={setSearchQuery}
          onOpenCreate={handleOpenCreate}
          totalElements={totalElements}
          currentRoleLabel={getRoleDisplayLabel()}
          loading={loading}
        />

        <UserTable
          users={filteredUsers}
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
    </div>
  )
}

export default UserManagementPage
