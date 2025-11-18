# Quick Start - Testing in Android Studio (Windows)

## Step 1: Locate Your Project

Your Android project is ready at:

**Windows Path:**
```
\\wsl$\Ubuntu\home\user\myproject
```

(If you're using a different Linux distro, replace "Ubuntu" with your distro name)

## Step 2: Open in Android Studio

### Method A: From File Explorer
1. Open **File Explorer** (Win + E)
2. Type in address bar: `\\wsl$\Ubuntu\home\user\myproject`
3. Press Enter
4. **Right-click** on the `myproject` folder
5. Select **"Open Folder as Android Studio Project"** (if available)

### Method B: From Android Studio
1. Launch **Android Studio**
2. Click **"Open"** (or File → Open)
3. In the file browser, type: `\\wsl$\Ubuntu\home\user\myproject`
4. Select the **myproject** folder
5. Click **OK**

## Step 3: First-Time Setup

When Android Studio opens the project:

1. **Gradle Sync** will start automatically
   - Status shown in bottom-right corner
   - Can take 2-5 minutes first time
   - Downloads all dependencies

2. **If prompted**:
   - ✅ "Gradle Sync" → Click **Sync Now**
   - ✅ "Install missing components" → Click **Install**
   - ✅ "Update Gradle" → Click **Update**
   - ✅ Accept any license agreements

3. **Wait for "Gradle sync finished successfully"** message

## Step 4: Set Up Virtual Device (First Time Only)

1. Click **Tools** → **Device Manager**
2. Click **"+ Create Device"**
3. Choose **Phone** → **Pixel 6** (or any phone)
4. Click **Next**
5. Download system image: **API 34 (Android 14)** or **API 30 (Android 11)**
6. Click **Next** → **Finish**

## Step 5: Run the App

1. Select your virtual device from the dropdown (top toolbar)
2. Click the green **▶ Run** button
3. Wait for emulator to start (30-60 seconds first time)
4. App will install and launch automatically

## What You Should See

✅ **Purple gradient header** with "EduMaster" title
✅ **Stats bar**: Streak (7), Cards (248), Today (85%), Level (12)
✅ **Dashboard** with:
   - 🔥 7 Days Study Streak card
   - 4 quick stat cards
   - Progress bar at 85%
   - 3 active courses listed
✅ **Bottom navigation** with 5 icons

## Test Navigation

Tap each bottom navigation icon:
- 🏠 **Dashboard** - Full featured (you're here)
- 📚 **Study** - Placeholder screen
- 📅 **Calendar** - Placeholder screen
- 🛍️ **Store** - Placeholder screen
- 👤 **Profile** - Placeholder screen

## Troubleshooting

### "Project SDK is not defined"
- Click **"Setup SDK"**
- Select Android SDK location
- Click **OK**

### "Gradle sync failed"
- Check internet connection
- File → Invalidate Caches → Restart
- Try again

### "Cannot resolve symbol"
- Build → Clean Project
- Build → Rebuild Project

### Emulator won't start
- Check Windows Hyper-V is disabled
- Enable virtualization in BIOS
- Use a physical Android device instead:
  - Enable Developer Options
  - Enable USB Debugging
  - Connect via USB

## Running on Physical Device

1. On your Android phone:
   - Go to **Settings** → **About Phone**
   - Tap **Build Number** 7 times
   - Go back to **Settings** → **Developer Options**
   - Enable **USB Debugging**

2. Connect phone via USB to computer

3. When prompted on phone: Allow USB debugging

4. In Android Studio:
   - Select your device from dropdown
   - Click **Run**

## Need Help?

- See `BUILD_INSTRUCTIONS.md` for detailed guide
- See `README.md` for project overview
- Check Logcat (bottom panel) for errors

## Success Checklist

After running the app, verify:
- [ ] App launches without crashes
- [ ] Dashboard shows streak counter
- [ ] Stats display correctly
- [ ] Course list shows 3 courses
- [ ] Bottom navigation works
- [ ] Can navigate between all 5 tabs
- [ ] Data persists when you close and reopen app

---

**Ready to code?** The dashboard is fully functional. Next step: Implement the Study screen with flashcard functionality!
