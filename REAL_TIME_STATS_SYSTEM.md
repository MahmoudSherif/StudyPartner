# Real-Time Stats System

## Overview

The real-time stats system ensures that all charts, streaks, and statistics are automatically updated whenever any related activity occurs and are properly saved to and retrieved from Firestore in real-time.

## Architecture

### 1. Stats Manager (`src/lib/statsManager.ts`)

The `StatsManager` is a singleton class that:
- Calculates all user statistics in real-time
- Manages subscriptions to stats updates
- Provides a centralized way to update and retrieve stats
- Handles complex calculations for streaks, progress, and achievements

**Key Features:**
- Real-time calculation of user stats, task progress, weekly/monthly progress
- Achievement unlocking based on current stats
- Challenge leaderboard calculations
- Streak calculations using improved algorithms

### 2. Real-Time Data Hooks (`src/hooks/useFirebaseData.ts`)

Enhanced Firebase hooks that provide:
- Real-time listeners for all data types (sessions, tasks, challenges, etc.)
- Automatic syncing to Firestore when data changes
- Fallback mechanisms for offline scenarios
- Error handling and retry logic

**Supported Data Types:**
- Study Sessions
- Focus Sessions
- Tasks
- Challenges
- Goals
- Achievements
- Subjects

### 3. Real-Time Stats Hook (`src/hooks/useRealTimeStats.ts`)

A custom hook that:
- Subscribes to the StatsManager for real-time updates
- Integrates all Firebase data hooks
- Provides a unified interface for accessing all stats
- Handles loading states and error conditions

## Data Flow

```
User Activity (Session, Task, etc.)
    ↓
Firebase Hook (useFirebaseData)
    ↓
Real-time Listener (onSnapshot)
    ↓
Stats Manager (updateStats)
    ↓
Stats Calculation
    ↓
Notify Listeners
    ↓
UI Components Update
```

## Real-Time Updates

### 1. Study Sessions
- **Trigger**: When a session is completed or modified
- **Updates**: Total study time, session count, streak calculation
- **Charts**: Activity grid, weekly/monthly charts

### 2. Focus Sessions
- **Trigger**: When a focus session is completed
- **Updates**: Total study time, session count, streak calculation
- **Charts**: Activity grid, weekly/monthly charts

### 3. Tasks
- **Trigger**: When a task is completed or created
- **Updates**: Task completion count, daily progress, challenge progress
- **Charts**: Task progress bars, challenge leaderboards

### 4. Challenges
- **Trigger**: When challenge tasks are completed or participants change
- **Updates**: Challenge progress, leaderboard rankings, points
- **Charts**: Challenge progress, leaderboard displays

### 5. Goals
- **Trigger**: When goals are updated or progress is made
- **Updates**: Goal progress, achievement unlocking
- **Charts**: Goal progress indicators

## Statistics Calculated

### User Stats
- **Total Study Time**: Combined time from sessions and focus sessions
- **Streak**: Current consecutive days with study activity
- **Sessions Completed**: Total number of completed sessions
- **Average Session Length**: Mean duration of completed sessions
- **Tasks Completed**: Total completed tasks (regular + challenge)
- **Challenge Tasks Completed**: Tasks completed in challenges

### Task Progress
- **Daily Tasks**: Today's task completion progress
- **Challenge Progress**: Active challenge participation and ranking
- **Leaderboard**: Real-time rankings for active challenges

### Weekly Progress
- **Study Time**: Total study time for current week
- **Sessions**: Number of sessions completed this week
- **Tasks**: Number of tasks completed this week
- **Streak**: Current streak within the week

### Monthly Progress
- **Study Time**: Total study time for current month
- **Sessions**: Number of sessions completed this month
- **Tasks**: Number of tasks completed this month
- **Average Session Length**: Mean session duration for the month

## Firestore Integration

### Real-Time Listeners
All data is automatically synced to Firestore using `onSnapshot` listeners:

```typescript
// Example: Real-time session updates
const docRef = doc(db, 'userData', `${userId}_sessions`)
const unsubscribe = onSnapshot(docRef, (docSnap) => {
  if (docSnap.exists()) {
    const sessions = docSnap.data().data as StudySession[]
    // Update local state and trigger stats recalculation
  }
})
```

### Data Persistence
- All user data is stored in Firestore collections
- Real-time updates ensure data consistency across devices
- Offline support with automatic sync when connection is restored

### Security Rules
Firestore security rules ensure:
- Users can only access their own data
- Challenge data is properly shared between participants
- Real-time updates respect user permissions

## Achievement System

### Real-Time Unlocking
Achievements are automatically unlocked when:
- Study time milestones are reached
- Streak milestones are achieved
- Task completion milestones are met
- Challenge participation milestones are reached

### Notification System
When achievements are unlocked:
- Haptic feedback is triggered (mobile)
- Toast notifications are shown
- Push notifications are sent (if enabled)

## Performance Optimizations

### 1. Debounced Updates
Stats calculations are debounced to prevent excessive recalculations during rapid data changes.

### 2. Memoized Calculations
Complex calculations (like streaks) are memoized to avoid redundant computations.

### 3. Selective Updates
Only affected stats are recalculated when specific data changes.

### 4. Efficient Listeners
Real-time listeners are properly cleaned up to prevent memory leaks.

## Testing

### Debug Component
A `StatsDebugger` component is available for testing real-time updates:
- Shows all current stats in real-time
- Displays update timestamps
- Indicates when live updates are active

### Manual Testing
1. Complete a study session
2. Check that stats update immediately
3. Verify Firestore data is synced
4. Test offline/online scenarios

## Error Handling

### Network Issues
- Graceful degradation when offline
- Automatic retry when connection is restored
- Local data preservation during outages

### Data Validation
- Input validation for all data types
- Fallback values for missing data
- Error boundaries for component failures

### Firestore Errors
- Permission denied handling
- Network timeout handling
- Data corruption recovery

## Future Enhancements

### 1. Advanced Analytics
- Study pattern analysis
- Productivity insights
- Goal achievement predictions

### 2. Social Features
- Friend activity feeds
- Study group statistics
- Community challenges

### 3. Machine Learning
- Personalized study recommendations
- Optimal study time suggestions
- Progress prediction models

## Usage Examples

### Basic Stats Usage
```typescript
const { userStats, taskProgress, isLoading } = useRealTimeStats()

if (isLoading) {
  return <div>Loading stats...</div>
}

return (
  <div>
    <p>Study Time: {userStats.totalStudyTime} minutes</p>
    <p>Streak: {userStats.streak} days</p>
    <p>Daily Progress: {taskProgress.dailyTasks.percentage}%</p>
  </div>
)
```

### Manual Stats Update
```typescript
import { statsManager } from '@/lib/statsManager'

// Update stats manually (if needed)
const stats = statsManager.updateStats(
  sessions,
  focusSessions,
  tasks,
  challenges,
  goals,
  achievements,
  userId
)
```

## Conclusion

The real-time stats system provides a robust, scalable solution for tracking user progress and achievements. It ensures that all statistics are always up-to-date and properly synchronized across devices, providing users with immediate feedback on their study activities. 