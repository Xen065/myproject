# 🚀 Deploy EduMaster to Render.com

This guide will help you deploy your EduMaster app online for testing and bug fixing.

**Estimated Time:** 20-30 minutes
**Cost:** Free tier available (perfect for testing)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be on GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **This repository pushed to GitHub**

---

## 🎯 Deployment Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│   Backend API   │─────▶│   PostgreSQL    │
│  (Static Site)  │      │  (Web Service)  │      │   (Database)    │
│   React App     │      │    Express.js   │      │    Render DB    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

You'll create **3 services** on Render:
1. PostgreSQL Database
2. Backend API Server
3. Frontend Static Site

---

## 📝 Step-by-Step Deployment

### **Step 1: Push Your Code to GitHub**

```bash
# If not already on GitHub, create a repo and push
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

### **Step 2: Create PostgreSQL Database**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `edumaster-db`
   - **Database:** `edumaster`
   - **User:** `edumaster_user` (auto-generated)
   - **Region:** Choose closest to you
   - **Plan:** **Free** (for testing)
4. Click **"Create Database"**
5. ⚠️ **IMPORTANT:** Save these values (shown on database page):
   - **Internal Database URL** - You'll need this for backend!
   - **External Database URL** - For local connections

---

### **Step 3: Deploy Backend API**

1. Click **"New +"** → **"Web Service"**
2. Connect your **GitHub repository**
3. Configure:

   **Basic Settings:**
   - **Name:** `edumaster-backend`
   - **Region:** Same as database
   - **Branch:** `main` (or your branch)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Instance:**
   - **Plan:** **Free** (for testing)

4. Click **"Advanced"** and add **Environment Variables**:

   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[Paste Internal Database URL from Step 2]
   JWT_SECRET=[Generate a random string - see below]
   JWT_EXPIRE=7d
   FRONTEND_URL=[Leave empty for now, will update after Step 4]
   ```

   **🔐 Generate JWT_SECRET:**
   Run this in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as `JWT_SECRET`

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. ⚠️ **SAVE YOUR BACKEND URL:**
   - Will be like: `https://edumaster-backend.onrender.com`
   - Test it: Visit `https://your-backend-url.onrender.com/api/health`
   - Should see: `{"success": true, "message": "EduMaster API Server is running!"}`

---

### **Step 4: Deploy Frontend**

1. Click **"New +"** → **"Static Site"**
2. Connect your **GitHub repository**
3. Configure:

   **Basic Settings:**
   - **Name:** `edumaster-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. Add **Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```
   ⚠️ Replace with YOUR actual backend URL from Step 3!
   ⚠️ Make sure to include `/api` at the end!

5. Click **"Create Static Site"**
6. Wait for build (3-5 minutes)
7. ⚠️ **SAVE YOUR FRONTEND URL:**
   - Will be like: `https://edumaster-frontend.onrender.com`

---

### **Step 5: Update Backend CORS**

Your backend needs to allow requests from your frontend:

1. Go back to **"edumaster-backend"** service
2. Click **"Environment"** tab
3. **Edit** the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
   ⚠️ Replace with YOUR actual frontend URL from Step 4!
   ⚠️ No trailing slash!

4. Click **"Save Changes"**
5. Backend will **auto-redeploy** (2-3 minutes)

---

### **Step 6: Initialize Database with Sample Data (Optional)**

If you want to seed your database with sample data:

1. Install Render CLI or use their web shell
2. Or connect to your database directly:
   ```bash
   # On your local machine
   cd backend

   # Create .env file with production DATABASE_URL
   echo "DATABASE_URL=your-internal-database-url" > .env.production

   # Run seed script
   NODE_ENV=production node scripts/seedDatabase.js
   ```

---

## ✅ Step 7: Test Your Deployment!

1. **Visit your frontend URL:** `https://edumaster-frontend.onrender.com`
2. **Create a test account:** Click Register
3. **Test all features:**
   - Login / Register
   - Create courses
   - Add flashcards
   - Study sessions
   - Practice questions
   - Dashboard stats
   - Achievements
   - Math tricks
   - Calendar
   - Notes

