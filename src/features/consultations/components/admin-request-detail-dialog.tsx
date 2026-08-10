import { useEffect, useState } from "react"
import { AlertCircle, FileText, CheckCircle2, User, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { consultationApi } from "../services/consultation-api"
import type { ConsultationRequestReviewResponse } from "../types"
import { formatDate, statusBadge } from "./shared"

export function AdminRequestDetailDialog({
  requestId,
  open,
  onOpenChange,
  onNeedMoreInfo,
  onSelectDoctor,
  onReject,
}: {
  requestId: number | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onNeedMoreInfo: (request: ConsultationRequestReviewResponse) => void
  onSelectDoctor: (request: ConsultationRequestReviewResponse) => void
  onReject: (requestId: number | string) => void
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<ConsultationRequestReviewResponse | null>(null)

  useEffect(() => {
    if (open && requestId) {
      setLoading(true)
      consultationApi.getRequestDetail(requestId)
        .then(res => setDetail(res.data))
        .catch(err => {
          toast({ variant: "destructive", description: "Failed to load request detail." })
          onOpenChange(false)
        })
        .finally(() => setLoading(false))
    } else {
      setDetail(null)
    }
  }, [open, requestId, toast, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Detail #{requestId}</DialogTitle>
          <DialogDescription>
            Review consultation request and assign a doctor.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading detail...</div>
        ) : detail ? (
          <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">Status:</span>
                {statusBadge(detail.status)}
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {formatDate(detail.createdAt)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="w-4 h-4" />
                  Service Package
                </div>
                <div className="text-sm">
                  <span className="font-medium">{detail.packageNameSnapshot || "N/A"}</span>
                  <div className="text-muted-foreground text-xs mt-1">
                    {detail.packagePriceSnapshot ? detail.packagePriceSnapshot.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "Free"} &bull; {detail.packageDurationDaysSnapshot} days
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <User className="w-4 h-4" />
                  Member Info
                </div>
                {detail.member ? (
                  <div className="text-sm">
                    <span className="font-medium">{detail.member.displayName || detail.member.email}</span>
                    <div className="text-muted-foreground text-xs mt-1">
                      ID: #{detail.memberId} &bull; {detail.member.phone || "No phone"}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">ID: #{detail.memberId}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Request Reason</span>
              <div className="p-3 bg-muted/30 border rounded-md text-sm whitespace-pre-wrap">
                {detail.reason || "No reason provided."}
              </div>
            </div>

            {detail.healthRecord && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Health Record Attachment</span>
                <div className="p-3 bg-muted/30 border rounded-md text-sm">
                  #{detail.healthRecord.id} - {detail.healthRecord.title || "Health Record"}
                  {detail.healthRecord.summary && <div className="mt-1 text-xs text-muted-foreground">{detail.healthRecord.summary}</div>}
                </div>
              </div>
            )}

            {(detail.assignedDoctor || detail.preferredDoctor) && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">{detail.assignedDoctorId ? "Assigned Doctor" : "Preferred Doctor"}</span>
                <div className="flex items-center gap-2 p-3 bg-muted/30 border rounded-md text-sm">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <div>
                    <span className="font-medium">
                      {detail.assignedDoctor?.displayName || detail.preferredDoctor?.displayName || "Doctor"}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      ID: #{detail.assignedDoctorId || detail.preferredDoctor?.id}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detail.status === "WAITING_PAYMENT" && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Doctor Reserved
                </div>
                <div className="mt-1 text-xs">
                  Reserved at: {formatDate(detail.doctorReservedAt)}<br />
                  Payment deadline: {formatDate(detail.paymentDeadline)}
                </div>
              </div>
            )}

            {detail.status === "NEED_MORE_INFO" && detail.moreInfoReason && (
              <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-md text-sm">
                <div className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Waiting for member info
                </div>
                <div className="mt-1">Reason: {detail.moreInfoReason}</div>
              </div>
            )}

            {detail.memberAdditionalNote && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                <div className="font-semibold">Member has provided additional info:</div>
                <div className="mt-1">{detail.memberAdditionalNote}</div>
              </div>
            )}

          </div>
        ) : null}

        {detail && (
          <DialogFooter className="gap-2 sm:justify-between border-t pt-4">
            <div>
              {detail.status === "PENDING_REVIEW" && (
                <Button variant="destructive" onClick={() => onReject(detail.id)}>
                  Reject Request
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              {detail.status === "PENDING_REVIEW" && (
                <>
                  <Button variant="secondary" onClick={() => onNeedMoreInfo(detail)}>
                    Request More Info
                  </Button>
                  <Button onClick={() => onSelectDoctor(detail)}>
                    Select Doctor
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
