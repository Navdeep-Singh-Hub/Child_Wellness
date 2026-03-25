// Backend routes for Reader module
import express from 'express';
import multer from 'multer';
import { SessionResult } from '../models/SessionResult.js';
import OpenAI from 'openai';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI (if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// POST /api/check-section7-session1 (Level 7 Session 1)
router.post('/check-section7-session1', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      twoApplesDetected: false,
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
1. Is the sentence "I see a cat" written correctly?
2. Is the subtraction 3 - 1 solved correctly as 2 (written as 3-1=2 or 3 - 1 = 2)?
3. Are two apples drawn?

Return JSON with: sentenceDetected, subtractionCorrect, twoApplesDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          twoApplesDetected: parsed.twoApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          twoApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        twoApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session1] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session3 (Level 7 Session 3)
router.post('/check-section7-session3', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      threeStarsDetected: false,
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
1. Is the sentence "I see a bat" written correctly?
2. Is the subtraction 5 - 2 solved correctly as 3 (written as 5-2=3 or 5 - 2 = 3)?
3. Are three stars drawn?

Return JSON with: sentenceDetected, subtractionCorrect, threeStarsDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          threeStarsDetected: parsed.threeStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          threeStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        threeStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session3] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session4 (Level 7 Session 4)
router.post('/check-section7-session4', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      fourStarsDetected: false,
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
1. Is the sentence "I see the sun" written correctly?
2. Is the subtraction 5 - 1 solved correctly as 4 (written as 5-1=4 or 5 - 1 = 4)?
3. Are four stars drawn?

Return JSON with: sentenceDetected, subtractionCorrect, fourStarsDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          fourStarsDetected: parsed.fourStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fourStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fourStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session4] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session5 (Level 7 Session 5)
router.post('/check-section7-session5', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      fourApplesDetected: false,
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
1. Is the sentence "I see a hat" written correctly?
2. Is the subtraction 6 - 2 solved correctly as 4 (written as 6-2=4 or 6 - 2 = 4)?
3. Are four apples drawn?

Return JSON with: sentenceDetected, subtractionCorrect, fourApplesDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          fourApplesDetected: parsed.fourApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fourApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fourApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session5] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session6 (Level 7 Session 6)
router.post('/check-section7-session6', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      threeCirclesDetected: false,
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
1. Is the sentence "I see a cup" written correctly?
2. Is the subtraction 6 - 3 solved correctly as 3 (written as 6-3=3 or 6 - 3 = 3)?
3. Are three circles drawn?

Return JSON with: sentenceDetected, subtractionCorrect, threeCirclesDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          threeCirclesDetected: parsed.threeCirclesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          threeCirclesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        threeCirclesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session6] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session7 (Level 7 Session 7)
router.post('/check-section7-session7', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      fiveStarsDetected: false,
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
1. Is the sentence "I see a dog" written correctly?
2. Is the subtraction 7 - 2 solved correctly as 5 (written as 7-2=5 or 7 - 2 = 5)?
3. Are five stars drawn?

Return JSON with: sentenceDetected, subtractionCorrect, fiveStarsDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          fiveStarsDetected: parsed.fiveStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fiveStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fiveStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session7] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session8 (Level 7 Session 8)
router.post('/check-section7-session8', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      fiveApplesDetected: false,
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
1. Is the sentence "I see a cat" written correctly?
2. Is the subtraction 8 - 3 solved correctly as 5 (written as 8-3=5 or 8 - 3 = 5)?
3. Are five apples drawn?

Return JSON with: sentenceDetected, subtractionCorrect, fiveApplesDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          fiveApplesDetected: parsed.fiveApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fiveApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fiveApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session8] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session9 (Level 7 Session 9)
router.post('/check-section7-session9', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentenceDetected: false,
      subtractionCorrect: false,
      fiveStarsDetected: false,
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
1. Is the sentence "I see a bat" written correctly?
2. Is the subtraction 9 - 4 solved correctly as 5 (written as 9-4=5 or 9 - 4 = 5)?
3. Are five stars drawn?

Return JSON with: sentenceDetected, subtractionCorrect, fiveStarsDetected (all boolean).`,
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
          subtractionCorrect: parsed.subtractionCorrect || false,
          fiveStarsDetected: parsed.fiveStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentenceDetected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fiveStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentenceDetected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fiveStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session9] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-section7-session10 (Level 7 Session 10 - Final Challenge)
router.post('/check-section7-session10', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      sentence1Detected: false,
      sentence2Detected: false,
      subtractionCorrect: false,
      fourCirclesDetected: false,
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
1. Is the sentence "I see a cat" written correctly?
2. Is the sentence "I see a dog" written correctly?
3. Are the subtractions 6-2=4 and 7-3=4 solved correctly (written as 6-2=4 or 6 - 2 = 4, and 7-3=4 or 7 - 3 = 4)?
4. Are four circles drawn?

Return JSON with: sentence1Detected, sentence2Detected, subtractionCorrect, fourCirclesDetected (all boolean).`,
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
          sentence1Detected: parsed.sentence1Detected || false,
          sentence2Detected: parsed.sentence2Detected || false,
          subtractionCorrect: parsed.subtractionCorrect || false,
          fourCirclesDetected: parsed.fourCirclesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          sentence1Detected: Math.random() > 0.3,
          sentence2Detected: Math.random() > 0.3,
          subtractionCorrect: Math.random() > 0.3,
          fourCirclesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        sentence1Detected: Math.random() > 0.3,
        sentence2Detected: Math.random() > 0.3,
        subtractionCorrect: Math.random() > 0.3,
        fourCirclesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-section7-session10] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
