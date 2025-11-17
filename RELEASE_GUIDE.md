# EduMaster - Release Preparation Guide

## 📋 Overview

This guide provides step-by-step instructions to prepare EduMaster for Play Store submission.

**Current Status:** Version 1.0.0 (Build 1)
**Target:** Production Release on Google Play Store

---

## ✅ Pre-Release Checklist

### Phase 1: Code & Testing ✅
- [x] All 5 main screens implemented
- [x] 255+ flashcards across 8 courses
- [x] SM-2 algorithm working correctly
- [x] Dark mode fully functional
- [x] Custom app icon created
- [x] Onboarding flow complete
- [x] Unit tests written (16 tests)
- [x] Release build configured
- [x] ProGuard/R8 rules set up

### Phase 2: Documentation ✅
- [x] Privacy Policy created
- [x] Play Store listing prepared
- [x] Testing checklist created
- [x] Release guide created (this document)

### Phase 3: Testing (In Progress)
- [ ] Manual testing on multiple devices
- [ ] Test on Android 7.0 (minimum SDK)
- [ ] Test on Android 14 (target SDK)
- [ ] Test on different screen sizes
- [ ] Test dark mode thoroughly
- [ ] Verify all 255+ flashcards load
- [ ] Test spaced repetition algorithm
- [ ] Test notifications
- [ ] Verify no crashes

### Phase 4: Play Store Preparation (To Do)
- [ ] Create Google Play Developer account ($25)
- [ ] Generate release keystore
- [ ] Build signed APK/AAB
- [ ] Prepare screenshots (8 required)
- [ ] Host privacy policy online
- [ ] Create feature graphic
- [ ] Complete content rating questionnaire
- [ ] Set up store listing
- [ ] Submit for review

---

## 🔑 Step 1: Create Release Keystore

**Important:** Keep your keystore secure - you'll need it for all future updates!

```bash
# Generate keystore (Run from project root)
keytool -genkey -v -keystore edumaster-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias edumaster-key

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Key password (SAVE THIS!)
# - Your name
# - Organization
# - City/Locality
# - State/Province
# - Country code (e.g., US, IN, UK)
```

**Store Keystore Information Securely:**
```
Keystore Path: /path/to/edumaster-release-key.jks
Keystore Password: [YOUR_PASSWORD]
Key Alias: edumaster-key
Key Password: [YOUR_KEY_PASSWORD]
```

**⚠️ CRITICAL:** Backup your keystore in multiple secure locations!

---

## 🔐 Step 2: Configure Signing in build.gradle

Add this to `app/build.gradle` (above `buildTypes`):

```gradle
android {
    ...

    signingConfigs {
        release {
            storeFile file("path/to/edumaster-release-key.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "edumaster-key"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

**Security Note:** For production, use environment variables or `gradle.properties`:

Create `keystore.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=edumaster-key
storeFile=path/to/edumaster-release-key.jks
```

Add to `.gitignore`:
```
keystore.properties
*.jks
*.keystore
```

---

## 📦 Step 3: Build Release APK/AAB

### Build AAB (Recommended for Play Store)

```bash
# Clean and build
./gradlew clean

# Build release AAB
./gradlew bundleRelease

# Output location:
# app/build/outputs/bundle/release/app-release.aab
```

### Build APK (For testing)

```bash
# Build release APK
./gradlew assembleRelease

# Output location:
# app/build/outputs/apk/release/app-release.apk
```

### Verify Build

```bash
# Check file size (should be < 20MB)
ls -lh app/build/outputs/bundle/release/app-release.aab

