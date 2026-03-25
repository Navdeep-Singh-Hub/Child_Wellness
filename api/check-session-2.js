// Backend API: POST /api/check-session-2
// Analyzes notebook image using OpenAI Vision API for Session 2

const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB connection (example - adjust to your setup)
const mongoose = require('mongoose');

const SessionResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  gamesCompleted: { type: Number, default: 0 },
  batWordDetected: { type: Boolean, default: false },
  squareDetected: { type: Boolean, default: false },
  batDrawingDetected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const SessionResult = mongoose.model('SessionResult', SessionResultSchema);

async function analyzeImageWithOpenAI(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this notebook photo from a child learning to write and draw.

Check:
1. Are letters B, A, T written in sequence forming the word "BAT"?
2. Is a square shape drawn?
3. Is there a drawing resembling a bat (animal)?

Return JSON only with this format:
{
  "batWordDetected": true/false,
  "squareDetected": true/false,
  "batDrawingDetected": true/false
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback parsing
    return {
      batWordDetected: content.toLowerCase().includes('bat') && content.toLowerCase().includes('true'),
      squareDetected: content.toLowerCase().includes('square') && content.toLowerCase().includes('true'),
      batDrawingDetected: content.toLowerCase().includes('bat') && content.toLowerCase().includes('drawing') && content.toLowerCase().includes('true'),
    };
  } catch (error) {
    console.error('OpenAI Vision API Error:', error);
    throw error;
  }
}

// Express route handler
async function checkSession2Handler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const userId = req.body.userId || 'anonymous';
    const sessionId = req.body.sessionId || 'level3-session2';

    // Analyze image with OpenAI Vision
    const analysisResult = await analyzeImageWithOpenAI(imagePath);

    // Save to MongoDB
    const sessionResult = new SessionResult({
      userId,
      sessionId,
      batWordDetected: analysisResult.batWordDetected || false,
      squareDetected: analysisResult.squareDetected || false,
      batDrawingDetected: analysisResult.batDrawingDetected || false,
    });

    await sessionResult.save();

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    // Return results
    res.json({
      batWordDetected: analysisResult.batWordDetected || false,
      squareDetected: analysisResult.squareDetected || false,
      batDrawingDetected: analysisResult.batDrawingDetected || false,
    });
  } catch (error) {
    console.error('Error in checkSession2Handler:', error);
    res.status(500).json({ error: 'Failed to analyze image', details: error.message });
  }
}

// Export middleware and handler
module.exports = {
  upload: upload.single('image'),
  handler: checkSession2Handler,
};
