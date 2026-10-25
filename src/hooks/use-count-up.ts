import { useEffect, useRef, useState } from "react"

/**
 * Đếm từ giá trị đang hiện tới `target` trong `duration` ms (ease-out), dùng cho số liệu KPI khi mở trang
 * hoặc khi dữ liệu đổi. Tôn trọng prefers-reduced-motion: trả thẳng giá trị đích.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduced || !Number.isFinite(target)) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = from + (target - from) * eased
      setValue(p < 1 ? current : target)
      if (p < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
