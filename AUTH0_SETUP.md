# Auth0 Callback URL Setup Instructions

## ⚠️ IMPORTANT: Fix These Issues First

1. **Application Login URI Error**: The "Application Login URI" field has an invalid value causing an error. 
   - **FIX**: **Clear this field completely** (leave it empty) - this field is optional for mobile apps
   - OR if you must set it, use: `https://child-wellness.us.auth0.com/authorize` (single URL, no commas)
   - This field should be a valid HTTPS URL or empty, not a comma-separated list

## Redirect URIs to Add

Based on your app configuration, add these **exact** URIs to your Auth0 dashboard:

### Allowed Callback URLs
**REMOVE all existing values and add ONLY these** (comma-separated, NO spaces):
```
ChildWellness:///callback,childwellness://callback,com.anonymous.ChildWellness://callback
```

**IMPORTANT:** The actual redirect URI being sent is `ChildWellness:///callback` (capital C/W, three slashes). Make sure this exact format is included!

**DO NOT include:**
- ❌ `https://child-wellness.us.auth0.com` (this is the Auth0 domain, not a callback URL)
- ❌ Duplicate `childwellness://callback` entries

### Allowed Logout URLs
**⚠️ CRITICAL: Make sure these end with `/logout`, NOT `/callback`!**

**REMOVE all existing values and add ONLY these** (comma-separated, NO spaces):
```
ChildWellness:///logout,childwellness://logout,com.anonymous.ChildWellness://logout
```

**IMPORTANT:** 
- The actual logout URI will be `ChildWellness:///logout` (capital C/W, three slashes)
- Make sure these are **logout** URLs, NOT callback URLs!
- Do NOT copy the callback URLs here - they must end with `/logout`

**DO NOT include:**
- ❌ `https://child-wellness.us.auth0.com://callback` (malformed URL)
- ❌ Incomplete entries like `child-`

## Steps to Add in Auth0 Dashboard

1. Go to: https://manage.auth0.com/dashboard/us/child-wellness/applications/mVqiDhhSeBZ3BGUddxCvqheVb0VJcaGC/settings
2. Scroll down to **"Application URIs"** section
3. In **"Allowed Callback URLs"**, add the callback URLs above (comma-separated)
4. In **"Allowed Logout URLs"**, add the logout URLs above (comma-separated)
5. Click **"Save"** button at the bottom
6. Try logging in again

## Notes

- `childwellness://callback` - Main app scheme (from app.json)
- `com.anonymous.ChildWellness://callback` - Android package-based scheme (for native builds)
- `exp://...` - Expo Go development URLs (if using Expo Go)

Make sure there are **NO trailing spaces** and the URLs match **exactly** as shown above.

