# EduMaster - Complete Setup Guide for Windows

This guide will help you set up the complete EduMaster platform on your Windows laptop with **no prior web development experience required**.

## What You're Building

A complete learning platform with:
- **Web Application:** Browser-based interface for students
- **Backend API:** Node.js server with PostgreSQL database
- **Android App:** Mobile app that connects to your web backend (coming next)

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│  React Web App  │─────▶│  Node.js API     │─────▶│   PostgreSQL    │
│  (Frontend)     │      │  (Backend)       │      │   (Database)    │
│  Port 3000      │      │  Port 5000       │      │   Port 5432     │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
         │                                                   ▲
         │                                                   │
         ▼                                                   │
┌─────────────────┐                                         │
│                 │                                         │
│  Android App    │─────────────────────────────────────────┘
│                 │
└─────────────────┘
```

## Prerequisites to Install

### 1. Node.js (JavaScript Runtime)

**What it is:** Allows you to run JavaScript on your computer (not just in browsers)

**Download:** https://nodejs.org/
- Click the big green "LTS" button (Long Term Support)
- Download the Windows Installer (.msi file)
- Run the installer
  - Click "Next" through all steps
  - Accept the license agreement
  - Keep all default options selected
  - Click "Install"
  - Wait for installation (2-3 minutes)
  - Click "Finish"

**Verify Installation:**
1. Open **Command Prompt** (Press Win + R, type `cmd`, press Enter)
2. Type: `node --version`
3. You should see something like: `v18.18.0` or `v20.x.x`
4. Type: `npm --version`
5. You should see something like: `9.8.1` or `10.x.x`

✅ **Success!** Node.js is installed.

### 2. PostgreSQL (Database)

**What it is:** A database to store all your users, courses, flashcards, etc.

**Download:** https://www.postgresql.org/download/windows/
- Click "Download the installer"
- Choose the latest version (16.x or 15.x)
- Download the Windows x86-64 installer
- Run the installer

**During Installation:**
1. Click "Next" on welcome screen
2. Installation Directory: Keep default, click "Next"
3. Select Components: Keep all selected, click "Next"
4. Data Directory: Keep default, click "Next"
5. **Password:**
   - Enter a password (e.g., `postgres`)
   - **IMPORTANT:** Remember this password! Write it down!
   - Re-enter the same password
   - Click "Next"
6. Port: Keep `5432`, click "Next"
7. Locale: Keep default, click "Next"
8. Click "Next" to start installation
9. Wait 3-5 minutes
10. Uncheck "Launch Stack Builder" at the end
11. Click "Finish"

**Verify Installation:**
1. Open **Start Menu**
2. Search for "pgAdmin 4"
3. Click to open it
4. Enter the password you set above
5. You should see the pgAdmin interface

✅ **Success!** PostgreSQL is installed.

### 3. Git (Version Control) - Optional but Recommended

**What it is:** Helps track changes to your code

- Download: https://git-scm.com/download/win
- Run installer, click "Next" through all options (defaults are fine)

---

## Part 1: Backend Setup (API Server)

### Step 1: Create the Database

1. Open **pgAdmin 4** (search in Start Menu)
2. Enter your PostgreSQL password
3. In the left panel, expand "Servers" → "PostgreSQL XX"
4. Right-click "Databases" → "Create" → "Database..."
5. Database name: `edumaster`
6. Click "Save"

You should now see "edumaster" in the database list!

### Step 2: Install Backend Dependencies

1. Open **Command Prompt** or **PowerShell**
2. Navigate to your project:
   ```cmd
   cd C:\path\to\your\project\backend
   ```
   Replace `C:\path\to\your\project` with the actual path. For WSL:
   ```cmd
   cd \\wsl$\Ubuntu\home\user\myproject\backend
   ```

3. Install dependencies:
   ```cmd
   npm install
   ```
   This downloads all required packages (may take 2-5 minutes)

### Step 3: Configure Environment

1. Navigate to the `backend` folder in File Explorer
2. You'll see a file called `.env`
3. Open it in Notepad
4. Change this line:
   ```
   DB_PASSWORD=postgres
   ```
   Replace `postgres` with the PostgreSQL password you set earlier
5. Save and close

### Step 4: Initialize Database

```cmd
# Make sure you're still in the backend folder
npm run init-db
```

You should see:
```
✅ Database connected successfully
✅ All tables created successfully
```

### Step 5: Add Sample Data

```cmd
npm run seed
```

You should see:
```
✅ Created user: demo@edumaster.com / demo123
✅ Created 4 courses
✅ Created 5 flashcards
✅ Created 6 achievements
```

### Step 6: Start the Backend Server

```cmd
npm start
```

You should see:
```
🚀 EduMaster API Server is running!
🚀 Port: 5000
🚀 URL: http://localhost:5000
```

**Test it:** Open your web browser and visit:
- http://localhost:5000/api/health

You should see a JSON response with `"success": true`

✅ **Backend is running!** Keep this Command Prompt window open.

---

## Part 2: Frontend Setup (Web Interface)

### Step 1: Open a New Terminal

1. Open a **NEW** Command Prompt or PowerShell window (don't close the backend one!)
2. Navigate to the frontend folder:
   ```cmd
   cd C:\path\to\your\project\frontend
   ```
   Or for WSL:
   ```cmd
   cd \\wsl$\Ubuntu\home\user\myproject\frontend
   ```

### Step 2: Install Frontend Dependencies

```cmd
npm install
```

This installs React and all dependencies (may take 3-10 minutes)

### Step 3: Start the Frontend

```cmd
npm start
```

After a moment:
- Your default web browser should automatically open
- You should see the Edu Master login page
- URL: http://localhost:3000

If it doesn't open automatically, manually visit: http://localhost:3000

✅ **Frontend is running!**

---

## Using the Application

### Login with Test Account

On the login page:
- **Email:** `demo@edumaster.com`
- **Password:** `demo123`
- Click "Login"

You should be redirected to the Dashboard!

### What You Can Do

1. **Dashboard**
   - View your study streak
   - See statistics (cards, accuracy, progress)
   - View enrolled courses

2. **Courses**
   - Browse available courses
   - Enroll in courses
   - View course details

3. **Study**
   - Review flashcards
   - Rate your performance (Again, Hard, Good, Easy)
   - See spaced repetition in action

4. **Profile**
   - View your level and XP
   - See achievements
   - Check your stats

5. **Calendar**
   - Schedule study sessions
   - View upcoming reviews

### Create Your Own Account

1. Click "Sign Up" on login page
2. Fill in your details
3. Click "Register"
4. You'll be automatically logged in

---

## Running Everything (Daily Use)

You need to run both backend and frontend:

### Terminal 1: Backend
```cmd
cd \\wsl$\Ubuntu\home\user\myproject\backend
npm start
```

### Terminal 2: Frontend
```cmd
cd \\wsl$\Ubuntu\home\user\myproject\frontend
npm start
```

Both must be running for the application to work!

---

## Stopping the Servers

In each terminal window:
- Press `Ctrl + C`
- Type `Y` when asked to terminate
- Or simply close the terminal window

---

## Troubleshooting

### Backend Issues

**Error: "ECONNREFUSED" or "Connection refused"**
- PostgreSQL is not running
- Open Services: Win + R → `services.msc`
- Find "postgresql-x64-XX"
- Right-click → Start

**Error: "password authentication failed"**
- Check `.env` file in backend folder
- Make sure `DB_PASSWORD` matches your PostgreSQL password

**Error: "Port 5000 already in use"**
- Another app is using port 5000
- Change `PORT=5000` to `PORT=5001` in `.env`
- Update frontend `.env` to match

### Frontend Issues

**Error: "Cannot connect to backend" or "Network Error"**
- Make sure backend is running (terminal 1)
- Check http://localhost:5000/api/health in browser
- If backend is running on different port, update frontend config

**Page is blank**
- Check browser console (F12 → Console tab)
- Look for red error messages
- Make sure all dependencies installed: `npm install`

**"npm: command not found"**
- Node.js not installed or not in PATH
- Reinstall Node.js
- Restart terminal after installation

### General Issues

**Both servers running but can't login**
- Check browser console (F12) for errors
- Make sure database was initialized: `npm run init-db`
- Make sure sample data was added: `npm run seed`

**Changes not showing**
- Hard refresh browser: Ctrl + Shift + R
- Clear browser cache
- Stop and restart frontend server

---

## File Structure

```
myproject/
├── backend/                 # API Server
│   ├── config/             # Database config
│   ├── models/             # Data models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication
│   ├── scripts/            # Database scripts
│   ├── .env                # Environment config
│   ├── server.js           # Entry point
│   └── package.json        # Dependencies
│
├── frontend/               # Web Interface
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── context/        # State management
│   │   └── App.js          # Main app
│   └── package.json        # Dependencies
│
└── android/                # Android App
    └── (existing Android app files)