---

## 🐛 Troubleshooting

### Backend won't start
- Check **Logs** tab in backend service
- Verify `DATABASE_URL` is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Check browser console (F12)
- Verify `REACT_APP_API_URL` includes `/api`
- Test backend health: `https://your-backend.onrender.com/api/health`
- Check CORS: Ensure `FRONTEND_URL` matches your frontend URL exactly

### Database connection errors
- Use **Internal Database URL** for backend (not External)
- Check database is running in Render dashboard

### "Unauthorized" errors
- Clear browser localStorage
- Re-register a new account
- Check JWT_SECRET is set

### Features not working
- Open browser DevTools → Network tab
- Check which API calls are failing
- View backend logs in Render dashboard
- Check database has tables (should auto-create on first start)

---

## 🔄 Redeploying After Bug Fixes

Render auto-deploys when you push to GitHub:

```bash
# Fix bug in your code
git add .
git commit -m "Fix: description of bug fix"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Rebuild your app
# 3. Deploy the new version
# Wait 2-5 minutes and refresh your browser!
```

---

## 📊 Monitoring & Debugging

### View Backend Logs
1. Go to backend service
2. Click **"Logs"** tab
3. See real-time server logs

### View Frontend Build Logs
1. Go to frontend service
2. Click **"Logs"** tab
3. See build output and errors

### Database Access
1. Go to database service
2. Click **"Connect"** for connection info
3. Use tools like pgAdmin or DBeaver to inspect data

---

## 💡 Tips for Testing

1. **Free Tier Limitations:**
   - Services "spin down" after 15 min of inactivity
   - First request after sleep takes ~30 seconds
   - Perfect for testing, not for production

2. **Keep Services Awake (Optional):**
   - Use a service like UptimeRobot to ping your backend every 5 minutes
   - Free plan: https://uptimerobot.com

3. **View Database:**
   - Connect using External Database URL
   - Use TablePlus, pgAdmin, or DBeaver

4. **Share with Testers:**
   - Just share your frontend URL
   - Anyone can create an account and test

---

## 🎓 Your Deployed URLs

After deployment, save these:

```
Frontend:  https://edumaster-frontend.onrender.com
Backend:   https://edumaster-backend.onrender.com
Health:    https://edumaster-backend.onrender.com/api/health
Database:  [Internal URL - keep secret!]
```

---

## 🚨 Important Notes

1. **Free Tier Limits:**
   - Database: 1 GB storage
   - Services spin down after inactivity
   - Perfect for testing, upgrade for production

2. **Environment Variables:**
   - Never commit `.env` files to GitHub
   - Set all secrets in Render dashboard

3. **SSL/HTTPS:**
   - Automatically provided by Render
   - No configuration needed

4. **Custom Domain (Optional):**
   - Can add your own domain in Render settings
   - Free SSL certificate included

---

## 🎉 Success Checklist

- [ ] Database created and running
- [ ] Backend deployed and health check works
- [ ] Frontend deployed and loads
- [ ] Can register a new account
- [ ] Can login
- [ ] Can create a course
- [ ] Can add flashcards
- [ ] Can study cards
- [ ] Dashboard shows stats
- [ ] All features working

---

## 📞 Need Help?

**Render Documentation:** https://render.com/docs
**Render Community:** https://community.render.com

**Common Issues:**
- Build fails → Check Node.js version compatibility
- Database errors → Verify DATABASE_URL
- CORS errors → Check FRONTEND_URL matches exactly
- 404 errors → Verify API_URL includes `/api`

---

## 🔄 Next Steps After Testing

Once you've tested and fixed all bugs:

1. **Upgrade to Paid Plans** (for production):
   - No cold starts
   - More resources
   - Better performance

2. **Add Custom Domain:**
   - Point your domain to Render
   - Free SSL included

3. **Set Up Monitoring:**
   - Enable Render notifications
   - Add error tracking (e.g., Sentry)

4. **Backup Strategy:**
   - Enable automated database backups
   - Export important data regularly

---

**Happy Testing! 🎉**

If you find bugs, fix them locally, commit, and push - Render will auto-deploy!
