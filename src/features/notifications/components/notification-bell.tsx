import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  HeartPulse,
  MessagesSquare,
  RefreshCw,
  Sparkles,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/features/auth/auth-store"
import { notificationApi } from "@/services"
import type { NotificationResponse, NotificationType } from "@/types/notification"

export function NotificationBell() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "MEMBER"

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  // 1. Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationApi.getUnreadCount()
      setUnreadCount(res.data?.unreadCount ?? 0)
    } catch {
      // Silently catch polling errors
    }
  }, [])

  // 2. Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingList(true)
      const res = await notificationApi.listNotifications({ page: 1, size: 20 })
      setNotifications(res.data?.content || [])
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách thông báo.",
      })
    } finally {
      setLoadingList(false)
    }
  }, [toast])

  // Polling unread count every 30s
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // When popover opens, fetch list & refresh unread count
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      void fetchNotifications()
      void fetchUnreadCount()
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true)
      await notificationApi.markAllRead()
      setUnreadCount(0)
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      )
      toast({
        title: "Thành công",
        description: "Đã đánh dấu tất cả thông báo là đã đọc.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể đánh dấu đọc tất cả.",
      })
    } finally {
      setMarkingAll(false)
    }
  }

  // Handle click on single notification
  const handleNotificationClick = async (notif: NotificationResponse) => {
    // 1. Mark as read if unread
    if (!notif.read && !notif.readAt) {
      try {
        await notificationApi.markRead(notif.id)
        setUnreadCount((c) => Math.max(0, c - 1))
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        )
      } catch {
        // Silently continue navigation
      }
    }

    setOpen(false)

    // 2. Verified reference navigation
    const refType = notif.referenceType?.toUpperCase()
    const refId = notif.referenceId

    if (!refType || !refId) return

    switch (refType) {
      case "REQUEST":
        if (role === "CARE_COORDINATOR" || role === "ADMIN" || role === "SUPER_ADMIN") {
          navigate(`/app/general/consultations?tab=admin-requests&requestId=${refId}`)
        } else {
          navigate(`/app/general/consultations?tab=requests`)
        }
        break

      case "SESSION":
      case "CONSULTATION_SESSION":
        navigate(`/app/general/consultations?tab=chat&sessionId=${refId}`)
        break

      case "NEEDS_ACTION":
        if (role === "CARE_COORDINATOR" || role === "ADMIN" || role === "SUPER_ADMIN") {
          navigate(`/app/management/needs-actions?itemId=${refId}`)
        }
        break

      case "REFUND":
        if (role === "CARE_COORDINATOR" || role === "ADMIN" || role === "SUPER_ADMIN") {
          navigate(`/app/management/needs-actions`)
        }
        break

      case "HEALTH_RECORD":
        if (role === "MEMBER") {
          navigate(`/app/general/afib-history`)
        } else {
          navigate(`/app/management/health-records`)
        }
        break

      case "PACKAGE":
        if (role === "MEMBER") {
          navigate(`/app/general/packages/catalog`)
        } else {
          navigate(`/app/management/packages`)
        }
        break

      case "CARE_HISTORY":
        navigate(`/app/general/care-history`)
        break

      default:
        // Unsupported or unmapped reference: safe no-op after mark-read
        break
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    if (type.startsWith("PAYMENT_")) {
      return <CreditCard className="w-4 h-4 text-amber-500" />
    }
    if (type.startsWith("HEALTH_")) {
      return <HeartPulse className="w-4 h-4 text-rose-500" />
    }
    if (type.startsWith("CARE_") || type === "FINAL_SUMMARY_AVAILABLE") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    }
    if (type.startsWith("REQUEST_")) {
      return <FileText className="w-4 h-4 text-blue-500" />
    }
    if (type === "NEW_MESSAGE") {
      return <MessagesSquare className="w-4 h-4 text-sky-500" />
    }
    if (type.includes("REVIEW") || type.includes("ACTION") || type.includes("INTERRUPTION")) {
      return <AlertCircle className="w-4 h-4 text-orange-500" />
    }
    return <Sparkles className="w-4 h-4 text-indigo-500" />
  }

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return "Vừa xong"
      if (diffMins < 60) return `${diffMins} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return dateStr
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 rounded-full border-slate-200/90 bg-white/90 shadow-2xs hover:bg-slate-50 cursor-pointer"
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[380px] sm:w-[420px] p-0 rounded-2xl border-slate-200 shadow-2xl bg-white overflow-hidden"
      >
        {/* Popover Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Thông báo</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] font-extrabold px-1.5 py-0">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[380px]">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-2 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span>Đang tải thông báo...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 space-y-2 text-center text-xs">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-600">Không có thông báo nào</p>
              <p className="text-[11px]">Bạn sẽ nhận được thông báo khi có cập nhật mới</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => {
                const isUnread = !notif.read && !notif.readAt
                const hasReference = Boolean(notif.referenceType && notif.referenceId)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start hover:bg-slate-50/80 ${
                      isUnread ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`text-xs truncate ${
                            isUnread ? "font-black text-slate-900" : "font-bold text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        {hasReference && (
                          <span className="flex items-center gap-0.5 text-blue-600 font-semibold">
                            <span>Chi tiết</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
