/**
 * Đo tiến độ chuyển sang i18n + kiểm tra khoá dịch.
 *
 *   npm run i18n:check              # bảng tổng hợp + kiểm khoá
 *   node scripts/i18n-coverage.mjs --files
 *
 * Thoát với mã 1 nếu có khoá t() thiếu bản dịch — dùng được trong CI.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const SRC = "src"
const VI_CHARS =
  /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁÂĂÈÉÊÌÍÒÓÔƠÙÚƯÝĐ]/

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(name)) out.push(p)
  }
  return out
}

/** Đếm dòng có chữ tiếng Việt còn hardcode (bỏ comment và dòng đã dùng t()). */
function countHardcoded(file) {
  let n = 0
  for (const raw of readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim()
    if (!VI_CHARS.test(line)) continue
    if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) continue
    if (/\bt\(["'`]/.test(line)) continue
    n++
  }
  return n
}

const files = walk(SRC).filter((f) => !f.replaceAll("\\", "/").includes("src/locales"))

const rows = files
  .map((f) => ({ file: relative(SRC, f).replaceAll("\\", "/"), n: countHardcoded(f) }))
  .filter((r) => r.n > 0)
  .sort((a, b) => b.n - a.n)

const areaOf = (f) =>
  f.startsWith("pages/public/") ? "pages/public"
    : f.startsWith("pages/app/general/") ? "pages/app/general"
      : f.startsWith("pages/app/management/") ? "pages/app/management"
        : f.startsWith("components/layout/") ? "components/layout (khung app)"
          : f.startsWith("components/") ? "components (khác)"
            : f.split("/")[0]

const byArea = new Map()
for (const r of rows) {
  const a = areaOf(r.file)
  const cur = byArea.get(a) ?? { lines: 0, files: 0 }
  byArea.set(a, { lines: cur.lines + r.n, files: cur.files + 1 })
}

const total = rows.reduce((s, r) => s + r.n, 0)
console.log("")
console.log("DÒNG CÒN HARDCODE TIẾNG VIỆT (chưa qua t())")
console.log("")
console.log("  " + "khu vực".padEnd(32) + "file".padStart(6) + "dòng".padStart(8))
console.log("  " + "-".repeat(46))
for (const [a, v] of [...byArea].sort((x, y) => y[1].lines - x[1].lines)) {
  console.log("  " + a.padEnd(32) + String(v.files).padStart(6) + String(v.lines).padStart(8))
}
console.log("  " + "-".repeat(46))
console.log("  " + "TỔNG".padEnd(32) + String(rows.length).padStart(6) + String(total).padStart(8))

// --- Kiểm tra khoá: mọi khoá t() phải có trong CẢ HAI file dịch ---
const flat = (o, pre = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? flat(v, pre + k + ".") : [pre + k])

const vi = new Set(flat(JSON.parse(readFileSync("src/locales/vi/common.json", "utf8"))))
const en = new Set(flat(JSON.parse(readFileSync("src/locales/en/common.json", "utf8"))))

const used = new Set()
const KEY_RE = /\bt\(\s*["`]([a-zA-Z0-9_.-]+)["`]/g
for (const f of files) {
  for (const m of readFileSync(f, "utf8").matchAll(KEY_RE)) used.add(m[1])
}

const missVi = [...used].filter((k) => !vi.has(k))
const missEn = [...used].filter((k) => !en.has(k))
const drift = [
  ...[...vi].filter((k) => !en.has(k)),
  ...[...en].filter((k) => !vi.has(k)),
]

console.log("")
console.log("KIỂM TRA KHOÁ DỊCH")
console.log("")
console.log("  khoá t() đang dùng   : " + used.size)
console.log("  thiếu trong vi       : " + (missVi.length ? missVi.join(", ") : "không"))
console.log("  thiếu trong en       : " + (missEn.length ? missEn.join(", ") : "không"))
console.log("  lệch giữa 2 file     : " + (drift.length ? drift.join(", ") : "không"))

if (missVi.length + missEn.length + drift.length > 0) {
  console.log("")
  console.log("  => CÓ KHOÁ HỎNG: giao diện sẽ lộ khoá thô. Sửa trước khi commit.")
  process.exitCode = 1
}

if (process.argv.includes("--files")) {
  console.log("")
  console.log("THEO FILE")
  console.log("")
  for (const r of rows) console.log("  " + String(r.n).padStart(4) + "  " + r.file)
}
console.log("")