# Verify signing
jarsigner -verify -verbose -certs app/build/outputs/bundle/release/app-release.aab
```

---

## 📸 Step 4: Create Screenshots

**Required: Minimum 2, Maximum 8 screenshots**

**Recommended Sizes:**
- Phone: 1080 x 1920 (or 1080 x 2340 for modern phones)
- 7-inch Tablet: 1200 x 1920
- 10-inch Tablet: 2048 x 1536

**Screenshot Recommendations:**
1. **Home Dashboard** - Show overview with stats
2. **Study Screen** - Active flashcard with question
3. **Session Complete** - Results screen
4. **Profile** - Achievements and stats
5. **Store** - Course browsing
6. **Calendar** - Study history
7. **Dark Mode** - Show dark theme
8. **Course Selection** - Multiple courses

**Tips:**
- Use actual app content, not placeholder data
- Show compelling statistics (high streaks, many cards)
- Include both light and dark mode
- Ensure text is readable
- Remove any test/debug data
- Use device frames for professional look

**Tools:**
- Android Studio Emulator screenshots
- Real device screenshots (adb screenshot)
- [Device Art Generator](https://developer.android.com/distribute/marketing-tools/device-art-generator)

---

## 🌐 Step 5: Host Privacy Policy

**Options:**

### Option 1: GitHub Pages (Free)
1. Create repository: `edumaster-privacy`
2. Add `PRIVACY_POLICY.md`
3. Enable GitHub Pages
4. URL: `https://[username].github.io/edumaster-privacy/`

### Option 2: Simple Website
1. Use free hosting (Netlify, Vercel, etc.)
2. Create simple HTML page with privacy policy
3. Deploy

### Option 3: Google Sites (Free)
1. Create new Google Site
2. Paste privacy policy content
3. Publish

**URL Format:** `https://yourdomain.com/privacy` or `https://username.github.io/app-privacy`

---

## 🎨 Step 6: Create Feature Graphic

**Size:** 1024 x 500 pixels
**Format:** PNG or JPEG
**Max file size:** 1MB

**Content Ideas:**
- App name: "EduMaster"
- Tagline: "Master Anything with Spaced Repetition"
- App icon
- Key features icons
- Clean, professional design

