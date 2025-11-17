# EduMaster Website

A modern web-based spaced repetition learning platform converted from the Android EduMaster app. Study smarter with intelligent flashcards, track your progress, and achieve your learning goals.

## Features

- **Smart Flashcards**: Spaced repetition algorithm (SM-2) for optimal learning
- **Gamification**: Levels, coins, achievements, and streak tracking
- **Course Management**: Browse, purchase, and study multiple courses
- **Progress Tracking**: Detailed statistics and performance analytics
- **Study Calendar**: Schedule and track study sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **better-sqlite3**: Embedded SQLite database
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: Modern UI library
- **Material-UI (MUI)**: Component library and design system
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **date-fns**: Date manipulation

## Project Structure

```
website/
├── backend/
│   ├── server.js          # Express server & API routes
│   ├── database.js        # SQLite database setup
│   ├── repository.js      # Business logic & SM-2 algorithm
│   ├── package.json       # Backend dependencies
│   └── edumaster.db       # SQLite database (auto-generated)
│
└── frontend/
    ├── public/
    │   └── index.html     # HTML template
    ├── src/
    │   ├── components/    # React components
    │   │   ├── Dashboard.js
    │   │   ├── Study.js
    │   │   ├── Calendar.js
    │   │   ├── Store.js
    │   │   ├── Profile.js
    │   │   ├── Header.js
    │   │   └── BottomNav.js
    │   ├── App.js         # Main app component
    │   ├── index.js       # React entry point
    │   └── api.js         # API client
    └── package.json       # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd website
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both the backend and frontend servers.

#### Terminal 1 - Backend Server
```bash
cd website/backend
npm start
```
Backend will run on http://localhost:3001

#### Terminal 2 - Frontend Server
```bash
cd website/frontend
npm start
```
Frontend will run on http://localhost:3000

The website will automatically open in your browser at http://localhost:3000

## API Endpoints

### User Stats
- `GET /api/user-stats` - Get user statistics
- `PUT /api/user-stats` - Update user statistics

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/owned` - Get owned courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses/:id/purchase` - Purchase a course

### Cards
- `GET /api/courses/:courseId/cards` - Get all cards for a course
- `GET /api/courses/:courseId/cards/due` - Get due cards for review
- `GET /api/cards/:id` - Get card by ID
- `POST /api/cards/:id/review` - Review a card (SM-2 algorithm)

### Achievements
- `GET /api/achievements` - Get all achievements

### Study Sessions
- `GET /api/study-sessions` - Get all study sessions
- `POST /api/study-sessions` - Create a study session
- `PUT /api/study-sessions/:id/complete` - Complete a session

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Features Overview

### 1. Dashboard
- Current streak tracker with fire indicator
- Quick stats: Due today, Completed, New cards, Study time
- Progress bar for today's goals
- Course list with progress indicators
- Quick access to study sessions

### 2. Study Mode
- Flashcard-based learning interface
- Card flip animation
- Hint system for difficult cards
- 4-level difficulty rating (Again, Hard, Good, Easy)
- Real-time XP and coin rewards
- Session statistics tracking
- SM-2 spaced repetition scheduling

### 3. Calendar
- Weekly view with session indicators
- Daily session details
- Upcoming sessions list
- Completion tracking
- Interactive date selection

### 4. Course Store
- Browse all available courses
- Category filtering
- Course details with ratings
- Purchase with coins
- Real-time coin balance
- Owned/Available status indicators

### 5. Profile
- User level and XP progress
- Achievement showcase (unlocked/locked)
- Detailed statistics dashboard
- Streak tracking (current and longest)
- Study time and accuracy metrics

## Learning Algorithm

EduMaster uses the **SM-2 (SuperMemo 2)** spaced repetition algorithm:

- **Quality 1-2 (Again, Hard)**: Reset interval, reduce ease factor
- **Quality 3 (Good)**: Moderate interval increase
- **Quality 4-5 (Easy)**: Optimal interval increase

**Interval Schedule:**
- 1st repetition: 1 day
- 2nd repetition: 6 days
- 3rd+ repetition: previous interval × ease factor

**Rewards:**
- XP: 5-20 points per card (based on difficulty)
- Coins: 2-8 coins per card (based on difficulty)

## Database Schema

### Cards
- Question, Answer, Hint
- SM-2 fields: interval, easeFactor, repetitions, nextReview
- Statistics: timesReviewed, timesCorrect, timesIncorrect

### Courses
- Name, description, category, icon
- Progress: totalCards, cardsCompleted, cardsDue
- Ownership: isOwned, price, rating

### UserStats
- Level, experiencePoints, coins
- Streaks: currentStreak, longestStreak
- Totals: cardsStudied, studyMinutes, accuracy

### Achievements
- Name, description, icon, category
- Progress tracking: progress, maxProgress
- Unlock status: isUnlocked, unlockedAt

### StudySessions
- Course reference, scheduled date
- Duration, completion status
- Performance: cardsReviewed, cardsCorrect

## Sample Data

The database is pre-populated with:
- 5 courses (3 owned, 2 available for purchase)
- 4 sample flashcards
- User stats (Level 12, 2450 coins, 7-day streak)
- 8 achievements (4 unlocked, 4 locked)

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # React hot-reload enabled by default
```

### Building for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```
This creates an optimized production build in the `frontend/build` folder.

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory:
```env
PORT=3001
```

### Frontend
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Design

The website is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Future Enhancements

- [ ] User authentication and multi-user support
- [ ] Dark mode
- [ ] Export/import flashcards
- [ ] Social features (leaderboards, sharing)
- [ ] Advanced analytics dashboard
- [ ] Custom card creation
- [ ] Audio pronunciation support
- [ ] Image-based flashcards
- [ ] Study reminders and notifications
- [ ] Offline mode with PWA

## Migration from Android App

This website maintains feature parity with the Android app:
- ✅ All 5 screens (Dashboard, Study, Calendar, Store, Profile)
- ✅ Complete SM-2 algorithm implementation
- ✅ Gamification system (levels, coins, achievements, streaks)
- ✅ Course management and purchasing
- ✅ Progress tracking and statistics
- ✅ Material Design UI

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using React and Node.js**
