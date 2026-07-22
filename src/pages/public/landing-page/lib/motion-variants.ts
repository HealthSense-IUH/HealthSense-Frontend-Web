import type { Variants } from "framer-motion"

// Functional clinical motion: short durations, crisp ease-out.
export const EASE_FUNCTIONAL = [0.25, 0.8, 0.25, 1] as const // Crisp ease-out
export const DURATION_FAST = 0.2
export const DURATION_NORMAL = 0.35

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: DURATION_NORMAL, ease: EASE_FUNCTIONAL }
  }
}

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: DURATION_NORMAL, ease: EASE_FUNCTIONAL }
  }
}

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}
