import { Moon, Clock, Zap } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const mockSleepStages = [
  { time: "23:00", stage: 3, name: "Thức" },
  { time: "23:30", stage: 2, name: "Ngủ nông" },
  { time: "00:00", stage: 1, name: "Ngủ sâu" },
  { time: "01:00", stage: 2, name: "Ngủ nông" },
  { time: "02:00", stage: 1, name: "Ngủ sâu" },
  { time: "03:30", stage: 0, name: "REM" },
  { time: "04:30", stage: 2, name: "Ngủ nông" },
  { time: "06:00", stage: 0, name: "REM" },
  { time: "07:00", stage: 3, name: "Thức" },
]

export default function SleepPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Giấc ngủ</h1>
          <p className="text-muted-foreground mt-1">Đánh giá chất lượng và chu kỳ giấc ngủ đêm qua</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sleep Score */}
        <Card className="rounded-3xl border-0 shadow-sm bg-health-sleep text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Điểm số Giấc ngủ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-5xl font-bold">85</span>
                <span className="text-xl opacity-80">/100</span>
              </div>
              <Moon className="h-10 w-10 opacity-50" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1 font-medium">
                <span>Chất lượng Tốt</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thời gian ngủ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-[120px]">
            <div className="text-3xl font-bold text-foreground">7h 30m</div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Từ 23:00 đến 07:00
            </div>
          </CardContent>
        </Card>

        {/* Efficiency */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hiệu suất giấc ngủ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-[120px]">
            <div className="text-3xl font-bold text-foreground">92%</div>
            <div className="flex items-center gap-2 mt-2 text-sm text-green-500">
              <Zap className="h-4 w-4" /> Ngủ liền mạch, ít thức giấc
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Hypnogram Chart */}
        <Card className="md:col-span-2 rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>Biểu đồ Chu kỳ Giấc ngủ (Hypnogram)</CardTitle>
            <CardDescription>Các giai đoạn giấc ngủ trong đêm qua</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSleepStages} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-health-sleep)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-health-sleep)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(val) => {
                    if (val === 3) return "Thức"
                    if (val === 2) return "Nông"
                    if (val === 1) return "Sâu"
                    if (val === 0) return "REM"
                    return ""
                  }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(val) => `Thời gian: ${val}`}
                  formatter={(_value: number, _name: string, props: any) => [props.payload.name, "Giai đoạn"]}
                />
                <Area type="stepAfter" dataKey="stage" stroke="var(--color-health-sleep)" strokeWidth={3} fillOpacity={1} fill="url(#colorStage)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Summary */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle className="text-primary">Tổng kết Giai đoạn</CardTitle>
            <CardDescription>Phân bổ thời gian ngủ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Ngủ sâu (Deep)</span>
                <span className="text-muted-foreground">1h 45m (23%)</span>
              </div>
              <Progress value={23} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Ngủ nông (Light)</span>
                <span className="text-muted-foreground">4h 15m (57%)</span>
              </div>
              <Progress value={57} className="h-2 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Ngủ mơ (REM)</span>
                <span className="text-muted-foreground">1h 15m (17%)</span>
              </div>
              <Progress value={17} className="h-2 bg-purple-100 dark:bg-purple-900/30" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">Thức giấc</span>
                <span className="text-muted-foreground">15m (3%)</span>
              </div>
              <Progress value={3} className="h-2 bg-orange-100 dark:bg-orange-900/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
