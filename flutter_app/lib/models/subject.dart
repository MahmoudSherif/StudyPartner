import 'package:json_annotation/json_annotation.dart';

part 'subject.g.dart';

@JsonSerializable()
class Subject {
  final String id;
  final String name;
  final String color;
  final int totalTime;
  final int? goal;
  final int? dailyTarget; // minutes per day
  final int? weeklyTarget; // minutes per week

  const Subject({
    required this.id,
    required this.name,
    required this.color,
    required this.totalTime,
    this.goal,
    this.dailyTarget,
    this.weeklyTarget,
  });

  factory Subject.fromJson(Map<String, dynamic> json) => _$SubjectFromJson(json);
  Map<String, dynamic> toJson() => _$SubjectToJson(this);

  Subject copyWith({
    String? id,
    String? name,
    String? color,
    int? totalTime,
    int? goal,
    int? dailyTarget,
    int? weeklyTarget,
  }) {
    return Subject(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      totalTime: totalTime ?? this.totalTime,
      goal: goal ?? this.goal,
      dailyTarget: dailyTarget ?? this.dailyTarget,
      weeklyTarget: weeklyTarget ?? this.weeklyTarget,
    );
  }
}