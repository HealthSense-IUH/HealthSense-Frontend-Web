import { useEffect, useRef, useState, useCallback } from "react"

export function useChatScroll<T>(
  dependencies: T,
  loadingMore: boolean
) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const prevScrollHeightRef = useRef<number>(0)
  const prevDependenciesRef = useRef<T>(dependencies)

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    
    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    // Within 100px of bottom is considered "near bottom"
    const nearBottom = distanceFromBottom < 100
    setIsNearBottom(nearBottom)
    setShowScrollButton(!nearBottom)
  }, [])

  // Handle maintaining scroll position when older messages load
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    
    if (loadingMore) {
      prevScrollHeightRef.current = container.scrollHeight
    }
  }, [loadingMore])

  // Handle new messages or history loaded
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    if (loadingMore) {
      return // Wait until loading finishes
    }

    if (prevScrollHeightRef.current > 0) {
      // History was loaded: adjust scroll to keep viewport steady
      const newScrollHeight = container.scrollHeight
      const heightDifference = newScrollHeight - prevScrollHeightRef.current
      container.scrollTop = container.scrollTop + heightDifference
      prevScrollHeightRef.current = 0
    } else {
      // New message arrived or initial load
      // Auto-scroll only if we were already near the bottom, or if this is the first render (deps changed from null)
      if (isNearBottom || prevDependenciesRef.current === null) {
        const isFirstRender = prevDependenciesRef.current === null
        container.scrollTo({
          top: container.scrollHeight,
          behavior: isFirstRender ? "auto" : "smooth"
        })
      } else {
        // We received a new message but we are scrolled up. 
        // We shouldn't force scroll. showScrollButton is already handled by handleScroll.
      }
    }
    
    prevDependenciesRef.current = dependencies
  }, [dependencies, loadingMore, isNearBottom])

  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollRef.current
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
      })
    }
  }, [])

  return { scrollRef, bottomRef, showScrollButton, handleScroll, scrollToBottom }
}
