# MotivaMate Mobile Web App

A mobile-first study companion application that helps students organize their learning, track progress, and stay motivated through gamification and social features.

**Experience Qualities**: 
1. **Intuitive** - Navigation and features should feel natural and require minimal learning curve
2. **Motivating** - Progress tracking and achievements should encourage continued engagement  
3. **Focused** - Interface should minimize distractions and promote deep learning sessions

**Complexity Level**: Light Application (multiple features with basic state)
- Combines study session tracking, progress visualization, and basic social elements without requiring complex user accounts or backend systems

## Essential Features

### Study Session Timer
- **Functionality**: Pomodoro-style timer with customizable work/break intervals
- **Purpose**: Helps maintain focus and prevents burnout through structured study sessions
- **Trigger**: User taps "Start Study Session" from main dashboard
- **Progression**: Select subject → Set timer duration → Study with timer → Take break → Review session stats
- **Success criteria**: Timer runs accurately, notifications work, session data persists

### Progress Tracking Dashboard
- **Functionality**: Visual charts showing daily/weekly/monthly study time, session counts, and detailed pattern analysis
- **Purpose**: Provides motivation through visible progress and helps identify study patterns and optimal times
- **Trigger**: Automatically updates after each completed study session
- **Progression**: Complete study session → Data automatically logged → View updated charts and statistics across multiple time ranges
- **Success criteria**: Data visualizes correctly, trends are clear, historical data persists, multiple chart views are responsive

### Weekly and Monthly Progress Charts
- **Functionality**: Interactive charts displaying study patterns over time with weekly, monthly, and daily breakdowns
- **Purpose**: Enables users to identify long-term trends, consistency patterns, and optimize study schedules
- **Trigger**: Access from enhanced stats tab with chart navigation
- **Progression**: Navigate to stats → Select chart timeframe → Analyze patterns → Adjust study habits based on insights
- **Success criteria**: Charts render smoothly on mobile, data aggregates correctly, meaningful insights are visible

### Subject Management
- **Functionality**: Add, edit, and organize different study subjects with color coding
- **Purpose**: Allows focused tracking per topic and better organization
- **Trigger**: User taps "Manage Subjects" or adds new subject during session setup
- **Progression**: Add subject → Choose color → Set study goals → Track progress per subject
- **Success criteria**: Subjects persist, colors display consistently, easy to modify

### Achievement System
- **Functionality**: Unlock badges and milestones based on study habits and consistency
- **Purpose**: Gamifies the learning process to maintain long-term engagement
- **Trigger**: Automatically triggered when study milestones are reached
- **Progression**: Complete study sessions → Meet achievement criteria → Unlock badge → View in achievements gallery
- **Success criteria**: Achievements unlock reliably, progress toward next achievement is clear

## Edge Case Handling
- **Timer Interruption**: Save partial session progress if app is closed or phone locks
- **No Study Data**: Show helpful onboarding prompts and sample data for new users
- **Long Study Sessions**: Automatic break reminders and session splitting for health
- **Data Loss Prevention**: Regular auto-save to local storage with export capabilities

## Design Direction
The design should feel clean, motivating, and focused like a premium productivity app - think Apple's approach to education apps with Notion's organizational clarity. Mobile-first interface that prioritizes essential actions and uses progressive disclosure for advanced features.

## Color Selection
Complementary (opposite colors) - Using a calming blue-green primary with warm orange accents to create energy while maintaining focus. The combination promotes both concentration and achievement celebration.

- **Primary Color**: Deep teal `oklch(0.45 0.15 200)` - communicates focus, reliability, and academic depth
- **Secondary Colors**: Light blue-gray `oklch(0.85 0.02 220)` for backgrounds and neutral elements
- **Accent Color**: Warm orange `oklch(0.70 0.15 50)` - attention-grabbing highlight for achievements, progress, and CTAs
- **Foreground/Background Pairings**: 
  - Background (Light Gray #F8F9FA): Dark text `oklch(0.2 0 0)` - Ratio 12.6:1 ✓
  - Card (White #FFFFFF): Dark text `oklch(0.2 0 0)` - Ratio 15.8:1 ✓
  - Primary (Deep Teal): White text `oklch(0.98 0 0)` - Ratio 7.2:1 ✓
  - Secondary (Light Blue-Gray): Dark text `oklch(0.2 0 0)` - Ratio 9.8:1 ✓
  - Accent (Warm Orange): White text `oklch(0.98 0 0)` - Ratio 4.8:1 ✓

## Font Selection
Typography should convey clarity and academic professionalism while remaining highly readable on mobile screens - using Inter for its excellent mobile legibility and modern feel.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/24px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/20px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Main Text): Inter Regular/16px/relaxed line height
  - Caption (Timer, Stats): Inter Medium/14px/wide letter spacing

## Animations
Animations should feel purposeful and snappy like iOS system animations - quick transitions that provide feedback without delaying user actions, with special attention to timer state changes and achievement celebrations.

- **Purposeful Meaning**: Motion reinforces the focus-oriented, achievement-driven nature of studying
- **Hierarchy of Movement**: Timer gets primary animation focus, followed by progress indicators, then navigation transitions

## Component Selection
- **Components**: Cards for study sessions and stats, Tabs for main navigation and chart timeframes, Progress bars for visual feedback, Dialog for session completion, Button variants for different action types, Charts (Area, Bar, Line) for progress visualization
- **Customizations**: Custom timer component with circular progress, achievement badge components, subject color picker, responsive chart components with mobile-optimized touch interactions
- **States**: Timer buttons show clear play/pause states, progress elements animate smoothly, disabled states for completed sessions, chart loading states with smooth transitions
- **Icon Selection**: Play/Pause for timer, Trophy for achievements, BarChart for stats, Book for subjects, Clock for time tracking, Calendar for weekly view, TrendingUp for monthly trends
- **Spacing**: Consistent 4/8/16/24px spacing scale optimized for touch targets and mobile readability, chart containers with appropriate padding for mobile viewing
- **Mobile**: Bottom tab navigation, swipe gestures for timer controls, thumb-friendly button placement, collapsible sections for detailed stats, horizontally scrollable charts for better mobile experience