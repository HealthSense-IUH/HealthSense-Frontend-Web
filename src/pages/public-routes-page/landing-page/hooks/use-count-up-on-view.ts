import { useState, useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

/**
 * Counts a numeric value from 0 to `target` using requestAnimationFrame,
 * triggered once when the attached element first enters the viewport.
 *
 * - Returns `target` immediately for reduced-motion users.
 * - Cancels the animation frame on unmount.
 * - Clamps to exact target value on completion.
 * - Never restarts once completed.
 *
 * @example
 * const { value: hrValue, ref: hrRef } = useCountUpOnView<HTMLSpanElement>(78, 1000)
 * return <span ref={hrRef}>{hrValue}</span>
 */
export function useCountUpOnView<T extends HTMLElement = HTMLElement>(
  target: number,
  duration = 1000
): { value: number; ref: React.MutableRefObject<T | null> } {
  const ref = useRef<T>(null)
  const [value, setValue] = useState(0)
  const hasStarted = useRef(false)
  const rafId = useRef<number>(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasStarted.current) return
        hasStarted.current = true

        // Return target immediately for reduced-motion users
        if (shouldReduceMotion) {
          setValue(target)
          return
        }

        const startTime = performance.now()

        function tick(now: number) {
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          // Ease-out cubic for smooth deceleration
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * target))

          if (progress < 1) {
            rafId.current = requestAnimationFrame(tick)
          } else {
            // Clamp to exact target value
            setValue(target)
          }
        }

        rafId.current = requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [target, duration, shouldReduceMotion])

  return { value, ref }
}
