/**
 * API integration layer for connecting with StudyPartner backend
 * Handles authentication, data synchronization, and user management
 */

export interface APIConfig {
  baseURL: string
  apiKey?: string
  timeout: number
}

export interface APIUser {
  id: string
  email: string
  displayName: string
  avatar?: string
  createdAt: string
  lastLoginAt: string
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SyncData {
  subjects: any[]
  sessions: any[]
  tasks: any[]
  achievements: any[]
  challenges: any[]
  focusSessions: any[]
  goals: any[]
  notes: any[]
  lastSyncAt: string
}

class StudyPartnerAPI {
  private config: APIConfig
  private authToken: string | null = null

  constructor(config: APIConfig) {
    this.config = config
    this.loadAuthToken()
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem('studypartner-auth-token')
  }

  private saveAuthToken(token: string) {
    this.authToken = token
    localStorage.setItem('studypartner-auth-token', token)
  }

  private clearAuthToken() {
    this.authToken = null
    localStorage.removeItem('studypartner-auth-token')
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout'
        }
      }

      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // Authentication methods
  async signUp(email: string, password: string, displayName: string): Promise<APIResponse<{ user: APIUser; token: string }>> {
    const response = await this.makeRequest<{ user: APIUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        displayName,
        source: 'motivamate' // Identify requests from this app
      })
    })

    if (response.success && response.data) {
      this.saveAuthToken(response.data.token)
    }

    return response
  }

  async signIn(email: string, password: string): Promise<APIResponse<{ user: APIUser; token: string }>> {
    const response = await this.makeRequest<{ user: APIUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        source: 'motivamate'
      })
    })

    if (response.success && response.data) {
      this.saveAuthToken(response.data.token)
    }

    return response
  }

  async signInWithGoogle(googleToken: string): Promise<APIResponse<{ user: APIUser; token: string }>> {
    const response = await this.makeRequest<{ user: APIUser; token: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        googleToken,
        source: 'motivamate'
      })
    })

    if (response.success && response.data) {
      this.saveAuthToken(response.data.token)
    }

    return response
  }

  async signOut(): Promise<APIResponse> {
    const response = await this.makeRequest('/auth/logout', {
      method: 'POST'
    })

    this.clearAuthToken()
    return response
  }

  async getCurrentUser(): Promise<APIResponse<APIUser>> {
    return this.makeRequest<APIUser>('/auth/me')
  }

  async refreshToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.makeRequest<{ token: string }>('/auth/refresh', {
      method: 'POST'
    })

    if (response.success && response.data) {
      this.saveAuthToken(response.data.token)
    }

    return response
  }

  // Data synchronization methods
  async syncDataToServer(data: Partial<SyncData>): Promise<APIResponse> {
    return this.makeRequest('/sync/upload', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        source: 'motivamate',
        timestamp: new Date().toISOString()
      })
    })
  }

  async syncDataFromServer(lastSyncAt?: string): Promise<APIResponse<SyncData>> {
    const params = new URLSearchParams()
    if (lastSyncAt) {
      params.append('since', lastSyncAt)
    }
    params.append('source', 'motivamate')

    return this.makeRequest<SyncData>(`/sync/download?${params.toString()}`)
  }

  async getFullUserData(): Promise<APIResponse<SyncData>> {
    return this.makeRequest<SyncData>('/user/data')
  }

  // Cross-platform user lookup
  async findUserByEmail(email: string): Promise<APIResponse<APIUser>> {
    return this.makeRequest<APIUser>(`/users/search?email=${encodeURIComponent(email)}`)
  }

  async getUsersByIds(userIds: string[]): Promise<APIResponse<APIUser[]>> {
    return this.makeRequest<APIUser[]>('/users/batch', {
      method: 'POST',
      body: JSON.stringify({ userIds })
    })
  }

  // Health check
  async ping(): Promise<APIResponse> {
    return this.makeRequest('/health')
  }

  // Update configuration
  updateConfig(newConfig: Partial<APIConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current auth state
  isAuthenticated(): boolean {
    return !!this.authToken
  }

  getAuthToken(): string | null {
    return this.authToken
  }
}

// Default configuration - should be environment-specific
const defaultConfig: APIConfig = {
  baseURL: import.meta.env.VITE_STUDYPARTNER_API_URL || 'https://api.studypartner.app/v1',
  apiKey: import.meta.env.VITE_STUDYPARTNER_API_KEY,
  timeout: 10000 // 10 seconds
}

// Create singleton instance
export const studyPartnerAPI = new StudyPartnerAPI(defaultConfig)

// Utility function to handle API errors gracefully
export const handleAPIError = (error: string): string => {
  const errorMappings: Record<string, string> = {
    'Network error occurred': 'Unable to connect to StudyPartner. Please check your internet connection.',
    'Request timeout': 'Request is taking too long. Please try again.',
    'HTTP 401: Unauthorized': 'Your session has expired. Please sign in again.',
    'HTTP 403: Forbidden': 'You don\'t have permission to perform this action.',
    'HTTP 404: Not Found': 'The requested resource was not found.',
    'HTTP 409: Conflict': 'This email is already registered.',
    'HTTP 500: Internal Server Error': 'StudyPartner is experiencing issues. Please try again later.'
  }

  return errorMappings[error] || error
}

// Connection status checker
export const checkStudyPartnerConnection = async (): Promise<boolean> => {
  try {
    const response = await studyPartnerAPI.ping()
    return response.success
  } catch {
    return false
  }
}