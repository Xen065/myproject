# 🔧 API Issue Diagnostic & Fix Guide

Follow these steps in order to diagnose and fix your API connectivity issue.

---

## 🎯 Step 1: Find Out What's Wrong

**Open your frontend website in the browser, then:**

1. Press **F12** (or Right-click → Inspect)
2. Click the **"Console"** tab
3. Try to **Register** or **Login**
4. **Look at the error messages**

### **What error do you see?**

---

## ❌ Error Type A: "Network Error" or "ERR_CONNECTION_REFUSED"

**Problem:** Frontend can't reach the backend at all.

**Solutions:**

### **Fix A1: Backend is Not Running**

1. Go to Render Dashboard → Backend Service
2. Check status at the top
3. **Is it "Live" (green)?**
   - ❌ **NO** (red/yellow) → Backend crashed, go to **Fix A2**
   - ✅ **YES** (green) → Go to **Fix A3**

### **Fix A2: Backend Crashed - Missing DATABASE_URL**

1. Backend Service → **"Logs"** tab
2. Look for error: `ConnectionRefusedError` or `ECONNREFUSED`
3. **This means DATABASE_URL is not set**

**Add DATABASE_URL:**
1. Get PostgreSQL **Internal Database URL**:
   - Dashboard → PostgreSQL service
   - Scroll to "Connections"
   - Copy **"Internal Database URL"**
   - Example: `postgresql://user:pass@dpg-xxxxx-a/dbname`

2. Add to Backend:
   - Backend Service → **"Environment"** tab
   - Click **"Add Environment Variable"**
   - Key: `DATABASE_URL`
   - Value: [Paste the URL]
   - Click **"Save Changes"**

3. Redeploy:
   - **"Manual Deploy"** tab → **"Clear build cache & deploy"**
   - Wait 3-5 minutes
   - Check **"Logs"** tab for: `✅ EduMaster API Server is running!`

### **Fix A3: Frontend Has Wrong Backend URL**

1. Backend Service → Copy the URL at the top
   - Example: `https://edumaster-backend-abc123.onrender.com`

2. Frontend Service → **"Environment"** tab
3. Look for: `REACT_APP_API_URL`

**Is it there?**
   - ❌ **NO** → Add it (see below)
   - ✅ **YES** → Edit it (see below)

**Add/Edit REACT_APP_API_URL:**
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   - ⚠️ Use YOUR backend URL from step 1
   - ⚠️ Must end with `/api`
   - ⚠️ Must use `https://` (not `http://`)
   - Click **"Save Changes"**

4. Redeploy Frontend:
   - **"Manual Deploy"** tab → **"Clear build cache & deploy"**
   - Wait 2-3 minutes

---

## ❌ Error Type B: "CORS Policy Blocked" or "Access-Control-Allow-Origin"

**Problem:** Backend is blocking requests from frontend.

**Solution:**

1. Frontend Service → Copy the URL at the top
   - Example: `https://edumaster-frontend-xyz.onrender.com`

2. Backend Service → **"Environment"** tab
3. Look for: `FRONTEND_URL`

