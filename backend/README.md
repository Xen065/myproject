# EduMaster Backend API

REST API server for the EduMaster learning platform with spaced repetition.

## Features

- 🔐 JWT Authentication
- 👤 User Management
- 📚 Course Management
- 🎴 Flashcard System
- 🧠 SM-2 Spaced Repetition Algorithm
- 📊 Progress Tracking & Statistics
- 🏆 Achievements & Gamification
- 📅 Study Sessions & Calendar

## Tech Stack

- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator

## Project Structure

```
backend/
├── config/
│   └── database.js           # Database connection
├── models/
│   ├── User.js              # User model
│   ├── Course.js            # Course model
│   ├── Card.js              # Flashcard model
│   ├── StudySession.js      # Study session model
│   ├── Achievement.js       # Achievement model
│   ├── UserAchievement.js   # User-achievement junction
│   ├── UserCourse.js        # User-course junction
│   └── index.js             # Model relationships
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User profile routes
│   ├── courses.js           # Course routes
│   ├── cards.js             # Flashcard routes
│   ├── study.js             # Study session routes
│   ├── stats.js             # Statistics routes
│   └── achievements.js      # Achievement routes
├── middleware/
│   └── auth.js              # JWT verification middleware
├── utils/
│   └── jwt.js               # JWT utilities
├── scripts/
│   ├── initDatabase.js      # Database initialization
│   └── seedDatabase.js      # Sample data seeding
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Entry point
└── package.json             # Dependencies

```

## Windows Setup Guide

### Prerequisites

1. **Node.js (v16 or higher)**
   - Download: https://nodejs.org/
   - Download the LTS version (Windows Installer .msi)
   - Run installer and follow the wizard
   - Check installation: Open Command Prompt and run:
     ```cmd
     node --version
     npm --version
     ```

2. **PostgreSQL (v12 or higher)**
   - Download: https://www.postgresql.org/download/windows/
   - Download the installer
   - During installation:
     - Remember the password you set for the `postgres` user
     - Default port: 5432 (keep it)
     - Install pgAdmin 4 (GUI tool - recommended)
   - After installation, PostgreSQL should auto-start

### Installation Steps

#### Step 1: Create Database

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect using the password you set during installation
3. Right-click **Databases** → **Create** → **Database**
4. Database name: `edumaster`
5. Click **Save**

**Alternative: Using Command Line**
```cmd
# Open Command Prompt
psql -U postgres

# Enter your PostgreSQL password when prompted
# Then create the database:
CREATE DATABASE edumaster;

# Exit psql:
\q
```

#### Step 2: Install Backend Dependencies

```cmd
# Open Command Prompt or PowerShell
# Navigate to the backend folder
cd C:\path\to\myproject\backend

# Install all dependencies
npm install
```

This will install:
- express (web framework)
- pg & sequelize (PostgreSQL connection)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- And all other dependencies...

#### Step 3: Configure Environment

1. Open the `backend` folder in File Explorer
2. You'll see `.env` file already exists with default settings
3. Open `.env` in Notepad and verify/update:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=edumaster
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here  # ← Change this!

JWT_SECRET=edumaster_secret_key_2024_change_in_production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:3000
```

**Important:** Change `DB_PASSWORD` to match the password you set during PostgreSQL installation!

#### Step 4: Initialize Database

```cmd
# Still in the backend folder
# Create all database tables
npm run init-db
```

You should see:
```
✅ Database connected successfully
✅ All tables created successfully
```

#### Step 5: Add Sample Data (Optional but Recommended)

```cmd
# Add sample courses, cards, and a test user
npm run seed
```

You should see:
```
✅ Created user: demo@edumaster.com / demo123
✅ Created 4 courses
✅ Created 5 flashcards
✅ Created 6 achievements
```

#### Step 6: Start the Server

```cmd
# Start the API server
npm start
```

You should see:
```
🚀 ============================================
🚀 EduMaster API Server is running!
🚀 Environment: development
🚀 Port: 5000
🚀 URL: http://localhost:5000
🚀 Health Check: http://localhost:5000/api/health
🚀 ============================================
```

#### Step 7: Test the API

Open your web browser and visit:
- http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "EduMaster API Server is running!",
  "timestamp": "2024-...",
  "environment": "development"
}
```

✅ **Success!** Your backend is running!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Users
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update profile (requires token)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `POST /api/courses/:id/enroll` - Enroll in course (requires token)
- `GET /api/courses/my/enrolled` - Get enrolled courses (requires token)

### Cards (Flashcards)
- `GET /api/cards` - Get user's cards (requires token)
- `GET /api/cards/due` - Get cards due for review (requires token)
- `POST /api/cards` - Create new card (requires token)
- `PUT /api/cards/:id` - Update card (requires token)
- `DELETE /api/cards/:id` - Delete card (requires token)

### Study
- `POST /api/study/review` - Review a card (requires token)
- `POST /api/study/sessions` - Create study session (requires token)
- `GET /api/study/sessions` - Get study sessions (requires token)

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics (requires token)
- `GET /api/stats/history` - Get study history (requires token)

### Achievements
- `GET /api/achievements` - Get all achievements with progress (requires token)
- `GET /api/achievements/unlocked` - Get unlocked achievements (requires token)

## Testing the API

### Using the Test Account

After running `npm run seed`, you can login with:
- **Email:** demo@edumaster.com
- **Password:** demo123

### Example: Login Request

**Using PowerShell:**
```powershell
$body = @{
    email = "demo@edumaster.com"
    password = "demo123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Using curl (if installed):**
```cmd
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@edumaster.com\",\"password\":\"demo123\"}"
```

You'll receive a response with a `token`. Save this token for authenticated requests!

### Example: Get Dashboard Stats

Replace `YOUR_TOKEN_HERE` with the token from login:

```powershell
$headers = @{
    Authorization = "Bearer YOUR_TOKEN_HERE"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/stats/dashboard" -Headers $headers
```

## Development

### Running in Development Mode (Auto-restart)

```cmd
# Install nodemon globally (optional)
npm install -g nodemon

# Or use the dev script
npm run dev
```

The server will automatically restart when you make changes to the code!

### Resetting the Database

```cmd
# This will drop all tables and recreate them
npm run init-db

# Then re-add sample data
npm run seed
```

## Troubleshooting

### Issue: "ECONNREFUSED" or "Connection refused"

**Solution:**
- Make sure PostgreSQL is running
- Open Services (Win + R, type `services.msc`)
- Find "postgresql-x64-XX" service
- Make sure it's running
- If not, right-click → Start

### Issue: "password authentication failed for user postgres"

**Solution:**
- Check the `DB_PASSWORD` in `.env` file
- Make sure it matches the password you set during PostgreSQL installation
- Try connecting with pgAdmin 4 using the same password

### Issue: "Port 5000 is already in use"

**Solution:**
- Another application is using port 5000
- Change `PORT=5000` to `PORT=5001` in `.env` file
- Restart the server

### Issue: "Cannot find module"

**Solution:**
- Delete `node_modules` folder
- Run `npm install` again

### Issue: Database tables not created

**Solution:**
- Make sure the database `edumaster` exists in PostgreSQL
- Run `npm run init-db` again
- Check for error messages

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | edumaster |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | (required) |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRE | Token expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## Next Steps

1. ✅ Backend is running
2. 🔜 Set up the React frontend (see `/frontend` folder)
3. 🔜 Connect Android app to this API
4. 🔜 Deploy to production server

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments (all files are heavily documented)
- Check server logs in the terminal

## License

ISC
