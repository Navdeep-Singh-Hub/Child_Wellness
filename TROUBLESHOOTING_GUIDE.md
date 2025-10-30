# Troubleshooting "signed_out" Error

## Your Clerk Key (Looks Complete!)
```
pk_test_Y3VkZGx5LXN1bmJlYW0tODEuY2xlcmsuYWNjb3VudHMuZGV2JA
```

This key appears to be complete and correct.

---

## Real Causes of "signed_out" Error

### 1. **Clerk Development Mode Rate Limiting**
Clerk's free/dev mode has strict rate limits:
- Limited emails per hour
- Sessions expire quickly
- Account cleanup restrictions

**Solution**: Try with a **different email** that hasn't been used

### 2. **Email Already Exists**
If you've tried creating an account with this email before:
- The sign-up is created successfully
- But Clerk auto-signs you out during verification
- This triggers the "signed_out" error

**Solution**: 
- Use a completely new email
- Or sign in to the existing account instead

### 3. **Redirect URL Not Configured**
Your OAuth redirect might be misconfigured

**Solution**: Add to Clerk Dashboard → Configure → Paths → Redirect URLs:
```
childwellness://
```

### 4. **App Cache/Session Conflicts**
Old session data interfering with new sign-up

**Solution**: Clear everything:
```bash
# 1. Stop server and clear cache
npx expo start --clear

# 2. On your phone:
# Android: Settings → Apps → Your App → Clear Data
# iOS: Uninstall and reinstall
```

---

## Step-by-Step Fix

### Step 1: Clear App Data
```bash
# Clear app data on your phone first
```

### Step 2: Update Clerk Dashboard
1. Go to https://dashboard.clerk.com/
2. Navigate to **Configure** → **Paths** → **Redirect URLs**
3. Add: `childwellness://`
4. Save changes

### Step 3: Restart Fresh
```bash
npx expo start --clear
```

### Step 4: Try with Fresh Email
Use an email you've **never** used for this app before

### Step 5: Test Sign-Up
If it fails, check the exact error in logs

---

## Debugging: Check What's Actually Happening

Look at your terminal logs for these patterns:

### ✅ Good Signs:
```
✅ A) create ok { id: "...", status: "missing_requirements" }
✅ A) prepare ok via resource
```

### ❌ Bad Signs:
```
❌ A) error blob: { "code": "signed_out" }
```

If you see the good signs followed by bad signs, it's likely:
1. Email rate limiting
2. Email already exists
3. Development mode limitation

---

## Most Likely Solution

Based on your error pattern, try these in order:

1. **Use a different email** (most likely fix!)
2. **Add redirect URL** to Clerk dashboard
3. **Clear app data** completely
4. **Wait 1 hour** for rate limits to reset

---

## Alternative: Test with Different Method

Try Google OAuth instead of email to bypass email rate limits:
- Tap "Continue with Google"
- This might work even if email sign-up doesn't

---

## Still Not Working?

Share these details:
1. The exact error message from terminal
2. What happens when you try to sign up
3. Whether you've used this email before
4. Whether redirect URL is added in Clerk dashboard

