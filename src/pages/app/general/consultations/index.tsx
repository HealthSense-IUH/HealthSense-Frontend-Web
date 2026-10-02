import { useEffect, useState } from "react"
import { Calendar, CheckCircle2, Coins, Inbox, RefreshCw, ShieldAlert, Stethoscope, Users, XCircle, X } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Page, PageBody, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { AdminActionDialog } from "@/pages/app/general/consultations/components/admin-action-dialog"
import { AdminRequestDetailDialog } from "@/pages/app/general/consultations/components/admin-request-detail-dialog"
import { CareAgreementDialog } from "@/pages/app/general/consultations/components/care-agreement-dialog"
import { CreateRequestPanel } from "@/pages/app/general/consultations/components/create-request-panel"
import { DoctorCandidatesDialog } from "@/pages/app/general/consultations/components/doctor-candidates-dialog"
import { DoctorCareProfileDialog } from "@/pages/app/general/consultations/components/doctor-care-profile-dialog"
import { MemberQueuePanel } from "@/pages/app/general/consultations/components/member-queue-panel"
import { MemberCreditsPanel } from "@/pages/app/general/consultations/components/member-credits-panel"
import { PendingConflictDialog } from "@/pages/app/general/consultations/components/pending-conflict-dialog"
import { DoctorDispatchHeader } from "@/pages/app/management/doctor-consultations/components/doctor-dispatch-header"
import { DoctorOfferCard } from "@/pages/app/management/doctor-consultations/components/doctor-offer-card"
import { DoctorScheduleDialog } from "@/pages/app/management/doctor-consultations/components/doctor-schedule-dialog"
import { RequestsPanel } from "@/pages/app/general/consultations/components/requests-panel"
import { SessionsPanel } from "@/pages/app/general/consultations/components/sessions-panel"
import { useConsultationsLogic } from "@/pages/app/general/consultations/hooks/use-consultations-logic"

