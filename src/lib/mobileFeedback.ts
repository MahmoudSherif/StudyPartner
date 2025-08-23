// Mobile haptic feedback and audio feedback utilities

export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(50)
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(100)
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate(200)
    }
  },
  
  success: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  },
  
  taskComplete: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([150, 75, 150, 75, 250])
    }
  },
  
  challengeTaskComplete: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([200, 50, 100, 50, 100, 50, 300])
    }
  },
  
  studySessionComplete: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([300, 100, 200, 100, 400])
    }
  },
  
  achievement: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([400, 100, 200, 100, 200, 100, 500])
    }
  },
  
  error: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200])
    }
  },
  
  notification: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([50, 50, 50])
    }
  },
  
  progressMilestone: () => {
    if ('vibrate' in navigator && navigator.vibrate) {
      navigator.vibrate([75, 25, 75, 25, 150])
    }
  }
}

export const audioFeedback = {
  // Create simple audio tones using Web Audio API
  createTone: (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    // Check if audio is supported
    if (typeof window === 'undefined') return
    if (!('AudioContext' in window) && !('webkitAudioContext' in window)) return
    
    try {
      // Use webkit prefix for older browsers
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      
      const audioContext = new AudioContextClass()
      
      // Check if context is suspended (mobile browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {
          // Ignore resume errors
        })
      }
      
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
      
      // Clean up after the tone finishes
      setTimeout(() => {
        try {
          if (audioContext.state !== 'closed') {
            audioContext.close()
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }, duration + 100)
    } catch (e) {
      // Silently ignore all audio errors
      // Audio feedback not available - silent fallback
    }
  },
  
  success: () => {
    audioFeedback.createTone(523.25, 200) // C5
    setTimeout(() => audioFeedback.createTone(659.25, 200), 100) // E5
  },
  
  taskComplete: () => {
    // Task completion sound - more rewarding
    audioFeedback.createTone(440, 150) // A4
    setTimeout(() => audioFeedback.createTone(554.37, 150), 75) // C#5
    setTimeout(() => audioFeedback.createTone(659.25, 200), 150) // E5
  },
  
  challengeTaskComplete: () => {
    // Challenge task completion - even more rewarding
    audioFeedback.createTone(523.25, 200) // C5
    setTimeout(() => audioFeedback.createTone(659.25, 200), 100) // E5
    setTimeout(() => audioFeedback.createTone(783.99, 200), 200) // G5
    setTimeout(() => audioFeedback.createTone(1046.50, 300), 300) // C6
  },
  
  studySessionComplete: () => {
    // Study session completion - triumphant sound
    audioFeedback.createTone(659.25, 300) // E5
    setTimeout(() => audioFeedback.createTone(783.99, 300), 150) // G5
    setTimeout(() => audioFeedback.createTone(1046.50, 400), 300) // C6
  },
  
  error: () => {
    audioFeedback.createTone(311.13, 300) // E♭4
    setTimeout(() => audioFeedback.createTone(233.08, 300), 150) // B♭3
  },
  
  notification: () => {
    audioFeedback.createTone(440, 100) // A4
  },
  
  tick: () => {
    audioFeedback.createTone(800, 50, 'square')
  },
  
  celebration: () => {
    // Play a celebration chord - for achievements
    audioFeedback.createTone(523.25, 400) // C5
    setTimeout(() => audioFeedback.createTone(659.25, 400), 50) // E5
    setTimeout(() => audioFeedback.createTone(783.99, 400), 100) // G5
    setTimeout(() => audioFeedback.createTone(1046.50, 600), 150) // C6
  },
  
  progressMilestone: () => {
    // Progress milestone sound
    audioFeedback.createTone(587.33, 150) // D5
    setTimeout(() => audioFeedback.createTone(659.25, 200), 75) // E5
  }
}

// Combined feedback for different actions
export const mobileFeedback = {
  buttonPress: () => {
    hapticFeedback.light()
    audioFeedback.tick()
  },
  
  taskComplete: () => {
    hapticFeedback.taskComplete()
    audioFeedback.taskComplete()
  },
  
  challengeTaskComplete: () => {
    hapticFeedback.challengeTaskComplete()
    audioFeedback.challengeTaskComplete()
  },
  
  studySessionComplete: () => {
    hapticFeedback.studySessionComplete()
    audioFeedback.studySessionComplete()
  },
  
  achievement: () => {
    hapticFeedback.achievement()
    audioFeedback.celebration()
  },
  
  progressMilestone: () => {
    hapticFeedback.progressMilestone()
    audioFeedback.progressMilestone()
  },
  
  error: () => {
    hapticFeedback.error()
    audioFeedback.error()
  },
  
  notification: () => {
    hapticFeedback.notification()
    audioFeedback.notification()
  }
}

// Hook for managing feedback preferences
export function useFeedbackPreferences() {
  const getPreference = (key: string, defaultValue: boolean = true): boolean => {
    try {
      const stored = localStorage.getItem(`feedback_${key}`)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }
  
  const setPreference = (key: string, value: boolean) => {
    try {
      localStorage.setItem(`feedback_${key}`, JSON.stringify(value))
    } catch {
      // Ignore localStorage errors
    }
  }
  
  return {
    hapticEnabled: getPreference('haptic'),
    audioEnabled: getPreference('audio'),
    setHapticEnabled: (enabled: boolean) => setPreference('haptic', enabled),
    setAudioEnabled: (enabled: boolean) => setPreference('audio', enabled)
  }
}