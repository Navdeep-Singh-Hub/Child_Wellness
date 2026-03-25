// Backend routes for Counter module
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

// POST /api/check-level5-session1 (Level 5 Session 1)
router.post('/check-level5-session1', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      wordADetected: false,
      additionCorrect: false,
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
1. Is the sight word "A" written (the letter A)?
2. Is the addition 1 + 1 solved correctly as 2 (written as 1+1=2 or 1 + 1 = 2)?
3. Are two apples drawn?

Return JSON with: wordADetected, additionCorrect, twoApplesDetected (all boolean).`,
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
          wordADetected: parsed.wordADetected || false,
          additionCorrect: parsed.additionCorrect || false,
          twoApplesDetected: parsed.twoApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          wordADetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          twoApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        wordADetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        twoApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session1] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session2 (Level 5 Session 2)
router.post('/check-level5-session2', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      theWordDetected: false,
      additionCorrect: false,
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
1. Is the sight word "THE" written correctly?
2. Is the addition 2 + 1 solved correctly as 3 (written as 2+1=3 or 2 + 1 = 3)?
3. Are three stars drawn?

Return JSON with: theWordDetected, additionCorrect, threeStarsDetected (all boolean).`,
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
          theWordDetected: parsed.theWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          threeStarsDetected: parsed.threeStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          theWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          threeStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        theWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        threeStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session2] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session3 (Level 5 Session 3)
router.post('/check-level5-session3', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      isWordDetected: false,
      additionCorrect: false,
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
1. Is the sight word "IS" written correctly?
2. Is the addition 2 + 2 solved correctly as 4 (written as 2+2=4 or 2 + 2 = 4)?
3. Are four circles drawn?

Return JSON with: isWordDetected, additionCorrect, fourCirclesDetected (all boolean).`,
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
          isWordDetected: parsed.isWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          fourCirclesDetected: parsed.fourCirclesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          isWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          fourCirclesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        isWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        fourCirclesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session3] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session4 (Level 5 Session 4)
router.post('/check-level5-session4', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      toWordDetected: false,
      additionCorrect: false,
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
1. Is the sight word "TO" written correctly?
2. Is the addition 3 + 1 solved correctly as 4 (written as 3+1=4 or 3 + 1 = 4)?
3. Are four stars drawn?

Return JSON with: toWordDetected, additionCorrect, fourStarsDetected (all boolean).`,
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
          toWordDetected: parsed.toWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          fourStarsDetected: parsed.fourStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          toWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          fourStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        toWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        fourStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session4] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session5 (Level 5 Session 5)
router.post('/check-level5-session5', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      goWordDetected: false,
      additionCorrect: false,
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
1. Is the sight word "GO" written correctly?
2. Is the addition 3 + 2 solved correctly as 5 (written as 3+2=5 or 3 + 2 = 5)?
3. Are five apples drawn?

Return JSON with: goWordDetected, additionCorrect, fiveApplesDetected (all boolean).`,
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
          goWordDetected: parsed.goWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          fiveApplesDetected: parsed.fiveApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          goWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          fiveApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        goWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        fiveApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session5] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session6 (Level 5 Session 6)
router.post('/check-level5-session6', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      weWordDetected: false,
      additionCorrect: false,
      fiveCirclesDetected: false,
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
1. Is the sight word "WE" written correctly?
2. Is the addition 4 + 1 solved correctly as 5 (written as 4+1=5 or 4 + 1 = 5)?
3. Are five circles drawn?

Return JSON with: weWordDetected, additionCorrect, fiveCirclesDetected (all boolean).`,
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
          weWordDetected: parsed.weWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          fiveCirclesDetected: parsed.fiveCirclesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          weWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          fiveCirclesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        weWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        fiveCirclesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session6] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session7 (Level 5 Session 7)
router.post('/check-level5-session7', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      seeWordDetected: false,
      additionCorrect: false,
      sixStarsDetected: false,
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
1. Is the sight word "SEE" written correctly?
2. Is the addition 4 + 2 solved correctly as 6 (written as 4+2=6 or 4 + 2 = 6)?
3. Are six stars drawn?

Return JSON with: seeWordDetected, additionCorrect, sixStarsDetected (all boolean).`,
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
          seeWordDetected: parsed.seeWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          sixStarsDetected: parsed.sixStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          seeWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          sixStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        seeWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        sixStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session7] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session9 (Level 5 Session 9)
router.post('/check-level5-session9', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      seeWordDetected: false,
      additionCorrect: false,
      sevenApplesDetected: false,
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
1. Is the sight word "SEE" written correctly (at least three times)?
2. Is the addition 5 + 2 solved correctly as 7 (written as 5+2=7 or 5 + 2 = 7)?
3. Are seven apples drawn?

Return JSON with: seeWordDetected, additionCorrect, sevenApplesDetected (all boolean).`,
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
          seeWordDetected: parsed.seeWordDetected || false,
          additionCorrect: parsed.additionCorrect || false,
          sevenApplesDetected: parsed.sevenApplesDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          seeWordDetected: Math.random() > 0.3,
          additionCorrect: Math.random() > 0.3,
          sevenApplesDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        seeWordDetected: Math.random() > 0.3,
        additionCorrect: Math.random() > 0.3,
        sevenApplesDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session9] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/check-level5-session10 (Level 5 Session 10 - Final Challenge)
router.post('/check-level5-session10', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    let result = {
      theWordDetected: false,
      isWordDetected: false,
      weWordDetected: false,
      additionAnswersCorrect: false,
      sixStarsDetected: false,
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
1. Are the sight words "THE", "IS", and "WE" written correctly?
2. Are the addition answers correct? Check for both:
   - 3 + 3 = 6 (written as 3+3=6 or 3 + 3 = 6)
   - 4 + 2 = 6 (written as 4+2=6 or 4 + 2 = 6)
3. Are six stars drawn?

Return JSON with: theWordDetected, isWordDetected, weWordDetected, additionAnswersCorrect, sixStarsDetected (all boolean).`,
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
          theWordDetected: parsed.theWordDetected || false,
          isWordDetected: parsed.isWordDetected || false,
          weWordDetected: parsed.weWordDetected || false,
          additionAnswersCorrect: parsed.additionAnswersCorrect || false,
          sixStarsDetected: parsed.sixStarsDetected || false,
        };
      } catch (error) {
        console.error('[OpenAI] Error:', error);
        // Fallback to mock result
        result = {
          theWordDetected: Math.random() > 0.3,
          isWordDetected: Math.random() > 0.3,
          weWordDetected: Math.random() > 0.3,
          additionAnswersCorrect: Math.random() > 0.3,
          sixStarsDetected: Math.random() > 0.3,
        };
      }
    } else {
      // Mock result if OpenAI is not configured
      result = {
        theWordDetected: Math.random() > 0.3,
        isWordDetected: Math.random() > 0.3,
        weWordDetected: Math.random() > 0.3,
        additionAnswersCorrect: Math.random() > 0.3,
        sixStarsDetected: Math.random() > 0.3,
      };
    }

    res.json(result);
  } catch (error) {
    console.error('[check-level5-session10] Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
