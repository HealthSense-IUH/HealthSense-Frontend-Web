import { useRef, useEffect } from "react"
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion"

/**
 * Returns a container ref and spring-smoothed motion values (x, y) normalized
 * to [-0.5, 0.5] based on pointer position within the container element.
 *
 * Automatically disabled on:
 * - touch / coarse-pointer devices
 * - prefers-reduced-motion
 *
 * Cleans up all event listeners on unmount.
 *
 * @example
 * const { containerRef, x, y } = usePointerParallax()
 * const watchX = useTransform(x, [-0.5, 0.5], [-6, 6])
 * return <section ref={containerRef}>...</section>
 */
export function usePointerParallax() {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Spring smoothing — stiffness/damping chosen for a calm, clinical feel
  const x = useSpring(rawX, { stiffness: 80, damping: 20, mass: 1 })
  const y = useSpring(rawY, { stiffness: 80, damping: 20, mass: 1 })

  useEffect(() => {
    // Disable on reduced-motion preference
    if (shouldReduceMotion) return

    // Disable on touch / coarse-pointer devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return

    const container = containerRef.current
    if (!container) return

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect()
      rawX.set((e.clientX - rect.left) / rect.width - 0.5)
      rawY.set((e.clientY - rect.top) / rect.height - 0.5)
    }

    function handleMouseLeave() {
      rawX.set(0)
      rawY.set(0)
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [shouldReduceMotion, rawX, rawY])

  return { containerRef, x, y }
}
