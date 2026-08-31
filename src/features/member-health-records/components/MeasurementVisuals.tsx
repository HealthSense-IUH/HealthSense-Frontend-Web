import { Activity, Droplets, Gauge, HeartPulse, ShieldAlert, ShieldCheck, Wind } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts"

import type { HRVFeatures } from "@/types/health-record"

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
}

function SqiBadge({ features }: { features: HRVFeatures }) {
  if (typeof features.sqi_ok !== "boolean") return null

  const ok = features.sqi_ok
  const ratio =
    typeof features.sqi_valid_ratio === "number"
      ? ` • ${(features.sqi_valid_ratio * 100).toFixed(0)}% nhịp hợp lệ`
      : ""

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-xs ${
        ok
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
      }`}
    >
      {ok ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
      {ok ? `Chất lượng đo: Tốt${ratio}` : "Chất lượng đo: Kém — nên đo lại"}
    </span>
  )
}

interface MetricTile {
  key: string
  icon: typeof Activity
  label: string
  value: string
  unit?: string
  note?: string
}

function buildExtraTiles(features: HRVFeatures): MetricTile[] {
  const tiles: MetricTile[] = []

  if (typeof features.deviceSpO2 === "number") {
    tiles.push({
      key: "spo2",
      icon: Droplets,
      label: "SpO2",
      value: features.deviceSpO2.toFixed(0),
      unit: "%",
      note: "Tham khảo (đo tại thiết bị)",
    })
  }
  if (typeof features.respiratoryRate === "number") {
    tiles.push({
      key: "resp",
      icon: Wind,
      label: "Nhịp thở",
      value: features.respiratoryRate.toFixed(1),
      unit: "lần/phút",
      note: "12 - 20 lần/phút",
    })
  }
  if (typeof features.hrMin === "number" && typeof features.hrMax === "number") {
    tiles.push({
      key: "hrrange",
      icon: HeartPulse,
      label: "Nhịp tim min - max",
      value: `${features.hrMin.toFixed(0)} - ${features.hrMax.toFixed(0)}`,
      unit: "BPM",
      note: "Trong phiên đo",
    })
  }
  if (typeof features.perfusionIndex === "number") {
    tiles.push({
      key: "pi",
      icon: Activity,
      label: "Perfusion Index",
      value: features.perfusionIndex.toFixed(2),
      unit: "%",
      note: "Thấp → đeo lỏng / tưới máu yếu",
    })
  }
  // Stress score chỉ hiển thị khi nhịp không quá bất thường —
  // với nhịp AFib, chỉ số này mất ý nghĩa và dễ gây hiểu lầm
  const irregular = typeof features.pNN50 === "number" && features.pNN50 > 40
  if (typeof features.stressScore === "number" && !irregular) {
    tiles.push({
      key: "stress",
      icon: Gauge,
      label: "Điểm căng thẳng",
      value: String(features.stressScore),
      unit: "/100",
      note: "Tham khảo (Baevsky SI)",
    })
  }
  return tiles
}

/**
 * Khối trực quan của một phép đo: sóng mạch PPG + đồ thị Poincaré + badge SQI.
 * Toàn bộ dữ liệu lấy từ hrvFeatures đã lưu sẵn trong record (AI Service sinh):
 * - chartData: 300 điểm sóng mạch (mọi record từ trước đến nay đều có)
 * - nnIntervals + sqi_*: chỉ có ở các phép đo mới — tự ẩn nếu thiếu
 */
export function MeasurementVisuals({ features }: { features: HRVFeatures }) {
  const wave = asNumberArray(features.chartData)
  const nn = asNumberArray(features.nnIntervals)
  const extraTiles = buildExtraTiles(features)

  const hasWave = wave.length >= 10
  const hasPoincare = nn.length >= 10
  const hasSqi = typeof features.sqi_ok === "boolean"

  if (!hasWave && !hasPoincare && !hasSqi && extraTiles.length === 0) return null

  const waveData = wave.map((v, i) => ({ i, v }))
  const poincareData = nn.slice(0, -1).map((x, i) => ({ x, y: nn[i + 1] }))
  const nnMin = hasPoincare ? Math.min(...nn) : 0
  const nnMax = hasPoincare ? Math.max(...nn) : 0
  const pad = Math.max(30, (nnMax - nnMin) * 0.1)
  const domain: [number, number] = [Math.max(0, nnMin - pad), nnMax + pad]

  return (
    <div className="space-y-3">
      {/* Sóng mạch PPG */}
      {hasWave && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-500" />
              Sóng mạch (PPG) trong phiên đo
            </span>
            <SqiBadge features={features} />
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waveData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="ppgWaveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis hide domain={[0, 100]} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#0ea5e9"
                  strokeWidth={1.6}
                  fill="url(#ppgWaveFill)"
                  isAnimationActive={false}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Mỗi đỉnh sóng là một nhịp tim. Sóng đều đặn → nhịp ổn định; sóng lộn xộn, biên độ
            thất thường → nhịp bất thường.
          </p>
        </div>
      )}

      {/* Chỉ số bổ sung của phiên đo */}
      {extraTiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {extraTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <div key={tile.key} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-sky-500" />
                  {tile.label}
                </span>
                <div className="text-lg font-bold text-foreground mt-1">
                  {tile.value}{" "}
                  {tile.unit && <span className="text-xs font-normal text-muted-foreground">{tile.unit}</span>}
                </div>
                {tile.note && (
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{tile.note}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Poincaré + chú giải */}
      {hasPoincare && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Đồ thị Poincaré
            </span>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 6, right: 10, bottom: 14, left: 2 }}>
                  <CartesianGrid strokeOpacity={0.15} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={domain}
                    tick={{ fontSize: 10 }}
                    label={{ value: "NN(n) — ms", position: "insideBottom", offset: -8, fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={domain}
                    tick={{ fontSize: 10 }}
                    width={42}
                  />
                  <ReferenceLine
                    segment={[
                      { x: domain[0], y: domain[0] },
                      { x: domain[1], y: domain[1] },
                    ]}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                  />
                  <Scatter
                    data={poincareData}
                    fill="#6366f1"
                    fillOpacity={0.65}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Cách đọc đồ thị
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mỗi chấm là <b>một cặp nhịp tim liên tiếp</b>: vị trí ngang là khoảng cách nhịp
              trước, vị trí dọc là khoảng cách nhịp sau.
            </p>
            <ul className="text-xs text-muted-foreground leading-relaxed space-y-1 list-disc pl-4">
              <li>
                Đám chấm <b>gọn, bám sát đường chéo</b> → nhịp tim đều đặn.
              </li>
              <li>
                Đám chấm <b>tản rộng như đám mây</b> → nhịp biến thiên bất thường, đặc trưng
                thường gặp của rung nhĩ.
              </li>
            </ul>
            <p className="text-[11px] text-muted-foreground">
              Dựa trên {nn.length} khoảng nhịp ghi nhận trong phiên đo.
            </p>
          </div>
        </div>
      )}

      {/* Chỉ có SQI (không có đồ thị nào) */}
      {!hasWave && !hasPoincare && hasSqi && (
        <div className="flex items-center">
          <SqiBadge features={features} />
        </div>
      )}
    </div>
  )
}
