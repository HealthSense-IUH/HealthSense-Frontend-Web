import type { TFunction } from "i18next"
import { formatHrvNumber, formatRecordDate, getPredictionMeta } from "@/lib"
import type { MemberHealthRecord } from "@/types/health-record"

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
}

function buildPpgWaveformSvg(rawSamples: number[]): string {
  if (rawSamples.length < 4) return ""
  const maxPoints = 300
  const stride = Math.max(1, Math.floor(rawSamples.length / maxPoints))
  const samples: number[] = []
  for (let i = 0; i < rawSamples.length && samples.length < maxPoints; i += stride) {
    samples.push(rawSamples[i])
  }

  let min = samples[0]
  let max = samples[0]
  for (const v of samples) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const span = max - min || 1
  const width = 760
  const height = 110
  const padX = 8
  const padY = 10
  const usableW = width - padX * 2
  const usableH = height - padY * 2

  const points = samples
    .map((v, idx) => {
      const x = padX + (idx / Math.max(samples.length - 1, 1)) * usableW
      const y = padY + (1 - (v - min) / span) * usableH
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const areaPoints = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`

  return `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PPG waveform">
      <defs>
        <linearGradient id="ppgFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.22" />
          <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      <line x1="0" y1="28" x2="${width}" y2="28" stroke="#e2e8f0" stroke-dasharray="3 3" />
      <line x1="0" y1="55" x2="${width}" y2="55" stroke="#e2e8f0" stroke-dasharray="3 3" />
      <line x1="0" y1="82" x2="${width}" y2="82" stroke="#e2e8f0" stroke-dasharray="3 3" />
      <polygon points="${areaPoints}" fill="url(#ppgFill)" />
      <polyline points="${points}" fill="none" stroke="#0284c7" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
  `
}

export function printAfibReport(record: MemberHealthRecord, t: TFunction): boolean {
  const popup = window.open("", "_blank", "width=940,height=1080")
  if (!popup) {
    return false
  }

  const meta = getPredictionMeta(record.predictionLabel, record.status)
  const features = record.hrvFeatures || {}
  const measuredAt = formatRecordDate(record.createdAt)
  const printedAt = formatRecordDate(new Date().toISOString())
  const afibPct =
    typeof record.confidence === "number" ? `${(record.confidence * 100).toFixed(1)}%` : "--"

  const tone =
    record.predictionLabel === "AFIB"
      ? { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", badgeBg: "#fee2e2" }
      : record.predictionLabel === "NORMAL"
        ? { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", badgeBg: "#dcfce7" }
        : { bg: "#fffbeb", border: "#fde68a", text: "#b45309", badgeBg: "#fef3c7" }

  const waveformSvg = buildPpgWaveformSvg(asNumberArray(features.chartData))

  const sqiSummary =
    typeof features.sqi_ok === "boolean"
      ? features.sqi_ok
        ? t("measurementVisuals.sqi.good", {
            ratio:
              typeof features.sqi_valid_ratio === "number"
                ? t("measurementVisuals.sqi.validRatio", {
                    value: (features.sqi_valid_ratio * 100).toFixed(0),
                  })
                : "",
          })
        : t("measurementVisuals.sqi.poor")
      : ""

  const extraChips: string[] = []
  if (sqiSummary) extraChips.push(sqiSummary)
  if (typeof features.deviceSpO2 === "number") {
    extraChips.push(`SpO2: ${features.deviceSpO2.toFixed(0)}%`)
  }
  if (typeof features.respiratoryRate === "number") {
    extraChips.push(
      `${t("measurementVisuals.tiles.respiratoryRate")}: ${features.respiratoryRate.toFixed(1)} ${t("measurementVisuals.tiles.breathsPerMin")}`
    )
  }
  if (typeof features.hrMin === "number" && typeof features.hrMax === "number") {
    extraChips.push(
      `${t("measurementVisuals.tiles.hrRange")}: ${features.hrMin.toFixed(0)}–${features.hrMax.toFixed(0)} BPM`
    )
  }
  if (typeof features.perfusionIndex === "number") {
    extraChips.push(
      `${t("measurementVisuals.tiles.perfusionIndex")}: ${features.perfusionIndex.toFixed(2)}%`
    )
  }

  const windowAnalysis = features.windowAnalysis
  let windowSectionHtml = ""
  if (windowAnalysis && Array.isArray(windowAnalysis.windows) && windowAnalysis.windows.length > 0) {
    const ruleSummary = !windowAnalysis.temporalRuleAvailable
      ? t("recordDetail.temporal.unavailable")
      : windowAnalysis.alert && windowAnalysis.alertBranch === "two_window_high_confidence"
        ? t("recordDetail.temporal.alertTwo", {
            time: typeof windowAnalysis.alertTimeS === "number" ? Math.round(windowAnalysis.alertTimeS) : "--",
          })
        : windowAnalysis.alert
          ? t("recordDetail.temporal.alertFive", {
              time: typeof windowAnalysis.alertTimeS === "number" ? Math.round(windowAnalysis.alertTimeS) : "--",
            })
          : t("recordDetail.temporal.noAlert")

    const chips = windowAnalysis.windows
      .map((w) => {
        const cls =
          !w.accepted || typeof w.pMeta !== "number"
            ? "win-chip win-neutral"
            : w.pMeta >= 0.8
              ? "win-chip win-danger"
              : "win-chip win-ok"
        const val =
          w.accepted && typeof w.pMeta === "number"
            ? `${(w.pMeta * 100).toFixed(0)}%`
            : t("recordDetail.temporal.rejected")
        const range = t("recordDetail.temporal.window", {
          start: Math.round(w.startS),
          end: Math.round(w.endS),
        })
        return `<div class="${cls}"><div class="win-range">${escapeHtml(range)}</div><div class="win-val">${escapeHtml(val)}</div></div>`
      })
      .join("")

    windowSectionHtml = `
      <section class="card">
        <div class="section-title">${escapeHtml(t("recordDetail.temporal.title"))}</div>
        <div class="rule-summary ${windowAnalysis.alert ? "text-danger" : ""}">${escapeHtml(ruleSummary)}</div>
        <div class="muted small">${escapeHtml(
          t("recordDetail.temporal.accepted", {
            accepted: windowAnalysis.acceptedWindows,
            total: windowAnalysis.windows.length,
          })
        )}</div>
        <div class="win-grid">${chips}</div>
      </section>
    `
  }

  const hrvRows = [
    {
      name: "Mean_NN",
      value: `${formatHrvNumber(features.Mean_NN, 1)} ms`,
      ref: "600 - 1200 ms",
      meaning: t("recordDetail.meaning.meanNn"),
    },
    {
      name: "SDNN",
      value: `${formatHrvNumber(features.SDNN, 1)} ms`,
      ref: "30 - 100 ms",
      meaning: t("recordDetail.meaning.sdnn"),
    },
    {
      name: "RMSSD",
      value: `${formatHrvNumber(features.RMSSD, 1)} ms`,
      ref: "20 - 50 ms",
      meaning: t("recordDetail.meaning.rmssd"),
    },
    {
      name: "pNN50",
      value: `${formatHrvNumber(features.pNN50, 1)}%`,
      ref: "3% - 30%",
      meaning: t("recordDetail.meaning.pnn50"),
    },
    {
      name: "CV",
      value: formatHrvNumber(features.CV, 4),
      ref: "0.05 - 0.15",
      meaning: t("recordDetail.meaning.cv"),
    },
    {
      name: "LF",
      value: formatHrvNumber(features.LF, 3),
      ref: "0.04 - 0.15 Hz",
      meaning: t("recordDetail.meaning.lf"),
    },
    {
      name: "HF",
      value: formatHrvNumber(features.HF, 3),
      ref: "0.15 - 0.40 Hz",
      meaning: t("recordDetail.meaning.hf"),
    },
    {
      name: t("recordDetail.lfHfRatio"),
      value: formatHrvNumber(features.LF_HF_Ratio, 2),
      ref: "0.5 - 2.0",
      meaning: t("recordDetail.meaning.lfHf"),
    },
  ]

  const hrvTableRowsHtml = hrvRows
    .map(
      (row) => `
        <tr>
          <td class="font-bold">${escapeHtml(row.name)}</td>
          <td class="font-semibold tabular">${escapeHtml(row.value)}</td>
          <td class="muted tabular">${escapeHtml(row.ref)}</td>
          <td class="muted">${escapeHtml(row.meaning)}</td>
        </tr>
      `
    )
    .join("")

  const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(t("recordDetail.printReport.documentTitle", { id: record.id }))}</title>
  <style>
    @page { size: A4; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11.5px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 820px; margin: 0 auto; padding: 14px 18px 24px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .brand { font-size: 18px; font-weight: 800; color: #0369a1; letter-spacing: -0.02em; }
    .subtitle { font-size: 11px; color: #475569; margin-top: 2px; }
    .meta-right { text-align: right; font-size: 10.5px; color: #475569; }
    .meta-right strong { color: #0f172a; }
    .diagnosis {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 10px;
      background: ${tone.bg};
      border: 1px solid ${tone.border};
      margin-bottom: 12px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 11px;
      background: ${tone.badgeBg};
      color: ${tone.text};
      border: 1px solid ${tone.border};
      margin-left: 6px;
    }
    .prob-box { text-align: right; min-width: 118px; }
    .prob-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .prob-val { font-size: 22px; font-weight: 800; color: ${tone.text}; font-variant-numeric: tabular-nums; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 10px;
    }
    .kpi {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      background: #f8fafc;
    }
    .kpi-label { font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748b; }
    .kpi-value { font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px; font-variant-numeric: tabular-nums; }
    .kpi-unit { font-size: 10.5px; font-weight: 600; color: #475569; }
    .kpi-ref { font-size: 9.5px; color: #64748b; margin-top: 2px; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .chip {
      font-size: 10px;
      font-weight: 600;
      color: #334155;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: 999px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
      break-inside: avoid;
    }
    .section-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #334155;
      margin-bottom: 6px;
    }
    .rule-summary { font-size: 11px; font-weight: 700; margin-bottom: 3px; }
    .text-danger { color: #b91c1c; }
    .win-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .win-chip { border-radius: 7px; padding: 4px 8px; border: 1px solid #e2e8f0; min-width: 74px; }
    .win-ok { background: #f0fdf4; border-color: #bbf7d0; }
    .win-danger { background: #fef2f2; border-color: #fecaca; }
    .win-neutral { background: #f8fafc; border-color: #e2e8f0; }
    .win-range { font-size: 9.5px; color: #64748b; }
    .win-val { font-size: 11px; font-weight: 700; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    th {
      text-align: left;
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      padding: 6px 8px;
      border-bottom: 1px solid #cbd5e1;
    }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .tabular { font-variant-numeric: tabular-nums; }
    .muted { color: #64748b; }
    .small { font-size: 10px; }
    .disclaimer {
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      background: #f8fafc;
      border-left: 3px solid #0284c7;
      font-size: 10px;
      color: #475569;
    }
    .print-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-bottom: 10px;
    }
    .btn {
      border: 1px solid #cbd5e1;
      background: #0284c7;
      color: #ffffff;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    @media print {
      .print-actions { display: none; }
      .page { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="print-actions">
      <button class="btn" onclick="window.print()">${escapeHtml(t("recordDetail.printReport.printNow"))}</button>
    </div>

    <header class="header">
      <div>
        <div class="brand">HealthSense AI</div>
        <div class="subtitle">${escapeHtml(t("recordDetail.printReport.subtitle"))}</div>
      </div>
      <div class="meta-right">
        <div><strong>${escapeHtml(t("recordDetail.printReport.recordId"))}:</strong> #${escapeHtml(record.id)}</div>
        <div><strong>${escapeHtml(t("recordDetail.printReport.measuredAtLabel"))}:</strong> ${escapeHtml(measuredAt)}</div>
        <div><strong>${escapeHtml(t("recordDetail.printReport.fileLabel"))}:</strong> ${escapeHtml(record.fileName || "--")}</div>
        <div><strong>${escapeHtml(t("recordDetail.printReport.printedAtLabel"))}:</strong> ${escapeHtml(printedAt)}</div>
      </div>
    </header>

    <section class="diagnosis">
      <div>
        <div>
          <span class="font-bold">${escapeHtml(t("recordDetail.aiConclusion"))}</span>
          <span class="badge">${escapeHtml(meta.label)}</span>
        </div>
        <div style="margin-top: 5px; color: #334155;">${escapeHtml(meta.advice)}</div>
      </div>
      <div class="prob-box">
        <div class="prob-label">${escapeHtml(t("recordDetail.afibProbability"))}</div>
        <div class="prob-val">${escapeHtml(afibPct)}</div>
      </div>
    </section>

    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi-label">${escapeHtml(t("recordDetail.avgHeartRate"))}</div>
        <div class="kpi-value">${escapeHtml(features.HR_mean ? formatHrvNumber(features.HR_mean, 0) : "--")} <span class="kpi-unit">BPM</span></div>
        <div class="kpi-ref">60 - 100 BPM</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">SDNN</div>
        <div class="kpi-value">${escapeHtml(features.SDNN ? formatHrvNumber(features.SDNN, 1) : "--")} <span class="kpi-unit">ms</span></div>
        <div class="kpi-ref">30 - 100 ms</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">RMSSD</div>
        <div class="kpi-value">${escapeHtml(features.RMSSD ? formatHrvNumber(features.RMSSD, 1) : "--")} <span class="kpi-unit">ms</span></div>
        <div class="kpi-ref">20 - 50 ms</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">${escapeHtml(t("recordDetail.lfHfRatio"))}</div>
        <div class="kpi-value">${escapeHtml(features.LF_HF_Ratio ? formatHrvNumber(features.LF_HF_Ratio, 2) : "--")}</div>
        <div class="kpi-ref">0.5 - 2.0</div>
      </div>
    </section>

    ${
      extraChips.length > 0
        ? `<div class="chips">${extraChips.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join("")}</div>`
        : ""
    }

    ${
      waveformSvg
        ? `<section class="card">
            <div class="section-title">${escapeHtml(t("measurementVisuals.wave.title"))}</div>
            ${waveformSvg}
          </section>`
        : ""
    }

    ${windowSectionHtml}

    <section class="card">
      <div class="section-title">${escapeHtml(t("recordDetail.hrvTitle"))}</div>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("recordDetail.table.metric"))}</th>
            <th>${escapeHtml(t("recordDetail.table.value"))}</th>
            <th>${escapeHtml(t("recordDetail.table.referenceRange"))}</th>
            <th>${escapeHtml(t("recordDetail.table.meaning"))}</th>
          </tr>
        </thead>
        <tbody>
          ${hrvTableRowsHtml}
        </tbody>
      </table>
    </section>

    <footer class="disclaimer">
      <strong>${escapeHtml(t("recordDetail.printReport.disclaimerTitle"))}:</strong>
      ${escapeHtml(t("recordDetail.printReport.disclaimerBody"))}
    </footer>
  </div>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 250);
    });
  </script>
</body>
</html>`

  popup.document.open()
  popup.document.write(html)
  popup.document.close()
  popup.focus()
  return true
}
