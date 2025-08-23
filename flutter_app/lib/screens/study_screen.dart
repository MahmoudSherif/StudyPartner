import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math' as math;
import '../providers/study_provider.dart';
import '../models/subject.dart';
import '../constants/app_constants.dart';
import '../widgets/timer_widget.dart';
import '../widgets/subject_selector.dart';
import '../widgets/quick_stats_card.dart';

class StudyScreen extends StatelessWidget {
  const StudyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Timer'),
        centerTitle: true,
      ),
      body: Consumer<StudyProvider>(
        builder: (context, studyProvider, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppConstants.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Quick stats
                const QuickStatsCard(),
                const SizedBox(height: AppConstants.spacing24),
                
                // Subject selector
                const SubjectSelector(),
                const SizedBox(height: AppConstants.spacing24),
                
                // Timer
                const TimerWidget(),
                const SizedBox(height: AppConstants.spacing24),
                
                // Timer duration controls
                if (!studyProvider.isTimerRunning) ...[
                  Text(
                    'Study Duration',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: AppConstants.spacing16),
                  Row(
                    children: [
                      Expanded(
                        child: _TimerDurationButton(
                          duration: 15,
                          isSelected: studyProvider.timerDuration == 15,
                          onTap: () => studyProvider.setTimerDuration(15),
                        ),
                      ),
                      const SizedBox(width: AppConstants.spacing8),
                      Expanded(
                        child: _TimerDurationButton(
                          duration: 25,
                          isSelected: studyProvider.timerDuration == 25,
                          onTap: () => studyProvider.setTimerDuration(25),
                        ),
                      ),
                      const SizedBox(width: AppConstants.spacing8),
                      Expanded(
                        child: _TimerDurationButton(
                          duration: 45,
                          isSelected: studyProvider.timerDuration == 45,
                          onTap: () => studyProvider.setTimerDuration(45),
                        ),
                      ),
                      const SizedBox(width: AppConstants.spacing8),
                      Expanded(
                        child: _TimerDurationButton(
                          duration: 60,
                          isSelected: studyProvider.timerDuration == 60,
                          onTap: () => studyProvider.setTimerDuration(60),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppConstants.spacing24),
                ],
                
                // Timer controls
                Row(
                  children: [
                    if (studyProvider.isTimerRunning) ...[
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: studyProvider.pauseTimer,
                          icon: const Icon(Icons.pause),
                          label: const Text('Pause'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppConstants.accentOrange,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppConstants.spacing16),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: studyProvider.stopTimer,
                          icon: const Icon(Icons.stop),
                          label: const Text('Stop'),
                        ),
                      ),
                    ] else ...[
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: studyProvider.selectedSubject != null
                              ? studyProvider.startTimer
                              : null,
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Start Study Session'),
                        ),
                      ),
                    ],
                  ],
                ),
                
                if (studyProvider.selectedSubject == null) ...[
                  const SizedBox(height: AppConstants.spacing16),
                  Container(
                    padding: const EdgeInsets.all(AppConstants.spacing16),
                    decoration: BoxDecoration(
                      color: AppConstants.accentOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppConstants.spacing8),
                      border: Border.all(
                        color: AppConstants.accentOrange.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info,
                          color: AppConstants.accentOrange,
                        ),
                        const SizedBox(width: AppConstants.spacing8),
                        Expanded(
                          child: Text(
                            'Please select a subject to start studying',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppConstants.accentOrange,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _TimerDurationButton extends StatelessWidget {
  final int duration;
  final bool isSelected;
  final VoidCallback onTap;

  const _TimerDurationButton({
    required this.duration,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppConstants.spacing16),
        decoration: BoxDecoration(
          color: isSelected ? AppConstants.primaryTeal : Colors.white,
          borderRadius: BorderRadius.circular(AppConstants.spacing8),
          border: Border.all(
            color: isSelected 
                ? AppConstants.primaryTeal 
                : AppConstants.lightBlueGray,
            width: 2,
          ),
        ),
        child: Text(
          '${duration}m',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: isSelected ? Colors.white : AppConstants.darkText,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}