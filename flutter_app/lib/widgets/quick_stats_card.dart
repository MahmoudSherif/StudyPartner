import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/study_provider.dart';
import '../constants/app_constants.dart';

class QuickStatsCard extends StatelessWidget {
  const QuickStatsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<StudyProvider>(
      builder: (context, studyProvider, child) {
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(AppConstants.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Today\'s Progress',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: AppConstants.spacing16),
                Row(
                  children: [
                    Expanded(
                      child: _StatItem(
                        icon: Icons.timer,
                        label: 'Study Time',
                        value: _formatTime(studyProvider.todayStudyTime.toInt()),
                        color: AppConstants.primaryTeal,
                      ),
                    ),
                    Container(
                      width: 1,
                      height: 40,
                      color: AppConstants.lightBlueGray,
                    ),
                    Expanded(
                      child: _StatItem(
                        icon: Icons.task_alt,
                        label: 'Sessions',
                        value: '${studyProvider.sessionsCompleted}',
                        color: AppConstants.accentOrange,
                      ),
                    ),
                    Container(
                      width: 1,
                      height: 40,
                      color: AppConstants.lightBlueGray,
                    ),
                    Expanded(
                      child: _StatItem(
                        icon: Icons.local_fire_department,
                        label: 'Streak',
                        value: '${studyProvider.currentStreak}',
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatTime(int minutes) {
    if (minutes < 60) {
      return '${minutes}m';
    } else {
      final hours = minutes ~/ 60;
      final remainingMinutes = minutes % 60;
      return '${hours}h ${remainingMinutes}m';
    }
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(
          icon,
          color: color,
          size: 24,
        ),
        const SizedBox(height: AppConstants.spacing4),
        Text(
          value,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: Colors.grey[600],
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}