import 'package:json_annotation/json_annotation.dart';

part 'study_session.g.dart';

@JsonSerializable()
class StudySession {
  final String id;
  final String subjectId;
  @JsonKey(fromJson: _dateTimeFromJson, toJson: _dateTimeToJson)
  final DateTime startTime;
  @JsonKey(fromJson: _dateTimeFromJsonNullable, toJson: _dateTimeToJsonNullable)
  final DateTime? endTime;
  final int duration; // in minutes
  final bool completed;

  const StudySession({
    required this.id,
    required this.subjectId,
    required this.startTime,
    this.endTime,
    required this.duration,
    required this.completed,
  });

  factory StudySession.fromJson(Map<String, dynamic> json) => _$StudySessionFromJson(json);
  Map<String, dynamic> toJson() => _$StudySessionToJson(this);

  StudySession copyWith({
    String? id,
    String? subjectId,
    DateTime? startTime,
    DateTime? endTime,
    int? duration,
    bool? completed,
  }) {
    return StudySession(
      id: id ?? this.id,
      subjectId: subjectId ?? this.subjectId,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      duration: duration ?? this.duration,
      completed: completed ?? this.completed,
    );
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