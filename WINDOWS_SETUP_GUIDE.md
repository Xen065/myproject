# Windows Setup Guide for EduMaster Android App

## Important: This is NOT a Web Server Project

**EduMaster is a native Android mobile application**, not a web application. This means:
- ❌ You do NOT need Apache, XAMPP, Node.js, or any web server
- ✅ You DO need Android Studio to run the app
- ✅ The app runs on Android emulators or physical Android devices
- ✅ All data is stored locally on the device (no backend server required)

## What You'll Need on Windows

### 1. Android Studio (Required)
The main tool for developing and testing Android apps.

**Download & Install:**
1. Visit: https://developer.android.com/studio
2. Download the latest version (Hedgehog 2023.1.1 or newer)
3. Run the installer (exe file)
4. Follow the setup wizard:
   - Install Android SDK
   - Install Android Virtual Device (AVD)
   - Accept license agreements
   - Choose installation location (needs ~8 GB of space)

**System Requirements:**
- Windows 10/11 (64-bit)
- 8 GB RAM minimum (16 GB recommended)
- 8 GB available disk space
- 1280 x 800 minimum screen resolution

### 2. Java Development Kit (JDK)
Android Studio usually includes this, but verify:
- Required version: JDK 11 or 17
- Check if installed: Open Command Prompt and run `java -version`
- If not installed, Android Studio will prompt you during first run

## Accessing Your Project from Windows

Since your project is in WSL (Windows Subsystem for Linux), you need to access it from Windows.

### Finding Your Project Path

Your project is located at:
- **Linux path:** `/home/user/myproject`
- **Windows path:** `\\wsl$\Ubuntu\home\user\myproject`

