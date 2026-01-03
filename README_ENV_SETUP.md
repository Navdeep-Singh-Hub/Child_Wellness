# Environment Setup Guide

## Local Testing vs Production

This guide explains how to switch between local and production API endpoints.

## Quick Setup

### For Local Testing (Default)

**Option 1: Create `.env.local` file** (Recommended)
```bash
# Create .env.local file in project root
echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:4000" > .env.local
```

**Option 2: Use npm script**
```bash
npm run setup:local
```

**Option 3: Set in terminal** (Temporary - only for current session)
```bash
# Windows (PowerShell)
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
npm start

# Mac/Linux
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000 npm start
```

2. **Start your local backend server**:
   ```bash
   cd backend
   npm start
   # Server should run on http://localhost:4000
   ```

3. **Start Expo**:
   ```bash
   npm start
   ```

### For Production/Deployment

1. **Set environment variable in your deployment platform** (Render, Vercel, etc.):
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-app.onrender.com
   ```

2. **Or temporarily override for testing**:
   ```bash
   # Windows (PowerShell)
   $env:EXPO_PUBLIC_API_BASE_URL="https://your-app.onrender.com"
   npm start
   
   # Mac/Linux
   EXPO_PUBLIC_API_BASE_URL=https://your-app.onrender.com npm start
   ```

## Testing on Physical Devices

If testing on a physical iOS/Android device:

1. **Find your computer's local IP address**:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. **Update `.env.local`**:
   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.3:4000
   ```
   (Replace `192.168.1.3` with your actual IP)

3. **Make sure your device and computer are on the same WiFi network**

## How It Works

The app checks for `EXPO_PUBLIC_API_BASE_URL` in this order:
1. Environment variable from `.env.local` or deployment config
2. Fallback to `http://localhost:4000` (web) or `http://192.168.1.3:4000` (mobile)

## Switching Between Environments

### Option 1: Use .env.local (Recommended for Local)
- Create/update `.env.local` with your local URL
- Restart Expo dev server: `npm start`

### Option 2: Set in Terminal (Temporary)
```bash
# Windows (PowerShell)
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
npm start

# Mac/Linux
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000 npm start
```

### Option 3: Check Current Setting
The app logs the API URL on startup. Check your console for:
```
API_BASE_URL = http://localhost:4000
Platform.OS = web
```

## Verifying Configuration

1. **Check console logs** when app starts - it shows the API_BASE_URL being used
2. **Test API connection** - try logging in or accessing any API endpoint
3. **Check Network tab** in browser DevTools to see which URL is being called

## Troubleshooting

### "Network request failed"
- Make sure your backend server is running
- Check the API_BASE_URL in console logs
- Verify firewall isn't blocking the connection

### "CORS error"
- Make sure your backend allows requests from your frontend origin
- Check backend CORS configuration in `backend/server.js`

### "Connection refused"
- Backend server not running
- Wrong port number
- Wrong IP address (for physical devices)

