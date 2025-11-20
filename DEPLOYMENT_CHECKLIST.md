# 🚀 Quick Deployment Checklist

Use this checklist as you deploy to Render.com

---

## Before You Start

- [ ] Code is working locally
- [ ] Code is pushed to GitHub
- [ ] Have a Render.com account (sign up free)

---

## Render Deployment Steps

### 1️⃣ Create Database (5 min)
- [ ] New → PostgreSQL
- [ ] Name: `edumaster-db`
- [ ] Plan: Free
- [ ] Copy **Internal Database URL** ⚠️

### 2️⃣ Deploy Backend (10 min)
- [ ] New → Web Service
- [ ] Connect GitHub repo
- [ ] Root Directory: `backend`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Plan: Free

**Environment Variables:**
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=` [paste database URL]
- [ ] `JWT_SECRET=` [generate random string]
- [ ] `JWT_EXPIRE=7d`
- [ ] `FRONTEND_URL=` [leave empty for now]

- [ ] Create Web Service
- [ ] Wait for deployment
- [ ] Copy **Backend URL** ⚠️
- [ ] Test: visit `https://your-backend/api/health`

### 3️⃣ Deploy Frontend (10 min)
- [ ] New → Static Site
- [ ] Connect GitHub repo
- [ ] Root Directory: `frontend`
- [ ] Build: `npm install && npm run build`
- [ ] Publish: `build`

**Environment Variable:**
- [ ] `REACT_APP_API_URL=https://your-backend-url/api` ⚠️

- [ ] Create Static Site
- [ ] Wait for build
- [ ] Copy **Frontend URL** ⚠️

### 4️⃣ Update Backend CORS (2 min)
- [ ] Go back to backend service
- [ ] Environment → Edit `FRONTEND_URL`
- [ ] Set to: `https://your-frontend-url` (no trailing slash)
- [ ] Save (auto-redeploys)

---

## ✅ Testing

- [ ] Visit frontend URL
- [ ] Register new account
- [ ] Login works
- [ ] Create course
- [ ] Add flashcards
- [ ] Study session works
- [ ] Dashboard shows stats
- [ ] All features functional

---

## 🐛 If Something's Wrong

**Backend not working:**
- Check Logs tab in backend service
- Verify DATABASE_URL is correct
- Test health endpoint

**Frontend can't connect:**
- Open browser DevTools (F12) → Console
- Check `REACT_APP_API_URL` has `/api` at end
- Verify CORS: `FRONTEND_URL` matches frontend exactly

**Database errors:**
- Use Internal Database URL (not External)
- Tables auto-create on first start

---

## 📝 Save Your URLs

```
Frontend:  _______________________________________
Backend:   _______________________________________
Health:    _______________________________________/api/health
Database:  [keep secret]
```

---

## 🔄 Fixing Bugs

```bash
# Fix code locally
git add .
git commit -m "Fix: bug description"
git push origin main

# Render auto-deploys in 2-5 minutes
# Refresh browser to see changes
```

---

## 💡 Remember

- Free tier spins down after 15 min inactivity
- First request after sleep = ~30 seconds
- Perfect for testing!
- Upgrade for production use

---

**Full Guide:** See `RENDER_DEPLOYMENT_GUIDE.md`

**Need Help?** https://render.com/docs