export default function ConsultationsPage() {
  const logic = useConsultationsLogic()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showRegisterForm, setShowRegisterForm] = useState(false)

  const hasActiveQueue = Boolean(
    logic.currentQueueState &&
    (logic.currentQueueState.queueStatus === "WAITING" ||
     logic.currentQueueState.queueStatus === "OFFERING_DOCTOR" ||
     logic.currentQueueState.queueStatus === "WAITING_CONFIRMATION" ||
     logic.currentQueueState.queueStatus === "WAITING_MEMBER_CONFIRMATION" ||
     logic.currentQueueState.phase === "QUEUE" ||
     logic.currentQueueState.phase === "WAITING_CONFIRMATION" ||
     logic.currentQueueState.phase === "ACTIVE_SESSION")
  )

  // Khi đã có hàng đợi hoạt động, luôn ẩn form đăng ký
  useEffect(() => {
    if (hasActiveQueue) {
      setShowRegisterForm(false)
    }
  }, [hasActiveQueue])

  const tabParam = searchParams.get("tab")
  const defaultTab = logic.isAdmin 
    ? "admin-requests" 
    : logic.isMember 
      ? "queue" 
      : "sessions"
  const activeTab = tabParam === "requests"
    ? (logic.isAdmin ? "admin-requests" : "queue")
    : tabParam === "create-request"
      ? "queue"
      : tabParam === "chat"
        ? "sessions"
        : (tabParam || defaultTab)

  useEffect(() => {
    const pkgId = searchParams.get("packageId")
    if (pkgId && logic.isMember) {
      logic.setRequestForm((prev) => (prev.packageId === pkgId ? prev : { ...prev, packageId: pkgId }))
      setShowRegisterForm(true)
    }
  }, [searchParams, logic.isMember, logic.setRequestForm])

  useEffect(() => {
    if (tabParam === "create-request") {
      setShowRegisterForm(true)
    }
  }, [tabParam])


  if (!logic.isAdmin && !logic.isDoctor && !logic.isMember) {
    return (
      <Page>
        <PageHeader icon={<Stethoscope className="w-5 h-5" />} title="Tư vấn & Chăm sóc" />
        <PageBody className="items-center justify-center text-center">
          <div className="flex max-w-lg flex-col items-center gap-4">
            <ShieldAlert className="text-danger-500" />
            <h2 className="text-2xl font-bold text-slate-950">Truy cập bị từ chối</h2>
            <p className="text-sm text-slate-500">Mô-đun tư vấn chỉ dành cho các vai trò Hội viên, Bác sĩ và Quản trị viên.</p>
          </div>
        </PageBody>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader
        icon={<Stethoscope className="w-5 h-5" />}
        title="Tư vấn & Chăm sóc"
        description="Quản lý các buổi và phiên tư vấn 1-1 của bạn."
        actions={
          <Button variant="outline" size="sm" onClick={() => void logic.loadData()} disabled={logic.loading} className="shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      <PageBody className="gap-4">
        {logic.alert && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shrink-0",
              logic.alert.type === "success"
                ? "border-success-200 bg-success-50 text-success-900"
                : "border-danger-200 bg-danger-50 text-danger-900"
            )}
          >
            {logic.alert.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            <span className="flex-1">{logic.alert.text}</span>
            <button
              type="button"
              aria-label="Đóng thông báo"
              className="rounded-md p-1 opacity-60 hover:opacity-100 hover:bg-black/5 cursor-pointer"
              onClick={() => logic.setAlert(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="min-w-0 gap-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-10 bg-muted/60 p-1 rounded-xl">
              {logic.isMember && (
                <>
                  <TabsTrigger value="queue" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>Hàng đợi tư vấn</span>
                    {hasActiveQueue && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-warning-500 text-white font-bold animate-pulse">
                        Đang chờ
                      </span>
                    )}
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
                  <TabsTrigger value="credits" className="rounded-lg text-xs font-semibold gap-1.5 px-3">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Lượt tư vấn</span>
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
                </>
              )}
            </TabsList>
          </div>

          {logic.isMember && (
            <TabsContent value="queue" className="m-0 space-y-4">
              {hasActiveQueue || !showRegisterForm ? (
                <MemberQueuePanel
                  queueState={logic.currentQueueState}
                  latestRequest={logic.requests[0] ?? null}
                  loading={logic.loading}
                  actionLoading={logic.actionLoading}
                  insufficientCredits={logic.insufficientCredits}
                  onConfirm={logic.handleConfirmQueue}
                  onCancel={(requestId) => {
                    logic.handleCancelQueue(requestId)
                    setShowRegisterForm(false)
                  }}
                  onRefresh={logic.fetchCurrentQueueState}
                  onOpenSession={(sessionId: string | number) => {
                    navigate(`/app/general/consultations/${sessionId}`)
                  }}
                  onRegisterNew={() => setShowRegisterForm(true)}
                />
              ) : (
                <CreateRequestPanel
                  form={logic.requestForm}
                  healthRecords={logic.healthRecords}
                  packages={logic.packages}
                  availableCredits={logic.wallet?.available}
                  hasActiveQueue={hasActiveQueue}
                  loading={logic.actionLoading}
                  insufficientCredits={logic.insufficientCredits}
                  queueStatistics={logic.queueStatistics}
                  onChange={logic.setRequestForm}
                  onSubmit={(e) =>
                    logic.handleCreateRequest(e, () => {
                      setShowRegisterForm(false)
                    })
                  }
                  onPendingConflict={() => logic.setIsPendingConflictDialogOpen(true)}
                  onCancel={() => setShowRegisterForm(false)}
                />
              )}
            </TabsContent>
          )}

        {logic.isAdmin && (
          <TabsContent value="admin-requests" className="m-0">
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
            />
          </TabsContent>
        )}

        <TabsContent value="sessions" className="m-0 space-y-4">
          {logic.isDoctor && (
            <>
              <DoctorDispatchHeader
                dispatchStatus={logic.doctorDispatchStatus}
                loading={logic.loading}
                actionLoading={logic.actionLoading}
                hasProfile={logic.hasDoctorProfile}
                profileLoading={logic.doctorProfileLoading}
                onToggleStatus={logic.handleToggleDoctorDispatchStatus}
                onToggleStopAfterCurrentSession={logic.handleToggleDoctorStopAfterCurrentSession}
                onRetryProfile={logic.fetchDoctorCareProfile}
                onOpenScheduleDialog={() => logic.setIsDoctorScheduleOpen(true)}
              />

              {logic.doctorCurrentOffer && (
                <DoctorOfferCard
                  offer={logic.doctorCurrentOffer}
                  actionLoading={logic.actionLoading}
                  onAccept={logic.handleAcceptDoctorOffer}
                  onReject={logic.handleRejectDoctorOffer}
                  onOfferExpired={logic.fetchDoctorDispatchAndOffer}
                />
              )}
            </>
          )}

          <SessionsPanel
            isAdmin={logic.isAdmin}
            sessions={logic.sessions}
            loading={logic.loading || logic.actionLoading}
            selectedSessionId={logic.selectedSession?.id ?? null}
            onClose={logic.openCloseDialog}
            onSessionRefreshed={logic.loadData}
          />
        </TabsContent>

        {logic.isMember && (
          <TabsContent value="credits" className="m-0 space-y-6">
            <MemberCreditsPanel />
          </TabsContent>
        )}
        </Tabs>
      </PageBody>

      <AdminActionDialog
        mode={logic.adminDialogMode}
        request={logic.targetRequest}
        session={logic.targetSession}
        doctorId={logic.doctorId}
        reason={logic.reason}
        terminationReason={logic.terminationReason}
        meaningfulCareOccurred={logic.meaningfulCareOccurred}
        loading={logic.actionLoading}
        onDoctorIdChange={logic.setDoctorId}
        onReasonChange={logic.setReason}
        onTerminationReasonChange={logic.setTerminationReason}
        onMeaningfulCareOccurredChange={logic.setMeaningfulCareOccurred}
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
        onOpenCareProfile={(docId) => logic.openDoctorCareProfile(String(docId))}
        isReserving={logic.actionLoading}
        reservingDoctorId={logic.reservingDoctorId}
      />

      <DoctorCareProfileDialog
        doctorId={logic.targetDoctorId}
        open={logic.isDoctorCareProfileOpen}
        onOpenChange={logic.setIsDoctorCareProfileOpen}
      />

      <DoctorScheduleDialog
        isOpen={logic.isDoctorScheduleOpen}
        onClose={() => logic.setIsDoctorScheduleOpen(false)}
        currentProfile={logic.doctorCareProfile}
        onSuccess={() => {
          void logic.fetchDoctorCareProfile()
        }}
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

      <PendingConflictDialog
        open={logic.isPendingConflictDialogOpen}
        onOpenChange={logic.setIsPendingConflictDialogOpen}
        onGoToQueue={() => setSearchParams({ tab: "queue" })}
        queueNumber={logic.currentQueueState?.queueNumber}
      />
    </Page>
  )
}
