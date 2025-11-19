# 🚀 Quick Setup Guide - Demo Accounts

## Prerequisites Checklist

Before creating demo accounts, make sure you have:

- [ ] PostgreSQL installed and running
- [ ] Database created (default: `edumaster`)
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] `.env` file configured in backend/

---

## Step 1: Start PostgreSQL

### On Linux/macOS:
```bash
# Start PostgreSQL service
sudo service postgresql start

# Or if using systemd:
sudo systemctl start postgresql
```

### On macOS (with Homebrew):
```bash
brew services start postgresql
```

### On Windows:
```bash
# Start PostgreSQL service
net start postgresql-x64-14
```

### Verify PostgreSQL is Running:
```bash
psql --version
psql -U postgres -c "SELECT version();"
```

---

## Step 2: Create Database (if not exists)

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE edumaster;

# Create user (if needed)
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edumaster TO postgres;

# Exit
\q
```

---

## Step 3: Configure Environment Variables

Make sure your `backend/.env` file exists with:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=edumaster
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Step 4: Install Dependencies

```bash
cd backend
npm install
```

---

## Step 5: Run Database Migrations

This creates the RBAC tables (roles, permissions, audit logs):

```bash
cd backend
node scripts/addRBACSystem.js
```

You should see:
```
✅ RBAC Migration Complete!
✓ Role fields added to users table
✓ Permissions table created
✓ Role_permissions table created
✓ Audit_logs table created
✓ 36 permissions seeded
✓ Permissions assigned to 4 roles
```

---

## Step 6: Create Demo Accounts

Now run the demo account creation script:

```bash
node scripts/createDemoAccounts.js
```

This will create 4 accounts:

### 🔐 Login Credentials Created:

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Super Admin | `superadmin` | `Super123!` | superadmin@demo.com |
| Admin | `admin` | `Admin123!` | admin@demo.com |
| Teacher | `teacher` | `Teacher123!` | teacher@demo.com |
| Student | `student` | `Student123!` | student@demo.com |

---

## Step 7: Start the Servers

### Terminal 1 - Backend:
```bash
cd backend
npm start
```

Wait for:
```
✅ Database connected successfully
✅ Database synchronized
🚀 EduMaster API Server is running!
🚀 Port: 5000
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install  # if not done already
npm start
```

Wait for:
```
Compiled successfully!
Local: http://localhost:3000
```

---

## Step 8: Test the Demo Accounts

### 🎯 Login and Test Each Role:

1. **Go to:** http://localhost:3000/login

2. **Test Super Admin:**
   - Username: `superadmin`
   - Password: `Super123!`
   - After login, visit: http://localhost:3000/admin
   - ✅ Should see full admin dashboard

3. **Test Admin:** (open in new incognito tab)
   - Username: `admin`
   - Password: `Admin123!`
   - Visit: http://localhost:3000/admin
   - ✅ Can manage courses, users (limited), view logs

4. **Test Teacher:** (open in another incognito tab)
   - Username: `teacher`
   - Password: `Teacher123!`
   - Visit: http://localhost:3000/admin
   - ✅ Can create courses, manage own courses only

5. **Test Student:** (open in another incognito tab)
   - Username: `student`
   - Password: `Student123!`
   - ❌ Should NOT be able to access /admin
   - ✅ Can enroll in courses and study

---

## Alternative: Manual Account Creation (If Script Fails)

If the script doesn't work, you can create accounts manually via database:

```bash
# Connect to database
psql -U postgres -d edumaster

# Create super admin
INSERT INTO users (username, email, password, full_name, role, is_active, is_email_verified, created_at, updated_at)
VALUES
('superadmin', 'superadmin@demo.com', '$2a$10$YourHashedPasswordHere', 'Super Admin Demo', 'super_admin', true, true, NOW(), NOW());

# Note: Password needs to be hashed with bcrypt
# Use this Node.js command to hash passwords:
```

Hash password with Node.js:
```javascript
// In Node.js console (node)
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('Super123!', 10);
console.log(hash);
// Copy the hash and use it in SQL INSERT
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Check if database exists
psql -U postgres -l | grep edumaster

# Check .env file has correct credentials
cat backend/.env
```

### Issue: "Module not found"
```bash
cd backend
npm install
```

### Issue: "Table already exists"
```bash
# The migration script is safe to run multiple times
# It uses "IF NOT EXISTS" checks
node scripts/addRBACSystem.js
```

### Issue: "User already exists"
```bash
# The demo account script updates existing users
# It's safe to run multiple times
node scripts/createDemoAccounts.js
```

---

## Quick Verification

After setup, verify everything works:

### 1. Check Database Tables
```bash
psql -U postgres -d edumaster

\dt

# You should see:
# - users (with role column)
# - permissions
# - role_permissions
# - audit_logs
# - courses
# - cards
# etc.
```

### 2. Check Demo Accounts
```sql
SELECT id, username, email, role FROM users;
```

Expected output:
```
 id |  username   |         email          |    role
----+-------------+------------------------+-------------
  1 | superadmin  | superadmin@demo.com    | super_admin
  2 | admin       | admin@demo.com         | admin
  3 | teacher     | teacher@demo.com       | teacher
  4 | student     | student@demo.com       | student
```

### 3. Test API Endpoint
```bash
# Test super admin login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "superadmin", "password": "Super123!"}'

# Should return token and user object
```

---

## Next Steps After Setup

1. ✅ Login as each role and explore
2. ✅ As teacher: Create a course at /admin
3. ✅ As admin: Try changing user roles
4. ✅ As super admin: View audit logs
5. ✅ As student: Enroll in a course and study

---

## Summary Commands

```bash
# Full setup from scratch:
cd backend

# 1. Install dependencies
npm install

# 2. Run RBAC migration
node scripts/addRBACSystem.js

# 3. Create demo accounts
node scripts/createDemoAccounts.js

# 4. Start backend
npm start

# In another terminal:
cd frontend
npm install
npm start

# Open browser:
# http://localhost:3000/login
```

---

## Demo Account Credentials Reference

Keep this handy for quick access:

```
SUPER ADMIN:
  Username: superadmin
  Password: Super123!

ADMIN:
  Username: admin
  Password: Admin123!

TEACHER:
  Username: teacher
  Password: Teacher123!

STUDENT:
  Username: student
  Password: Student123!
```

---

**🎉 That's it! You're ready to test the admin system with all 4 roles!**
