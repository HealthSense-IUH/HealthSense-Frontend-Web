import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import i18n from "@/lib/i18n"
import {
  User,
  Activity,
  MessagesSquare,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { USER_ROLES } from "@/constants"
import { userManagementApi } from "@/services"
import type { UserItem, AdminMemberDetailResponse, UserUpdateRequest } from "@/types/user"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MemberPersonalTab } from "./components/member-personal-tab"
import { MemberHealthRecordsTab } from "./components/member-health-records-tab"
import { MemberConsultationsTab } from "./components/member-consultations-tab"
import { UserFormModal } from "./components/user-form-modal"

export default function MemberDetailPage() {
  const { t } = useTranslation("management")
  const { id } = useParams<{ id: string }>()
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
          text: i18n.t("management:userDetail.page.loadError"),
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
        text: t("userDetail.page.updateSuccess", { id: user.id }),
      })
      setIsEditOpen(false)
      await fetchMemberInfo()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || t("userDetail.page.updateFailed"),
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
        text: t("userDetail.page.fakeRecordSuccess", { name: user.displayName || user.email }),
      })
      await fetchMemberInfo()
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } }
      setStatusAlert({
        type: "error",
        text: err?.response?.data?.message || t("userDetail.page.fakeRecordFailed"),
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (!isAuthorized) {
    return (
      <Page>
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center max-w-lg">
            <div className="p-5 rounded-2xl bg-danger-50 text-danger-600 border border-danger-200/80 shadow-xs mb-5">
              <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t("userDetail.page.accessDeniedTitle")}</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              <Trans
                t={t}
                i18nKey="userDetail.page.accessDeniedDescription"
                components={{
                  strong: <strong className="text-slate-800" />,
                  primary: <strong className="text-primary-600" />,
                  warning: <strong className="text-warning-600" />,
                }}
              />
            </p>
          </div>
        </PageBody>
      </Page>
    )
  }

  if (loading && !user) {
    return (
      <Page>
        <PageBody className="items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
            <span className="text-sm font-bold text-slate-700">{t("userDetail.page.loading", { id })}</span>
          </div>
        </PageBody>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        breadcrumbs={[
          { label: t("userDetail.page.breadcrumbUsers"), to: "/app/management/users" },
          { label: t("userDetail.page.breadcrumbDetail") },
        ]}
        title={user?.displayName || t("userDetail.page.fallbackTitle", { id })}
        description={t("userDetail.page.description")}
      />

      <PageBody>
        {/* Status Feedback Alert */}
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

        {/* Main 3 Tabs Navigation */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 h-auto flex flex-wrap gap-1.5">
            <TabsTrigger
              value="personal"
              className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t("userDetail.page.tabs.personal")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="records"
              className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>{t("userDetail.page.tabs.records")}</span>
              {memberDetail?.totalHealthRecords != null && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-primary-100 text-primary-800">
                  {memberDetail.totalHealthRecords}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="consultations"
              className="rounded-xl px-4 py-2.5 font-extrabold text-xs flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary-700 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              <MessagesSquare className="w-4 h-4" />
              <span>{t("userDetail.page.tabs.consultations")}</span>
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
      </PageBody>
    </Page>
  )
}
