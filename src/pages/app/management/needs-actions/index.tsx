import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import {
  ListTodo,
  RefreshCw,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/features/auth/auth-store"
import { needsActionApi } from "@/services"
import type { NeedsActionResponse, NeedsActionStatus, NeedsActionType } from "@/types/needs-action"
import { NeedsActionDetailDialog } from "@/features/needs-actions/components/needs-action-detail-dialog"

export default function NeedsActionsPage() {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "CARE_COORDINATOR"

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<NeedsActionResponse[]>([])
  const [page] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [statusTab, setStatusTab] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Detail dialog
  const [selectedItem, setSelectedItem] = useState<NeedsActionResponse | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Fetch Needs Action list
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await needsActionApi.listNeedsActions({
        status: statusTab !== "ALL" ? (statusTab as NeedsActionStatus) : undefined,
        type: typeFilter !== "ALL" ? (typeFilter as NeedsActionType) : undefined,
        page,
        size: pageSize,
      })
      setItems(res.data?.content || [])
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: anyErr.response?.data?.message || "Không thể tải danh sách công việc cần xử lý.",
      })
    } finally {
      setLoading(false)
    }
  }, [statusTab, typeFilter, page, pageSize, toast])

  useEffect(() => {
    void fetchItems()
  }, [fetchItems])

  // Handle URL query ?itemId=
  useEffect(() => {
    const itemIdParam = searchParams.get("itemId")
    if (itemIdParam) {
      needsActionApi
        .getNeedsAction(itemIdParam)
        .then((res) => {
          if (res.data) {
            setSelectedItem(res.data)
            setDetailOpen(true)
          }
        })
        .catch(() => {
          // Ignore invalid item ID
        })
    }
  }, [searchParams])

  // Client-side search query filtering
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      String(item.id).includes(q)
    )
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px]">CRITICAL</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px]">HIGH</Badge>
      default:
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[10px]">NORMAL</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]">RESOLVED</Badge>
      case "CLAIMED":
        return <Badge className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-[10px]">CLAIMED</Badge>
      default:
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px]">OPEN</Badge>
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Hàng đợi Xử lý Vận hành (Needs Action)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Các nghiệp vụ cần can thiệp xử lý, điều phối và đối soát ngoại tuyến (Vai trò: <span className="font-bold text-slate-700">{role}</span>)
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchItems()}
          disabled={loading}
          className="h-9 font-semibold text-xs border-slate-200 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-slate-100/80">
            <TabsTrigger value="ALL" className="text-xs font-bold">Tất cả</TabsTrigger>
            <TabsTrigger value="OPEN" className="text-xs font-bold text-amber-600">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="CLAIMED" className="text-xs font-bold text-sky-600">Đang xử lý</TabsTrigger>
            <TabsTrigger value="RESOLVED" className="text-xs font-bold text-emerald-600">Đã xong</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 rounded-xl border-slate-200"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl border-slate-200">
              <SelectValue placeholder="Lọc loại sự kiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại sự kiện</SelectItem>
              <SelectItem value="PAYMENT_REQUIRES_REVIEW">Payment Review</SelectItem>
              <SelectItem value="PROVIDER_CANCELLATION_RECONCILIATION">Provider Cancellation</SelectItem>
              <SelectItem value="REFUND_REVIEW_REQUIRED">Refund Review</SelectItem>
              <SelectItem value="REFUND_PROVIDER_FAILURE">Refund Provider Failure</SelectItem>
              <SelectItem value="DOCTOR_ACTIVE_CARE_INTERRUPTION">Doctor Interruption</SelectItem>
              <SelectItem value="MEMBER_ACTIVE_CARE_INTERRUPTION">Member Interruption</SelectItem>
              <SelectItem value="TERMINATION_REVIEW">Termination Review</SelectItem>
              <SelectItem value="SUMMARY_PENDING">Summary Pending</SelectItem>
              <SelectItem value="SUMMARY_OVERDUE">Summary Overdue</SelectItem>
              <SelectItem value="SUMMARY_ESCALATED">Summary Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs font-medium">Đang tải danh sách hàng đợi công việc...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="rounded-3xl border-slate-200 shadow-xs bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800">Hàng đợi trống</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Không có công việc vận hành nào cần xử lý trong danh mục được phân công cho vai trò của bạn.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => {
                setSelectedItem(item)
                setDetailOpen(true)
              }}
              className="rounded-2xl border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] text-slate-400 font-bold">#{item.id}</span>
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                        {item.assignedRole}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {item.claimedByUserId && (
                    <span className="text-blue-600 font-semibold">
                      Phụ trách: #{item.claimedByUserId}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Needs Action Detail Dialog */}
      <NeedsActionDetailDialog
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSuccess={() => {
          void fetchItems()
        }}
      />
    </div>
  )
}
