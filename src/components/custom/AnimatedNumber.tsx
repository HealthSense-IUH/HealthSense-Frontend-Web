import { useCountUp } from "@/hooks/use-count-up"

// Intl.NumberFormat tốn kém khi khởi tạo: giữ lại theo (locale, số thập phân)
const formatters = new Map<string, Intl.NumberFormat>()
function formatterFor(locale: string, decimals: number) {
  const key = `${locale}:${decimals}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    formatters.set(key, f)
  }
  return f
}

interface AnimatedNumberProps {
  value: number
  /** Số chữ số thập phân hiển thị (mặc định 0) */
  decimals?: number
  /** Định dạng theo ngôn ngữ (mặc định vi-VN: dấu chấm ngăn nghìn) */
  locale?: string
  duration?: number
  className?: string
}

/** Số liệu đếm tăng dần tới giá trị đích; giữ chiều rộng ổn định nhờ tabular-nums. */
export function AnimatedNumber({ value, decimals = 0, locale = "vi-VN", duration, className }: AnimatedNumberProps) {
  const current = useCountUp(value, duration)
  const text = formatterFor(locale, decimals).format(decimals > 0 ? current : Math.round(current))
  return (
    <span className={className ? `tabular-nums ${className}` : "tabular-nums"} aria-label={String(value)}>
      {text}
    </span>
  )
}
