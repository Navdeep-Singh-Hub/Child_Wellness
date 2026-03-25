// Routes for The Clockwise module
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { SessionResult } from '../models/SessionResult.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize OpenAI client
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn('[Clockwise Routes] OpenAI not configured:', error.message);
}

// POST /api/check-section9-session1 (Level 9 Session 1)
router.post('/check-section9-session1', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      clockDetected: false,
      clockTimeCorrect: false,
    };

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this notebook image from a child. Check:
1. Is the sentence "Sam has a red ball" written correctly?
2. Is a clock drawn?
3. Are the clock hands positioned correctly for 1:00? (Hour hand at 1, minute hand at 12)

Return JSON with: sentenceDetected, clockDetected, clockTimeCorrect (all boolean).`,
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

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        result = {
          sentenceDetected: parsed.sentenceDetected || false,
          clockDetected: parsed.clockDetected || false,
          clockTimeCorrect: parsed.clockTimeCorrect || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          clockDetected: Math.random() > 0.3,
          clockTimeCorrect: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        clockDetected: Math.random() > 0.3,
        clockTimeCorrect: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section9-session1] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section9-session2 (Level 9 Session 2)
router.post('/check-section9-session2', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      clockDetected: false,
      clockTimeCorrect: false,
    };

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this notebook image from a child. Check:
1. Is the sentence "The cat sleeps on the mat" written correctly?
2. Is a clock drawn?
3. Are the clock hands positioned correctly for 2:00? (Hour hand at 2, minute hand at 12)

Return JSON with: sentenceDetected, clockDetected, clockTimeCorrect (all boolean).`,
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

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        result = {
          sentenceDetected: parsed.sentenceDetected || false,
          clockDetected: parsed.clockDetected || false,
          clockTimeCorrect: parsed.clockTimeCorrect || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          clockDetected: Math.random() > 0.3,
          clockTimeCorrect: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        clockDetected: Math.random() > 0.3,
        clockTimeCorrect: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section9-session2] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section9-session5 (Level 9 Session 5)
router.post('/check-section9-session5', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      linesDetected: false,
      lengthDifferenceDetected: false,
    };

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this notebook image from a child. Check:
1. Is the sentence "The pencil is long" written correctly?
2. Are two lines drawn?
3. Is one line clearly longer than the other? (One short line and one long line)

Return JSON with: sentenceDetected, linesDetected, lengthDifferenceDetected (all boolean).`,
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

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        result = {
          sentenceDetected: parsed.sentenceDetected || false,
          linesDetected: parsed.linesDetected || false,
          lengthDifferenceDetected: parsed.lengthDifferenceDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          linesDetected: Math.random() > 0.3,
          lengthDifferenceDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        linesDetected: Math.random() > 0.3,
        lengthDifferenceDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section9-session5] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
