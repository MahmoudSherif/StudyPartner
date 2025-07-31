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
  type: 'task' | 'streak' | 'milestone';
  date: string;
  points: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string;
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
}

export interface AppState {
  tasks: Task[];
  achievements: Achievement[];
  streak: Streak;
  importantDates: ImportantDate[];
  questions: Question[];
  moodEntries: MoodEntry[];
  dailyProgress: DailyProgress[];
} 