# EduMaster - Build Instructions

This document provides step-by-step instructions for building and running the EduMaster Android app.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Android Studio** (Hedgehog 2023.1.1 or later)
   - Download from: https://developer.android.com/studio

2. **Java Development Kit (JDK) 17**
   - Usually bundled with Android Studio
   - Or download from: https://www.oracle.com/java/technologies/downloads/

3. **Android SDK**
   - Install via Android Studio SDK Manager
   - Required: Android SDK Platform 34
   - Required: Android Build Tools 34.0.0+

## Step-by-Step Build Instructions

### Option 1: Using Android Studio (Recommended)

1. **Open the Project**:
   ```
   - Launch Android Studio
   - Click "Open" or "File > Open"
   - Navigate to the 'myproject' folder
   - Click "OK"
   ```

2. **Wait for Gradle Sync**:
   ```
   - Android Studio will automatically detect the project
   - Wait for "Gradle sync" to complete (bottom status bar)
   - This may take 2-5 minutes on first run
   - All dependencies will be downloaded automatically
   ```

3. **Resolve Any Issues**:
   ```
   - If prompted to update Gradle, click "Update"
   - If SDK components are missing, click "Install missing components"
   - Accept any license agreements
   ```

4. **Build the Project**:
   ```
   - Click "Build > Make Project" from menu
   - Or press Ctrl+F9 (Windows/Linux) or Cmd+F9 (Mac)
   - Wait for build to complete (check "Build" tab at bottom)
   ```

5. **Run the App**:

   **On Emulator**:
   ```
   - Click "Tools > Device Manager"
   - Create a new virtual device if needed:
     * Click "+ Create Device"
     * Select "Phone" > "Pixel 6" or similar
     * Select system image: API 34 (Android 14)
     * Click "Finish"
   - Select your device from dropdown at top
   - Click green "Run" button (or Shift+F10)
   ```

   **On Physical Device**:
   ```
   - Enable Developer Options on your Android device:
     * Go to Settings > About Phone
     * Tap "Build Number" 7 times
     * Go back to Settings > System > Developer Options
     * Enable "USB Debugging"
   - Connect device via USB
   - Allow USB debugging on device when prompted
   - Select your device from dropdown at top
   - Click green "Run" button
   ```

### Option 2: Using Command Line

1. **Open Terminal**:
   ```bash
   cd /home/user/myproject
   ```

2. **Make Gradlew Executable** (Linux/Mac only):
   ```bash
   chmod +x gradlew
   ```

3. **Build the APK**:
   ```bash
   ./gradlew assembleDebug
   ```

   Windows:
   ```cmd
   gradlew.bat assembleDebug
   ```

4. **Install on Connected Device**:
   ```bash
   ./gradlew installDebug
   ```

5. **Find the APK**:
   ```
   Location: app/build/outputs/apk/debug/app-debug.apk
   ```

## Troubleshooting

### Issue: "Gradle sync failed"
**Solution**:
- Check internet connection
- Click "File > Invalidate Caches > Invalidate and Restart"
- Update Gradle wrapper: `./gradlew wrapper --gradle-version 8.1.1`

### Issue: "SDK not found"
**Solution**:
- Open "Tools > SDK Manager"
- Install Android SDK Platform 34
- Install Android SDK Build-Tools 34.0.0

### Issue: "Room schema export directory is not provided"
**Solution**:
- This is a warning, not an error
- The app will still build and run normally

### Issue: "Duplicate class" errors
**Solution**:
- Click "Build > Clean Project"
- Click "Build > Rebuild Project"

### Issue: App crashes on startup
**Solution**:
- Check Logcat in Android Studio (bottom panel)
- Look for red error messages
- Ensure device has Android 7.0 (API 24) or higher

## Verifying the Build

After successful build and installation, you should see:

1. **App Icon**: "EduMaster" appears in app drawer
2. **Launch Screen**: Purple gradient header with "EduMaster" title
3. **Dashboard**:
   - Streak counter showing "🔥 7"
   - Quick stats cards
   - Active courses list
   - Bottom navigation with 5 icons

4. **Navigation**:
   - Tap bottom navigation icons
   - Should switch between Dashboard, Study, Calendar, Store, Profile

## Running Tests

```bash
# Run unit tests
./gradlew test

# Run instrumented tests (requires connected device)
./gradlew connectedAndroidTest
```

## Building Release APK

1. **Create Keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore edumaster-release.keystore \
           -alias edumaster -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build Signed APK**:
   ```
   - In Android Studio: Build > Generate Signed Bundle / APK
   - Select APK
   - Create new keystore or choose existing
   - Select "release" build variant
   - Click "Finish"
   ```

3. **Find Release APK**:
   ```
   Location: app/build/outputs/apk/release/app-release.apk
   ```

## Project File Sizes

Approximate sizes:
- Source code: ~150 KB
- Build output (debug APK): ~5-8 MB
- Build cache: ~200-500 MB (in .gradle and build folders)

## Additional Resources

- **Android Developer Guide**: https://developer.android.com/guide
- **Kotlin Documentation**: https://kotlinlang.org/docs/home.html
- **Room Database**: https://developer.android.com/training/data-storage/room
- **Material Design 3**: https://m3.material.io/

## Support

For issues or questions:
1. Check the README.md file
2. Review the code comments
3. Check Android Studio's Logcat for errors
4. Refer to official Android documentation

## Next Steps

Once the app is running:
1. Explore the Dashboard
2. Check the pre-populated sample data
3. Test the navigation between screens
4. Review the code to understand the architecture
5. Start implementing additional features (Study screen, Calendar, etc.)

---

**Note**: This is a development build. For production deployment, additional steps are required including signing, optimization, and testing on multiple devices.
