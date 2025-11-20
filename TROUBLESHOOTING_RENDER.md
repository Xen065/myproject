# 🔧 Render Deployment Troubleshooting

You're seeing connection errors and can't login/register. Follow these steps carefully.

---

## 🎯 Step 1: Verify Backend Service Settings

### **A. Check Which Branch Render is Deploying**

1. Go to: https://dashboard.render.com
2. Click on your **Backend Web Service**
3. Click **"Settings"** tab (left sidebar)
4. Scroll to **"Build & Deploy"** section
5. Find **"Branch"** field

**What does it say?**
- ✅ If it says: `claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG` → Good!
- ❌ If it says: `master` or anything else → **CHANGE IT**

**To change:**
- Click the pencil/edit icon
- Enter: `claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG`
- Click "Save Changes"

### **B. Verify Root Directory**

Still in **"Settings"** → **"Build & Deploy"**:

**Root Directory should be:** `backend`

If it's empty or different:
- Edit it to: `backend`
- Save Changes

---

## 🎯 Step 2: Set Environment Variables (CRITICAL!)

1. Still in your Backend service
2. Click **"Environment"** tab (left sidebar)
3. You need these EXACT variables:

### **Get Database URL First:**

1. Go back to Dashboard
2. Click on your **PostgreSQL database** (not backend)
3. Scroll down to **"Connections"** section
4. Find **"Internal Database URL"** (NOT External!)
5. Click **Copy** button next to it
6. It looks like: `postgresql://username:password@dpg-xxxxx-a/database_name`

### **Now Add All These Variables:**

Back in Backend service → Environment tab:

Click **"Add Environment Variable"** for each one:

```
Key: DATABASE_URL
Value: [Paste the Internal Database URL you just copied]

Key: NODE_ENV
Value: production

Key: PORT
Value: 5000

Key: JWT_SECRET
Value: your_super_secret_random_string_here_at_least_32_characters_long

Key: JWT_EXPIRE
Value: 7d

Key: FRONTEND_URL
Value: [Leave empty for now - will add after frontend is working]
```

**IMPORTANT for JWT_SECRET:** Use a random string. Run this on your computer:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as JWT_SECRET.

**After adding all variables, click "Save Changes" at the top.**

---

## 🎯 Step 3: Clear Cache and Redeploy

1. Click **"Manual Deploy"** tab (left sidebar)
2. Click **"Clear build cache & deploy"** button
3. Wait 3-5 minutes for deployment

---

## 🎯 Step 4: Check Deployment Logs

1. Click **"Logs"** tab (left sidebar)
2. Wait for deployment to complete
3. **Look for these SUCCESS messages:**

```
✅ PostgreSQL connection has been established successfully.
✅ Database connected successfully
✅ Database synchronized
🚀 EduMaster API Server is running!
🚀 Port: 5000
```

### **If you see errors instead:**

**Error 1: "ConnectionRefusedError" or "ECONNREFUSED"**
- ❌ DATABASE_URL is not set or is wrong
- Go back to Step 2 and verify DATABASE_URL is correct
- Make sure you used **Internal** Database URL (not External)
- Redeploy after fixing

**Error 2: "Cannot find module" or "Error: Cannot find module 'express'"**
- ❌ Root Directory is wrong
- Go to Settings → Root Directory should be `backend`
- Save and redeploy

