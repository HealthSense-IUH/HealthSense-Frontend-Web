/**
 * Đo tiến độ chuyển sang i18n + kiểm tra khoá dịch.
 *
 *   npm run i18n:check              # bảng tổng hợp + kiểm khoá
 *   node scripts/i18n-coverage.mjs --files
 *
 * Bản dịch chia theo namespace: src/locales/{vi,en}/<namespace>.json. Namespace của một khoá:
 *   - "ns:khoá" ghi rõ trong t()/i18n.t(), hoặc
 *   - namespace đầu tiên của useTranslation("ns") / useTranslation(["ns", ...]) trong file, hoặc
 *   - "common" nếu file không chỉ định.
 *
 * Thoát với mã 1 nếu có khoá t() thiếu bản dịch hoặc hai ngôn ngữ lệch khoá — dùng được trong CI.
 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, basename } from "node:path"

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
    if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*") || line.startsWith("{/*")) continue
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

// --- Kiểm tra khoá: mọi khoá t() phải có trong CẢ HAI ngôn ngữ, đúng namespace ---
const flat = (o, pre = "") =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? flat(v, pre + k + ".") : [pre + k])

function loadLang(lang) {
  const dir = join(SRC, "locales", lang)
  const out = new Map()
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    out.set(basename(name, ".json"), new Set(flat(JSON.parse(readFileSync(join(dir, name), "utf8")))))
  }
  return out
}
const vi = loadLang("vi")
const en = loadLang("en")

const NS_RE = /useTranslation\(\s*(?:\[\s*)?["'`]([a-zA-Z0-9_-]+)["'`]/
const KEY_RE = /\bt\(\s*["`']([a-zA-Z0-9_.:-]+)["`']/g
const used = new Map() // "ns:key" -> file
for (const f of files) {
  const text = readFileSync(f, "utf8")
  const fileNs = text.match(NS_RE)?.[1] ?? "common"
  for (const m of text.matchAll(KEY_RE)) {
    const raw = m[1]
    const [ns, key] = raw.includes(":") ? raw.split(":", 2) : [fileNs, raw]
    if (!key || /\.$/.test(key)) continue // khoá ghép động, ví dụ t(`group.${id}`)
    used.set(`${ns}:${key}`, relative(SRC, f).replaceAll("\\", "/"))
  }
}

const has = (lang, nsKey) => {
  const [ns, key] = nsKey.split(":", 2)
  return lang.get(ns)?.has(key) ?? false
}
const missVi = [...used.keys()].filter((k) => !has(vi, k))
const missEn = [...used.keys()].filter((k) => !has(en, k))
const drift = []
for (const ns of new Set([...vi.keys(), ...en.keys()])) {
  const a = vi.get(ns) ?? new Set()
  const b = en.get(ns) ?? new Set()
  for (const k of a) if (!b.has(k)) drift.push(`${ns}:${k} (thiếu en)`)
  for (const k of b) if (!a.has(k)) drift.push(`${ns}:${k} (thiếu vi)`)
}

const show = (list) => (list.length ? "\n    " + list.slice(0, 40).map((k) => `${k}  ← ${used.get(k) ?? ""}`).join("\n    ") + (list.length > 40 ? `\n    … và ${list.length - 40} khoá khác` : "") : "không")
console.log("")
console.log("KIỂM TRA KHOÁ DỊCH")
console.log("")
console.log("  namespace            : " + [...vi.keys()].join(", "))
console.log("  khoá t() đang dùng   : " + used.size)
console.log("  thiếu trong vi       : " + show(missVi))
console.log("  thiếu trong en       : " + show(missEn))
console.log("  lệch giữa 2 ngôn ngữ : " + (drift.length ? "\n    " + drift.slice(0, 40).join("\n    ") : "không"))

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