```

---

## Next Steps

1. ✅ Backend running on http://localhost:5000
2. ✅ Frontend running on http://localhost:3000
3. ✅ Can create accounts and login
4. ✅ Can study flashcards with spaced repetition
5. 🔜 Connect Android app to the backend API
6. 🔜 Deploy to a production server (optional)

---

## Quick Reference

### Important URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health
- pgAdmin (Database): http://localhost:5050 (or search in Start Menu)

### Test Credentials
- Email: demo@edumaster.com
- Password: demo123

### Important Commands

Backend:
```cmd
cd backend
npm install          # Install dependencies
npm run init-db      # Create database tables
npm run seed         # Add sample data
npm start            # Start server
npm run dev          # Start with auto-reload
```

Frontend:
```cmd
cd frontend
npm install          # Install dependencies
npm start            # Start dev server
npm run build        # Build for production
```

---

## Getting Help

1. **Check the terminal** for error messages
2. **Check browser console** (Press F12 → Console tab)
3. **Read the error message carefully** - it usually tells you what's wrong
4. **Check this guide** for troubleshooting section
5. **Review the code comments** - all files are heavily documented

---

## Success Checklist

- [ ] Node.js installed (v16+)
- [ ] PostgreSQL installed
- [ ] Database `edumaster` created
- [ ] Backend dependencies installed (`npm install`)
- [ ] Database initialized (`npm run init-db`)
- [ ] Sample data added (`npm run seed`)
- [ ] Backend running (http://localhost:5000/api/health works)
- [ ] Frontend dependencies installed
- [ ] Frontend running (http://localhost:3000 shows login page)
- [ ] Can login with demo@edumaster.com / demo123
- [ ] Can see dashboard with statistics
- [ ] Can study flashcards

---

**Congratulations!** You now have a fully functional web-based learning platform running on your Windows laptop! 🎉