**Add/Edit FRONTEND_URL:**
   - Key: `FRONTEND_URL`
   - Value: `https://your-frontend-url.onrender.com`
   - ⚠️ Use YOUR frontend URL from step 1
   - ⚠️ NO trailing slash!
   - ⚠️ Must match exactly (including https://)
   - Click **"Save Changes"**

4. Backend will auto-redeploy (wait 2 minutes)

---

## ❌ Error Type C: "404 Not Found" on API calls

**Problem:** Frontend is calling wrong API endpoint.

**Check in Browser Console:**
- Look for failed requests
- Check the URL it's trying to call
- Example failed request: `https://backend.onrender.com/auth/login` ❌

**Should be:** `https://backend.onrender.com/api/auth/login` ✅

**Solution:**

Frontend Service → **"Environment"** tab:
- Edit `REACT_APP_API_URL`
- Value MUST end with `/api`: `https://your-backend.onrender.com/api`
- Save and redeploy frontend

---

## ❌ Error Type D: "500 Internal Server Error"

**Problem:** Backend is running but crashing on requests.

**Solution:**

1. Backend Service → **"Logs"** tab
2. Scroll to bottom to see recent errors
3. Look for error details

**Common errors:**

**D1: Database connection errors**
- Check `DATABASE_URL` is set correctly
- Verify using **Internal** Database URL (not External)
- PostgreSQL service should be "Available" status

**D2: JWT_SECRET missing**
- Backend Service → **"Environment"** tab
- Add: Key=`JWT_SECRET`, Value=`any_random_32_character_string`
- Save and backend will redeploy

**D3: Missing other env variables**
- Make sure ALL these are set in Backend Environment:
  ```
  DATABASE_URL
  NODE_ENV=production
  PORT=5000
  JWT_SECRET
  JWT_EXPIRE=7d
  FRONTEND_URL
  ```

---

## 🧪 Step 2: Test Backend Directly

**Verify backend is actually working:**

1. Get your backend URL from Render dashboard
2. Visit: `https://your-backend-url.onrender.com/api/health`
3. **What do you see?**

**✅ Success:**
```json
{
  "success": true,
  "message": "EduMaster API Server is running!",
  "timestamp": "2025-11-20...",
  "environment": "production"
}
```
→ Backend is working! Problem is frontend config (go to Step 3)

**❌ Failure:**
- **404 or "Not Found"** → Wrong branch deployed or wrong root directory
- **503 or nothing loads** → Backend crashed, check logs
- **"Cannot GET /api/health"** → Backend running but wrong code

---

## 🎨 Step 3: Verify Frontend Environment Variable

Frontend must know where the backend is!

**Test what the frontend is using:**

1. Visit your frontend in browser
2. Press **F12** → **Console** tab
3. Type this and press Enter:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   ```

**What does it show?**

**❌ `undefined` or `http://localhost:5000/api`**
- Frontend doesn't have the env variable
- Must add `REACT_APP_API_URL` to Frontend Environment tab
- Must redeploy frontend after adding

**✅ Shows your backend URL ending with `/api`**
- Frontend config is correct!
- Problem is likely CORS (go back to Error Type B)

---

## 📋 Complete Checklist

Make sure ALL of these are correct:

### **PostgreSQL Service:**
- [ ] Status shows "Available" (green)
- [ ] Can see "Internal Database URL" in Connections section

### **Backend Service:**

**Settings Tab:**
- [ ] Branch: `claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

**Environment Tab:**
- [ ] `DATABASE_URL` = [Internal Database URL from PostgreSQL]
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `JWT_SECRET` = [Random string, 32+ chars]
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `FRONTEND_URL` = `https://your-frontend.onrender.com` (no slash)

**Logs Tab:**
- [ ] Shows: `✅ Database connected successfully`
- [ ] Shows: `🚀 EduMaster API Server is running!`
- [ ] Status: "Live" (green)

**Health Check:**
- [ ] `https://your-backend/api/health` returns success JSON

### **Frontend Service:**

**Settings Tab:**
- [ ] Branch: `claude/deploy-web-app-01PqSk4jxiXK7bsAyKRPoXTG`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `build`

**Environment Tab:**
- [ ] `REACT_APP_API_URL` = `https://your-backend.onrender.com/api` (with /api)

**Build Logs:**
- [ ] Shows: "Build successful"
- [ ] Status: "Live" (green)

---

## 🔍 Quick Diagnosis Commands

**In your browser console (F12 → Console):**

```javascript
// Check what API URL frontend is using
console.log(process.env.REACT_APP_API_URL)

// Test if backend is reachable
fetch('https://your-backend-url/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend response:', d))
  .catch(e => console.error('Backend error:', e))
```

Replace `your-backend-url` with your actual backend URL.

---

## 🎯 Most Common Issues (90% of problems)

1. **`REACT_APP_API_URL` not set in frontend** → Frontend calls localhost
2. **`DATABASE_URL` not set in backend** → Backend can't start
3. **`REACT_APP_API_URL` missing `/api`** → 404 errors
4. **`FRONTEND_URL` doesn't match exactly** → CORS errors
5. **Wrong branch deployed** → Old code without database.js updates
6. **Wrong Root Directory** → Build finds wrong package.json

---

## 🚀 After Fixing

Once fixed, test in this order:

1. ✅ Backend health endpoint returns success
2. ✅ Frontend loads without console errors
3. ✅ Register new account works
4. ✅ Login works
5. ✅ Dashboard loads with data

---

## 📞 Still Stuck?

**Copy and share these 3 things:**

1. **Backend logs (last 20 lines):**
   - Backend Service → Logs tab → Copy bottom part

2. **Browser console errors:**
   - F12 → Console tab → Screenshot or copy errors

3. **Your environment variables:**
   - Backend Environment tab → Screenshot (hide passwords!)
   - Frontend Environment tab → Screenshot

I'll help you debug with these!
