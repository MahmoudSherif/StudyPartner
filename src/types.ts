export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'streak' | 'milestone' | 'daily-challenge' | 'social' | 'special';
  date: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
  unlocked: boolean;
}

export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNext: number;
  title: string;
  totalXP: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'task-completion' | 'streak-maintain' | 'mood-track' | 'knowledge-add' | 'special';
  target: number;
  progress: number;
  reward: {
    xp: number;
    coins: number;
    achievement?: string;
  };
  expiresAt: string;
  completed: boolean;
}

export interface UserStats {
  totalTasksCompleted: number;
  longestStreak: number;
  totalXP: number;
  totalCoins: number;
  joinedDate: string;
  favoriteActivity: string;
  level: UserLevel;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  weeklyXP: number;
  rank: number;
  avatar?: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string;
  freezeCount: number; // Streak freezes available
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'event' | 'deadline';
  description?: string;
  reminder: boolean;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  createdAt: string;
  lastReviewed?: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5; // 1=very bad, 5=excellent
  notes?: string;
  activities: string[];
}

export interface DailyProgress {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  mood?: number;
  notes?: string;
  xpEarned: number;
  coinsEarned: number;
}

export interface AppState {
  tasks: Task[];
  achievements: Achievement[];
  availableAchievements: Achievement[]; // All possible achievements
  streak: Streak;
  importantDates: ImportantDate[];
  questions: Question[];
  moodEntries: MoodEntry[];
  dailyProgress: DailyProgress[];
  userStats: UserStats;
  dailyChallenges: DailyChallenge[];
  leaderboard: LeaderboardEntry[];
  coins: number;
  settings: {
    theme: 'default' | 'forest' | 'ocean' | 'sunset' | 'galaxy' | 'space';
    notifications: boolean;
    soundEffects: boolean;
    username: string;
    avatar: string;
  };
} 