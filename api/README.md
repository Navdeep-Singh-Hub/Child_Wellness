# The Builder API

Backend API for Level 3 Session 1 - The Builder learning module.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=mongodb://localhost:27017/childwellness
PORT=3000
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### POST /api/check-drawing

Analyzes a notebook image using OpenAI Vision API.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file), `userId` (optional), `sessionId` (optional)

**Response:**
```json
{
  "catWordDetected": true,
  "circleDetected": true,
  "catDrawingDetected": true
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

**Collection:** `sessionresults`

```javascript
{
  userId: String,
  sessionId: String,
  gamesCompleted: Number,
  catWordDetected: Boolean,
  circleDetected: Boolean,
  catDrawingDetected: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 3000)
