import 'package:flutter/material.dart';
import '../models/achievement.dart';

class AppConstants {
  // Colors from PRD - maintaining the same design system
  static const Color primaryTeal = Color(0xFF1A6B6B); // Deep teal oklch(0.45 0.15 200)
  static const Color accentOrange = Color(0xFFE67E22); // Warm orange oklch(0.70 0.15 50)
  static const Color lightBlueGray = Color(0xFFE2E8F0); // Light blue-gray oklch(0.85 0.02 220)
  static const Color backgroundGray = Color(0xFFF8F9FA); // Background
  static const Color darkText = Color(0xFF1A202C); // Dark text oklch(0.2 0 0)
  static const Color whiteText = Color(0xFFFAFAFA); // White text
  
  // Subject colors
  static const List<Color> subjectColors = [
    Color(0xFF3B82F6), // Blue
    Color(0xFFEF4444), // Red
    Color(0xFF10B981), // Green
    Color(0xFFF59E0B), // Amber
    Color(0xFF8B5CF6), // Violet
    Color(0xFFEC4899), // Pink
    Color(0xFF06B6D4), // Cyan
    Color(0xFF84CC16), // Lime
  ];
  
  // Spacing scale (4/8/16/24px)
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing16 = 16.0;
  static const double spacing24 = 24.0;
  
  // Touch targets (44px minimum)
  static const double minTouchTarget = 44.0;
  
  // Font sizes
  static const double fontSize24 = 24.0; // H1
  static const double fontSize20 = 20.0; // H2
  static const double fontSize18 = 18.0; // H3
  static const double fontSize16 = 16.0; // Body
  static const double fontSize14 = 14.0; // Caption
  
  // Animation durations
  static const Duration quickAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration slowAnimation = Duration(milliseconds: 500);
}

// Initial achievements data
List<Achievement> getInitialAchievements() {
  return [
    const Achievement(
      id: 'first-session',
      title: 'Getting Started',
      description: 'Complete your first study session',
      icon: '🎯',
      unlocked: false,
      requirement: 1,
      progress: 0,
      category: AchievementCategory.sessions,
    ),
    const Achievement(
      id: 'hour-milestone',
      title: 'Hour Hero',
      description: 'Study for a total of 1 hour',
      icon: '⏰',
      unlocked: false,
      requirement: 60,
      progress: 0,
      category: AchievementCategory.time,
    ),
    const Achievement(
      id: 'week-warrior',
      title: 'Week Warrior',
      description: 'Study for 7 days in a row',
      icon: '🔥',
      unlocked: false,
      requirement: 7,
      progress: 0,
      category: AchievementCategory.streaks,
    ),
    const Achievement(
      id: 'focus-master',
      title: 'Focus Master',
      description: 'Complete 25 study sessions',
      icon: '🎓',
      unlocked: false,
      requirement: 25,
      progress: 0,
      category: AchievementCategory.sessions,
    ),
    const Achievement(
      id: 'century-club',
      title: 'Century Club',
      description: 'Study for 100 total hours',
      icon: '💯',
      unlocked: false,
      requirement: 6000, // 100 hours in minutes
      progress: 0,
      category: AchievementCategory.time,
    ),
    const Achievement(
      id: 'goal-setter',
      title: 'Goal Setter',
      description: 'Create your first goal',
      icon: '🎯',
      unlocked: false,
      requirement: 1,
      progress: 0,
      category: AchievementCategory.goals,
    ),
    const Achievement(
      id: 'goal-achiever',
      title: 'Goal Achiever',
      description: 'Complete 5 goals',
      icon: '🏆',
      unlocked: false,
      requirement: 5,
      progress: 0,
      category: AchievementCategory.goals,
    ),
    const Achievement(
      id: 'focus-champion',
      title: 'Focus Champion',
      description: 'Complete 10 focus sessions',
      icon: '🧠',
      unlocked: false,
      requirement: 10,
      progress: 0,
      category: AchievementCategory.focus,
    ),
    const Achievement(
      id: 'marathon-runner',
      title: 'Marathon Runner',
      description: 'Study for 5 hours in one day',
      icon: '🏃‍♂️',
      unlocked: false,
      requirement: 300, // 5 hours in minutes
      progress: 0,
      category: AchievementCategory.time,
      isGoalBased: true,
    ),
    const Achievement(
      id: 'consistency-king',
      title: 'Consistency King',
      description: 'Maintain a 30-day study streak',
      icon: '👑',
      unlocked: false,
      requirement: 30,
      progress: 0,
      category: AchievementCategory.streaks,
    ),
  ];
}