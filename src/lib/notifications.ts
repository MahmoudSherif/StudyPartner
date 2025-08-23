// Notification utilities for MotivaMate
// Handles push notifications for goals and challenges

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationData {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: NotificationAction[];
  vibrate?: number[];
  requireInteraction?: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkSupport();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private checkSupport(): void {
    this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      return 'denied';
    }
  }

  async showNotification(data: NotificationData): Promise<boolean> {
    if (!this.isSupported || this.permission !== 'granted' || !this.registration) {
      return false;
    }

    try {
      const options: NotificationOptions = {
        body: data.body,
        icon: data.icon || '/icons/favicon-32x32.png',
        badge: data.badge || '/icons/favicon-16x16.png',
        tag: data.tag || 'motivamate-notification',
        data: data.data || {},
        requireInteraction: data.requireInteraction || false,
        silent: false
      };

      await this.registration.showNotification(data.title, options);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Goal achievement notification
  async notifyGoalAchievement(goalTitle: string, goalDescription?: string): Promise<void> {
    const notification: NotificationData = {
      title: '🎯 Goal Achieved!',
      body: `Congratulations! You've completed: ${goalTitle}`,
      tag: 'goal-achievement',
      data: {
        type: 'goal-achievement',
        goalTitle,
        url: '/?tab=achieve'
      },
      actions: [
        {
          action: 'view',
          title: 'View Goals',
          icon: '/icons/favicon-16x16.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/favicon-16x16.png'
        }
      ],
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true
    };

    await this.showNotification(notification);
  }

  // Challenge winner notification
  async notifyChallengeWin(challengeTitle: string, points: number): Promise<void> {
    const notification: NotificationData = {
      title: '🏆 Challenge Winner!',
      body: `Amazing! You won "${challengeTitle}" with ${points} points!`,
      tag: 'challenge-winner',
      data: {
        type: 'challenge-winner',
        challengeTitle,
        points,
        url: '/?tab=tasks'
      },
      actions: [
        {
          action: 'celebrate',
          title: 'Celebrate! 🎉',
          icon: '/icons/favicon-16x16.png'
        },
        {
          action: 'view',
          title: 'View Challenges',
          icon: '/icons/favicon-16x16.png'
        }
      ],
      vibrate: [500, 200, 500, 200, 500],
      requireInteraction: true
    };

    await this.showNotification(notification);
  }

  // Challenge completion notification (for other participants)
  async notifyChallengeComplete(challengeTitle: string, winnerName: string): Promise<void> {
    const notification: NotificationData = {
      title: '🏁 Challenge Complete',
      body: `"${challengeTitle}" has ended. Winner: ${winnerName}`,
      tag: 'challenge-complete',
      data: {
        type: 'challenge-complete',
        challengeTitle,
        winnerName,
        url: '/?tab=tasks'
      },
      actions: [
        {
          action: 'view',
          title: 'View Results',
          icon: '/icons/favicon-16x16.png'
        }
      ],
      vibrate: [200, 100, 200],
      requireInteraction: false
    };

    await this.showNotification(notification);
  }

  // Focus milestone notification
  async notifyFocusMilestone(duration: number, subject: string): Promise<void> {
    const notification: NotificationData = {
      title: '⏰ Focus Milestone!',
      body: `Great job! ${duration} minutes of focused ${subject}`,
      tag: 'focus-milestone',
      data: {
        type: 'focus-milestone',
        duration,
        subject,
        url: '/?tab=achieve'
      },
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: false
    };

    await this.showNotification(notification);
  }

  // Achievement unlock notification
  async notifyAchievementUnlock(achievementTitle: string, description: string): Promise<void> {
    const notification: NotificationData = {
      title: '🏆 Achievement Unlocked!',
      body: `${achievementTitle}: ${description}`,
      tag: 'achievement-unlock',
      data: {
        type: 'achievement-unlock',
        achievementTitle,
        description,
        url: '/?tab=achievements'
      },
      actions: [
        {
          action: 'view',
          title: 'View Achievements',
          icon: '/icons/favicon-16x16.png'
        }
      ],
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true
    };

    await this.showNotification(notification);
  }

  // Study streak notification
  async notifyStudyStreak(days: number): Promise<void> {
    const notification: NotificationData = {
      title: '🔥 Study Streak!',
      body: `Amazing! You're on a ${days}-day study streak!`,
      tag: 'study-streak',
      data: {
        type: 'study-streak',
        days,
        url: '/?tab=profile'
      },
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: false
    };

    await this.showNotification(notification);
  }

  // Check if notifications are supported and enabled
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Schedule a notification for later (using service worker)
  async scheduleNotification(notification: NotificationData, delay: number): Promise<void> {
    if (!this.registration) return;

    setTimeout(async () => {
      await this.showNotification(notification);
    }, delay);
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Helper function to initialize notifications
export async function initializeNotifications(): Promise<boolean> {
  const manager = NotificationManager.getInstance();
  const initialized = await manager.initialize();
  
  if (initialized) {
    const permission = await manager.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}