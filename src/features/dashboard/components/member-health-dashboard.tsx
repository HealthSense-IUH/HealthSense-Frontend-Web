import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity,
  HeartPulse,
  Flame,
  Moon,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  MessagesSquare,
  Zap,
} from "lucide-react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Mock ECG Waveform Data (1-lead continuous signal simulation)
const ecgWaveformData = [
  { time: "0.0s", mv: 0.0 },
  { time: "0.1s", mv: 0.05 },
  { time: "0.2s", mv: 0.15 }, // P wave
  { time: "0.3s", mv: 0.0 },
  { time: "0.35s", mv: -0.1 }, // Q wave
  { time: "0.4s", mv: 1.2 },  // R peak
  { time: "0.45s", mv: -0.3 }, // S wave
  { time: "0.55s", mv: 0.0 },
  { time: "0.65s", mv: 0.25 }, // T wave
  { time: "0.75s", mv: 0.0 },
  { time: "0.9s", mv: 0.0 },
  { time: "1.0s", mv: 0.05 },
  { time: "1.1s", mv: 0.15 }, // P wave
  { time: "1.2s", mv: 0.0 },
  { time: "1.25s", mv: -0.1 }, // Q wave
  { time: "1.3s", mv: 1.25 }, // R peak
  { time: "1.35s", mv: -0.3 }, // S wave
  { time: "1.45s", mv: 0.0 },
  { time: "1.55s", mv: 0.26 }, // T wave
  { time: "1.65s", mv: 0.0 },
  { time: "1.8s", mv: 0.0 },
  { time: "1.9s", mv: 0.05 },
  { time: "2.0s", mv: 0.16 }, // P wave
  { time: "2.1s", mv: -0.1 }, // Q wave
  { time: "2.15s", mv: 1.18 }, // R peak
  { time: "2.2s", mv: -0.28 }, // S wave
  { time: "2.3s", mv: 0.0 },
  { time: "2.4s", mv: 0.24 }, // T wave
  { time: "2.5s", mv: 0.0 },
]

const recentScreenings = [
  { id: 1, time: "Hôm nay, 08:30", hr: 72, hrv: 58, status: "Nhịp xoang bình thường", risk: "2%", safe: true },
  { id: 2, time: "Hôm qua, 22:15", hr: 68, hrv: 64, status: "Nhịp xoang bình thường", risk: "1%", safe: true },
  { id: 3, time: "20 Th7, 14:05", hr: 115, hrv: 32, status: "Nghi ngờ Rung nhĩ (AFib)", risk: "82%", safe: false },
]

