import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/study_provider.dart';
import '../models/subject.dart';
import '../constants/app_constants.dart';

class SubjectSelector extends StatelessWidget {
  const SubjectSelector({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<StudyProvider>(
      builder: (context, studyProvider, child) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Select Subject',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                TextButton.icon(
                  onPressed: () => _showAddSubjectDialog(context),
                  icon: const Icon(Icons.add),
                  label: const Text('Add'),
                ),
              ],
            ),
            const SizedBox(height: AppConstants.spacing16),
            
            if (studyProvider.subjects.isEmpty)
              _buildEmptyState(context)
            else
              _buildSubjectGrid(context, studyProvider),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.spacing24),
      decoration: BoxDecoration(
        color: AppConstants.lightBlueGray.withOpacity(0.3),
        borderRadius: BorderRadius.circular(AppConstants.spacing16),
        border: Border.all(
          color: AppConstants.lightBlueGray,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.book_outlined,
            size: 48,
            color: Colors.grey[400],
          ),
          const SizedBox(height: AppConstants.spacing16),
          Text(
            'No subjects yet',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: AppConstants.spacing8),
          Text(
            'Add your first subject to start studying',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppConstants.spacing16),
          ElevatedButton.icon(
            onPressed: () => _showAddSubjectDialog(context),
            icon: const Icon(Icons.add),
            label: const Text('Add Subject'),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectGrid(BuildContext context, StudyProvider studyProvider) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: AppConstants.spacing16,
        mainAxisSpacing: AppConstants.spacing16,
        childAspectRatio: 1.2,
      ),
      itemCount: studyProvider.subjects.length,
      itemBuilder: (context, index) {
        final subject = studyProvider.subjects[index];
        final isSelected = studyProvider.selectedSubject?.id == subject.id;
        
        return GestureDetector(
          onTap: () => studyProvider.selectSubject(subject),
          child: Container(
            padding: const EdgeInsets.all(AppConstants.spacing16),
            decoration: BoxDecoration(
              color: isSelected ? AppConstants.primaryTeal : Colors.white,
              borderRadius: BorderRadius.circular(AppConstants.spacing16),
              border: Border.all(
                color: isSelected 
                    ? AppConstants.primaryTeal 
                    : AppConstants.lightBlueGray,
                width: 2,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: AppConstants.primaryTeal.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: Color(int.parse(subject.color.replaceFirst('#', '0xff'))),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const Spacer(),
                    if (isSelected)
                      const Icon(
                        Icons.check_circle,
                        color: Colors.white,
                        size: 20,
                      ),
                  ],
                ),
                const SizedBox(height: AppConstants.spacing8),
                Text(
                  subject.name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: isSelected ? Colors.white : AppConstants.darkText,
                    fontSize: 16,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const Spacer(),
                Text(
                  '${_formatTime(subject.totalTime)} studied',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isSelected 
                        ? Colors.white.withOpacity(0.8) 
                        : Colors.grey[600],
                    fontSize: 12,
                  ),
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

  void _showAddSubjectDialog(BuildContext context) {
    final nameController = TextEditingController();
    String selectedColor = AppConstants.subjectColors[0].value.toRadixString(16);
    
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Add New Subject'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Subject Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: AppConstants.spacing16),
                  const Text('Choose Color:'),
                  const SizedBox(height: AppConstants.spacing8),
                  Wrap(
                    spacing: AppConstants.spacing8,
                    children: AppConstants.subjectColors.map((color) {
                      final colorHex = color.value.toRadixString(16);
                      final isSelected = selectedColor == colorHex;
                      
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedColor = colorHex;
                          });
                        },
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                            border: isSelected
                                ? Border.all(color: AppConstants.darkText, width: 3)
                                : null,
                          ),
                          child: isSelected
                              ? const Icon(Icons.check, color: Colors.white)
                              : null,
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    if (nameController.text.trim().isNotEmpty) {
                      Provider.of<StudyProvider>(context, listen: false)
                          .addSubject(nameController.text.trim(), '#$selectedColor');
                      Navigator.of(dialogContext).pop();
                    }
                  },
                  child: const Text('Add'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}