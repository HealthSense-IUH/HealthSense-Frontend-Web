import { useEffect } from "react"
import { Activity, Calendar, CheckCircle2, Inbox, MessagesSquare, PlusCircle, RefreshCw, ShieldAlert, Stethoscope, XCircle } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { AdminActionDialog } from "@/pages/app/general/consultations/components/admin-action-dialog"
import { AdminRequestDetailDialog } from "@/pages/app/general/consultations/components/admin-request-detail-dialog"
import { CareAgreementDialog } from "@/pages/app/general/consultations/components/care-agreement-dialog"
import { ChatWorkspace } from "@/pages/app/general/consultations/components/chat/chat-workspace"
import { CreateAdminSessionPanel } from "@/pages/app/general/consultations/components/create-admin-session-panel"
import { CreateRequestPanel } from "@/pages/app/general/consultations/components/create-request-panel"
import { DoctorCandidatesDialog } from "@/pages/app/general/consultations/components/doctor-candidates-dialog"
import { DoctorCareProfileDialog } from "@/pages/app/general/consultations/components/doctor-care-profile-dialog"
import { HealthRecordsPanel } from "@/pages/app/general/consultations/components/health-records-panel"
import { RequestsPanel } from "@/pages/app/general/consultations/components/requests-panel"
import { SessionsPanel } from "@/pages/app/general/consultations/components/sessions-panel"
import { useConsultationsLogic } from "@/pages/app/general/consultations/hooks/use-consultations-logic"

