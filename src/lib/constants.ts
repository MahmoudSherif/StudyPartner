import { Achievement } from './types'

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-session',
    title: 'Getting Started',
    description: 'Complete your first study session',
    icon: '🎯',
    unlocked: false,
    requirement: 1,
    progress: 0,
    category: 'sessions'
  },
  {
    id: 'hour-milestone',
    title: 'Hour Hero',
    description: 'Study for a total of 1 hour',
    icon: '⏰',
    unlocked: false,
    requirement: 60,
    progress: 0,
    category: 'time'
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '🔥',
    unlocked: false,
    requirement: 7,
    progress: 0,
    category: 'streaks'
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 25 study sessions',
    icon: '🎓',
    unlocked: false,
    requirement: 25,
    progress: 0,
    category: 'sessions'
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Study for 100 total hours',
    icon: '💯',
    unlocked: false,
    requirement: 6000, // 100 hours in minutes
    progress: 0,
    category: 'time'
  },
  {
    id: 'goal-setter',
    title: 'Goal Setter',
    description: 'Create your first goal',
    icon: '🎯',
    unlocked: false,
    requirement: 1,
    progress: 0,
    category: 'goals'
  },
  {
    id: 'goal-achiever',
    title: 'Goal Achiever',
    description: 'Complete 5 goals',
    icon: '🏆',
    unlocked: false,
    requirement: 5,
    progress: 0,
    category: 'goals'
  },
  {
    id: 'focus-champion',
    title: 'Focus Champion',
    description: 'Complete 10 focus sessions',
    icon: '🧠',
    unlocked: false,
    requirement: 10,
    progress: 0,
    category: 'focus'
  },
  {
    id: 'marathon-runner',
    title: 'Marathon Runner',
    description: 'Study for 5 hours in one day',
    icon: '🏃‍♂️',
    unlocked: false,
    requirement: 300, // 5 hours in minutes
    progress: 0,
    category: 'time',
    isGoalBased: true
  },
  {
    id: 'consistency-king',
    title: 'Consistency King',
    description: 'Maintain a 30-day study streak',
    icon: '👑',
    unlocked: false,
    requirement: 30,
    progress: 0,
    category: 'streaks'
  }
]

export const SUBJECT_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
]