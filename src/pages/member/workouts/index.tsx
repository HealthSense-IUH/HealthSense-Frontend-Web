import { Flame, Clock, Route, Activity } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const mockChartData = [
  { day: "T2", calories: 320 },
  { day: "T3", calories: 450 },
  { day: "T4", calories: 280 },
  { day: "T5", calories: 510 },
  { day: "T6", calories: 390 },
  { day: "T7", calories: 600 },
  { day: "CN", calories: 420 },
]

const mockWorkouts = [
  { id: 1, type: "Chạy bộ", date: "Hôm nay, 07:30", duration: "45 p", distance: "5.2 km", calories: 420, avgHr: 145 },
  { id: 2, type: "Đạp xe", date: "Hôm qua, 18:15", duration: "60 p", distance: "15.4 km", calories: 600, avgHr: 132 },
  { id: 3, type: "Đi bộ", date: "15 Th7, 08:00", duration: "30 p", distance: "2.5 km", calories: 150, avgHr: 110 },
]

export default function WorkoutsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Lịch sử Tập luyện</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng buổi tập (Tuần)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng quãng đường</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23.1 <span className="text-sm font-normal">km</span></div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Thời gian hoạt động</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.5 <span className="text-sm font-normal">giờ</span></div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Calo</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2,970 <span className="text-sm font-normal">kcal</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart */}
        <Card className="md:col-span-1 lg:col-span-4 rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>Calo tiêu thụ (Tuần này)</CardTitle>
            <CardDescription>Biểu đồ lượng calo đốt cháy mỗi ngày</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="calories" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Workouts List */}
        <Card className="md:col-span-1 lg:col-span-3 rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>Buổi tập gần đây</CardTitle>
            <CardDescription>Các hoạt động trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockWorkouts.map(workout => (
                <div key={workout.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {workout.type === "Chạy bộ" ? <Activity className="h-6 w-6" /> : <Route className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{workout.type}</p>
                      <p className="text-xs text-muted-foreground">{workout.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{workout.distance}</p>
                    <p className="text-xs text-muted-foreground">{workout.duration} • {workout.calories} kcal</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