export default function ConsultationsPage() {
  const logic = useConsultationsLogic()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get("tab")
  const defaultTab = logic.isAdmin 
    ? "admin-requests" 
    : logic.isMember 
      ? (logic.requests.length > 0 ? "my-requests" : "create-request") 
      : "sessions"
  const activeTab = tabParam === "requests"
    ? (logic.isAdmin ? "admin-requests" : "my-requests")
    : (tabParam || defaultTab)

  useEffect(() => {
    const pkgId = searchParams.get("packageId")
    if (pkgId && logic.isMember) {
      logic.setRequestForm((prev) => (prev.packageId === pkgId ? prev : { ...prev, packageId: pkgId }))
    }
  }, [searchParams, logic.isMember, logic.setRequestForm])

  const roleLabel = logic.isAdmin ? "Admin" : logic.isDoctor ? "Doctor" : "Member"

  if (!logic.isAdmin && !logic.isDoctor && !logic.isMember) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-24 text-center">
        <ShieldAlert className="text-red-500" />
        <h2 className="text-2xl font-bold text-neutral-950">Access Denied</h2>
        <p className="text-sm text-neutral-500">Consultation module is only available for Member, Doctor, and Admin roles.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-100px)] w-full gap-4 pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-4 rounded-2xl shadow-sm border border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border/50 text-muted-foreground shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">Consultations</h1>
              <p className="text-sm text-muted-foreground">
                Manage your 1-on-1 consultations.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Role:</span>
              <span className="text-xs font-semibold text-foreground">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/50 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">ID:</span>
              <span className="text-xs font-semibold text-foreground">#{logic.userSession?.userId ?? "-"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => void logic.loadData()} disabled={logic.loading} className="shadow-sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {logic.alert && (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 text-sm font-medium shrink-0",
              logic.alert.type === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900"
            )}
          >
            <div className="flex items-start gap-2">
              {logic.alert.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="flex-1">{logic.alert.text}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2 self-end" onClick={() => logic.setAlert(null)}>
              Close
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="flex-1 min-w-0 flex flex-col bg-background rounded-2xl shadow-sm border border-border overflow-hidden h-full">
          <div className="border-b border-border bg-muted/20 px-4 py-2 shrink-0 flex items-center justify-between overflow-x-auto">
            <TabsList className="h-10 bg-muted/60 p-1 rounded-xl">
              {logic.isMember && (
                <>
                  <TabsTrigger value="my-requests" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Yêu cầu của tôi</span>
                    {logic.requests.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                        {logic.requests.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="create-request" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Đăng ký tư vấn</span>
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Phiên tư vấn</span>
                    {logic.sessions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-muted-foreground/15 text-foreground font-bold">
                        {logic.sessions.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <MessagesSquare className="w-3.5 h-3.5" />
                    <span>Trò chuyện trực tiếp</span>
                  </TabsTrigger>
                  <TabsTrigger value="records" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Hồ sơ đo đạc</span>
                  </TabsTrigger>
                </>
              )}

              {logic.isAdmin && (
                <>
                  <TabsTrigger value="admin-requests" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Yêu cầu tư vấn đến</span>
                    {logic.requests.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                        {logic.requests.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sessions" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tất cả phiên tư vấn</span>
                    {logic.sessions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-muted-foreground/15 text-foreground font-bold">
                        {logic.sessions.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="create-session" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tạo phiên trực tiếp</span>
                  </TabsTrigger>
                </>
              )}

              {logic.isDoctor && (
                <>
                  <TabsTrigger value="sessions" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Phiên tư vấn phụ trách</span>
                    {logic.sessions.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                        {logic.sessions.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <MessagesSquare className="w-3.5 h-3.5" />
                    <span>Phòng trao đổi chuyên môn</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {logic.isMember && (
          <TabsContent value="records" className="m-0 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <HealthRecordsPanel records={logic.healthRecords} loading={logic.loading} onSelect={(record) => logic.setRequestForm((prev) => ({ ...prev, healthRecordId: String(record.id) }))} />
          </TabsContent>
        )}

        {logic.isMember && (
          <TabsContent value="create-request" className="m-0 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <CreateRequestPanel
              form={logic.requestForm}
              healthRecords={logic.healthRecords}
              packages={logic.packages}
              loading={logic.actionLoading}
              onChange={logic.setRequestForm}
              onSubmit={(e) => logic.handleCreateRequest(e, () => setSearchParams({ tab: "my-requests" }))}
            />
          </TabsContent>
        )}

        {!logic.isDoctor && (
          <TabsContent value={logic.isAdmin ? "admin-requests" : "my-requests"} className="m-0 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <RequestsPanel
              isAdmin={logic.isAdmin}
              requests={logic.requests}
              loading={logic.loading || logic.actionLoading}
              onCancel={logic.handleCancelRequest}
              onApprove={logic.openAdminRequestDetail}
              onSubmitMoreInfo={logic.openMoreInfoDialog}
              onReviewAgreement={logic.openAgreementDialog}
              adminFilters={logic.adminFilters}
              onAdminFilterChange={logic.setAdminFilters}
              onSearchAdminFilters={logic.loadData}
              onInitiatePayment={logic.handleInitiatePayment}
              onExpireWaitingPayment={logic.handleExpireWaitingPayment}
              onOpenSession={(sessionId) => {
                const session = logic.sessions.find((item) => String(item.id) === String(sessionId))
                if (session) {
                  logic.setSelectedSession(session)
                }
              }}
            />
          </TabsContent>
        )}

        {logic.isAdmin && (
          <TabsContent value="create-session" className="m-0 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <CreateAdminSessionPanel
              form={logic.adminSessionForm}
              loading={logic.actionLoading}
              onChange={logic.setAdminSessionForm}
              onSubmit={logic.handleCreateAdminSession}
            />
          </TabsContent>
        )}

        <TabsContent value="sessions" className="m-0 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
          <SessionsPanel
            isAdmin={logic.isAdmin}
            sessions={logic.sessions}
            loading={logic.loading || logic.actionLoading}
            selectedSessionId={logic.selectedSession?.id ?? null}
            onSelect={logic.setSelectedSession}
            onClose={logic.openCloseDialog}
            onExpireOverdue={logic.handleExpireOverdue}
            onActivateScheduled={logic.handleActivateScheduledSessions}
            onSessionRefreshed={logic.loadData}
          />
        </TabsContent>

        {!logic.isAdmin && (
          <TabsContent value="chat" className="m-0 flex-1 min-h-0 flex flex-col data-[state=active]:flex">
            <ChatWorkspace
              sessions={logic.sessions}
              selectedSession={logic.selectedSession}
              messages={logic.sortedMessages}
              messageDraft={logic.messageDraft}
              attachmentUrl={logic.attachmentUrl}
              loading={logic.actionLoading}
              loadingMoreMessages={logic.loadingMoreMessages}
              hasMoreMessages={logic.hasMoreMessages}
              currentUserId={logic.userSession?.userId}
              isDoctor={logic.isDoctor}
              isMember={logic.isMember}
              onSelectSession={logic.setSelectedSession}
              onMessageChange={logic.setMessageDraft}
              onSubmit={logic.handleSendMessage}
              onLoadMore={logic.handleLoadMoreMessages}
              isOutsideSupportHours={logic.isOutsideSupportHours}
            />
          </TabsContent>
        )}
        </Tabs>
      </div>

    <AdminActionDialog
        mode={logic.adminDialogMode}
        request={logic.targetRequest}
        session={logic.targetSession}
        doctorId={logic.doctorId}
        reason={logic.reason}
        loading={logic.actionLoading}
        onDoctorIdChange={logic.setDoctorId}
        onReasonChange={logic.setReason}
        onSubmit={logic.handleAdminDialogSubmit}
        onOpenChange={(open) => {
          if (!open) {
            logic.setAdminDialogMode(null)
          }
        }}
      />

      <Dialog open={logic.isMoreInfoDialogOpen} onOpenChange={logic.setIsMoreInfoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bổ sung thông tin cho yêu cầu #{logic.targetRequest?.id}</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp thêm thông tin theo yêu cầu của điều phối viên.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nội dung giải trình / Thông tin bổ sung *</label>
              <Textarea
                placeholder="Nhập thông tin chi tiết bổ sung tại đây..."
                value={logic.moreInfoNote}
                onChange={(e) => logic.setMoreInfoNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {logic.healthRecords.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Đính kèm thêm hồ sơ đo đạc (Tùy chọn - {logic.moreInfoSelectedRecordIds.length} đã chọn)
                </label>
                <div className="max-h-36 overflow-y-auto border rounded-xl p-2 space-y-1 bg-muted/10">
                  {logic.healthRecords.map((record) => {
                    const idStr = String(record.id)
                    const checked = logic.moreInfoSelectedRecordIds.includes(idStr)
                    return (
                      <div
                        key={record.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault()
                          logic.setMoreInfoSelectedRecordIds((prev) =>
                            prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
                          )
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            logic.setMoreInfoSelectedRecordIds((prev) =>
                              prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
                            )
                          }
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 cursor-pointer text-xs select-none border border-transparent hover:border-border transition-all"
                      >
                        <Checkbox checked={checked} tabIndex={-1} className="data-[state=checked]:bg-primary pointer-events-none" />
                        <span className="font-medium">#{record.id} {record.originalFileName ? `- ${record.originalFileName}` : ""}</span>
                        {record.predictionLabel && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            [{record.predictionLabel}]
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => logic.setIsMoreInfoDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void logic.handleSubmitMoreInfo()} disabled={logic.actionLoading || !logic.moreInfoNote.trim()}>
              Gửi thông tin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CareAgreementDialog
        open={logic.isAgreementDialogOpen}
        onOpenChange={logic.setIsAgreementDialogOpen}
        requestId={logic.agreementTargetRequestId}
        onAgreementAccepted={() => void logic.loadData()}
      />

      <AdminRequestDetailDialog
        requestId={logic.targetRequest?.id ?? null}
        open={logic.isAdminRequestDetailOpen}
        onOpenChange={logic.setIsAdminRequestDetailOpen}
        onNeedMoreInfo={logic.openAdminRequestMoreInfo}
        onSelectDoctor={logic.openDoctorCandidates}
        onReject={logic.openRejectDialog}
      />

      <DoctorCandidatesDialog
        requestId={logic.targetRequest?.id ?? null}
        open={logic.isDoctorCandidatesOpen}
        onOpenChange={logic.setIsDoctorCandidatesOpen}
        onReserveDoctor={(doctorId) => void logic.handleReserveDoctor(doctorId)}
        onOpenCareProfile={logic.openDoctorCareProfile}
        isReserving={logic.actionLoading}
        reservingDoctorId={logic.reservingDoctorId}
      />

      <DoctorCareProfileDialog
        doctorId={logic.targetDoctorId}
        open={logic.isDoctorCareProfileOpen}
        onOpenChange={logic.setIsDoctorCareProfileOpen}
      />

      <Dialog open={logic.isAdminMoreInfoDialogOpen} onOpenChange={logic.setIsAdminMoreInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu bổ sung thông tin</DialogTitle>
            <DialogDescription>
              Gửi yêu cầu bổ sung thông tin đến thành viên cho yêu cầu #{logic.targetRequest?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea
              placeholder="Nhập lý do cần bổ sung..."
              value={logic.adminMoreInfoReason}
              onChange={(e) => logic.setAdminMoreInfoReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => logic.setIsAdminMoreInfoDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => void logic.handleAdminSubmitMoreInfoRequest()} disabled={logic.actionLoading || !logic.adminMoreInfoReason.trim()}>
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
