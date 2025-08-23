import { useEffect, useRef } from 'react'

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressTimeout?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchStartTime = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout>()
  const elementRef = useRef<HTMLElement>(null)

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    threshold = 50,
    longPressTimeout = 500
  } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Store references for cleanup to avoid race conditions
    let isCleanedUp = false

    const handleTouchStart = (e: TouchEvent) => {
      if (isCleanedUp) return
      const touch = e.touches[0]
      touchStartX.current = touch.clientX
      touchStartY.current = touch.clientY
      touchStartTime.current = Date.now()

      // Setup long press detection
      if (onLongPress && !isCleanedUp) {
        longPressTimer.current = setTimeout(() => {
          if (!isCleanedUp) {
            onLongPress()
          }
        }, longPressTimeout)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isCleanedUp) return
      // Clear long press if user moves finger
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = undefined
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isCleanedUp) return
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = undefined
      }

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX.current
      const deltaY = touch.clientY - touchStartY.current
      const deltaTime = Date.now() - touchStartTime.current

      // Only consider it a swipe if it's fast enough and meets threshold
      if (deltaTime > 300) return

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (absDeltaX > threshold && absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight && !isCleanedUp) {
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft && !isCleanedUp) {
          onSwipeLeft()
        }
      } else if (absDeltaY > threshold && absDeltaY > absDeltaX) {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown && !isCleanedUp) {
          onSwipeDown()
        } else if (deltaY < 0 && onSwipeUp && !isCleanedUp) {
          onSwipeUp()
        }
      }
    }

    // Add passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      isCleanedUp = true
      
      // Safely remove event listeners with defensive programming
      if (element && element.removeEventListener) {
        try {
          element.removeEventListener('touchstart', handleTouchStart)
          element.removeEventListener('touchmove', handleTouchMove)
          element.removeEventListener('touchend', handleTouchEnd)
        } catch (error) {
          // Silently handle DOM manipulation errors during cleanup
        }
      }
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = undefined
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress, threshold, longPressTimeout])

  return elementRef
}