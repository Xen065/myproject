# How to Build and Install EduMaster APK

## Option 1: Build on Your Computer (Recommended)

### Prerequisites
- Android Studio installed on your computer
- OR Java JDK 17+ and Android SDK installed

### Steps Using Android Studio

1. **Clone/Download the Project**
   ```bash
   # If you have git access to your repository
   git clone [your-repository-url]
   cd myproject
   ```

2. **Open Project in Android Studio**
   - Open Android Studio
   - Click "Open an Existing Project"
   - Navigate to the `myproject` folder
   - Click OK

3. **Let Android Studio Sync**
   - Android Studio will automatically download all dependencies
   - Wait for "Gradle sync" to complete (bottom status bar)
   - This may take 2-5 minutes on first sync

4. **Build Debug APK**

   **Method A: Using Build Menu**
   - Click `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
   - Wait for build to complete
   - Click "locate" in the notification that appears
   - APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

   **Method B: Using Terminal in Android Studio**
   - Open Terminal tab at bottom
   - Run: `./gradlew assembleDebug`
   - APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

5. **Transfer APK to Phone**
   - Copy `app-debug.apk` to your phone via:
     - USB cable
     - Email to yourself
     - Google Drive/Dropbox
     - Bluetooth
     - ADB: `adb install app/build/outputs/apk/debug/app-debug.apk`

### Steps Using Command Line (Without Android Studio)

1. **Install Prerequisites**
   - Install Java JDK 17 or higher
   - Download Android SDK Command-line tools

2. **Build APK**
   ```bash
   cd myproject
   ./gradlew assembleDebug
   ```

3. **Find APK**
   - Location: `app/build/outputs/apk/debug/app-debug.apk`

---

## Option 2: Install APK on Your Android Phone

### Enable Installation from Unknown Sources

**Android 8.0 and above:**
1. Go to `Settings` > `Apps & notifications`
2. Tap `Advanced` > `Special app access`
3. Tap `Install unknown apps`
4. Select the app you want to use to install (e.g., Chrome, Files, Gmail)
5. Toggle `Allow from this source`

**Android 7.x and below:**
1. Go to `Settings` > `Security`
2. Enable `Unknown sources`
3. Tap OK when prompted

### Install the APK

1. **Locate the APK on your phone**
   - Use File Manager to find `app-debug.apk`
   - Or tap the downloaded file from browser/email

2. **Tap the APK file**
   - Android will ask "Do you want to install this application?"
   - Tap `Install`

3. **Wait for Installation**
   - Should take 5-10 seconds

4. **Open the App**
   - Tap `Open` when installation completes
   - Or find "EduMaster" in your app drawer

---

## Option 3: Install via ADB (USB Debugging)

### Enable USB Debugging on Phone

1. Go to `Settings` > `About phone`
2. Tap `Build number` 7 times (enables Developer options)
3. Go back to `Settings` > `Developer options`
4. Enable `USB debugging`

### Install via ADB

1. **Connect phone to computer via USB**

2. **Verify connection**
   ```bash
   adb devices
   ```
   You should see your device listed

3. **Install APK**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

4. **App will install automatically**
   - Check your app drawer for "EduMaster"

---

## Quick Build Script

Save this as `build-apk.sh` in the project root:

```bash
#!/bin/bash

echo "🏗️  Building EduMaster Debug APK..."
echo ""

# Clean previous builds
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📱 APK Location:"
    echo "   app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📊 APK Size:"
    ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print "   "$5}'
    echo ""
    echo "📲 Next Steps:"
    echo "   1. Transfer APK to your Android phone"
    echo "   2. Enable 'Install from unknown sources'"
    echo "   3. Tap the APK file to install"
    echo "   4. Open EduMaster and start learning!"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "   Check the error messages above"
    echo ""
fi
```

Make it executable and run:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

---

## Troubleshooting

### "App not installed" error
- **Solution:** Uninstall any previous version of EduMaster
- Settings > Apps > EduMaster > Uninstall
- Then try installing again

### "Parse error" or "There is a problem parsing the package"
- **Solution:** APK file may be corrupted during transfer
- Try transferring the APK again
- Make sure to transfer in binary mode (not text)

### Build fails with "SDK not found"
- **Solution:** Set ANDROID_HOME environment variable
  ```bash
  export ANDROID_HOME=/path/to/Android/Sdk
  ```

### Build fails with "Execution failed for task ':app:compileDebugKotlin'"
- **Solution:** Clean and rebuild
  ```bash
  ./gradlew clean
  ./gradlew assembleDebug
  ```

### "Insufficient storage" on phone
- **Solution:** Free up space on your phone
- App requires about 30-50 MB

---

## Expected APK Details

**File Name:** `app-debug.apk`
**Expected Size:** 15-25 MB
**Min Android Version:** Android 7.0 (API 24)
**Target Android Version:** Android 14 (API 34)
**Permissions Required:**
- Notifications (for study reminders)
- Vibrate (optional, for haptic feedback)

---

## First Launch Checklist

After installing:
1. ✅ Splash screen appears
2. ✅ Onboarding screens show (3 slides)
3. ✅ Tap "Get Started" on last slide
4. ✅ Main dashboard loads
5. ✅ Bottom navigation works (5 tabs)
6. ✅ You see 3 owned courses
7. ✅ Tap "Study Now" to start learning!

---

## Testing Your Installation

### Quick Functionality Test:
1. **Study Screen:** Tap "Study Now" > Flip flashcard > Rate it
2. **Profile Screen:** Check your stats and achievements
3. **Store Screen:** Browse premium courses
4. **Calendar Screen:** View study history (will be empty initially)
5. **Theme:** Tap Settings icon > Choose Dark mode

### If Everything Works:
🎉 **Congratulations!** EduMaster is successfully installed and working!

---

## Need Help?

**Common Issues:**
- If app crashes on launch: Check Android version (must be 7.0+)
- If flashcards don't load: Clear app data and relaunch
- If dark mode doesn't work: Force close app and reopen

**Build Issues:**
- Make sure you have internet connection for first build
- Gradle will download ~500MB of dependencies first time
- Subsequent builds will be much faster

---

## Alternative: Pre-built APK

If you cannot build the APK yourself, you can request a pre-built debug APK. However, building it yourself ensures:
- Latest code from your repository
- Ability to customize before building
- Learning how the build process works

---

## For Future Updates

Whenever you want to rebuild with changes:

```bash
cd myproject
git pull  # Get latest changes (if using git)
./gradlew clean assembleDebug
```

New APK will be at the same location: `app/build/outputs/apk/debug/app-debug.apk`

---

**Happy Testing! 📱🎓**