export function MemberHealthDashboard() {
  const navigate = useNavigate()
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true)

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Banner: Welcome & Device Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 p-7 text-white shadow-xl shadow-sky-500/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Thiết bị AI HeartSense: Đang đồng bộ thời gian thực</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bảng Theo Dõi Sức Khỏe Tim Mạch
            </h1>
            <p className="text-sm font-medium text-sky-100 max-w-xl">
              Hệ thống giám sát điện tâm đồ liên tục, cảnh báo sớm biến thiên HRV và nguy cơ rung nhĩ dựa trên AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate("/app/afib-history")}
              className="rounded-xl bg-white text-sky-700 font-bold hover:bg-sky-50 shadow-md shadow-black/10 border-0"
            >
              <HeartPulse className="h-4 w-4 mr-2 text-rose-500 animate-pulse" />
              Tầm soát Rung nhĩ
            </Button>
            <Button
              onClick={() => navigate("/app/consultations")}
              variant="outline"
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md"
            >
              <MessagesSquare className="h-4 w-4 mr-2" />
              Tư vấn Bác sĩ
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Vitals Grid (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Heart Rate */}
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nhịp tim hiện tại</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-heading">72</span>
              <span className="text-xs font-bold text-slate-500">BPM</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Nhịp xoang đều • 60-100 BPM</span>
            </div>
          </CardContent>
        </Card>

        {/* AFib Risk Score */}
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nguy cơ Rung nhĩ AI</span>
            <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-heading">2%</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold hover:bg-emerald-50">
                Rất an toàn
              </Badge>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span>Không phát hiện dấu hiệu bất thường</span>
            </div>
          </CardContent>
        </Card>

        {/* HRV Variability */}
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Biến thiên nhịp (HRV)</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-heading">58</span>
              <span className="text-xs font-bold text-slate-500">ms (rMSSD)</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Zap className="h-4 w-4 text-cyan-500" />
              <span>Phục hồi thể chất tối ưu</span>
            </div>
          </CardContent>
        </Card>

        {/* SpO2 Blood Oxygen */}
        <Card className="rounded-2xl border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Oxy trong máu (SpO2)</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-heading">98%</span>
              <span className="text-xs font-bold text-slate-500">Bão hòa</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Chỉ số hô hấp bình thường</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Live AI ECG Waveform Visualizer */}
      <Card className="rounded-3xl border-slate-200/90 shadow-xs bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Dải Sóng Điện Tâm Đồ (Live ECG Lead-I)
                </CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono font-bold">
                  250 Hz Real-Time
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Tín hiệu ECG sau khi qua bộ lọc thông dải Butterworth 0.5Hz - 45Hz và AI phát hiện phức bộ QRS.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveMonitoring(!isLiveMonitoring)}
                className="rounded-xl text-xs font-bold border-slate-200"
              >
                {isLiveMonitoring ? "Tạm dừng" : "Tiếp tục đo"}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/app/afib-history")}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs"
              >
                Xem chi tiết lịch sử
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ecgWaveformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ecgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[-0.5, 1.5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                  }}
                  formatter={(val: any) => [`${val} mV`, "Biên độ điện học"]}
                />
                <Area
                  type="monotone"
                  dataKey="mv"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#ecgGradient)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Khoảng PR</span>
              <p className="text-sm font-black text-slate-800 mt-0.5">142 ms</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Độ rộng QRS</span>
              <p className="text-sm font-black text-slate-800 mt-0.5">88 ms</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Khoảng QTc</span>
              <p className="text-sm font-black text-slate-800 mt-0.5">410 ms</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Độ tin cậy AI</span>
              <p className="text-sm font-black text-emerald-600 mt-0.5">99.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Lifestyle & Activity Sync (Sleep, Workouts, Doctor Consult) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep Sync Card */}
        <Card
          onClick={() => navigate("/app/sleep")}
          className="rounded-3xl border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer bg-white group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Moon className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">Giấc ngủ đêm qua</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-heading">7h 30m</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Điểm: 85/100
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Giai đoạn ngủ sâu (Deep Sleep) đạt 2h 15m, nhịp tim khi ngủ ổn định ở 58 BPM.
            </p>
          </CardContent>
        </Card>

        {/* Workouts Sync Card */}
        <Card
          onClick={() => navigate("/app/workouts")}
          className="rounded-3xl border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer bg-white group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Flame className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">Luyện tập hôm nay</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 font-heading">420 kcal</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                5.2 km Chạy bộ
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Nhịp tim trung bình buổi tập 145 BPM, thời gian trong vùng đốt mỡ: 35 phút.
            </p>
          </CardContent>
        </Card>

        {/* Consultation Doctor Card */}
        <Card
          onClick={() => navigate("/app/consultations")}
          className="rounded-3xl border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer bg-white group"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-sm font-bold text-slate-900">Tư vấn Bác sĩ</CardTitle>
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900">TS.BS Nguyễn Minh</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                14:00 Hôm nay
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Phiên tư vấn đánh giá chỉ số ECG và hướng dẫn phác đồ kiểm soát rung nhĩ.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. Recent Screening Table */}
      <Card className="rounded-3xl border-slate-200/90 shadow-xs bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Lịch sử Đo & Cảnh Báo Gần Đây</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Kết quả phân tích tự động từ thiết bị đeo và thuật toán AI C.A.R.E
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/afib-history")}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl"
          >
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {recentScreenings.map((sc) => (
              <div key={sc.id} className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${sc.safe ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sc.status}</h4>
                    <span className="text-xs text-slate-400 font-medium">{sc.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-700">{sc.hr} BPM</span>
                    <span className="text-[11px] text-slate-400 block">HRV: {sc.hrv} ms</span>
                  </div>
                  <Badge
                    className={`rounded-full px-3 py-1 font-bold text-xs ${
                      sc.safe
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    Nguy cơ: {sc.risk}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