(If you're using a different Linux distribution, replace "Ubuntu" with your distro name like "Debian" or "kali-linux")

### Method 1: Open via File Explorer

1. Press `Win + E` to open File Explorer
2. In the address bar, type: `\\wsl$\Ubuntu\home\user\myproject`
3. Press Enter
4. You should see your project files:
   - `app/` folder
   - `gradle/` folder
   - `build.gradle` file
   - `README.md` file
   - etc.

5. **Bookmark this location:**
   - Right-click on the `myproject` folder
   - Select "Pin to Quick Access"

### Method 2: Open Directly in Android Studio

1. Launch Android Studio
2. Click **"Open"** (or File → Open)
3. In the file browser, paste the path: `\\wsl$\Ubuntu\home\user\myproject`
4. Click **OK**

## First-Time Setup in Android Studio

### Step 1: Project Sync

When you first open the project:

1. Android Studio will automatically start **Gradle Sync**
2. You'll see a progress bar at the bottom: "Syncing 'myproject'..."
3. This downloads all dependencies (may take 3-10 minutes)
4. Wait for the message: **"Gradle sync finished successfully"**

### Step 2: Install Missing Components

If prompted, install:
- ✅ Android SDK Platform 34
- ✅ Android SDK Build-Tools 34.0.0
- ✅ Android Emulator
- ✅ Accept all license agreements

Click **"Install"** when prompted.

### Step 3: Create a Virtual Device (Emulator)

To test the app without a physical phone:

1. Click **Tools → Device Manager**
2. Click **"Create Device"** (the + button)
3. Select a phone model:
   - Choose **"Pixel 6"** or **"Pixel 7"**
   - Click **Next**
4. Select a system image:
   - Choose **"API 34"** (Android 14) or **"API 30"** (Android 11)
   - Click **Download** if not already downloaded
   - Wait for download to complete
   - Click **Next**
5. Configure the device:
   - Name: "Pixel 6 API 34" (or keep default)
   - Click **Finish**

**Note:** The emulator requires hardware virtualization. If it doesn't work:
- Enable VT-x/AMD-V in your BIOS
- Disable Hyper-V in Windows Features
- Or use a physical Android phone instead

## Running the App

### Option A: Run on Emulator

1. In Android Studio, look at the top toolbar
2. Select your virtual device from the dropdown (e.g., "Pixel 6 API 34")
3. Click the green **▶ Run** button (or press Shift+F10)
4. Wait for the emulator to start (30-90 seconds first time)
5. The app will automatically install and launch

**What you should see:**
- Purple gradient header with "EduMaster" title
- Study streak counter: 🔥 7
- Quick stats cards
- Active courses list
- Bottom navigation with 5 icons

### Option B: Run on Physical Android Phone

**Enable Developer Mode on your phone:**
1. Go to **Settings → About Phone**
2. Find **Build Number** and tap it 7 times
3. You'll see: "You are now a developer!"
4. Go back to **Settings → System → Developer Options**
5. Enable **USB Debugging**

**Connect and run:**
1. Connect your phone to your Windows laptop via USB
2. On your phone, tap **"Allow USB Debugging"** when prompted
3. In Android Studio, select your phone from the device dropdown
4. Click the green **▶ Run** button
5. The app will install on your phone

**Minimum requirements:**
- Android 7.0 (API 24) or higher
- Any Android phone from 2016 or newer should work

## Alternative: Command-Line Testing (Advanced)

If you prefer working from the command line:

### From WSL Terminal:

```bash
cd /home/user/myproject

# Build the app
./gradlew assembleDebug

# Install on connected device/emulator
./gradlew installDebug

# Run tests
./gradlew test
```

### From Windows Command Prompt:

```cmd
cd \\wsl$\Ubuntu\home\user\myproject

# Build the app
gradlew.bat assembleDebug

# Install on connected device/emulator
gradlew.bat installDebug
```

The built APK file will be at:
```
app\build\outputs\apk\debug\app-debug.apk
```

You can manually install this APK by:
1. Transferring it to your phone
2. Opening it on your phone
3. Allowing installation from unknown sources

## Troubleshooting

### Issue: "Cannot access \\wsl$\Ubuntu"

**Solutions:**
- Make sure WSL is running: Open Ubuntu from Start Menu first
- Check your Linux distro name: `wsl -l -v` in PowerShell
- Try: `\\wsl$\` (should show all Linux distros)

### Issue: "Gradle sync failed"

**Solutions:**
1. Check internet connection
2. Click **File → Invalidate Caches → Invalidate and Restart**
3. Try again: **File → Sync Project with Gradle Files**
4. Check if you need to update Gradle plugin

### Issue: "SDK not found" or "Project SDK is not defined"

**Solutions:**
1. Click **File → Project Structure → SDK Location**
2. Set Android SDK location (usually: `C:\Users\YourName\AppData\Local\Android\Sdk`)
3. Click **Apply → OK**

### Issue: Emulator won't start

**Solutions:**
1. **Enable virtualization in BIOS:**
   - Restart computer
   - Enter BIOS (usually F2, F12, or Del key)
   - Look for "Intel VT-x" or "AMD-V"
   - Enable it
   - Save and exit

2. **Disable Hyper-V on Windows:**
   - Open PowerShell as Administrator
   - Run: `bcdedit /set hypervisorlaunchtype off`
   - Restart your computer

3. **Use a physical device instead:**
   - Follow the "Run on Physical Android Phone" steps above

### Issue: "Cannot resolve symbol" errors in code

**Solutions:**
1. Click **Build → Clean Project**
2. Click **Build → Rebuild Project**
3. Click **File → Invalidate Caches → Invalidate and Restart**

### Issue: App crashes on startup

**Solutions:**
1. Check **Logcat** tab at the bottom of Android Studio
2. Look for red error messages
3. Check if your device has Android 7.0+ (API 24+)
4. Try uninstalling and reinstalling: **Run → Run 'app'**

## Understanding the Project Structure

Once Android Studio is open, you'll see:

```
myproject/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/edumaster/    ← Kotlin source code
│   │   │   ├── res/                    ← UI layouts, images, colors
│   │   │   └── AndroidManifest.xml     ← App configuration
│   ├── build.gradle                    ← App dependencies
│   └── build/                          ← Generated files (gitignored)
├── gradle/                             ← Gradle wrapper files
├── build.gradle                        ← Project configuration
├── settings.gradle                     ← Project settings
└── README.md                           ← Project documentation
```

## Working with Claude Code from Windows

Since you're using Claude Code via WSL, you can:

### Option 1: Work in WSL, test in Windows Android Studio
1. Edit code in WSL using Claude Code
2. Open the project in Windows Android Studio for testing
3. Android Studio will auto-detect file changes

### Option 2: Work entirely in Windows
1. Open the project in Android Studio
2. Use Android Studio's built-in editor
3. Use the terminal inside Android Studio for git commands

### Option 3: Hybrid approach
1. Edit in WSL with your favorite editor
2. Build via command line: `./gradlew assembleDebug`
3. Test in Android Studio emulator

## Testing the App

After the app launches successfully:

### Basic Tests:
- [ ] App opens without crashing
- [ ] Dashboard shows streak counter (🔥 7)
- [ ] Stats display correctly (248 cards, 85% today, Level 12)
- [ ] Course list shows 3 courses
- [ ] Bottom navigation has 5 icons
- [ ] Tapping navigation switches screens
- [ ] All 5 screens load (Dashboard, Study, Calendar, Store, Profile)

### Data Persistence Test:
1. Open the app
2. Note the streak counter
3. Close the app completely (swipe away from recent apps)
4. Reopen the app
5. Verify data is still there

## Next Steps After Setup

Once your app is running:

1. **Explore the Dashboard:**
   - See the study streak
   - View quick stats
   - Check active courses

2. **Test Navigation:**
   - Tap each bottom navigation icon
   - Currently only Dashboard is fully implemented
   - Other screens show placeholder text

3. **Review the Code:**
   - Open `app/src/main/java/com/edumaster/MainActivity.kt`
   - Explore the UI layouts in `app/src/main/res/layout/`
   - Check the database models in `app/src/main/java/com/edumaster/data/models/`

4. **Start Development:**
   - The Study screen needs implementation
   - Calendar view is a placeholder
   - Store and Profile screens are placeholders

## Useful Resources

- **Android Developer Guide:** https://developer.android.com/guide
- **Kotlin Documentation:** https://kotlinlang.org/docs/home.html
- **Android Studio Guide:** https://developer.android.com/studio/intro
- **Material Design 3:** https://m3.material.io/
- **Room Database:** https://developer.android.com/training/data-storage/room

## Still Need Help?

If you're still stuck:

1. **Check Logcat:** The bottom panel in Android Studio shows detailed error logs
2. **Review BUILD_INSTRUCTIONS.md:** More detailed build steps
3. **Check README.md:** Project overview and features
4. **Ask Claude Code:** Describe the specific error you're seeing

## Summary

**Remember:**
- This is an **Android mobile app**, not a web application
- You need **Android Studio** (not a web server)
- The app runs on **Android devices/emulators** (not in a browser)
- Your project path is: `\\wsl$\Ubuntu\home\user\myproject`
- First run may take 10-15 minutes (downloading dependencies + emulator boot)

**Quick Start Checklist:**
1. ✅ Install Android Studio
2. ✅ Open project from `\\wsl$\Ubuntu\home\user\myproject`
3. ✅ Wait for Gradle sync
4. ✅ Create a virtual device (emulator)
5. ✅ Click Run ▶
6. ✅ Wait for emulator to start
7. ✅ App launches!

Good luck with your Android development journey!
