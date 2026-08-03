import { CheckCircle2, RefreshCw, ShieldAlert, Stethoscope, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { AdminActionDialog } from "../components/admin-action-dialog"
import { ChatWorkspace } from "../components/chat/chat-workspace"
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
    <>
      <Tabs defaultValue={logic.isAdmin ? "admin-requests" : logic.isMember ? "create-request" : "sessions"} className="flex flex-col lg:flex-row h-[calc(100vh-220px)] w-full gap-6 pb-2">
      <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
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
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border/50 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Role:</span>
              <span className="text-xs font-semibold text-foreground">{roleLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-border/50 bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">ID:</span>
              <span className="text-xs font-semibold text-foreground">#{logic.userSession?.userId ?? "-"}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => void logic.loadData()} disabled={logic.loading} className="w-full shadow-sm mt-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {logic.alert && (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-lg border p-3 text-sm font-medium",
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

        <TabsList className="flex flex-col items-stretch h-auto bg-transparent p-0 gap-1 border-none w-full">
          {logic.isMember && <TabsTrigger value="records" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted/60 data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-border/50">My Health Records</TabsTrigger>}
          {logic.isMember && <TabsTrigger value="create-request" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted/60 data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-border/50">Create Request</TabsTrigger>}
          {!logic.isDoctor && <TabsTrigger value={logic.isAdmin ? "admin-requests" : "my-requests"} className="justify-start px-4 py-2.5 data-[state=active]:bg-muted/60 data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-border/50">{logic.isAdmin ? "Requests Management" : "My Requests"}</TabsTrigger>}
          {logic.isAdmin && <TabsTrigger value="create-session" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted/60 data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-border/50">Create Session</TabsTrigger>}
          <TabsTrigger value="sessions" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted/60 data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-border/50">{logic.isAdmin ? "Sessions Management" : "My Consultations"}</TabsTrigger>
          {!logic.isAdmin && <TabsTrigger value="chat" className="justify-start px-4 py-2.5 data-[state=active]:bg-[#EBF7EE] data-[state=active]:text-[#2E7D32] data-[state=active]:shadow-none hover:bg-muted/40 text-left border border-transparent data-[state=active]:border-[#84D396]">Chat Room</TabsTrigger>}
        </TabsList>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0 flex flex-col bg-background rounded-2xl shadow-sm border border-border overflow-hidden h-full">
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
              loading={logic.actionLoading}
              onChange={logic.setRequestForm}
              onSubmit={logic.handleCreateRequest}
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
            onExtend={logic.openExtendDialog}
            onClose={logic.openCloseDialog}
            onExpireOverdue={logic.handleExpireOverdue}
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
            />
          </TabsContent>
        )}
      </div>
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
    </>
  )
}

export default ConsultationsPage
