import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ShieldAlert, RefreshCw, Eye, MessageSquare, AlertTriangle, FileText, Calendar, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { USER_ROLES } from "@/constants"
import { useAppShell } from "@/components/layout/app-shell-context"

import { consultationApi } from "@/services"
import type { DoctorConsultationSessionResponse } from "@/types/consultation"
import { formatDate } from "../components/shared"
import { DoctorSessionDetailDialog } from "../components/doctor-session-detail-dialog"

function readError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string }
  return err.response?.data?.message || err.message || fallback
}

function getSessionStatusBadge(status: string) {
  switch (status) {
    case "SCHEDULED":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đã lên lịch</Badge>
    case "ACTIVE":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Đang chăm sóc</Badge>
    case "COMPLETED":
      return <Badge variant="secondary" className="bg-neutral-100 text-neutral-700">Đã hoàn tất</Badge>
    case "EXPIRED":
      return <Badge variant="destructive">Đã hết hạn</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function DoctorSessionsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { effectiveRole } = useAppShell()
  const isDoctor = effectiveRole === USER_ROLES.DOCTOR

  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<DoctorConsultationSessionResponse[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null)
  
  const loadSessions = useCallback(async (pageNum: number, isRefresh = false) => {
    if (!isDoctor) return
    try {
      setLoading(true)
      const res = await consultationApi.getDoctorSessions({ page: pageNum, size: 10 })
      const data = res.data.content || []
      
      if (isRefresh || pageNum === 1) {
        setSessions(data)
      } else {
        setSessions(prev => [...prev, ...data])
      }
      
      setHasMore(data.length === 10)
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast({ variant: "destructive", description: "Bạn không có quyền truy cập trang bác sĩ." })
      } else {
        toast({ variant: "destructive", description: readError(error, "Lỗi tải danh sách phiên chăm sóc.") })
      }
    } finally {
      setLoading(false)
    }
  }, [isDoctor, toast])

  useEffect(() => {
    if (isDoctor) {
      loadSessions(1, true)
    }
  }, [isDoctor, loadSessions])

  if (!isDoctor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Quyền truy cập bị từ chối</h2>
        <p className="text-neutral-500 mb-6">Bạn không có quyền truy cập trang bác sĩ.</p>
        <Button onClick={() => navigate("/app/general/dashboard")}>Về trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Phiên chăm sóc (Active Care)</h2>
          <p className="text-neutral-500">Quản lý các phiên chăm sóc và tư vấn cho bệnh nhân.</p>
        </div>
        <Button variant="outline" onClick={() => loadSessions(1, true)} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {loading && sessions.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border-dashed bg-neutral-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-1">Chưa có phiên chăm sóc nào</h3>
            <p className="text-sm text-neutral-500">Bạn chưa được phân công phiên chăm sóc nào vào lúc này.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sessions.map(session => (
            <Card key={session.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      Bệnh nhân #{session.memberId}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono mt-1">
                      ID: {session.id}
                    </CardDescription>
                  </div>
                  {getSessionStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-3 space-y-4">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div className="flex items-start gap-2 text-neutral-600">
                    <Calendar className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-900">Bắt đầu</p>
                      <p>{formatDate(session.startedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-600">
                    <Clock className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-900">Kết thúc</p>
                      <p>{formatDate(session.endsAt) || 'Không xác định'}</p>
                    </div>
                  </div>
                </div>

                {session.unresolvedAttentionCount > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-md p-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        Có {session.unresolvedAttentionCount} hồ sơ cần xem
                      </p>
                      <p className="text-xs text-orange-700 mt-0.5">Sẽ bổ sung chi tiết ở batch tiếp theo.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-3 border-t bg-neutral-50/50 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedSessionId(session.id)}
                >
                  <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                </Button>
                {session.status === "ACTIVE" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/app/general/consultations?tab=chat&sessionId=${session.id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Mở Chat
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              loadSessions(nextPage)
            }}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            Tải thêm
          </Button>
        </div>
      )}

      {selectedSessionId && (
        <DoctorSessionDetailDialog 
          sessionId={selectedSessionId} 
          open={!!selectedSessionId} 
          onOpenChange={(open) => !open && setSelectedSessionId(null)} 
        />
      )}
    </div>
  )
}
