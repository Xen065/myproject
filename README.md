# EduMaster - Spaced Repetition Learning App

A native Android educational app built with Kotlin that implements spaced repetition learning with calendar integration and gamification features.

## Features

### Implemented ✅
- **Dashboard**:
  - Study streak tracking
  - Quick stats (due cards, completed, study time)
  - Progress tracking
  - Active courses list

- **Database Layer**:
  - Room database with local storage
  - Entities: Cards, Courses, Study Sessions, User Stats, Achievements
  - Full CRUD operations
  - SM-2 Spaced Repetition Algorithm implementation

- **Data Models**:
  - Card (flashcards with spaced repetition metadata)
  - Course (course catalog with progress tracking)
  - StudySession (scheduled study sessions)
  - UserStats (user progress, level, coins, streaks)
  - Achievement (gamification achievements)

- **Architecture**:
  - MVVM pattern with Repository layer
  - LiveData for reactive UI updates
  - Navigation Component for screen navigation
  - ViewBinding for type-safe view access

- **UI Components**:
  - Bottom Navigation
  - Material Design 3 theming
  - Gradient backgrounds
  - Card-based layouts

### Planned 🚧
- Study screen with flashcard flip animation
- Calendar view for study scheduling
- Course store with purchasable content
- Profile screen with achievements
- Study timer with notifications
- Dark mode support

## Technology Stack

- **Language**: Kotlin
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Architecture**: MVVM
- **Database**: Room
- **UI**: Material Design 3, ViewBinding
- **Navigation**: Navigation Component
- **Concurrency**: Kotlin Coroutines
- **Async**: LiveData

## Project Structure

```
app/src/main/
├── java/com/edumaster/
│   ├── MainActivity.kt                    # Main activity with bottom navigation
│   ├── data/
│   │   ├── models/                        # Data models (Card, Course, etc.)
│   │   ├── database/                      # Room DAOs and database
│   │   └── repository/                    # Repository layer
│   ├── ui/
│   │   ├── dashboard/                     # Dashboard fragment
│   │   ├── study/                         # Study fragment
│   │   ├── calendar/                      # Calendar fragment
│   │   ├── store/                         # Store fragment
│   │   └── profile/                       # Profile fragment
│   └── utils/                             # Utility classes
└── res/
    ├── layout/                            # XML layouts
    ├── values/                            # Strings, colors, themes
    ├── drawable/                          # Drawables and shapes
    ├── menu/                              # Navigation menus
    └── navigation/                        # Navigation graph
```

## Building the Project

### Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Gradle 8.1+

### Build Steps

1. **Clone or Open Project**:
   ```bash
   # Open the 'myproject' folder in Android Studio
   ```

2. **Sync Gradle**:
   - Android Studio will automatically detect the project
   - Click "Sync Now" when prompted
   - Wait for dependencies to download

3. **Build the App**:
   - Click Build > Make Project
   - Or use: `./gradlew build`

4. **Run on Device/Emulator**:
   - Connect Android device or start emulator
   - Click Run > Run 'app'
   - Or use: `./gradlew installDebug`

## Spaced Repetition Algorithm (SM-2)

The app implements the SuperMemo-2 (SM-2) algorithm for optimal learning:

- **Quality Ratings**: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
- **Interval Calculation**: Based on ease factor and repetition count
- **Ease Factor**: Adjusts based on performance (1.3 to 2.5)
- **Review Scheduling**: Automatic calculation of next review date

### How it Works:
1. First review: 1 day
2. Second review: 6 days
3. Subsequent reviews: interval × ease factor
4. Failed cards: reset to 1 day, ease factor reduced
5. Easy cards: longer intervals, ease factor increased

## Database Schema

### Cards Table
- Stores flashcards with questions, answers, hints
- Tracks spaced repetition metadata (interval, ease factor, next review)
- Statistics (times reviewed, correct, incorrect)

### Courses Table
- Course information and metadata
- Progress tracking (total cards, completed, due)
- Ownership and purchase status

### Study Sessions Table
- Scheduled study sessions
- Completion tracking
- Performance metrics

### User Stats Table
- User level and experience points
- Coins and streak tracking
- Overall statistics (accuracy, total study time)

### Achievements Table
- Gamification achievements
- Progress tracking
- Unlock status

## Sample Data

The app is pre-populated with:
- 3 owned courses (English Vocabulary, Current Affairs, Science)
- 4 sample flashcards
- User stats (Level 12, 7-day streak, 2450 coins)
- 8 achievements (4 unlocked, 4 locked)

## Color Scheme

- Primary: #6366F1 (Indigo)
- Secondary: #8B5CF6 (Purple)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)
- Gradient: #667EEA → #764BA2

## Next Steps

To continue development:

1. **Study Screen**: Implement flashcard UI with flip animation
2. **Calendar**: Add calendar view with study session scheduling
3. **Store**: Create course store with purchasing functionality
4. **Profile**: Build profile screen with achievements grid
5. **Timer**: Add Pomodoro-style study timer
6. **Notifications**: Implement study reminders
7. **Dark Mode**: Add dark theme support
8. **Export/Import**: Add data backup and restore

## License

This is a prototype educational app. All rights reserved.

## Credits

Based on the EduMaster HTML prototype.
Built with ❤️ using Kotlin and Android Jetpack.
