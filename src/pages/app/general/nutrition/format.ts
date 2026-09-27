/** Làm tròn giá trị dinh dưỡng để hiển thị: >= 100 lấy số nguyên, >= 1 lấy 1 chữ số thập phân, còn lại 2 chữ số. */
export function formatNutrientAmount(value: number | null | undefined): string {
  if (value == null) return "—"
  const abs = Math.abs(value)
  const digits = abs >= 100 ? 0 : abs >= 1 ? 1 : 2
  const factor = 10 ** digits
  return String(Math.round(value * factor) / factor)
}
