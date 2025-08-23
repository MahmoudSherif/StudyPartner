import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math' as math;
import '../providers/study_provider.dart';
import '../constants/app_constants.dart';

class TimerWidget extends StatelessWidget {
  const TimerWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<StudyProvider>(
      builder: (context, studyProvider, child) {
        final progress = studyProvider.timerDuration > 0
            ? (studyProvider.timerDuration * 60 - studyProvider.remainingTime) / 
              (studyProvider.timerDuration * 60)
            : 0.0;
        
        final minutes = studyProvider.remainingTime ~/ 60;
        final seconds = studyProvider.remainingTime % 60;
        
        return Container(
          height: 300,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Background circle
              Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 20,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
              ),
              
              // Progress circle
              SizedBox(
                width: 220,
                height: 220,
                child: CustomPaint(
                  painter: CircularProgressPainter(
                    progress: progress,
                    strokeWidth: 8,
                    progressColor: studyProvider.isTimerRunning 
                        ? AppConstants.primaryTeal 
                        : AppConstants.lightBlueGray,
                    backgroundColor: AppConstants.lightBlueGray.withOpacity(0.3),
                  ),
                ),
              ),
              
              // Timer text
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}',
                    style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: AppConstants.darkText,
                    ),
                  ),
                  const SizedBox(height: AppConstants.spacing8),
                  if (studyProvider.selectedSubject != null)
                    Text(
                      studyProvider.selectedSubject!.name,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Color(int.parse(studyProvider.selectedSubject!.color.replaceFirst('#', '0xff'))),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  if (studyProvider.isTimerRunning) ...[
                    const SizedBox(height: AppConstants.spacing4),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppConstants.spacing8,
                        vertical: AppConstants.spacing4,
                      ),
                      decoration: BoxDecoration(
                        color: AppConstants.primaryTeal.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Focus Time',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppConstants.primaryTeal,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class CircularProgressPainter extends CustomPainter {
  final double progress;
  final double strokeWidth;
  final Color progressColor;
  final Color backgroundColor;

  CircularProgressPainter({
    required this.progress,
    required this.strokeWidth,
    required this.progressColor,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - strokeWidth / 2;

    // Background circle
    final backgroundPaint = Paint()
      ..color = backgroundColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, backgroundPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = progressColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final sweepAngle = 2 * math.pi * progress;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2, // Start from top
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(CircularProgressPainter oldDelegate) {
    return oldDelegate.progress != progress ||
           oldDelegate.progressColor != progressColor ||
           oldDelegate.backgroundColor != backgroundColor;
  }
}