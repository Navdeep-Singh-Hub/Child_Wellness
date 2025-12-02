# Backend Deployment Guide

## Testing Backend Health

### Local Testing
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/test
```

### Production Testing
Replace `YOUR_RENDER_URL` with your actual Render service URL:
```bash
curl https://YOUR_RENDER_URL/api/health
curl https://YOUR_RENDER_URL/api/test
```

## Environment Variables Required

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (defaults to 4000)

## Deployment URLs

After deployment, update your frontend environment variable:
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com
```

Make sure to:
1. Remove trailing slashes
2. Don't include `/api` in the base URL (it's added automatically)

