# Manual Test Checklist: Authentication & Sign-Out Flows

This checklist is for manual QA of authentication and sign-out flows in the City Crawler mobile app. Complete all steps on both Android and iOS before release.

---

## 1. Sign In Flow
- [ ] Launch the app. Verify the sign-in screen appears if not already signed in.
- [ ] Tap "Sign in with Google" (or other available provider).
- [ ] Complete the OAuth flow. Verify you are redirected to the main app/home screen.
- [ ] Verify your user profile info (name, email, avatar) is displayed correctly.
- [ ] Close and reopen the app. Verify you remain signed in (session persists).

## 2. Sign Out Flow
- [ ] From the profile or settings screen, tap "Sign Out".
- [ ] Confirm the sign-out action if prompted.
- [ ] Verify you are returned to the sign-in screen.
- [ ] Try to access protected screens (e.g., profile, crawl progress) while signed out. Verify access is denied or redirected to sign-in.
- [ ] Close and reopen the app. Verify you are still signed out.

## 3. Multiple Account Handling
- [ ] Sign in with a different Google (or other) account.
- [ ] Verify the new account's profile info is displayed.
- [ ] Sign out and sign back in with the original account. Verify correct info is shown.

## 4. Edge Cases
- [ ] Attempt to sign in, then cancel the OAuth flow. Verify you remain on the sign-in screen.
- [ ] Attempt to sign out while network is offline. Verify error handling and messaging.
- [ ] Attempt to sign in while network is offline. Verify error handling and messaging.
- [ ] If using device biometrics or password managers, verify they work as expected.

## 5. Security Checks
- [ ] After sign-out, verify that no sensitive user data (tokens, profile info) remains accessible in the app.
- [ ] Attempt to access API endpoints with an expired or missing token. Verify access is denied.

---

**Notes:**
- Repeat all tests on both Android and iOS devices/emulators.
- Document any failures or unexpected behavior for follow-up. 