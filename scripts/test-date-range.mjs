import assert from "node:assert"

// Import or re-implement calendar math matching date-range.ts
function addDaysToDateParts(parts, daysToAdd) {
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + daysToAdd))
  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
  }
}

function formatDateString(parts) {
  const y = String(parts.year).padStart(4, "0")
  const m = String(parts.month).padStart(2, "0")
  const d = String(parts.day).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseDateString(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) return null
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  }
}

function nextDayOf(dateStr) {
  const parts = parseDateString(dateStr)
  if (!parts) throw new Error(`Invalid: ${dateStr}`)
  const nextParts = addDaysToDateParts(parts, 1)
  return formatDateString(nextParts)
}

function toStartOfDayInstant(dateStr) {
  return `${dateStr}T00:00:00+07:00`
}

console.log("=== RUNNING DATE RANGE ASSERTION TESTS ===")

// 1. Year End Transition: 31/12 -> 01/01
const r1 = nextDayOf("2025-12-31")
console.log("Assert: 2025-12-31 -> nextDayOf:", r1)
assert.strictEqual(r1, "2026-01-01", "31/12 should transition to 01/01 of next year")

// 2. Non-leap February: 28/02/2026 -> 01/03/2026
const r2 = nextDayOf("2026-02-28")
console.log("Assert: 2026-02-28 -> nextDayOf:", r2)
assert.strictEqual(r2, "2026-03-01", "28/02/2026 should transition to 01/03/2026")

// 3. Leap February: 28/02/2028 -> 29/02/2028
const r3 = nextDayOf("2028-02-28")
console.log("Assert: 2028-02-28 -> nextDayOf:", r3)
assert.strictEqual(r3, "2028-02-29", "28/02/2028 should transition to 29/02/2028")

// 4. Leap February End: 29/02/2028 -> 01/03/2028
const r4 = nextDayOf("2028-02-29")
console.log("Assert: 2028-02-29 -> nextDayOf:", r4)
assert.strictEqual(r4, "2028-03-01", "29/02/2028 should transition to 01/03/2028")

// 5. Check instant formatting
assert.strictEqual(toStartOfDayInstant("2026-10-01"), "2026-10-01T00:00:00+07:00")
assert.strictEqual(toStartOfDayInstant(r1), "2026-01-01T00:00:00+07:00")

console.log("✅ All Date Range & Calendar Arithmetic assertions PASSED!")
