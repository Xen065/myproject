# EduMaster - Testing Checklist

## Pre-Release Testing Checklist

### 1. First Launch & Onboarding

- [ ] App launches successfully on cold start
- [ ] Splash screen displays correctly
- [ ] Onboarding screens display in correct order
- [ ] Can swipe through all 3 onboarding slides
- [ ] Dot indicators update correctly
- [ ] "Skip" button works on slides 1-2
- [ ] "Get Started" button appears on final slide
- [ ] After onboarding, redirects to main app
- [ ] Onboarding only shows once (not on subsequent launches)

### 2. Main Dashboard

- [ ] Dashboard loads with all UI elements
- [ ] User stats display correctly (level, coins, streak)
- [ ] Course cards display with correct information
- [ ] "Study Now" button navigates to study screen
- [ ] Bottom navigation works (all 5 tabs)
- [ ] Smooth transitions between screens

### 3. Study Screen Functionality

- [ ] Study screen loads due cards correctly
- [ ] Flashcard front displays question
- [ ] Tap to flip shows answer
- [ ] Smooth flip animation
- [ ] All 4 rating buttons work (Wrong, Hard, Good, Easy)
- [ ] Progress bar updates correctly
- [ ] Stats update in real-time (remaining cards, correct/wrong)
- [ ] Session completes when all cards done
- [ ] Completion screen shows accurate statistics
- [ ] XP and coins are awarded
- [ ] "Finish" button returns to dashboard
- [ ] Empty state shows when no cards due

### 4. Spaced Repetition Algorithm (SM-2)

- [ ] Cards scheduled correctly after rating
- [ ] "Wrong" rating resets interval to 1 day
- [ ] "Hard" rating increases interval slightly
- [ ] "Good" rating uses standard interval increase
- [ ] "Easy" rating gives longest interval
- [ ] Due dates calculated correctly
- [ ] Cards appear in due cards list at correct time
- [ ] Ease factor adjusts based on ratings
- [ ] Repetition count increases correctly

### 5. Profile Screen

- [ ] User stats display correctly
- [ ] Level and XP shown
- [ ] Coins balance accurate
- [ ] Current and longest streak displayed
- [ ] Study time tracked correctly
- [ ] Accuracy percentage calculated properly
- [ ] Achievements grid displays
- [ ] Unlocked achievements show correctly
- [ ] Locked achievements show progress
- [ ] Achievement icons and descriptions visible

### 6. Store Screen

- [ ] All 8 courses display
- [ ] Course cards show correct information
- [ ] Price displayed for premium courses
- [ ] "Owned" badge shows for purchased courses
- [ ] Category filter tabs work (All, Vocabulary, Science, etc.)
- [ ] Purchase dialog appears when clicking premium course
- [ ] Insufficient coins shows error message
- [ ] Successful purchase unlocks course
- [ ] Coins deducted correctly after purchase
- [ ] Course becomes available in study screen

### 7. Calendar Screen

- [ ] Study history displays
- [ ] Current and longest streak shown correctly
- [ ] Session cards show date, time, duration
- [ ] Cards reviewed and accuracy displayed
- [ ] Sessions sorted by date (newest first)
- [ ] Empty state shows when no sessions
- [ ] Session stats are accurate

### 8. Theme Functionality

- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] System default theme follows device setting
- [ ] Theme selection dialog appears
- [ ] Theme persists after app restart
- [ ] All screens support both themes
- [ ] Text is readable in both themes
- [ ] Colors properly inverted in dark mode
- [ ] Icons visible in both themes

### 9. Notifications

- [ ] Notification permission requested
- [ ] Daily reminder notification appears
- [ ] Notification shows correct time
- [ ] Tapping notification opens app
- [ ] Notification shows when cards are due
- [ ] No notification when no cards due
- [ ] Notification can be dismissed
- [ ] Reminder can be disabled in settings

### 10. Data Persistence

- [ ] Study progress saves correctly
- [ ] User stats persist across app restarts
- [ ] Purchased courses remain after restart
- [ ] Theme preference persists
- [ ] Streak continues correctly day-to-day
- [ ] Study sessions saved to calendar
- [ ] Achievement progress saved
- [ ] Card intervals and due dates persist

### 11. Performance

- [ ] App launches in under 3 seconds
- [ ] Smooth 60fps animations
- [ ] No lag when navigating screens
- [ ] RecyclerViews scroll smoothly
- [ ] No memory leaks during extended use
- [ ] App doesn't crash during normal use
- [ ] Background tasks don't slow down UI
- [ ] Database queries are fast

### 12. Error Handling

