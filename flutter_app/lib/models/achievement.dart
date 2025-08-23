import 'package:json_annotation/json_annotation.dart';

part 'achievement.g.dart';

enum AchievementCategory { time, sessions, streaks, focus, goals, tasks }

@JsonSerializable()
class Achievement {
  final String id;
  final String title;
  final String description;
  final String icon;
  final bool unlocked;
  @JsonKey(fromJson: _dateTimeFromJsonNullable, toJson: _dateTimeToJsonNullable)
  final DateTime? unlockedAt;
  final int requirement;
  final int progress;
  final AchievementCategory? category;
  final bool? isGoalBased;
  final int? goalTarget;
  @JsonKey(fromJson: _dateTimeFromJsonNullable, toJson: _dateTimeToJsonNullable)
  final DateTime? goalDeadline;

  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.unlocked,
    this.unlockedAt,
    required this.requirement,
    required this.progress,
    this.category,
    this.isGoalBased,
    this.goalTarget,
    this.goalDeadline,
  });

  factory Achievement.fromJson(Map<String, dynamic> json) => _$AchievementFromJson(json);
  Map<String, dynamic> toJson() => _$AchievementToJson(this);

  Achievement copyWith({
    String? id,
    String? title,
    String? description,
    String? icon,
    bool? unlocked,
    DateTime? unlockedAt,
    int? requirement,
    int? progress,
    AchievementCategory? category,
    bool? isGoalBased,
    int? goalTarget,
    DateTime? goalDeadline,
  }) {
    return Achievement(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      unlocked: unlocked ?? this.unlocked,
      unlockedAt: unlockedAt ?? this.unlockedAt,
      requirement: requirement ?? this.requirement,
      progress: progress ?? this.progress,
      category: category ?? this.category,
      isGoalBased: isGoalBased ?? this.isGoalBased,
      goalTarget: goalTarget ?? this.goalTarget,
      goalDeadline: goalDeadline ?? this.goalDeadline,
    );
  }

  double get progressPercentage => (progress / requirement).clamp(0.0, 1.0);
}

// Helper functions for DateTime serialization
DateTime? _dateTimeFromJsonNullable(dynamic value) {
  if (value == null) return null;
  if (value is String) {
    return DateTime.parse(value);
  }
  if (value is int) {
    return DateTime.fromMillisecondsSinceEpoch(value);
  }
  return null;
}

String? _dateTimeToJsonNullable(DateTime? dateTime) => dateTime?.toIso8601String();