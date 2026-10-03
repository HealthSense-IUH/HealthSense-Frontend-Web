import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"
import { ShieldAlert, Sparkles, CheckCircle2, AlertCircle, Plus } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useAppShell } from "@/components/layout/app-shell-context"
import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
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
  const { t } = useTranslation("management")
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
        text: err?.response?.data?.message || i18n.t("management:users.page.alerts.loadFailed"),
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
            text: err?.response?.data?.message || i18n.t("management:users.page.alerts.loadFailed"),
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
        setStatusAlert({ type: "success", text: t("users.page.alerts.updated", { name: targetUser.displayName || targetUser.email }) })
      } else {
        // Create mode (POST)
        const created = await userManagementApi.createUser(payload as UserCreateRequest)
        const newEmail = (payload as UserCreateRequest).email
        setStatusAlert({
          type: "success",
          text: t("users.page.alerts.created", { name: created.data?.displayName || newEmail }),
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
      setStatusAlert({ type: "success", text: t("users.page.alerts.deleted", { id: targetUser.id, email: targetUser.email }) })
      setIsDeleteOpen(false)
      await fetchUsers()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || t("users.page.alerts.deleteFailed"),
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
      setStatusAlert({ type: "success", text: t("users.page.alerts.fakeRecordCreated", { name: targetUser.displayName || targetUser.email }) })
      setIsFakeRecordOpen(false)
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || t("users.page.alerts.fakeRecordFailed"),
      })
      setIsFakeRecordOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  // Unauthorized screen for DOCTOR and MEMBER roles
  if (!isAuthorized) {
    return (
      <Page>
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center max-w-lg">
            <div className="p-5 rounded-2xl bg-danger-50 text-danger-600 border border-danger-200/80 shadow-xs mb-5">
              <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("users.page.unauthorized.title")}</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              <Trans
                t={t}
                i18nKey="users.page.unauthorized.body"
                values={{ role: effectiveRole }}
                components={{
                  module: <strong className="text-slate-800" />,
                  admin: <strong className="text-primary-600" />,
                  superAdmin: <strong className="text-warning-600" />,
                  role: <strong className="text-slate-900" />,
                }}
              />
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 w-full text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-warning-500" />
              <span>{t("users.page.unauthorized.hint")}</span>
            </div>
          </div>
        </PageBody>
      </Page>
    )
  }

  const getRoleDisplayLabel = () => {
    switch (selectedRole) {
      case USER_ROLES.MEMBER: return t("users.page.roleLabel.member")
      case USER_ROLES.DOCTOR: return t("users.page.roleLabel.doctor")
      case USER_ROLES.CARE_COORDINATOR: return t("users.page.roleLabel.careCoordinator")
      case USER_ROLES.ADMIN: return t("users.page.roleLabel.admin")
      default: return String(selectedRole)
    }
  }

  return (
    <Page>
      <PageHeader
        title={t("users.page.title")}
        description={t("users.page.description")}
        actions={
          <Button
            onClick={handleOpenCreate}
            disabled={loading}
            className="h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs px-4.5 shadow-sm shadow-primary-500/25 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{t("users.page.addAccount")}</span>
          </Button>
        }
      />

      <PageBody>
        {/* Role Switcher Tabs (Fulfilling required API role parameter) */}
        <UserRoleTabs selectedRole={selectedRole} onSelectRole={handleSelectRole} loading={loading} effectiveRole={effectiveRole} />

        {/* Status Alert feedback box */}
        {statusAlert && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              statusAlert.type === "success"
                ? "bg-success-50 border-success-200 text-success-900 shadow-3xs shadow-success-500/10"
                : "bg-danger-50 border-danger-200 text-danger-900 shadow-3xs shadow-danger-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              {statusAlert.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-danger-600 shrink-0" />
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
        <section aria-label={t("users.page.tableAria")} className="space-y-4">
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
            totalElements={totalElements}
            currentRoleLabel={getRoleDisplayLabel()}
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
              text: t("users.page.alerts.careProfileUpdated"),
            })
          }}
        />
      </PageBody>
    </Page>
  )
}
