import { HeartPulse, Search, AlertCircle, CheckCircle2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockAfibHistory = [
  { id: 1, date: "Hôm nay, 08:30", hr: 72, status: "Bình thường", confidence: 98, isWarning: false },
  { id: 2, date: "Hôm qua, 22:15", hr: 68, status: "Bình thường", confidence: 95, isWarning: false },
  { id: 3, date: "20 Th7, 14:05", hr: 115, status: "Nghi ngờ Rung nhĩ", confidence: 82, isWarning: true },
  { id: 4, date: "19 Th7, 09:00", hr: 70, status: "Bình thường", confidence: 99, isWarning: false },
  { id: 5, date: "15 Th7, 18:45", hr: 85, status: "Bình thường", confidence: 92, isWarning: false },
  { id: 6, date: "10 Th7, 23:30", hr: 120, status: "Nghi ngờ Rung nhĩ", confidence: 88, isWarning: true },
]

export default function AfibHistoryPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Lịch sử Tầm soát Rung nhĩ</h1>
          <p className="text-muted-foreground mt-1">Lịch sử các lần đo chủ động và cảnh báo từ AI</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70" />
          <Input 
            type="search" 
            placeholder="Tìm kiếm theo ngày..." 
            className="w-full pl-9 bg-white dark:bg-card border-0 rounded-xl shadow-sm h-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-white dark:bg-card border-0 rounded-xl shadow-sm h-10">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="warning">Cảnh báo (Rung nhĩ)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockAfibHistory.map(record => (
          <Card key={record.id} className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card overflow-hidden">
            <div className={`h-2 w-full ${record.isWarning ? 'bg-warning' : 'bg-primary'}`}></div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{record.date}</CardTitle>
                <Badge variant={record.isWarning ? "default" : "default"} className={record.isWarning ? "bg-warning text-warning-foreground hover:bg-warning/90" : "bg-primary hover:bg-primary/90"}>
                  {record.isWarning ? "Cảnh báo" : "An toàn"}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1 mt-1">
                <HeartPulse className="h-4 w-4" /> Nhịp tim: {record.hr} BPM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                {record.isWarning ? (
                  <AlertCircle className="h-8 w-8 text-warning" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                )}
                <div>
                  <p className={`font-semibold ${record.isWarning ? 'text-warning' : 'text-primary'}`}>
                    {record.status}
                  </p>
                  <p className="text-xs text-muted-foreground">Độ tin cậy AI: {record.confidence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