**Error 3: "sequelize is not defined" or SSL errors**
- ❌ Wrong branch deployed (doesn't have updated database.js)
- Go to Settings → Branch should be `claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG`
- Save and redeploy

---

## 🎯 Step 5: Test Backend Health Endpoint

1. On your Backend service page, find the URL at the top
2. Copy it (looks like: `https://your-service-name.onrender.com`)
3. Add `/api/health` to the end
4. Visit: `https://your-service-name.onrender.com/api/health`

**You should see:**
```json
{
  "success": true,
  "message": "EduMaster API Server is running!",
  "timestamp": "2025-11-20T...",
  "environment": "production"
}
```

**If you see 404 or "Not Found":**
- Backend is running but wrong code deployed
- Double-check branch setting
- Double-check root directory is `backend`

---

## 🎯 Step 6: Configure Frontend

### **A. Set Frontend Environment Variable**

1. Go to your **Frontend Static Site** in Render
2. Click **"Environment"** tab
3. Add this variable:

```
Key: REACT_APP_API_URL
Value: https://your-backend-url.onrender.com/api
```

**IMPORTANT:**
- Replace `your-backend-url` with your actual backend URL
- Must end with `/api`
- No trailing slash after `/api`

Example: `https://edumaster-backend-xyz.onrender.com/api`

4. Click "Save Changes"

### **B. Verify Frontend Build Settings**

Click **"Settings"** tab:

**Should have:**
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`

If different, fix and save.

### **C. Redeploy Frontend**

1. Click **"Manual Deploy"** tab
2. Click **"Clear build cache & deploy"**
3. Wait 2-3 minutes

---

## 🎯 Step 7: Update Backend CORS

Now that frontend is deployed:

1. Go back to **Backend service**
2. Click **"Environment"** tab
3. Edit (or add) `FRONTEND_URL`:

```
Key: FRONTEND_URL
Value: https://your-frontend-url.onrender.com
```

**IMPORTANT:**
- Use your actual frontend URL
- NO trailing slash
- Must start with https://

4. Save Changes (backend will auto-redeploy)

---

## 🎯 Step 8: Test Login/Register

1. Visit your frontend URL
2. Try to **Register** a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: password123

**Expected:** Account created successfully

3. Try to **Login** with the account you just created

**Expected:** Logged in successfully, see dashboard

---

## 🐛 If Login/Register Still Doesn't Work

### **Check Browser Console:**

1. Press **F12** (or right-click → Inspect)
2. Click **"Console"** tab
3. Try to register again
4. **Look for error messages**

**Common Errors:**

**1. "Network Error" or "Failed to fetch"**
- Frontend can't reach backend
- Check `REACT_APP_API_URL` has correct backend URL
- Check backend is actually running (health endpoint works)

**2. "CORS policy blocked"**
- Backend's `FRONTEND_URL` doesn't match actual frontend URL
- Verify `FRONTEND_URL` is exactly: `https://your-frontend-url.onrender.com`
- No trailing slash!

**3. "404 Not Found"**
- API URL is wrong
- Verify `REACT_APP_API_URL` ends with `/api`
- Example: `https://backend.onrender.com/api` ✅
- Wrong: `https://backend.onrender.com` ❌

**4. "500 Internal Server Error"**
- Backend crashed or database error
- Check backend logs for errors
- Verify DATABASE_URL is correct

---

## 📋 Complete Environment Variable Checklist

### **Backend Service - Environment Tab:**
```
✓ DATABASE_URL = postgresql://user:pass@dpg-xxxxx-a/dbname (Internal URL)
✓ NODE_ENV = production
✓ PORT = 5000
✓ JWT_SECRET = (random 32+ character string)
✓ JWT_EXPIRE = 7d
✓ FRONTEND_URL = https://your-frontend.onrender.com (no trailing slash)
```

### **Frontend Service - Environment Tab:**
```
✓ REACT_APP_API_URL = https://your-backend.onrender.com/api (with /api)
```

### **Backend Service - Settings Tab:**
```
✓ Branch = claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG
✓ Root Directory = backend
✓ Build Command = npm install
✓ Start Command = npm start
```

### **Frontend Service - Settings Tab:**
```
✓ Branch = claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG (or master if you merged)
✓ Root Directory = frontend
✓ Build Command = npm install && npm run build
✓ Publish Directory = build
```

---

## 🎉 Success Checklist

You'll know everything is working when:

- [ ] Backend health endpoint returns success JSON
- [ ] Backend logs show "🚀 EduMaster API Server is running!"
- [ ] Frontend loads without errors
- [ ] Can register a new account
- [ ] Can login with registered account
- [ ] Dashboard loads with user data
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console

---

## 📞 Still Having Issues?

**If you've followed all steps and it's still not working, check:**

1. **Database Status:**
   - Go to PostgreSQL service
   - Status should be "Available" (green)
   - If suspended or failed, you may need to recreate it

2. **Free Tier Limitations:**
   - Services sleep after 15 minutes of inactivity
   - First request takes ~30 seconds to wake up
   - Try refreshing after 30 seconds

3. **Build Logs:**
   - Check if build is actually succeeding
   - Look for "Build successful 🎉" in logs
   - If build fails, there may be code errors

---

**After following these steps, if it's still not working, copy the error messages from:**
1. Backend Logs tab (last 20 lines)
2. Browser Console (F12)
3. Frontend Build Logs

And share them - we'll debug together!