- [ ] Graceful handling of empty states
- [ ] Error messages are user-friendly
- [ ] Network not required (offline functionality)
- [ ] App doesn't crash on unexpected input
- [ ] Loading states show appropriately
- [ ] Retry mechanisms work when needed

### 13. UI/UX

- [ ] All text is readable and properly sized
- [ ] Touch targets are at least 48dp
- [ ] Navigation is intuitive
- [ ] Feedback provided for all actions
- [ ] Consistent design throughout app
- [ ] Icons are clear and understandable
- [ ] Colors have sufficient contrast
- [ ] Animations enhance experience (not distract)

### 14. Content Quality

- [ ] All flashcard questions are clear
- [ ] Answers are accurate
- [ ] No spelling or grammar errors
- [ ] Hints are helpful without giving away answer
- [ ] Course descriptions are accurate
- [ ] 255+ flashcards available
- [ ] Content loads correctly from database

### 15. Device Compatibility

**Test on Multiple Devices:**
- [ ] Android 7.0 (API 24) - Minimum SDK
- [ ] Android 10 (API 29) - Popular version
- [ ] Android 12 (API 31) - Recent version
- [ ] Android 14 (API 34) - Latest/Target SDK

**Screen Sizes:**
- [ ] Small phone (4.5" - 5.0")
- [ ] Medium phone (5.0" - 6.0")
- [ ] Large phone (6.0"+)
- [ ] Tablet (7"+)

**Orientations:**
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Rotation doesn't cause crashes
- [ ] Data persists after rotation

### 16. Edge Cases

- [ ] App handles 0 coins correctly
- [ ] App handles 0 cards due
- [ ] App handles maximum streak (999+ days)
- [ ] App handles maximum level
- [ ] Very long answers display correctly
- [ ] Special characters in flashcards work
- [ ] Rapid button clicking doesn't cause issues
- [ ] App recovers from low memory situations

### 17. Accessibility

- [ ] Text size is adjustable
- [ ] Content descriptions for screen readers
- [ ] High contrast mode support
- [ ] Touch targets are large enough
- [ ] Color is not the only differentiator

### 18. Privacy & Security

- [ ] No data sent to external servers
- [ ] Privacy policy accessible
- [ ] No unnecessary permissions requested
- [ ] Data stored securely locally
- [ ] Uninstalling removes all data

### 19. Release Build Testing

- [ ] Release APK/AAB builds successfully
- [ ] ProGuard/R8 doesn't break functionality
- [ ] Signing works correctly
- [ ] APK size is reasonable (< 20MB)
- [ ] App installs from APK
- [ ] No debug code in release build
- [ ] Logging disabled in release

### 20. Play Store Requirements

- [ ] Target SDK 34 (Android 14)
- [ ] 64-bit architecture support
- [ ] All required permissions declared
- [ ] Privacy policy URL ready
- [ ] App icon set (all densities)
- [ ] Feature graphic created
- [ ] Screenshots prepared (minimum 2, recommend 8)
- [ ] App description written
- [ ] Version code and name set correctly
- [ ] Content rating questionnaire completed

---

## Critical Bugs (Must Fix Before Release)

- [ ] No crashes during normal use
- [ ] No data loss
- [ ] No security vulnerabilities
- [ ] Spaced repetition algorithm works correctly
- [ ] Purchases work as expected
- [ ] Notifications don't spam users

---

## Nice-to-Have Improvements (Post-Launch)

- [ ] More animations
- [ ] More courses and content
- [ ] Cloud backup option
- [ ] User accounts (optional)
- [ ] Social features
- [ ] Leaderboards
- [ ] More achievement types
- [ ] Custom card creation
- [ ] Import/export functionality

---

## Testing Sign-Off

**Tester Name:** ___________________
**Date:** ___________________
**Device(s) Tested:** ___________________
**Android Version:** ___________________
**Build Version:** ___________________

**Overall Assessment:**
- [ ] Ready for release
- [ ] Minor issues (can release)
- [ ] Major issues (must fix before release)

**Notes:**
___________________________________
___________________________________
___________________________________

---

## Automated Testing

**Unit Tests:** ✅ 2 test classes created
- SM2AlgorithmTest (11 tests)
- ThemeHelperTest (5 tests)

**To Run Tests:**
```bash
./gradlew test
```

**Expected Result:** All tests pass ✅

---

## Performance Benchmarks

**Target Metrics:**
- App startup: < 3 seconds
- Screen navigation: < 500ms
- Database query: < 100ms
- Animation framerate: 60fps
- Memory usage: < 100MB
- APK size: < 20MB

---

*Complete this checklist before submitting to Play Store. All critical items must pass.*