**Tools:**
- Canva (free templates)
- Figma
- Adobe Photoshop/Illustrator
- [Google Play Asset Studio](https://romannurik.github.io/AndroidAssetStudio/pack.html)

---

## 📝 Step 7: Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 one-time registration fee
4. Complete account details
5. Accept Developer Distribution Agreement

**Required Information:**
- Developer name (individual or company)
- Email address
- Phone number
- Country
- Payment method for registration fee

---

## 🏪 Step 8: Create App in Play Console

### Create New App
1. Click "Create app"
2. Enter app details:
   - App name: "EduMaster"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
3. Complete declarations:
   - Privacy policy URL
   - App access (all functionality available)
   - Ads: No ads
   - Content guidelines compliance
   - US export laws compliance

### App Content
1. **Privacy Policy:** Paste your hosted URL
2. **App Access:** All features available to all users
3. **Ads:** Select "No, my app does not contain ads"
4. **Content Rating:**
   - Complete questionnaire
   - Expected rating: Everyone
5. **Target Audience:**
   - Age range: 13+
   - Appeals to children: No
6. **News app:** No
7. **COVID-19 contact tracing/status:** No
8. **Data safety:**
   - Collects data: Yes (only locally)
   - Shares data: No
   - Data types: Study progress (stored locally)
   - Data security: Encrypted in transit and at rest

### Store Listing
1. **App name:** EduMaster
2. **Short description:** (From PLAY_STORE_LISTING.md)
3. **Full description:** (From PLAY_STORE_LISTING.md)
4. **App icon:** 512 x 512 PNG
5. **Feature graphic:** 1024 x 500 PNG
6. **Screenshots:** Upload 2-8 screenshots
7. **Category:** Education
8. **Tags:** flashcards, learning, education, study
9. **Contact details:**
   - Email: support@edumaster.app
   - Phone: (optional)
   - Website: (optional)

### Release Track
1. Go to "Production" track
2. Click "Create new release"
3. Upload AAB file
4. **Release name:** Version 1.0.0
5. **Release notes:** (From PLAY_STORE_LISTING.md - What's New)
6. Save and review

---

## 🔍 Step 9: Review & Submit

### Pre-Submission Checklist
- [ ] App builds successfully
- [ ] Signed with release keystore
- [ ] Screenshots uploaded (minimum 2)
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Store listing complete
- [ ] Release notes added
- [ ] Tested on multiple devices
- [ ] No critical bugs

### Submit for Review
1. Review all sections in Play Console
2. Fix any errors or warnings
3. Click "Send for review"
4. Wait 1-3 days for review

### Review Process
- **Timeline:** Usually 1-3 days
- **Outcome:** Approved or Rejected
- **If Rejected:** Fix issues and resubmit

---

## 📊 Step 10: Post-Launch

### Monitor & Respond
1. **Play Console Dashboard:**
   - Monitor installations
   - Check crash reports
   - Review ratings and reviews

2. **Respond to Reviews:**
   - Reply within 24-48 hours
   - Thank positive reviewers
   - Address negative feedback constructively

3. **Track Metrics:**
   - Daily active users
   - Retention rate
   - Crash-free rate (target: >99%)
   - Average rating (target: 4.0+)

4. **Plan Updates:**
   - Fix critical bugs immediately
   - Plan feature updates every 2-4 weeks
   - Add more content regularly
   - Listen to user feedback

---

## 🔄 Future Updates

### Version Management
```gradle
versionCode 1 -> 2 -> 3 -> ...
versionName "1.0.0" -> "1.0.1" -> "1.1.0" -> ...
```

**Versioning Schema:**
- Major.Minor.Patch (Semantic Versioning)
- 1.0.0 → Initial release
- 1.0.1 → Bug fixes
- 1.1.0 → New features
- 2.0.0 → Major changes

### Update Process
1. Make changes in code
2. Update `versionCode` and `versionName`
3. Test thoroughly
4. Build new AAB
5. Upload to Production track
6. Add release notes
7. Submit for review

---

## 🆘 Troubleshooting

### Build Errors
```bash
# Clean build
./gradlew clean

# Check for errors
./gradlew assembleRelease --stacktrace

# Check ProGuard issues
./gradlew assembleRelease --debug
```

### ProGuard Issues
- Check `app/build/outputs/mapping/release/mapping.txt`
- Add keep rules to `proguard-rules.pro`
- Test release build thoroughly

### Signing Issues
- Verify keystore path is correct
- Check passwords are correct
- Ensure keystore file has read permissions

### Play Console Issues
- Read error messages carefully
- Complete all required sections
- Check policy compliance
- Verify screenshots meet requirements

---

## 📞 Support

### During Development
- Check `TESTING_CHECKLIST.md` for testing guidance
- Review `PLAY_STORE_LISTING.md` for marketing copy
- Read `PRIVACY_POLICY.md` for privacy details

### Play Store Help
- [Play Console Help Center](https://support.google.com/googleplay/android-developer/)
- [App Submission Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Policy Guidelines](https://play.google.com/about/developer-content-policy/)

---

## ✨ Success Criteria

**Ready for Launch When:**
- ✅ All critical bugs fixed
- ✅ Tested on multiple devices and Android versions
- ✅ Privacy policy hosted and accessible
- ✅ All Play Store requirements met
- ✅ Screenshots showcase key features
- ✅ Store listing is compelling
- ✅ Release build signed and tested
- ✅ Content rating appropriate
- ✅ No crashes during testing

---

## 🎉 Launch Day!

1. Submit app for review
2. Announce on social media (optional)
3. Share with friends and family
4. Monitor Play Console dashboard
5. Respond to initial reviews
6. Celebrate! 🎊

---

**Good luck with your launch! You've built something amazing! 🚀**

---

*Last Updated: November 17, 2025*
*EduMaster Version 1.0.0*
