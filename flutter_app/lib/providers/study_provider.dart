import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';
import '../models/subject.dart';
import '../models/study_session.dart';
import '../models/achievement.dart';
import '../models/task.dart';
import '../constants/app_constants.dart';

class StudyProvider extends ChangeNotifier {
  List<Subject> _subjects = [];
  List<StudySession> _sessions = [];
  List<Achievement> _achievements = [];
  List<Task> _tasks = [];
  
  Subject? _selectedSubject;
  bool _isTimerRunning = false;
  int _timerDuration = 25; // minutes
  int _remainingTime = 0; // seconds
  Timer? _timer;
  DateTime? _sessionStartTime;

  // Getters
  List<Subject> get subjects => _subjects;
  List<StudySession> get sessions => _sessions;
  List<Achievement> get achievements => _achievements;
  List<Task> get tasks => _tasks;
  Subject? get selectedSubject => _selectedSubject;
  bool get isTimerRunning => _isTimerRunning;
  int get timerDuration => _timerDuration;
  int get remainingTime => _remainingTime;

  // Stats getters
  int get totalStudyTime => _sessions.fold(0, (sum, session) => sum + session.duration);
  int get sessionsCompleted => _sessions.where((s) => s.completed).length;
  int get currentStreak => _calculateCurrentStreak();
  double get todayStudyTime => _getTodayStudyTime();

  StudyProvider() {
    _loadData();
    _achievements = getInitialAchievements();
  }

  Future<void> _loadData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load subjects
      final subjectsJson = prefs.getString('subjects');
      if (subjectsJson != null) {
        final List<dynamic> subjectsList = json.decode(subjectsJson);
        _subjects = subjectsList.map((json) => Subject.fromJson(json)).toList();
      }
      
      // Load sessions
      final sessionsJson = prefs.getString('sessions');
      if (sessionsJson != null) {
        final List<dynamic> sessionsList = json.decode(sessionsJson);
        _sessions = sessionsList.map((json) => StudySession.fromJson(json)).toList();
      }
      
      // Load tasks
      final tasksJson = prefs.getString('tasks');
      if (tasksJson != null) {
        final List<dynamic> tasksList = json.decode(tasksJson);
        _tasks = tasksList.map((json) => Task.fromJson(json)).toList();
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading data: $e');
    }
  }

  Future<void> _saveData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save subjects
      final subjectsJson = json.encode(_subjects.map((s) => s.toJson()).toList());
      await prefs.setString('subjects', subjectsJson);
      
      // Save sessions
      final sessionsJson = json.encode(_sessions.map((s) => s.toJson()).toList());
      await prefs.setString('sessions', sessionsJson);
      
      // Save tasks
      final tasksJson = json.encode(_tasks.map((t) => t.toJson()).toList());
      await prefs.setString('tasks', tasksJson);
    } catch (e) {
      debugPrint('Error saving data: $e');
    }
  }

  // Subject management
  void addSubject(String name, String color) {
    final subject = Subject(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      color: color,
      totalTime: 0,
    );
    _subjects.add(subject);
    _saveData();
    notifyListeners();
  }

  void selectSubject(Subject subject) {
    _selectedSubject = subject;
    notifyListeners();
  }

  // Timer management
  void setTimerDuration(int minutes) {
    if (!_isTimerRunning) {
      _timerDuration = minutes;
      _remainingTime = minutes * 60;
      notifyListeners();
    }
  }

  void startTimer() {
    if (_selectedSubject == null) return;
    
    _isTimerRunning = true;
    _sessionStartTime = DateTime.now();
    _remainingTime = _timerDuration * 60;
    
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingTime > 0) {
        _remainingTime--;
        notifyListeners();
      } else {
        _completeSession();
      }
    });
    
    notifyListeners();
  }

  void pauseTimer() {
    _isTimerRunning = false;
    _timer?.cancel();
    notifyListeners();
  }

  void stopTimer() {
    _isTimerRunning = false;
    _timer?.cancel();
    _remainingTime = _timerDuration * 60;
    _sessionStartTime = null;
    notifyListeners();
  }

  void _completeSession() {
    if (_selectedSubject == null || _sessionStartTime == null) return;
    
    final session = StudySession(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      subjectId: _selectedSubject!.id,
      startTime: _sessionStartTime!,
      endTime: DateTime.now(),
      duration: _timerDuration,
      completed: true,
    );
    
    _sessions.add(session);
    
    // Update subject total time
    final subjectIndex = _subjects.indexWhere((s) => s.id == _selectedSubject!.id);
    if (subjectIndex != -1) {
      _subjects[subjectIndex] = _subjects[subjectIndex].copyWith(
        totalTime: _subjects[subjectIndex].totalTime + _timerDuration,
      );
    }
    
    _updateAchievements();
    stopTimer();
    _saveData();
  }

  // Task management
  void addTask(String title, TaskPriority priority, {String? description, String? subjectId}) {
    final task = Task(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      description: description,
      completed: false,
      createdAt: DateTime.now(),
      subjectId: subjectId,
      priority: priority,
    );
    _tasks.add(task);
    _saveData();
    notifyListeners();
  }

  void toggleTask(String taskId) {
    final taskIndex = _tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = _tasks[taskIndex];
      _tasks[taskIndex] = task.copyWith(
        completed: !task.completed,
        completedAt: !task.completed ? DateTime.now() : null,
      );
      _saveData();
      notifyListeners();
    }
  }

  // Helper methods
  int _calculateCurrentStreak() {
    if (_sessions.isEmpty) return 0;
    
    final today = DateTime.now();
    int streak = 0;
    
    for (int i = 0; i < 365; i++) {
      final date = today.subtract(Duration(days: i));
      final hasSessionOnDate = _sessions.any((session) {
        final sessionDate = session.startTime;
        return sessionDate.year == date.year &&
               sessionDate.month == date.month &&
               sessionDate.day == date.day &&
               session.completed;
      });
      
      if (hasSessionOnDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  double _getTodayStudyTime() {
    final today = DateTime.now();
    return _sessions
        .where((session) {
          final sessionDate = session.startTime;
          return sessionDate.year == today.year &&
                 sessionDate.month == today.month &&
                 sessionDate.day == today.day &&
                 session.completed;
        })
        .fold(0.0, (sum, session) => sum + session.duration);
  }

  void _updateAchievements() {
    // Update achievement progress based on current stats
    for (int i = 0; i < _achievements.length; i++) {
      final achievement = _achievements[i];
      int newProgress = achievement.progress;
      
      switch (achievement.category) {
        case AchievementCategory.sessions:
          newProgress = sessionsCompleted;
          break;
        case AchievementCategory.time:
          newProgress = totalStudyTime;
          break;
        case AchievementCategory.streaks:
          newProgress = currentStreak;
          break;
        default:
          break;
      }
      
      if (newProgress >= achievement.requirement && !achievement.unlocked) {
        _achievements[i] = achievement.copyWith(
          unlocked: true,
          progress: newProgress,
          unlockedAt: DateTime.now(),
        );
      } else {
        _achievements[i] = achievement.copyWith(progress: newProgress);
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}