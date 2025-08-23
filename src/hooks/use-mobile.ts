import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkIsMobile = () => {
      try {
        return window.innerWidth < MOBILE_BREAKPOINT
      } catch (e) {
        return false
      }
    }

    try {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(checkIsMobile())
      }
      mql.addEventListener("change", onChange)
      setIsMobile(checkIsMobile())
      return () => mql.removeEventListener("change", onChange)
    } catch (e) {
      // Fallback if matchMedia is not available
      setIsMobile(checkIsMobile())
      return () => {}
    }
  }, [])

  return !!isMobile
}
