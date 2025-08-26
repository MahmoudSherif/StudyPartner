// Global network error interceptor for Firebase/Firestore blocked requests
export class NetworkErrorInterceptor {
  private static instance: NetworkErrorInterceptor | null = null
  private hasShownPersistentWarning = false
  private blockedRequestCount = 0
  private readonly MAX_BLOCKED_BEFORE_PERSISTENT = 3

  private constructor() {
    this.setupInterceptor()
  }

  static getInstance(): NetworkErrorInterceptor {
    if (!NetworkErrorInterceptor.instance) {
      NetworkErrorInterceptor.instance = new NetworkErrorInterceptor()
    }
    return NetworkErrorInterceptor.instance
  }

  private setupInterceptor() {
    // Intercept fetch errors
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        return response
      } catch (error: any) {
        // Check if it's a blocked request to Firebase/Firestore
        const url = args[0]?.toString() || ''
        if (url.includes('firestore.googleapis.com') || url.includes('firebase')) {
          if (error.message?.includes('Failed to fetch') || 
              error.message?.includes('NetworkError') ||
              error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
            this.handleBlockedRequest(url)
          }
        }
        throw error
      }
    }

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason
      if (error?.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          error?.message?.includes('firestore.googleapis.com')) {
        this.handleBlockedRequest('Firestore')
        // Prevent the default error handling
        event.preventDefault()
      }
    })

    // Listen for error events
    window.addEventListener('error', (event) => {
      if (event.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        this.handleBlockedRequest('Network request')
        // Prevent the default error handling
        event.preventDefault()
      }
    })
  }

  private handleBlockedRequest(resource: string) {
    this.blockedRequestCount++
    
    // Dispatch custom event for UI components to handle
    window.dispatchEvent(new CustomEvent('firebase-error', {
      detail: { 
        error: new Error(`Network request blocked: ${resource}`),
        isBlocked: true,
        count: this.blockedRequestCount
      }
    }))

    // Show persistent warning after multiple blocked requests
    if (this.blockedRequestCount >= this.MAX_BLOCKED_BEFORE_PERSISTENT && !this.hasShownPersistentWarning) {
      this.hasShownPersistentWarning = true
      this.showPersistentWarning()
    }
  }

  private showPersistentWarning() {
    // Create a persistent warning banner at the top of the page
    const existingBanner = document.getElementById('network-block-banner')
    if (existingBanner) return

    const banner = document.createElement('div')
    banner.id = 'network-block-banner'
    banner.className = 'network-block-banner'
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #ff6b6b, #ff8787);
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <strong>Network Requests Blocked</strong> - 
          Ad blocker detected. Please disable it for this site to enable real-time sync.
          <button id="dismiss-network-banner" style="
            margin-left: 12px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Dismiss</button>
        </div>
      </div>
    `
    
    document.body.appendChild(banner)
    
    // Add dismiss functionality
    const dismissBtn = document.getElementById('dismiss-network-banner')
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        banner.remove()
        // Reset the warning flag after some time
        setTimeout(() => {
          this.hasShownPersistentWarning = false
          this.blockedRequestCount = 0
        }, 300000) // 5 minutes
      }
    }

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (document.getElementById('network-block-banner')) {
        banner.style.transition = 'opacity 0.5s'
        banner.style.opacity = '0'
        setTimeout(() => banner.remove(), 500)
      }
    }, 30000)
  }

  reset() {
    this.blockedRequestCount = 0
    this.hasShownPersistentWarning = false
    const banner = document.getElementById('network-block-banner')
    if (banner) banner.remove()
  }
}

// Initialize the interceptor
export const networkErrorInterceptor = NetworkErrorInterceptor.getInstance()