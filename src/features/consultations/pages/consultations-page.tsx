import { CheckCircle2, RefreshCw, ShieldAlert, Stethoscope, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { AdminActionDialog } from "../components/admin-action-dialog"
import { ChatPanel } from "../components/chat-panel"
import { CreateAdminSessionPanel } from "../components/create-admin-session-panel"
import { CreateRequestPanel } from "../components/create-request-panel"
import { HealthRecordsPanel } from "../components/health-records-panel"
import { RequestsPanel } from "../components/requests-panel"
import { SessionsPanel } from "../components/sessions-panel"
import { useConsultationsLogic } from "../hooks/use-consultations-logic"

export function ConsultationsPage() {
  const logic = useConsultationsLogic()

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
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-neutral-950 p-3 text-white">
            <Stethoscope />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Consultations</h1>
            <p className="text-sm text-neutral-500">
              1-on-1 Consultation flow: create request, admin creates session, then chat with doctor.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          <Badge variant="outline">User #{logic.userSession?.userId ?? "-"}</Badge>
          <Button variant="outline" size="sm" onClick={() => void logic.loadData()} disabled={logic.loading}>
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
        </div>
      </div>

      {logic.alert && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border p-4 text-sm font-medium",
            logic.alert.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          )}
        >
          <span className="flex items-center gap-2">
            {logic.alert.type === "success" ? <CheckCircle2 /> : <XCircle />}
            {logic.alert.text}
          </span>
          <Button variant="ghost" size="sm" onClick={() => logic.setAlert(null)}>
            Close
          </Button>
        </div>
      )}

      <Tabs defaultValue={logic.isAdmin ? "admin-requests" : logic.isMember ? "create-request" : "sessions"} className="flex flex-col gap-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {logic.isMember && <TabsTrigger value="records">My Health Records</TabsTrigger>}
          {logic.isMember && <TabsTrigger value="create-request">Create Consultation Request</TabsTrigger>}
          {!logic.isDoctor && <TabsTrigger value={logic.isAdmin ? "admin-requests" : "my-requests"}>{logic.isAdmin ? "Requests Management" : "My Consultation Requests"}</TabsTrigger>}
          {logic.isAdmin && <TabsTrigger value="create-session">Create Consultation Session</TabsTrigger>}
          <TabsTrigger value="sessions">{logic.isAdmin ? "Sessions Management" : "My Consultations"}</TabsTrigger>
          {!logic.isAdmin && <TabsTrigger value="chat">Chat Room</TabsTrigger>}
        </TabsList>

        {logic.isMember && (
          <TabsContent value="records" className="m-0">
            <HealthRecordsPanel records={logic.healthRecords} loading={logic.loading} onSelect={(record) => logic.setRequestForm((prev) => ({ ...prev, healthRecordId: String(record.id) }))} />
          </TabsContent>
        )}

        {logic.isMember && (
          <TabsContent value="create-request" className="m-0">
            <CreateRequestPanel
              form={logic.requestForm}
              healthRecords={logic.healthRecords}
              loading={logic.actionLoading}
              onChange={logic.setRequestForm}
              onSubmit={logic.handleCreateRequest}
            />
          </TabsContent>
        )}

        {!logic.isDoctor && (
          <TabsContent value={logic.isAdmin ? "admin-requests" : "my-requests"} className="m-0">
            <RequestsPanel
              isAdmin={logic.isAdmin}
              requests={logic.requests}
              loading={logic.loading || logic.actionLoading}
              onCancel={logic.handleCancelRequest}
              onApprove={logic.openApproveDialog}
              onReject={logic.openRejectDialog}
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
          <TabsContent value="create-session" className="m-0">
            <CreateAdminSessionPanel
              form={logic.adminSessionForm}
              loading={logic.actionLoading}
              onChange={logic.setAdminSessionForm}
              onSubmit={logic.handleCreateAdminSession}
            />
          </TabsContent>
        )}

        <TabsContent value="sessions" className="m-0">
          <SessionsPanel
            isAdmin={logic.isAdmin}
            sessions={logic.sessions}
            loading={logic.loading || logic.actionLoading}
            selectedSessionId={logic.selectedSession?.id ?? null}
            onSelect={logic.setSelectedSession}
            onExtend={logic.openExtendDialog}
            onClose={logic.openCloseDialog}
            onExpireOverdue={logic.handleExpireOverdue}
          />
        </TabsContent>

        {!logic.isAdmin && (
          <TabsContent value="chat" className="m-0">
            <ChatPanel
              sessions={logic.sessions}
              selectedSession={logic.selectedSession}
              messages={logic.sortedMessages}
              socketStatus={logic.socketStatus}
              messageDraft={logic.messageDraft}
              attachmentUrl={logic.attachmentUrl}
              loading={logic.actionLoading}
              loadingMoreMessages={logic.loadingMoreMessages}
              hasMoreMessages={logic.hasMoreMessages}
              currentUserId={logic.userSession?.userId}
              onSelectSession={logic.setSelectedSession}
              onMessageChange={logic.setMessageDraft}
              onAttachmentChange={logic.setAttachmentUrl}
              onSubmit={logic.handleSendMessage}
              onLoadMore={logic.handleLoadMoreMessages}
            />
          </TabsContent>
        )}
      </Tabs>

      <AdminActionDialog
        mode={logic.adminDialogMode}
        request={logic.targetRequest}
        session={logic.targetSession}
        doctorId={logic.doctorId}
        endsAt={logic.endsAt}
        supportEndsAt={logic.supportEndsAt}
        reason={logic.reason}
        loading={logic.actionLoading}
        onDoctorIdChange={logic.setDoctorId}
        onEndsAtChange={logic.setEndsAt}
        onSupportEndsAtChange={logic.setSupportEndsAt}
        onReasonChange={logic.setReason}
        onSubmit={logic.handleAdminDialogSubmit}
        onOpenChange={(open) => {
          if (!open) {
            logic.setAdminDialogMode(null)
          }
        }}
      />
    </div>
  )
}

export default ConsultationsPage
