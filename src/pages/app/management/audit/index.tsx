import { useEffect, useState, useCallback } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  ShieldCheck,
  RefreshCw,
  Search,
  FileSearch,
  ArrowRight,
  User,
  Cpu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/stores/auth-store"
import { businessAuditApi } from "@/services"
import { COORDINATOR_PERMITTED_DOMAINS, ADMIN_ALL_DOMAINS } from "@/constants"
import type {
  BusinessAuditEventResponse,
  BusinessAuditTargetDomain as BusinessDomainType,
} from "@/types/business-audit"
import { AuditEventDetailDrawer } from "@/pages/app/management/audit/components/audit-event-detail-drawer"
import i18n, { currentIntlLocale } from "@/lib/i18n"

export default function BusinessAuditPage() {
  const { t } = useTranslation("management")
  const { toast } = useToast()
  const userSession = useAuthStore((state) => state.userSession)
  const role = userSession?.role || "CARE_COORDINATOR"
  const isCoordinator = role === "CARE_COORDINATOR"

  // Permitted domain types based on actor role
  const availableDomains = isCoordinator ? COORDINATOR_PERMITTED_DOMAINS : ADMIN_ALL_DOMAINS

  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<BusinessAuditEventResponse[]>([])
  const [page] = useState(1)
  const [pageSize] = useState(20)

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL")
  const [domainIdInput, setDomainIdInput] = useState("")
  const [eventTypeInput, setEventTypeInput] = useState("")

  // Detail drawer
  const [selectedEvent, setSelectedEvent] = useState<BusinessAuditEventResponse | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchAuditEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await businessAuditApi.queryAuditEvents({
        domainType: selectedDomain !== "ALL" ? (selectedDomain as BusinessDomainType) : undefined,
        domainId: domainIdInput.trim() || undefined,
        eventType: eventTypeInput.trim() || undefined,
        page,
        size: pageSize,
      })
      setEvents(res.data?.content || [])
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      toast({
        variant: "destructive",
        title: i18n.t("management:audit.loadErrorTitle"),
        description: anyErr.response?.data?.message || i18n.t("management:audit.loadErrorDescription"),
      })
    } finally {
      setLoading(false)
    }
  }, [selectedDomain, domainIdInput, eventTypeInput, page, pageSize, toast])

  useEffect(() => {
    void fetchAuditEvents()
  }, [fetchAuditEvents])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {t("audit.title")}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                <Trans
                  t={t}
                  i18nKey="audit.subtitle"
                  values={{ role }}
                  components={{ strong: <span className="font-bold text-slate-700" /> }}
                />
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAuditEvents()}
          disabled={loading}
          className="h-9 font-semibold text-xs border-slate-200 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          {t("audit.refresh")}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Domain Type selector strictly scoped */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t("audit.filters.domain")}</span>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder={t("audit.filters.domainPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("audit.filters.allDomains")}</SelectItem>
                {availableDomains.map((dom) => (
                  <SelectItem key={dom} value={dom}>
                    {dom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Domain ID search */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t("audit.filters.domainId")}</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder={t("audit.filters.domainIdPlaceholder")}
                value={domainIdInput}
                onChange={(e) => setDomainIdInput(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Event Type search */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{t("audit.filters.eventType")}</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder={t("audit.filters.eventTypePlaceholder")}
                value={eventTypeInput}
                onChange={(e) => setEventTypeInput(e.target.value)}
                className="pl-8 text-xs h-9 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Table / Timeline */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
          <span className="text-xs font-medium">{t("audit.loading")}</span>
        </div>
      ) : events.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-xs bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800">{t("audit.emptyTitle")}</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {t("audit.emptyDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t("audit.table.time")}</th>
                  <th className="py-3 px-4">{t("audit.table.domain")}</th>
                  <th className="py-3 px-4">{t("audit.table.eventType")}</th>
                  <th className="py-3 px-4">{t("audit.table.actor")}</th>
                  <th className="py-3 px-4">{t("audit.table.stateTransition")}</th>
                  <th className="py-3 px-4 text-right">{t("audit.table.detail")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => {
                      setSelectedEvent(ev)
                      setDetailOpen(true)
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(ev.occurredAt).toLocaleString(currentIntlLocale())}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="font-bold text-[10px] bg-slate-50">
                        {ev.domainType} #{ev.domainId}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      {ev.eventType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        {ev.actorType === "USER" ? (
                          <User className="w-3.5 h-3.5 text-primary-600" />
                        ) : (
                          <Cpu className="w-3.5 h-3.5 text-primary-600" />
                        )}
                        <span>{ev.actorType === "USER" ? `#${ev.actorId || "N/A"} (${ev.actorRole})` : "SYSTEM"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {ev.previousState && ev.newState ? (
                        <div className="flex items-center gap-1.5">
                          <span>{ev.previousState}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-primary-600">{ev.newState}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-primary-600 font-bold">
                        {t("audit.table.view")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <AuditEventDetailDrawer
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
