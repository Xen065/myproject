# Flashcard Frequency Mode Feature

## Overview
This feature adds user-configurable frequency modes to control how often flashcards are reviewed using the SM-2 spaced repetition algorithm.

## Feature Specifications

### Frequency Modes

| Mode | First Review | Second Review | Subsequent Multiplier | Description |
|------|-------------|---------------|----------------------|-------------|
| **Intensive** ⚡ | 1 day | 3 days | 0.8 × easeFactor | Faster, more frequent reviews |
| **Normal** 📖 | 1 day | 4 days | 1.0 × easeFactor | Standard SM-2 behavior (default) |
| **Relaxed** 🌙 | 2 days | 7 days | 1.2 × easeFactor | Slower, less frequent reviews |

## Implementation Details

### Backend Changes

#### 1. User Model (`/backend/models/User.js`)
- Added `frequencyMode` field (ENUM: 'intensive', 'normal', 'relaxed')
- Default value: 'normal'
- Database column: `frequency_mode`

#### 2. Card Model (`/backend/models/Card.js`)
- Updated `calculateNextReview()` method to accept `frequencyMode` parameter
- Implements custom intervals based on selected mode
- Maintains backward compatibility with default 'normal' mode

#### 3. Study Routes (`/backend/routes/study.js`)
- Modified review endpoint to fetch user's frequency mode preference
- Passes frequency mode to `calculateNextReview()` method
- Optimized to reuse user query

#### 4. User Routes (`/backend/routes/users.js`)
- Added `PUT /api/users/settings/frequency-mode` - Update frequency mode
- Added `GET /api/users/settings/frequency-mode` - Get current frequency mode
- Includes validation for valid modes

### Frontend Changes

#### 1. API Service (`/frontend/src/services/api.js`)
- Added `userSettingsAPI` with frequency mode methods:
  - `getFrequencyMode()` - Fetch current setting
  - `updateFrequencyMode(mode)` - Update setting

#### 2. Study Page (`/frontend/src/pages/Study.js`)
- Added frequency mode state management
- Implemented dropdown menu UI for mode selection
- Fetches current mode on component mount
- Updates mode via API with user feedback

#### 3. Study CSS (`/frontend/src/pages/Study.css`)
- Added purple-themed frequency selector button
- Styled dropdown menu with animations
- Responsive design for mobile devices

### Database Migration

**Script**: `/backend/scripts/addFrequencyModeColumn.js`

**To run the migration:**
```bash
cd backend
node scripts/addFrequencyModeColumn.js
```

This will:
1. Add the `frequency_mode` column to the users table
2. Set default value 'normal' for existing users

## How to Use

### For Users

1. **Navigate to Study Page** - Go to any course study session
2. **Click Frequency Button** - Purple "⚡ Frequency: [Mode]" button in filter controls
3. **Select Desired Mode**:
   - **Intensive**: For aggressive learning (cramming for exams)
   - **Normal**: For balanced, standard spaced repetition
   - **Relaxed**: For long-term retention with less pressure
4. **Confirmation** - Alert message confirms mode change

### For Developers

#### Testing the Feature

1. **Start the backend server:**
```bash
cd backend
npm install
node server.js
```

2. **Start the frontend:**
```bash
cd frontend
npm install
npm start
```

3. **Run the database migration** (if not already done):
```bash
cd backend
node scripts/addFrequencyModeColumn.js
```

4. **Test the feature:**
   - Login to the application
   - Navigate to Study page
   - Click the frequency mode button
   - Change between modes and verify:
     - Mode updates successfully
     - Next review dates reflect the new mode
     - Setting persists across sessions

## API Endpoints

### Get Frequency Mode
```
GET /api/users/settings/frequency-mode
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "frequencyMode": "normal"
  }
}
```

### Update Frequency Mode
```
PUT /api/users/settings/frequency-mode
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "frequencyMode": "intensive"
}

Response:
{
  "success": true,
  "message": "Frequency mode updated successfully",
  "data": {
    "frequencyMode": "intensive"
  }
}
```

## Technical Notes

### SM-2 Algorithm Adjustments

The frequency mode affects the interval calculation in three stages:

1. **First Review** - Initial learning interval
2. **Second Review** - Reinforcement interval
3. **Subsequent Reviews** - Long-term retention (multiplier × easeFactor)

### Ease Factor
- Range: 1.3 to 2.5
- Adjusted based on quality rating (1-4)
- Works in conjunction with frequency multiplier

### Quality Ratings
1. **Again** (1) - Didn't know, review soon
2. **Hard** (2) - Struggled to remember
3. **Good** (3) - Remembered correctly
4. **Easy** (4) - Too easy, review later

## Files Modified

### Backend
- `/backend/models/User.js` - Added frequencyMode field
- `/backend/models/Card.js` - Updated calculateNextReview() method
- `/backend/routes/study.js` - Updated review endpoint
- `/backend/routes/users.js` - Added frequency mode endpoints
- `/backend/scripts/addFrequencyModeColumn.js` - New migration script

### Frontend
- `/frontend/src/services/api.js` - Added userSettingsAPI
- `/frontend/src/pages/Study.js` - Added frequency mode UI and logic
- `/frontend/src/pages/Study.css` - Added frequency mode styles

## Future Enhancements

Potential improvements:
- Custom frequency mode (user-defined intervals)
- Course-specific frequency modes
- Analytics showing optimal mode based on performance
- A/B testing different modes
- Mobile app integration (Android)

## Credits

Implementation completed with custom frequency specifications:
- Intensive: 1d → 3d (0.8x multiplier)
- Normal: 1d → 4d (1.0x multiplier)
- Relaxed: 2d → 7d (1.2x multiplier)
