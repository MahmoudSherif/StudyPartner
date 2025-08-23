# MotivaMate Mobile - Flutter Application

A mobile study companion application built with Flutter, converted from the original React TypeScript web application.

## Features

### ✅ Implemented
- **Study Timer**: Pomodoro-style timer with customizable durations (15, 25, 45, 60 minutes)
- **Subject Management**: Add and select subjects with color coding
- **Progress Tracking**: View daily statistics, total time, session counts, and streaks
- **Task Management**: Create, complete, and organize tasks with priority levels
- **Achievement System**: Track progress toward study milestones
- **User Authentication**: Sign in/up functionality with local storage
- **Clean UI Design**: Following the original app's design system with Inter font and teal/orange color scheme

### 🚧 Coming Soon
- Calendar integration
- Charts and detailed analytics
- Achievement notifications
- Dark mode support
- Cloud synchronization with Firebase
- Push notifications

## Design System

The Flutter app maintains the same design principles as the original web application:

- **Primary Color**: Deep teal `#1A6B6B` (oklch(0.45 0.15 200))
- **Accent Color**: Warm orange `#E67E22` (oklch(0.70 0.15 50))
- **Typography**: Inter font family with mobile-optimized sizes
- **Spacing**: Consistent 4/8/16/24px spacing scale
- **Touch Targets**: Minimum 44px for accessibility

## Getting Started

### Prerequisites
- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / VS Code with Flutter extensions

### Installation

1. **Navigate to the Flutter app directory**
   ```bash
   cd flutter_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

### Building for Release

**Android APK:**
```bash
flutter build apk --release
```

**iOS (requires macOS and Xcode):**
```bash
flutter build ios --release
```

## Project Structure

```
lib/
├── constants/          # App constants and design tokens
├── models/            # Data models (Subject, Task, Achievement, etc.)
├── providers/         # State management (StudyProvider, AuthProvider)
├── screens/           # App screens (Study, Progress, Tasks, etc.)
├── widgets/           # Reusable UI components
└── main.dart          # App entry point
```

## Key Components

### State Management
- **Provider Pattern**: Using the `provider` package for state management
- **StudyProvider**: Manages study sessions, subjects, tasks, and achievements
- **AuthProvider**: Handles authentication and user session

### Core Features
- **Timer Widget**: Custom circular progress timer with pause/resume functionality
- **Subject Selector**: Grid-based subject selection with color indicators
- **Task Management**: Full CRUD operations for tasks with priority levels
- **Progress Tracking**: Statistics display with formatted time calculations

## Dependencies

Key dependencies used in this Flutter application:

- `provider` - State management
- `shared_preferences` - Local data storage
- `google_fonts` - Inter font family
- `fl_chart` - Charts and data visualization
- `json_annotation` - JSON serialization
- `firebase_core`, `firebase_auth`, `cloud_firestore` - Firebase integration (future)

## Contributing

This Flutter app is designed to mirror the functionality of the original React web application. When adding new features:

1. Maintain consistency with the web app's functionality
2. Follow the established design system
3. Ensure mobile-specific optimizations (touch targets, gestures)
4. Test on both Android and iOS platforms

## Conversion Notes

### From React to Flutter
- **TypeScript interfaces** → **Dart classes with JSON serialization**
- **React hooks/Context** → **Provider pattern**
- **CSS/Tailwind** → **Flutter widgets with custom styling**
- **localStorage** → **SharedPreferences**
- **React components** → **Flutter widgets**

### Mobile Optimizations
- Touch-friendly button sizes (44px minimum)
- Haptic feedback support
- Mobile-first navigation patterns
- Optimized scrolling and gestures
- Responsive design for different screen sizes

## License

This project is proprietary. All rights reserved.