import 'package:json_annotation/json_annotation.dart';

part 'task.g.dart';

enum TaskPriority { low, medium, high }

@JsonSerializable()
class Task {
  final String id;
  final String title;
  final String? description;
  final bool completed;
  @JsonKey(fromJson: _dateTimeFromJson, toJson: _dateTimeToJson)
  final DateTime createdAt;
  @JsonKey(fromJson: _dateTimeFromJsonNullable, toJson: _dateTimeToJsonNullable)
  final DateTime? completedAt;
  final String? subjectId;
  final TaskPriority priority;
  @JsonKey(fromJson: _dateTimeFromJsonNullable, toJson: _dateTimeToJsonNullable)
  final DateTime? dueDate;
  final int? estimatedTime; // minutes

  const Task({
    required this.id,
    required this.title,
    this.description,
    required this.completed,
    required this.createdAt,
    this.completedAt,
    this.subjectId,
    required this.priority,
    this.dueDate,
    this.estimatedTime,
  });

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
  Map<String, dynamic> toJson() => _$TaskToJson(this);

  Task copyWith({
    String? id,
    String? title,
    String? description,
    bool? completed,
    DateTime? createdAt,
    DateTime? completedAt,
    String? subjectId,
    TaskPriority? priority,
    DateTime? dueDate,
    int? estimatedTime,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      completed: completed ?? this.completed,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      subjectId: subjectId ?? this.subjectId,
      priority: priority ?? this.priority,
      dueDate: dueDate ?? this.dueDate,
      estimatedTime: estimatedTime ?? this.estimatedTime,
    );
  }

  bool get isOverdue {
    if (dueDate == null || completed) return false;
    return DateTime.now().isAfter(dueDate!);
  }
}

// Helper functions for DateTime serialization
DateTime _dateTimeFromJson(dynamic value) {
  if (value is String) {
    return DateTime.parse(value);
  }
  if (value is int) {
    return DateTime.fromMillisecondsSinceEpoch(value);
  }
  return DateTime.now();
}

String _dateTimeToJson(DateTime dateTime) => dateTime.toIso8601String();

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