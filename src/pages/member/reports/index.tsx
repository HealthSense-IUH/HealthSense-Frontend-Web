import { Download, Calendar as CalendarIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockHrTrendData = [
  { day: "1", avgHr: 72, restingHr: 60, maxHr: 110 },
  { day: "2", avgHr: 74, restingHr: 62, maxHr: 145 },
  { day: "3", avgHr: 71, restingHr: 59, maxHr: 120 },
  { day: "4", avgHr: 75, restingHr: 61, maxHr: 155 },
  { day: "5", avgHr: 70, restingHr: 58, maxHr: 105 },
  { day: "6", avgHr: 73, restingHr: 60, maxHr: 130 },
  { day: "7", avgHr: 72, restingHr: 60, maxHr: 125 },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Báo cáo Sức khỏe</h1>
          <p className="text-muted-foreground mt-1">Tổng hợp và phân tích xu hướng sức khỏe của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl bg-white dark:bg-card border-0 shadow-sm h-10">
            <CalendarIcon className="mr-2 h-4 w-4" />
            7 ngày qua
          </Button>
          <Button className="rounded-xl h-10 shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary Metric Cards */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nhịp tim nghỉ ngơi TB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">60</span>
              <span className="text-sm text-muted-foreground">BPM</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
              <TrendingDown className="h-4 w-4" />
              <span>Giảm 2 BPM so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SpO2 Trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">98</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
              <span>Không đổi so với tuần trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Điểm số giấc ngủ TB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">82</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>Tăng 5 điểm so với tuần trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle>Xu hướng Nhịp tim (7 ngày qua)</CardTitle>
          <CardDescription>Theo dõi sự thay đổi của nhịp tim nghỉ ngơi và nhịp tim tối đa</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHrTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Ngày ${val}`} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelFormatter={(val) => `Ngày ${val}`}
              />
              <Line type="monotone" dataKey="maxHr" name="Nhịp tim tối đa" stroke="var(--color-health-heart)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="restingHr" name="Nhịp tim nghỉ ngơi" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
