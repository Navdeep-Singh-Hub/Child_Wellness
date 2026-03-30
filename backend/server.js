import './loadEnv.js';
import express from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { SKILL_LOOKUP } from './constants/skills.js';
import { buildInsights } from './lib/insights.js';
import { buildNextActions, buildRecommendations, computeGlobalLevel, levelLabelFor } from './lib/recommendations.js';
import { Message } from './models/Message.js';
import { Session } from './models/Session.js';
import { User } from './models/User.js';
import gameRoutes from './routes/gameRoutes.js';
import razorpayWebhookRouter from './routes/razorpayWebhook.js';
import { smartExplorerRouter } from './routes/smartExplorer.js';
import subscriptionRouter from './routes/subscription.js';
import { tapGame } from './routes/tapGame.js';
import { therapyProgressRouter } from './routes/therapyProgress.js';
import { adminAnalyticsRouter } from './routes/adminAnalytics.js';
import { ActivityLog } from './models/ActivityLog.js';
import { handleRecognizeLetter } from './routes/recognizeLetterRoute.js';
import { handleValidateLetter } from './routes/validateLetterRoute.js';

const app = express();
// Behind proxies (Vercel/Render/Nginx), respect X-Forwarded-* headers
app.set('trust proxy', true);

// Define allowed origins
const allowedOrigins = [
  'https://child-wellness.vercel.app',
  'https://games-zeta-one.vercel.app',
  'https://autismplay.in',
  'https://www.autismplay.in',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:8080',
  'http://127.0.0.1:8081', // Also allow 127.0.0.1 for web
];

const ALLOW_LAN_CORS =
  process.env.ALLOW_LAN_CORS === '1' || process.env.ALLOW_LAN_CORS === 'true';

function isPrivateLanOrigin(origin) {
  try {
    const u = new URL(origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const h = u.hostname;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
    return false;
  } catch {
    return false;
  }
}

/** CORS: whitelist + optional private LAN (Expo web at http://192.168.x.x:8081 → API :4000). */
function corsOriginAllowed(origin) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  if (ALLOW_LAN_CORS && isPrivateLanOrigin(origin)) return true;
  return false;
}

// CRITICAL: Handle OPTIONS preflight requests FIRST - before ANY other middleware
// This MUST be the absolute first middleware to catch all OPTIONS requests
app.use((req, res, next) => {
  // Handle OPTIONS preflight requests immediately
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const url = req.originalUrl || req.path;
    console.log(`[CORS] ===== OPTIONS PREFLIGHT REQUEST =====`);
    console.log(`[CORS] Origin: ${origin}`);
    console.log(`[CORS] URL: ${url}`);
    console.log(`[CORS] Allowed origins:`, allowedOrigins);
    
    // Set CORS headers for allowed origins
    if (corsOriginAllowed(origin)) {
      console.log(`[CORS] ✅ ALLOWING OPTIONS request from ${origin} to ${url}`);
      // Use writeHead to ensure headers are written before response ends
      const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
        'Access-Control-Max-Age': '86400'
      };
      console.log(`[CORS] Setting headers:`, headers);
      res.writeHead(204, headers);
      res.end();
      console.log(`[CORS] ✅ OPTIONS response sent successfully`);
      return;
    } else {
      console.warn(`[CORS] ❌ OPTIONS request from disallowed origin: ${origin || 'none'}`);
      // Still send response to prevent hanging, but without CORS headers
      res.writeHead(204);
      res.end();
      return;
    }
  }
  
  next();
});

// Also register app.options('*') as a backup (runs after middleware but before routes)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS] app.options('*') handler triggered from origin: ${origin} to ${req.originalUrl || req.path}`);
  
  if (corsOriginAllowed(origin)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }
  res.writeHead(204);
  return res.end();
});

// CORS middleware for all requests (non-OPTIONS)
// This handles CORS headers for actual API requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers for all responses if origin is allowed
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// TODO: Auth0 JWT middleware goes here
// app.use(auth0JWTMiddleware());

// ---- serve /static so the app can load uploaded images
app.use('/static', express.static(path.join(process.cwd(), 'static')));

// ---- ensure upload dir exists
const uploadDir = path.join(process.cwd(), 'static', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// ---- configure multer (save to /static/uploads)
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    console.log('Multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    console.log('Multer filename:', name);
    cb(null, name);
  },
});
const fileFilter = (_, file, cb) => {
  console.log('Multer file filter - mimetype:', file.mimetype);
  const ok = /^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype);
  console.log('Multer file filter - allowed:', ok);
  cb(ok ? null : new Error('Only image files allowed'), ok);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
});

// ---- upload route (auth required) - MUST be before express.json()
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  console.log('Upload endpoint hit');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  console.log('User ID:', req.userId);

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // public URL for the image (proxy-safe) + relative path for future-proofing
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  const host = (req.get('x-forwarded-host') || req.get('host'));
  const rel = `/static/uploads/${req.file.filename}`;
  const url = `${proto}://${host}${rel}`;
  console.log('Generated URL:', url);
  res.json({ ok: true, url, path: rel });
});

// ---- upload-task route (Farm notebook: store image + mock Vision AI check)
// AI prompt: Check for 3 objects drawn, number 3 written, C words present.
app.post('/api/upload-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    objects_detected: true,
    correct_count: true,
    c_words_present: true,
  });
});

// ---- upload-explorer-ab-task route (Level 1 Explorer Session 1: Letters A & B — write A and B, draw 1 apple)
// AI prompt: Check for letters A and B written, drawing of one apple visible.
app.post('/api/upload-explorer-ab-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! A and B and one apple!' : "Let's try again! Write A and B and draw one apple.",
    letters_detected: true,
    apple_drawing_detected: true,
  });
});

// ---- verify-scribble route (Level 1 Grip Session 1: Free Hand Control — free scribbling on paper, upload photo)
// AI prompt: Analyze the uploaded image. Check if the image contains random scribbling lines made by a child using pen/pencil/crayon. No specific shape required. Just confirm presence of free-hand strokes.
app.post('/api/verify-scribble', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — "presence of free-hand scribbling"
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great scribbling! We see your free-hand strokes!' : 'Try again. Do free scribbling on paper and upload a photo.',
  });
});

// ---- verify-scribble-boundary route (Level 1 Controlled Scribbling Session 2: scribble inside shape on paper, upload photo)
// AI prompt: Analyze the uploaded image. Determine if a child has scribbled inside a defined shape (circle/triangle). Check: 1) visible boundary shape, 2) majority of scribble inside, 3) minimal scribbling outside. SUCCESS if mostly inside, TRY AGAIN if mostly outside or unclear.
app.post('/api/verify-scribble-boundary', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — scribble mostly inside boundary
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great control! Scribble is mostly inside the shape!' : 'Try again. Scribble mostly inside a shape on paper and upload a photo.',
  });
});

// ---- verify-standing-lines route (Level 1 Standing Lines Session 4: draw vertical lines on paper, upload photo)
// AI prompt: Analyze the uploaded image. Check if it contains vertical (standing) lines drawn by hand. Criteria: 1) lines mostly straight and vertical, 2) multiple vertical strokes preferred, 3) minor tilt/imperfections OK. Ignore slight curve/wobble, uneven spacing. SUCCESS if vertical lines clearly present, TRY AGAIN if missing or mostly not vertical.
app.post('/api/verify-standing-lines', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — vertical lines present
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great straight lines!' : 'Try again. Draw standing (vertical) lines on paper and upload a photo.',
  });
});

// ---- verify-line-types route (Level 1 Sleeping/Slanting Session 5: draw sleeping + slanting lines on paper, upload photo)
// AI prompt: Analyze the uploaded image. Check if it contains both: 1) horizontal (sleeping) lines, 2) slanting (diagonal) lines. Criteria: lines mostly straight; slant can be left or right diagonal; minor imperfections OK. SUCCESS if both types present, TRY AGAIN if one or both missing.
app.post('/api/verify-line-types', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — horizontal + diagonal lines present
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great line control!' : 'Try again. Draw sleeping and slanting lines on paper and upload a photo.',
  });
});

// ---- verify-curves route (Level 1 Curved Lines Session 5: draw curved lines on paper, upload photo)
// AI prompt: Analyze the uploaded image. Check if the drawing contains curved lines (waves, arcs, circles). Criteria: lines should show curvature, imperfections allowed. SUCCESS if curved lines are detected, TRY AGAIN if no curves are recognizable.
app.post('/api/verify-curves', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect curved lines (waves, arcs, circles)
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great curve drawing!' : 'Try again. Draw curved lines (waves, circles, arcs) on paper and upload a photo.',
  });
});

// ---- verify-capital-letter route (Level 1 Session 5: write any capital letter A–Z, upload photo)
// AI prompt: Check if the image contains any recognizable uppercase English letter A–Z. Accept imperfect handwriting.
app.post('/api/verify-capital-letter', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect any uppercase A–Z letter
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great letter writing!' : 'Try again. Write any capital letter (A–Z) on paper.',
  });
});

// ---- verify-master-writing route (Level 1 Session 10 FINAL: write A–Z clearly on paper, upload photo)
// AI prompt: Check if the image contains the complete uppercase alphabet A–Z written clearly and in order. Check recognizability and sequence consistency.
app.post('/api/verify-master-writing', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — verify full A–Z, recognizability, and sequence
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Outstanding! You have mastered capital letter writing!' : 'Try again. Write A–Z clearly and in order on paper.',
  });
});

// ---- verify-free-writing route (Level 1 Session 9: write A–Z without dots, upload photo)
// AI prompt: Check if the image contains multiple uppercase letters A–Z written without dotted guides. Accept imperfect handwriting.
app.post('/api/verify-free-writing', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect multiple free-written uppercase A–Z letters
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Amazing free writing!' : 'Try again. Write A–Z without any dots or guides.',
  });
});

// ---- verify-copy-letters route (Level 1 Session 8: write 5 letters from A–Z, upload photo)
// AI prompt: Check if the image contains at least 5 recognizable uppercase English letters. Accept imperfect handwriting.
app.post('/api/verify-copy-letters', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect at least 5 uppercase letters
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great letter writing!' : 'Try again. Write any 5 letters from A–Z on paper.',
  });
});

// ---- verify-light-dots route (Level 1 Session 7: write A–Z using light dots, upload photo)
// AI prompt: Check if the image contains multiple uppercase letters written with light dotted guides. Accept imperfect handwriting.
app.post('/api/verify-light-dots', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect multiple A–Z letters with light dot guides
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great light-dot writing!' : 'Try again. Write A–Z using light dots on paper.',
  });
});

// ---- verify-az-tracing route (Level 1 Session 6: trace A–Z using dots, upload photo)
// AI prompt: Check if the image contains multiple traced uppercase English letters A–Z. Accept imperfect handwriting.
app.post('/api/verify-az-tracing', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect multiple traced uppercase A–Z letters
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great alphabet tracing!' : 'Try again. Trace letters A–Z using the dotted guides.',
  });
});

// ---- verify-straight-letters route (Level 1 Session 4: write any straight-line letter I/L/T/H/E/F on paper, upload photo)
// AI prompt: Check if the image contains any uppercase straight-line letters like I, L, T, H, E, F. Accept imperfect shapes.
app.post('/api/verify-straight-letters', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', success: false });
  }
  const mockCorrect = true; // TODO: AI vision — detect straight-line letters (I/L/T/H/E/F)
  res.json({
    success: mockCorrect,
    message: mockCorrect ? 'SUCCESS' : 'TRY AGAIN',
    feedback: mockCorrect ? 'Great letter writing!' : 'Try again. Write any letter: I, L, T, H, E, F on paper.',
  });
});

// ---- upload-explorer-cd-task route (Level 1 Explorer Session 2: Letters C & D — write C and D, draw 2 cats)
// AI prompt: Check for letters C and D written, two cats drawn.
app.post('/api/upload-explorer-cd-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! C and D and two cats!' : "Let's try again! Write C and D and draw two cats.",
    letters_detected: true,
    two_cats_detected: true,
  });
});

// ---- upload-explorer-ef-task route (Level 1 Explorer Session 3: Letters E & F — write E and F)
// AI prompt: Check for letters E and F written.
app.post('/api/upload-explorer-ef-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! E and F!' : "Let's try again! Write E and F.",
    letters_detected: true,
  });
});

// ---- upload-explorer-gh-task route (Level 1 Explorer Session 4: Letters G & H — write G and H)
// AI prompt: Check for letters G and H written.
app.post('/api/upload-explorer-gh-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! G and H!' : "Let's try again! Write G and H.",
    letters_detected: true,
  });
});

// ---- upload-explorer-ij-task route (Level 1 Explorer Session 5: Letters I & J — write I and J)
// AI prompt: Check for letters I and J written.
app.post('/api/upload-explorer-ij-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! I and J!' : "Let's try again! Write I and J.",
    letters_detected: true,
  });
});

// ---- upload-explorer-kl-task route (Level 1 Explorer Session 6: Letters K & L — write K and L)
// AI prompt: Check for letters K and L written.
app.post('/api/upload-explorer-kl-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! K and L!' : "Let's try again! Write K and L.",
    letters_detected: true,
  });
});

// ---- upload-explorer-mn-task route (Level 1 Explorer Session 7: Letters M & N — write M and N)
// AI prompt: Check for letters M and N written.
app.post('/api/upload-explorer-mn-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! M and N!' : "Let's try again! Write M and N.",
    letters_detected: true,
  });
});

// ---- upload-explorer-op-task route (Level 1 Explorer Session 8: Letters O & P — write O and P)
// AI prompt: Check for letters O and P written.
app.post('/api/upload-explorer-op-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! O and P!' : "Let's try again! Write O and P.",
    letters_detected: true,
  });
});

// ---- upload-explorer-master-task route (Level 1 Explorer Session 10: Explorer Master — write A B C, draw 10 stars)
// AI prompt: Check for letters A/B/C written, number 10 or ten stars, drawing present.
app.post('/api/upload-explorer-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Amazing! You completed Explorer Master!' : "Let's try again! Write A, B, C and draw 10 stars.",
    letters_detected: true,
    numbers_detected: true,
    drawing_detected: true,
  });
});

// ---- upload-explorer-qr-task route (Level 1 Explorer Session 9: Letters Q & R — write Q and R)
// AI prompt: Check for letters Q and R written.
app.post('/api/upload-explorer-qr-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job! Q and R!' : "Let's try again! Write Q and R.",
    letters_detected: true,
  });
});

// ---- upload-builder-s1-red-task route (Level 3 Builder Session 1: Find something RED — real-world task)
// AI prompt: Check if the photo contains a red object (red object visible, e.g. on table).
app.post('/api/upload-builder-s1-red-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! You found something red!' : 'TRY AGAIN. Find something red and place it on a table.',
  });
});

// ---- upload-builder-s2-circle-task route (Level 3 Builder Session 2: Draw a CIRCLE — real-world task)
// AI prompt: Verify if the photo contains a circle drawing (hand-drawn or digital circle on paper/surface).
app.post('/api/upload-builder-s2-circle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see your circle!' : 'TRY AGAIN. Draw a circle on paper and take a photo.',
  });
});

// ---- upload-builder-s3-three-objects-task route (Level 3 Builder Session 3: Place 3 objects — real-world task)
// AI prompt: Count objects in the photo; return success if approximately 3 objects are visible on a table/surface.
app.post('/api/upload-builder-s3-three-objects-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see 3 objects!' : 'TRY AGAIN. Place 3 objects on a table and take a photo.',
    object_count: mockCorrect ? 3 : 0,
  });
});

// ---- upload-builder-s4-blue-task route (Level 3 Builder Session 4: Show something BLUE — real-world task)
// AI prompt: Verify if the photo contains a blue colored object.
app.post('/api/upload-builder-s4-blue-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see something blue!' : 'TRY AGAIN. Show something blue and take a photo.',
  });
});

// ---- upload-builder-s5-three-fingers-task route (Level 3 Builder Session 5: Show THREE fingers — real-world task)
// AI prompt: Check hand gesture for 3 fingers visible (e.g. hand showing 3 fingers).
app.post('/api/upload-builder-s5-three-fingers-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see three fingers!' : 'TRY AGAIN. Show three fingers to the camera.',
  });
});

// ---- upload-builder-s6-two-books-task route (Level 3 Builder Session 6: Place TWO books together — real-world task)
// AI prompt: Check if the photo contains two books (placed together).
app.post('/api/upload-builder-s6-two-books-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see two books!' : 'TRY AGAIN. Place two books together and take a photo.',
    book_count: mockCorrect ? 2 : 0,
  });
});

// ---- upload-builder-s7-square-task route (Level 3 Builder Session 7: Show a SQUARE object — AI verifies square shape)
app.post('/api/upload-builder-s7-square-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify square shape in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see a square!' : 'TRY AGAIN. Show a square object and take a photo.',
  });
});

// ---- upload-builder-s8-smile-task route (Level 3 Builder Session 8: Smile and take a photo — AI facial emotion detection)
app.post('/api/upload-builder-s8-smile-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI facial emotion detection to verify smile
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see your smile!' : 'TRY AGAIN. Smile and take a photo.',
  });
});

// ---- upload-builder-s9-rectangle-task route (Level 3 Builder Session 9: Show a RECTANGLE object — AI verifies rectangle shape)
app.post('/api/upload-builder-s9-rectangle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify rectangle shape in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see a rectangle!' : 'TRY AGAIN. Show a rectangle object and take a photo.',
  });
});

// ---- upload-builder-s10-three-in-line-task route (Level 3 Builder Session 10: Arrange THREE objects in a straight line — AI checks alignment and object count)
app.post('/api/upload-builder-s10-three-in-line-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects and alignment in a straight line
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! Three objects in a line!' : 'TRY AGAIN. Arrange three objects in a straight line and take a photo.',
  });
});

// ---- upload-counter-s1-three-in-line-task route (Level 5 Counter Session 1: Place THREE objects in a straight line — AI verifies count + alignment)
app.post('/api/upload-counter-s1-three-in-line-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects and alignment in a straight line
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! Three objects in a line!' : 'TRY AGAIN. Place three objects in a straight line on a table and take a photo.',
  });
});

// ---- upload-counter-s2-two-books-stacked-task route (Level 5 Counter Session 2: Show TWO books stacked — AI verifies two books stacked)
app.post('/api/upload-counter-s2-two-books-stacked-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify two books stacked on top of each other
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! Two books stacked!' : 'TRY AGAIN. Show two books stacked on top of each other and take a photo.',
  });
});

// ---- upload-counter-s3-triangle-task route (Level 5 Counter Session 3: Show a TRIANGLE shape — AI checks triangular shape)
app.post('/api/upload-counter-s3-triangle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify triangular shape in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see a triangle!' : 'TRY AGAIN. Show a triangle shape you can find around you and take a photo.',
  });
});

// ---- upload-counter-s4-same-color-task route (Level 5 Counter Session 4: Show THREE objects of the SAME color — AI checks color similarity)
app.post('/api/upload-counter-s4-same-color-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + same/similar color
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see three objects of the same color!' : 'TRY AGAIN. Show three objects that are the same color.',
  });
});

// ---- upload-counter-s5-round-task route (Level 5 Counter Session 5: Take a photo of something ROUND — AI verifies circular object)
app.post('/api/upload-counter-s5-round-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify circular/round object in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see something round!' : 'TRY AGAIN. Take a photo of something round.',
  });
});

// ---- upload-counter-s6-four-fingers-task route (Level 5 Counter Session 6: Show FOUR fingers — AI detects hand gesture)
app.post('/api/upload-counter-s6-four-fingers-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify hand gesture / 4 fingers
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see four fingers!' : 'TRY AGAIN. Show four fingers in the photo.',
  });
});

// ---- upload-counter-s7-two-far-apart-task route (Level 5 Counter Session 7: Place TWO objects far apart — AI checks spacing)
app.post('/api/upload-counter-s7-two-far-apart-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 2 objects + far apart / spacing
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see two objects far apart!' : 'TRY AGAIN. Place two objects with space between them.',
  });
});

// ---- upload-counter-s8-green-task route (Level 5 Counter Session 8: Show something GREEN — AI detects green object)
app.post('/api/upload-counter-s8-green-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify green object in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see something green!' : 'TRY AGAIN. Show something green in the photo.',
  });
});

// ---- upload-counter-s9-triangle-layout-task route (Level 5 Counter Session 9: Arrange THREE objects in a triangle shape — AI verifies triangle layout)
app.post('/api/upload-counter-s9-triangle-layout-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + triangle layout
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see three objects in a triangle!' : 'TRY AGAIN. Arrange three objects in a triangle shape.',
  });
});

// ---- upload-counter-s10-tower-3-task route (Level 5 Counter Session 10: Build a small tower using THREE objects — AI checks vertical stacking)
app.post('/api/upload-counter-s10-tower-3-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + vertical stacking
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'SUCCESS! We see a 3-object tower!' : 'TRY AGAIN. Stack three objects into a small tower and take a photo.',
  });
});

// ---- upload-reader-s1-three-different-line-task route (Level 7 Reader Session 1: Place THREE different objects in a straight line — AI checks count + alignment)
app.post('/api/upload-reader-s1-three-different-line-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + straight alignment + different objects
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three different objects in a straight line!'
      : 'TRY AGAIN. Place three different objects in a straight line and take a photo.',
  });
});

// ---- upload-reader-s2-same-color-task route (Level 7 Reader Session 2: Show TWO objects of the same color — AI verifies color similarity)
app.post('/api/upload-reader-s2-same-color-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 2 objects + color similarity
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see two objects of the same color!'
      : 'TRY AGAIN. Show two objects that are the same color and take a photo.',
  });
});

// ---- upload-reader-s3-square-layout-task route (Level 7 Reader Session 3: Arrange FOUR objects in a square shape — AI checks square layout)
app.post('/api/upload-reader-s3-square-layout-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 4 objects + square layout
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see four objects in a square shape!'
      : 'TRY AGAIN. Arrange four objects in a square shape and take a photo.',
  });
});

// ---- upload-reader-s4-round-square-task route (Level 7 Reader Session 4: Show something ROUND and something SQUARE together — AI detects both shapes)
app.post('/api/upload-reader-s4-round-square-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify round + square objects in image
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see something round and something square!'
      : 'TRY AGAIN. Show something round and something square together in one photo.',
  });
});

// ---- upload-reader-s5-stack-3-vertical-task route (Level 7 Reader Session 5: Stack THREE objects vertically — AI verifies vertical stacking)
app.post('/api/upload-reader-s5-stack-3-vertical-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + vertical stacking
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three objects stacked vertically!'
      : 'TRY AGAIN. Stack three objects on top of each other and take a photo.',
  });
});

// ---- upload-reader-s6-two-far-one-middle-task route (Level 7 Reader Session 6: Place TWO objects far apart and ONE in the middle — AI verifies arrangement)
app.post('/api/upload-reader-s6-two-far-one-middle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 2 far apart + 1 in middle
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see two objects far apart and one in the middle!'
      : 'TRY AGAIN. Place two objects far apart and one object in the middle, then take a photo.',
  });
});

// ---- upload-reader-s7-three-different-sizes-task route (Level 7 Reader Session 7: THREE objects of different sizes — AI checks size variation)
app.post('/api/upload-reader-s7-three-different-sizes-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + size variation
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three objects of different sizes!'
      : 'TRY AGAIN. Take a photo showing three objects of different sizes (e.g. small, medium, large).',
  });
});

// ---- upload-reader-s8-triangle-layout-task route (Level 7 Reader Session 8: Arrange THREE objects forming a triangle — AI verifies triangle layout)
app.post('/api/upload-reader-s8-triangle-layout-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects + triangle layout
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three objects forming a triangle!'
      : 'TRY AGAIN. Arrange three objects in a triangle shape and take a photo.',
  });
});

// ---- upload-reader-s9-different-colors-task route (Level 7 Reader Session 9: Show TWO objects of different colors — AI verifies color difference)
app.post('/api/upload-reader-s9-different-colors-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 2 objects + color difference
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see two objects of different colors!'
      : 'TRY AGAIN. Show two objects that are clearly different colors.',
  });
});

// ---- upload-reader-s10-tower-four-task route (Level 7 Reader Session 10 final: Build tower using FOUR objects — AI verifies stacked vertical objects)
app.post('/api/upload-reader-s10-tower-four-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 4 objects + vertical stacking
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see a tower of four objects! Level complete!'
      : 'TRY AGAIN. Stack four objects vertically to build a tower.',
  });
});

// ---- upload-level9-s1-four-line-equal-task route (Level 9 Session 1: Place FOUR objects in straight line with equal spacing — AI verifies count + alignment)
app.post('/api/upload-level9-s1-four-line-equal-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 4 objects + straight alignment + equal spacing
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see four objects in a straight line with equal spacing!'
      : 'TRY AGAIN. Place four objects in a straight line with equal spacing.',
  });
});

// ---- upload-level9-s2-same-shape-different-colors-task route (Level 9 Session 2: Two objects same shape, different colors — AI checks shape + color)
app.post('/api/upload-level9-s2-same-shape-different-colors-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 2 objects + same shape + different colors
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see two objects with the same shape and different colors!'
      : 'TRY AGAIN. Show two objects that are the same shape but different colors.',
  });
});

// ---- upload-level9-s3-square-layout-task route (Level 9 Session 3: Arrange FOUR objects in square layout — AI verifies square arrangement)
app.post('/api/upload-level9-s3-square-layout-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 4 objects + square layout
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see four objects in a square layout!'
      : 'TRY AGAIN. Arrange four objects in a square layout.',
  });
});

// ---- upload-level9-s4-round-rectangular-task route (Level 9 Session 4: Show round and rectangular together — AI verifies both shapes)
app.post('/api/upload-level9-s4-round-rectangular-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify round + rectangular objects
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see something round and something rectangular!'
      : 'TRY AGAIN. Show something round and something rectangular together.',
  });
});

// ---- upload-level9-s6-triangle-center-task route (Level 9 Session 6: Three objects in triangle, one in center — AI verifies spatial arrangement)
app.post('/api/upload-level9-s6-triangle-center-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects in triangle + 1 in center
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three objects in a triangle and one in the center!'
      : 'TRY AGAIN. Place three objects in a triangle and one object in the center.',
  });
});

// ---- upload-level9-s7-different-shapes-task route (Level 9 Session 7: Three objects of different shapes — AI verifies shape differences)
app.post('/api/upload-level9-s7-different-shapes-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 3 objects with different shapes
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see three objects of different shapes!'
      : 'TRY AGAIN. Show three objects of different shapes.',
  });
});

// ---- upload-level9-s8-five-circle-task route (Level 9 Session 8: Five objects in a circle — AI verifies circular arrangement)
app.post('/api/upload-level9-s8-five-circle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 5 objects in circular arrangement
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see five objects in a circle!'
      : 'TRY AGAIN. Arrange five objects in a circle.',
  });
});

// ---- upload-level9-s9-same-size-task route (Level 9 Session 9: Two objects same size — AI verifies size similarity)
app.post('/api/upload-level9-s9-same-size-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify two objects of similar size
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see two objects the same size!'
      : 'TRY AGAIN. Show two objects that are the same size.',
  });
});

// ---- upload-level9-s10-tower-five-task route (Level 9 Session 10 final: Build tower with 5 objects — AI verifies stacked vertical)
app.post('/api/upload-level9-s10-tower-five-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true; // TODO: AI vision to verify 5 objects stacked vertically
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect
      ? 'SUCCESS! We see a tower of five objects!'
      : 'TRY AGAIN. Build a tower using five objects.',
  });
});

// ---- upload-ocean-task route (Ocean notebook: store image + mock Vision AI check)
// AI prompt: Check for 5 fish/similar drawn, number 5 written, rhyming words present.
app.post('/api/upload-ocean-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    objects_detected: true,
    correct_count: true,
    rhyming_words: true,
  });
});

// ---- upload-jungle-task route (Jungle notebook: store image + mock Vision AI check)
// AI prompt: Check for two rhyming words, syllables marked, drawing present.
app.post('/api/upload-jungle-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    rhymes_present: true,
    syllables_marked: true,
    drawing_present: true,
  });
});

// ---- upload-space-task route (Space notebook: store image + mock Vision AI check)
// AI prompt: Check for rockets/objects drawn, number correct, syllable words (2-3) present.
app.post('/api/upload-space-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    syllable_words_present: true,
  });
});

// ---- upload-garden-task route (Garden notebook: store image + mock Vision AI check)
// AI prompt: Check for 6 bugs drawn, number correct, or syllable segmentation present.
app.post('/api/upload-garden-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    syllable_segmentation_present: true,
  });
});

// ---- upload-grocery-task route (Grocery notebook: 9 fruits + 9 or 3 rhyming words)
// AI prompt: Check for 9 fruits drawn + number 9, or rhyming grocery words.
app.post('/api/upload-grocery-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    rhyming_words_present: true,
  });
});

// ---- upload-music-task route (Music notebook: 7 notes + 7 or 2 rhyming instrument words)
// AI prompt: Check for 7 musical notes drawn + number 7, or rhyming instrument words.
app.post('/api/upload-music-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    rhyming_words_present: true,
  });
});

// ---- upload-superhero-task route (Superhero notebook: 8 hero logos + 8 or two 3-syllable words)
// AI prompt: Check for 8 hero logos drawn + number 8, or two three-syllable words written.
app.post('/api/upload-superhero-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    syllable_words_present: true,
  });
});

// ---- upload-fairy-task route (Fairy Tale notebook: 11 mushrooms + 11 or two rhyming word pairs)
// AI prompt: Check for 11 mushrooms drawn + number 11, or rhyming word pairs written.
app.post('/api/upload-fairy-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    drawing_present: true,
    number_correct: true,
    rhyming_pairs_present: true,
  });
});

// ---- upload-celebration-task route (Session 10 Final Party: 3 cakes, 5 candles, numbers 3 and 5)
// AI prompt: Check for 3 cakes drawn, 5 candles drawn, numbers 3 and 5 written.
app.post('/api/upload-celebration-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great drawing!' : "Let's try again!",
    cakes_correct: true,
    candles_correct: true,
    numbers_written_correctly: true,
  });
});

// ---- upload-at-word-task route (Grouper Session 1: -AT word family notebook — 3 -AT words + drawings)
// AI prompt: Check for -AT words written, at least 3 words, drawings present.
app.post('/api/upload-at-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    at_words_present: true,
    three_words_present: true,
    drawings_present: true,
  });
});

// ---- upload-in-word-task route (Grouper Session 2: -IN word family notebook — 3 -IN words + drawings)
app.post('/api/upload-in-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    in_words_present: true,
    three_words_present: true,
    drawings_present: true,
  });
});

// ---- upload-un-word-task route (Grouper Session 3: -UN word family notebook — draw 3 -UN words)
app.post('/api/upload-un-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    un_objects_present: true,
    three_drawings_present: true,
  });
});

// ---- upload-mixed-word-task route (Grouper Session 4: one word per family -at, -in, -un)
app.post('/api/upload-mixed-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    at_word_present: true,
    in_word_present: true,
    un_word_present: true,
  });
});

// ---- upload-op-word-task route (Grouper Session 5: -OP word family notebook — draw top, mop, hop)
app.post('/api/upload-op-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    op_objects_present: true,
    three_drawings_present: true,
  });
});

// ---- upload-an-word-task route (Grouper Session 6: -AN word family notebook — write 3 -AN words)
app.post('/api/upload-an-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    an_words_present: true,
    three_words_present: true,
  });
});

// ---- upload-et-word-task route (Grouper Session 7: -ET word family notebook — draw pet, jet)
app.post('/api/upload-et-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    pet_drawing_present: true,
    jet_drawing_present: true,
  });
});

// ---- upload-ig-word-task route (Grouper Session 8: -IG word family notebook — write 3 -IG words)
app.post('/api/upload-ig-word-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    ig_words_present: true,
    three_words_present: true,
  });
});

// ---- upload-family-challenge-task route (Grouper Session 9: Family Sorting Challenge — write 5 rhyming words)
app.post('/api/upload-family-challenge-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    rhyming_words_present: true,
    five_words_present: true,
  });
});

// ---- upload-grouper-master-task route (Grouper Session 10: one word from -at, -in, -un, -op)
app.post('/api/upload-grouper-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    at_word_present: true,
    in_word_present: true,
    un_word_present: true,
    op_word_present: true,
  });
});

// ---- upload-preposition-in-task route (Logic Lab Session 1: draw ball IN box — box, ball, ball inside box)
// AI prompt: Check for box drawn, ball drawn, ball inside box.
app.post('/api/upload-preposition-in-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    box_detected: true,
    ball_detected: true,
    ball_inside_box: true,
  });
});

// ---- upload-preposition-on-task route (Logic Lab Session 2: draw book ON table — table, book, book on table)
// AI prompt: Check for table drawn, book drawn, book on top of table.
app.post('/api/upload-preposition-on-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    table_detected: true,
    book_detected: true,
    book_on_table: true,
  });
});

// ---- upload-preposition-under-task route (Logic Lab Session 3: draw cat UNDER table — table, cat, cat under table)
// AI prompt: Check for table drawn, cat drawn, cat positioned under table.
app.post('/api/upload-preposition-under-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    table_detected: true,
    cat_detected: true,
    cat_under_table: true,
  });
});

// ---- upload-preposition-next-to-task route (Logic Lab Session 4: draw two objects next to each other)
// AI prompt: Check for two objects drawn, objects positioned next to each other.
app.post('/api/upload-preposition-next-to-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    two_objects_detected: true,
    objects_next_to_each_other: true,
  });
});

// ---- upload-preposition-behind-task route (Logic Lab Session 5: draw boy behind tree — tree, boy, boy behind tree)
// AI prompt: Check for tree drawn, boy drawn, boy positioned behind tree.
app.post('/api/upload-preposition-behind-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    tree_detected: true,
    boy_detected: true,
    boy_behind_tree: true,
  });
});

// ---- upload-preposition-between-task route (Logic Lab Session 6: draw object between two objects)
// AI prompt: Check for two outer objects drawn, third object between them.
app.post('/api/upload-preposition-between-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    two_outer_objects_detected: true,
    object_between_detected: true,
  });
});

// ---- upload-preposition-review-task route (Logic Lab Session 7: draw three objects, different positions)
// AI prompt: Check for at least three objects drawn, different positions (in/on/under/etc).
app.post('/api/upload-preposition-review-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    three_objects_detected: true,
    different_positions_detected: true,
  });
});

// ---- upload-pattern-builder-task route (Logic Lab Session 8: draw pattern of shapes)
// AI prompt: Check for multiple shapes drawn, repeating pattern.
app.post('/api/upload-pattern-builder-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    pattern_detected: true,
    multiple_shapes_detected: true,
  });
});

// ---- upload-sequence-master-task route (Logic Lab Session 9: draw sequence of 3 actions)
// AI prompt: Check for three actions drawn, sequence/order represented.
app.post('/api/upload-sequence-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    three_actions_detected: true,
    sequence_detected: true,
  });
});

// ---- upload-logic-lab-master-task route (Logic Lab Session 10: draw 3 objects, different prepositions)
// AI prompt: Check for objects detected, correct spatial relations, pattern/sequence when required.
app.post('/api/upload-logic-lab-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    objects_detected: true,
    correct_spatial_relation: true,
    pattern_or_sequence_detected: true,
  });
});

// ---- upload-safety-signs-task route (The Citizen Session 1: draw STOP sign)
// AI prompt: Check for STOP sign drawn, shape recognizable.
app.post('/api/upload-safety-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    stop_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-public-place-signs-task route (The Citizen Session 2: draw restroom sign)
// AI prompt: Check for restroom sign drawn, symbol recognizable.
app.post('/api/upload-public-place-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    restroom_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-direction-signs-task route (The Citizen Session 3: draw EXIT sign)
// AI prompt: Check for EXIT sign drawn, text or symbol recognizable.
app.post('/api/upload-direction-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    exit_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-store-signs-task route (The Citizen Session 4: draw OPEN sign)
// AI prompt: Check for OPEN sign drawn, text or symbol recognizable.
app.post('/api/upload-store-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    open_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-traffic-signs-task route (The Citizen Session 5: draw NO ENTRY sign)
// AI prompt: Check for NO ENTRY sign drawn, symbol recognizable (red circle with bar).
app.post('/api/upload-traffic-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    no_entry_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-school-signs-task route (The Citizen Session 6: draw LIBRARY sign)
// AI prompt: Check for LIBRARY sign drawn, text or symbol recognizable.
app.post('/api/upload-school-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    library_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-restaurant-signs-task route (The Citizen Session 7: draw MENU sign)
// AI prompt: Check for MENU sign drawn, text or symbol recognizable.
app.post('/api/upload-restaurant-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    menu_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-emergency-signs-task route (The Citizen Session 8: draw EXIT sign)
// AI prompt: Check for EXIT/emergency sign drawn, sign recognizable.
app.post('/api/upload-emergency-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    exit_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-community-signs-task route (The Citizen Session 9: draw BUS STOP sign)
// AI prompt: Check for BUS STOP sign drawn, text or symbol recognizable.
app.post('/api/upload-community-signs-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    bus_stop_sign_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-citizen-master-task route (The Citizen Session 10: draw two signs + one coin)
// AI prompt: Check for two recognizable signs drawn, one coin drawn, drawings valid.
app.post('/api/upload-citizen-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    two_signs_detected: true,
    coin_detected: true,
    drawing_valid: true,
  });
});

// ---- upload-graduate-conversation-task route (The Graduate Session 1: two-line conversation)
// AI prompt: writing_detected, two_lines_detected, conversation_detected.
app.post('/api/upload-graduate-conversation-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    two_lines_detected: true,
    conversation_detected: true,
  });
});

// ---- upload-graduate-story-sentences-task route (The Graduate Session 2: 3 actions in order)
// AI prompt: writing_detected, three_actions_detected, sequence_detected.
app.post('/api/upload-graduate-story-sentences-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    three_actions_detected: true,
    sequence_detected: true,
  });
});

// ---- upload-graduate-question-answer-task route (The Graduate Session 3: one question and one answer)
// AI prompt: writing_detected, question_detected, answer_detected.
app.post('/api/upload-graduate-question-answer-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    question_detected: true,
    answer_detected: true,
  });
});

// ---- upload-graduate-daily-stories-task route (The Graduate Session 4: draw a story scene)
// AI prompt: drawing_detected, story_scene_detected.
app.post('/api/upload-graduate-daily-stories-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    drawing_detected: true,
    story_scene_detected: true,
  });
});

// ---- upload-graduate-social-dialogue-task route (The Graduate Session 5: write two greetings)
// AI prompt: writing_detected, greetings_detected.
app.post('/api/upload-graduate-social-dialogue-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    greetings_detected: true,
  });
});

// ---- upload-graduate-story-understanding-task route (The Graduate Session 6: one short story sentence)
// AI prompt: writing_detected, sentence_detected.
app.post('/api/upload-graduate-story-understanding-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    sentence_detected: true,
  });
});

// ---- upload-graduate-real-life-problems-task route (The Graduate Session 7: small problem story)
// AI prompt: writing_detected, story_problem_detected.
app.post('/api/upload-graduate-real-life-problems-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    story_problem_detected: true,
  });
});

// ---- upload-graduate-dialogue-builder-task route (The Graduate Session 8: 3 lines of dialogue)
// AI prompt: writing_detected, three_lines_detected, dialogue_detected.
app.post('/api/upload-graduate-dialogue-builder-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    three_lines_detected: true,
    dialogue_detected: true,
  });
});

// ---- upload-graduate-story-problem-solver-task route (The Graduate Session 9: short story)
// AI prompt: writing_detected, story_text_detected.
app.post('/api/upload-graduate-story-problem-solver-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    story_text_detected: true,
  });
});

// ---- upload-graduate-master-task route (The Graduate Session 10: final notebook — story with numbers)
// AI prompt: writing_detected, sentence_present, numbers_present.
app.post('/api/upload-graduate-master-task', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const mockCorrect = true;
  res.json({
    correct: mockCorrect,
    feedback: mockCorrect ? 'Great job!' : "Let's try again!",
    writing_detected: true,
    sentence_present: true,
    numbers_present: true,
  });
});

// Raw body parser for Razorpay webhooks (must be before express.json)
app.use('/api/webhooks/razorpay', express.raw({ type: 'application/json' }));

// JSON middleware - MUST be after multer routes and webhook routes
// Default 100kb is too small for /api/recognize-letter (base64 PNGs from the canvas).
app.use(express.json({ limit: '12mb' }));


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Letter validation API is live — use POST (this GET is for deploy / curl checks only)
app.get('/api/validate-letter', (req, res) => {
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.json({
    ok: true,
    method: 'POST',
    path: '/api/validate-letter',
    body: {
      image: 'string (PNG base64, with or without data:image/...;base64, prefix)',
      expectedLetter: 'string A–Z',
      mimeType: 'optional, default image/png',
    },
  });
});

// Test therapy endpoint (no auth) to verify routing works
app.get('/api/therapy/test', (req, res) => {
  console.log('[THERAPY TEST] Test endpoint hit');
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.json({ ok: true, message: 'Therapy route is accessible', path: req.path });
});

// Test subscription endpoint (no auth) to verify routing works
app.get('/api/subscription/test', (req, res) => {
  console.log('[SUBSCRIPTION TEST] Test endpoint hit');
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.json({ ok: true, message: 'Subscription route is accessible', path: req.path });
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';

async function ensureUser(auth0Id, email, name) {
  // Use upsert to create or update user with Auth0 info
  const user = await User.findOneAndUpdate(
    { auth0Id },
    {
      $setOnInsert: {
        auth0Id,
        email: email || '',
        name: name || email || 'User',
        rewards: {
          xp: 0,
          coins: 0,
          hearts: 5,
          streakDays: 0,
          lastPlayedDate: null,
          totalGamesPlayed: 0
        }
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  if (user.isNew) {
    console.log(`Created new user: ${auth0Id} with email: ${email}`);
  } else {
    console.log(`Found existing user: ${auth0Id} with email: ${email}`);
  }

  return user;
}

// Replace requireAuth to extract Auth0 user info from request body or JWT
function requireAuth(req, res, next) {
  // Skip authentication for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    console.log('[REQUIRE AUTH] Skipping auth for OPTIONS request');
    return next();
  }
  
  // For now, get auth0Id from request body or headers (we'll send it from frontend)
  // TODO: In production, parse Auth0 JWT from Authorization header
  const auth0Id = req.body?.auth0Id || req.headers['x-auth0-id'] || 'auth0_test_user';
  const email = req.body?.email || req.headers['x-auth0-email'] || '';
  const name = req.body?.name || req.headers['x-auth0-name'] || '';

  console.log(`[REQUIRE AUTH] ${req.method} ${req.originalUrl || req.path} - auth0Id: ${auth0Id}`);

  req.auth0Id = auth0Id;
  req.auth0Email = email;
  req.auth0Name = name;
  req.userId = auth0Id; // Keep for backward compatibility
  next();
}
// Explicit OPTIONS handlers for specific API routes (backup)
app.options('/api/therapy/progress', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS] Explicit OPTIONS handler for /api/therapy/progress from origin: ${origin}`);
  if (corsOriginAllowed(origin)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }
  res.writeHead(204);
  return res.end();
});

// Explicit OPTIONS handlers for subscription routes (must be before routes are mounted)
app.options('/api/subscription/status', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS] Explicit OPTIONS handler for /api/subscription/status from origin: ${origin}`);
  if (corsOriginAllowed(origin)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }
  res.writeHead(204);
  return res.end();
});

app.options('/api/subscription/*', (req, res) => {
  const origin = req.headers.origin;
  console.log(`[CORS] Explicit OPTIONS handler for /api/subscription/* from origin: ${origin} to ${req.originalUrl || req.path}`);
  if (corsOriginAllowed(origin)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }
  res.writeHead(204);
  return res.end();
});

app.options('/api/validate-letter', (req, res) => {
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth0-id, x-auth0-email, x-auth0-name',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }
  res.writeHead(204);
  return res.end();
});

// Add tap game routes
app.use('/api/tap', requireAuth, tapGame);
app.use('/api/smart-explorer', requireAuth, smartExplorerRouter);

// Therapy routes with logging
app.use('/api/therapy', (req, res, next) => {
  console.log(`[THERAPY ROUTE] ${req.method} ${req.originalUrl || req.path}`);
  console.log(`[THERAPY ROUTE] Origin: ${req.headers.origin}`);
  next();
}, requireAuth, therapyProgressRouter);

app.use('/api/games', requireAuth, gameRoutes);

// OpenAI vision — handwritten uppercase letter (A–Z), forgiving recognition for children
app.post('/api/recognize-letter', requireAuth, handleRecognizeLetter);
// Copy-letter games: compares drawing to expected letter (frontend uses this)
app.post('/api/validate-letter', requireAuth, handleValidateLetter);

// Activity log (event-based time tracking for admin analytics)
app.post('/api/me/activity', requireAuth, async (req, res) => {
  try {
    const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
    const { eventType, therapy, gameKey, level, session, durationMs, meta } = req.body || {};
    if (!eventType) return res.status(400).json({ error: 'eventType required' });
    await ActivityLog.create({
      userId: user._id,
      eventType,
      therapy: therapy || undefined,
      gameKey: gameKey || undefined,
      level: level || undefined,
      session: session || undefined,
      durationMs: durationMs || 0,
      meta: meta || {},
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('activity log', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Admin analytics (requires ADMIN_AUTH0_IDS env)
app.use('/api/admin/analytics', requireAuth, adminAnalyticsRouter);

// Subscription and payment routes (require auth) with logging
app.use('/api/subscription', (req, res, next) => {
  console.log(`[SUBSCRIPTION ROUTE] ${req.method} ${req.originalUrl || req.path}`);
  console.log(`[SUBSCRIPTION ROUTE] Origin: ${req.headers.origin}`);
  next();
}, requireAuth, subscriptionRouter);

// Razorpay webhook (NO auth required - uses signature verification)
app.use('/api/webhooks', razorpayWebhookRouter);

const SKILL_ALPHA = 0.3;
const SKILL_LEVELS = [
  { level: 4, threshold: 85, minStreak: 3 },
  { level: 3, threshold: 70, minStreak: 0 },
  { level: 2, threshold: 50, minStreak: 0 },
  { level: 1, threshold: 0, minStreak: 0 },
];

function getSkillsMap(rewards = {}) {
  if (!rewards.skills) {
    rewards.skills = new Map();
  } else if (!(rewards.skills instanceof Map) && typeof rewards.skills === 'object') {
    rewards.skills = new Map(Object.entries(rewards.skills));
  }
  return rewards.skills;
}

function computeSkillLevel(accuracy, streak) {
  for (const rule of SKILL_LEVELS) {
    if (accuracy >= rule.threshold && streak >= (rule.minStreak || 0)) return rule.level;
  }
  return 1;
}

function updateSkillBucket(bucket, entry) {
  const prompts = Number(entry.prompts ?? entry.total ?? entry.totalQuestions ?? 0);
  const correct = Number(entry.correct ?? entry.correctPrompts ?? 0);
  const attempts = Number(entry.attempts ?? prompts);
  const avgResponseMs = Number(entry.avgResponseMs ?? entry.responseMs ?? 0);
  const prevAccuracy = bucket.accuracy || 0;
  const prevEwma = bucket.ewmaAccuracy || prevAccuracy;

  bucket.totalPrompts = (bucket.totalPrompts || 0) + prompts;
  bucket.correctPrompts = (bucket.correctPrompts || 0) + correct;
  bucket.attempts = (bucket.attempts || 0) + attempts;

  if (prompts > 0) {
    const sessionAcc = Math.max(0, Math.min(100, (correct / Math.max(prompts, 1)) * 100));
    bucket.accuracy =
      bucket.totalPrompts > 0
        ? Math.round((bucket.correctPrompts / bucket.totalPrompts) * 100)
        : Math.round(sessionAcc);
    bucket.ewmaAccuracy =
      prevEwma != null ? (1 - SKILL_ALPHA) * prevEwma + SKILL_ALPHA * sessionAcc : sessionAcc;

    if (avgResponseMs > 0) {
      const prevAvg = bucket.avgResponseMs || avgResponseMs;
      bucket.avgResponseMs =
        bucket.totalPrompts > 0
          ? Math.round(
            (prevAvg * (bucket.totalPrompts - prompts) + avgResponseMs * prompts) /
            Math.max(bucket.totalPrompts, 1),
          )
          : avgResponseMs;
    }

    if (sessionAcc >= 70) {
      bucket.streak = (bucket.streak || 0) + 1;
    } else {
      bucket.streak = 0;
    }
    bucket.bestStreak = Math.max(bucket.bestStreak || 0, bucket.streak || 0);
  }

  const today = new Date().toISOString().slice(0, 10);
  bucket.lastPlayedDate = today;
  bucket.level = computeSkillLevel(bucket.accuracy || 0, bucket.streak || 0);
  bucket.trend = Math.round((bucket.accuracy || 0) - prevAccuracy);
}
// app.use('/api/content', content);
// app.use('/api/utterances', utterances);

// Test endpoint for network connectivity
app.get('/api/test', (req, res) => {
  console.log('🔍 Test endpoint hit from:', req.headers['user-agent']);
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create or fetch the authenticated user immediately after verification/login
app.post('/api/users/ensure', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.body?.auth0Id || req.auth0Id;
    const email = req.body?.email || req.auth0Email;
    const name = req.body?.name || req.auth0Name;

    if (!auth0Id) {
      console.error('ensure-user: missing auth0Id', {
        headers: {
          xAuth0Id: req.headers['x-auth0-id'],
          auth: req.headers.authorization,
        },
        body: req.body,
      });
      return res.status(401).json({ ok: false, error: 'Missing auth0Id' });
    }

    const user = await ensureUser(auth0Id, email, name);
    res.json({
      ok: true,
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        rewards: user.rewards,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to ensure user:', error);
    res.status(500).json({ ok: false, error: 'Failed to ensure user' });
  }
});

// Get current user's profile
app.get('/api/me/profile', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    if (!auth0Id) {
      console.error('get-profile: missing auth0Id');
      return res.status(401).json({ error: 'Missing auth0Id' });
    }
    const user = await ensureUser(auth0Id, email, name);
    res.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      dob: user.dob || null,
      gender: user.gender || null,
      phoneCountryCode: user.phoneCountryCode || '+91',
      phoneNumber: user.phoneNumber || '',
    });
  } catch (_e) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Update current user's profile (DOB immutable once set)
app.post('/api/me/profile', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    if (!auth0Id) {
      console.error('update-profile: missing auth0Id. Headers:', {
        xAuth0Id: req.headers['x-auth0-id'],
        authHeader: req.headers.authorization,
      });
      return res.status(401).json({ ok: false, error: 'Missing auth0Id' });
    }
    const { firstName, lastName, dob, gender, phoneCountryCode, phoneNumber } = req.body || {};
    const user = await ensureUser(auth0Id, email, name);
    if (typeof firstName === 'string') user.firstName = firstName.trim();
    if (typeof lastName === 'string') user.lastName = lastName.trim();
    // Allow updating dob whenever a valid value is provided.
    // Parse strictly as YYYY-MM-DD instead of relying on Date(dob) heuristics.
    if (typeof dob === 'string' && dob.trim()) {
      const trimmed = dob.trim();
      const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) {
        const year = Number(m[1]);
        const month = Number(m[2]);
        const day = Number(m[3]);
        const parsed = new Date(Date.UTC(year, month - 1, day));
        if (!isNaN(parsed.getTime())) {
          user.dob = parsed;
        }
      }
    }
    if (gender && ['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
      user.gender = gender;
    }
    // Phone number - required and can be updated
    if (typeof phoneCountryCode === 'string' && phoneCountryCode.trim()) {
      user.phoneCountryCode = phoneCountryCode.trim();
    }
    if (typeof phoneNumber === 'string' && phoneNumber.trim()) {
      // Store only digits
      user.phoneNumber = phoneNumber.replace(/\D/g, '');
    }
    // Maintain name field as display name
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    console.error('Update profile failed:', e?.message || e, {
      stack: e?.stack,
    });
    res.status(500).json({ ok: false, error: 'Failed to update profile' });
  }
});



app.post('/api/me/game-feedback', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) return res.status(401).json({ error: 'Unauthorized' });
    const { at, mood, notes, observer } = req.body || {};
    if (!at) return res.status(400).json({ error: 'Missing timestamp' });

    const user = await ensureUser(auth0Id, req.auth0Email || '', req.auth0Name || '');
    const session = await Session.findOne({ userId: user._id });
    if (!session || !(session.gameLogs && session.gameLogs.length)) {
      return res.status(404).json({ error: 'No game logs found' });
    }

    const target = session.gameLogs.find((log) => {
      if (!log?.at) return false;
      const logISO = (log.at instanceof Date ? log.at : new Date(log.at)).toISOString();
      return logISO === new Date(at).toISOString();
    });

    if (!target) {
      return res.status(404).json({ error: 'Game log not found' });
    }

    target.feedback = {
      mood: typeof mood === 'number' ? mood : undefined,
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : undefined,
      observer: typeof observer === 'string' && observer.trim() ? observer.trim() : undefined,
    };

    await session.save();
    res.json({ ok: true });
  } catch (error) {
    console.error('game-feedback error', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});



// POST /api/me/game-log
app.post('/api/me/game-log', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) return res.status(401).json({ error: 'Unauthorized' });

    const {
      type,
      correct,
      total,
      accuracy,
      xpAwarded,
      durationMs,
      meta,
      mode,
      skillTags,
      difficulty,
      responseTimeMs,
      hintsUsed,
      incorrectAttempts,
      feedback,
    } = req.body || {};
    if (!type || typeof correct !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Get or create user to get userId (ObjectId)
    const user = await ensureUser(auth0Id, req.auth0Email || '', req.auth0Name || '');
    const userId = user._id;

    let session = await Session.findOne({ userId });
    if (!session) session = await Session.create({ userId });

    session.gameLogs.push({
      userId,
      type,
      mode: mode || meta?.mode || 'free-play',
      difficulty: difficulty || meta?.difficulty,
      skillTags: Array.isArray(skillTags || meta?.skillTags) ? (skillTags || meta?.skillTags) : [],
      level: meta?.level,
      correct,
      total,
      accuracy: Math.max(0, Math.min(100, Math.round(accuracy))),
      xpAwarded: xpAwarded || 0,
      durationMs: durationMs || 0,
      responseTimeMs: responseTimeMs || meta?.responseTimeMs || 0,
      hintsUsed: typeof hintsUsed === 'number' ? hintsUsed : meta?.hintsUsed || 0,
      incorrectAttempts: typeof incorrectAttempts === 'number' ? incorrectAttempts : meta?.incorrectAttempts || 0,
      feedback: feedback || meta?.feedback,
      at: new Date(),
      meta: meta || {},
    });

    session.points = (session.points || 0) + (xpAwarded || 0);
    session.totalGamesPlayed = (session.totalGamesPlayed || 0) + 1;

    await session.save();

    // Update accuracy using O(1) running counters + EMA (no need to scan all logs)
    const userDoc = await User.findById(userId); // we already ensured user earlier
    if (!userDoc.rewards) userDoc.rewards = {};

    // 1) Running totals
    const r = userDoc.rewards;
    r.correctSum = (r.correctSum || 0) + Number(correct || 0);
    r.totalSum = (r.totalSum || 0) + Number(total || 0);
    r.totalGamesPlayed = (r.totalGamesPlayed || 0) + 1;

    // 2) Bayesian smoothing over the lifetime data to prevent volatility on small N.
    //    Prior = Beta(α, β) ~ "expected accuracy" around 70% (tweakable).
    const alpha = 7;   // prior 'virtual' correct
    const beta = 3;   // prior 'virtual' incorrect
    const bayes = (r.correctSum + alpha) / (r.totalSum + alpha + beta); // 0..1

    // 3) Recency Exponential Moving Average on this game's accuracy.
    //    Good games nudge it up fast; bad games nudge it down fast.
    const thisGameAcc = total > 0 ? (correct / total) * 100 : 0;
    const k = 0.2; // smoothing factor (0.1 conservative, 0.3 snappier)
    r.accEMA = (r.accEMA ?? thisGameAcc) * (1 - k) + thisGameAcc * k; // in %

    // 4) Final displayed accuracy is a blend: mostly long-term (Bayes), some recent (EMA)
    const blended = 0.75 * (bayes * 100) + 0.25 * (r.accEMA || 0);
    r.accuracy = Math.round(Math.max(0, Math.min(100, blended)));

    // 5) Update quiz-specific stats if this is a quiz game
    if (type === 'quiz' && meta) {
      if (!r.quiz) r.quiz = {};
      const quiz = r.quiz;

      // Update overall quiz stats
      quiz.totalGamesPlayed = (quiz.totalGamesPlayed || 0) + 1;
      quiz.totalQuestions = (quiz.totalQuestions || 0) + Number(total || 0);
      quiz.totalCorrect = (quiz.totalCorrect || 0) + Number(correct || 0);
      quiz.totalXP = (quiz.totalXP || 0) + Number(xpAwarded || 0);

      // Update overall accuracy
      if (quiz.totalQuestions > 0) {
        quiz.overallAccuracy = Math.round((quiz.totalCorrect / quiz.totalQuestions) * 100);
      }

      // Update level tracking
      const levelReached = meta.level || 1;
      if (levelReached > (quiz.bestLevel || 0)) {
        quiz.bestLevel = levelReached;
      }
      // Update current level (use the level reached in this game)
      quiz.currentLevel = levelReached;

      // Update last played date
      const today = new Date();
      const todayYmd = today.toISOString().slice(0, 10);
      quiz.lastPlayedDate = todayYmd;

      // Update category performance
      if (meta.categoryPerformance && typeof meta.categoryPerformance === 'object') {
        if (!quiz.categoryPerformance) {
          quiz.categoryPerformance = new Map();
        } else if (!(quiz.categoryPerformance instanceof Map) && typeof quiz.categoryPerformance === 'object') {
          quiz.categoryPerformance = new Map(Object.entries(quiz.categoryPerformance));
        }

        Object.entries(meta.categoryPerformance).forEach(([category, stats]) => {
          if (stats && typeof stats === 'object') {
            const catStats = quiz.categoryPerformance.get(category) || {
              totalQuestions: 0,
              correctAnswers: 0,
              accuracy: 0,
              lastPlayedDate: todayYmd,
            };

            catStats.totalQuestions = (catStats.totalQuestions || 0) + (stats.totalQuestions || 0);
            catStats.correctAnswers = (catStats.correctAnswers || 0) + (stats.correctAnswers || 0);
            catStats.lastPlayedDate = todayYmd;

            if (catStats.totalQuestions > 0) {
              catStats.accuracy = Math.round((catStats.correctAnswers / catStats.totalQuestions) * 100);
            }

            quiz.categoryPerformance.set(category, catStats);
          }
        });
      }

      userDoc.markModified('rewards');
      userDoc.markModified('rewards.quiz');
      userDoc.markModified('rewards.quiz.categoryPerformance');
    }

    // 6) Update skill buckets when skills metadata is provided
    const skillsMap = getSkillsMap(r);

    // Process meta.skills array if provided (detailed skill breakdown)
    if (Array.isArray(meta?.skills) && meta.skills.length) {
      meta.skills.forEach((entry) => {
        const skillId = entry?.id;
        if (!skillId || !SKILL_LOOKUP[skillId]) return;
        const bucket = skillsMap.get(skillId) || {};
        updateSkillBucket(bucket, entry || {});
        skillsMap.set(skillId, bucket);
      });
      userDoc.markModified('rewards.skills');
    } else {
      // Fallback: Process skillTags to automatically create skill entries
      const tags = Array.isArray(skillTags) ? skillTags : (Array.isArray(meta?.skillTags) ? meta.skillTags : []);
      if (tags.length > 0) {
        // Map game type to default skill if no tags provided
        const typeToSkill = {
          'tap': 'timing-control',
          'match': 'color-recognition',
          'sort': 'category-sorting',
          'emoji': 'emotion-identification',
          'quiz': 'number-sense', // default, can be overridden by tags
        };

        // Use tags if provided, otherwise infer from game type
        const skillIds = tags.length > 0 ? tags : (typeToSkill[type] ? [typeToSkill[type]] : []);

        skillIds.forEach((skillId) => {
          if (!skillId || !SKILL_LOOKUP[skillId]) return;
          const bucket = skillsMap.get(skillId) || {};
          // Create skill entry from game results
          updateSkillBucket(bucket, {
            prompts: total,
            correct: correct,
            total: total,
            correctPrompts: correct,
            avgResponseMs: responseTimeMs || 0,
            attempts: total,
          });
          skillsMap.set(skillId, bucket);
        });
        userDoc.markModified('rewards.skills');
      }
    }

    // Update global level + label whenever skills change
    const globalLevel = computeGlobalLevel(skillsMap);
    r.globalLevel = globalLevel;
    r.levelLabel = levelLabelFor(globalLevel);
    userDoc.markModified('rewards');

    await userDoc.save();

    res.json({
      ok: true,
      points: session.points,
      totalGamesPlayed: session.totalGamesPlayed,
      last: session.gameLogs.at(-1),
      accuracy: r.accuracy, // send back for optional optimistic UI
      globalLevel: r.globalLevel,
    });
  } catch (e) {
    console.error('game-log error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/me/stats', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    const user = await ensureUser(auth0Id, email, name);
    const rewards = user.rewards || {};
    const skillsMap = getSkillsMap(rewards);
    let updated = false;

    let globalLevel = rewards.globalLevel;
    if (!globalLevel) {
      globalLevel = computeGlobalLevel(skillsMap);
      rewards.globalLevel = globalLevel;
      updated = true;
    }
    if (!rewards.levelLabel) {
      rewards.levelLabel = levelLabelFor(globalLevel);
      updated = true;
    }

    if (updated) {
      user.markModified('rewards');
      await user.save();
    }

    const recommendations = buildRecommendations({ skillsMap });
    const nextActions = buildNextActions({ skillsMap });

    res.json({
      xp: rewards?.xp ?? 0,
      coins: rewards?.coins ?? 0,
      hearts: rewards?.hearts ?? 5,
      streakDays: rewards?.streakDays ?? 0,
      bestStreak: rewards?.bestStreak ?? 0,
      lastPlayedDate: rewards?.lastPlayedDate ?? null,
      accuracy: rewards?.accuracy ?? 0,
      globalLevel,
      levelLabel: rewards.levelLabel,
      recommendations,
      nextActions,
    });
  } catch (error) {
    console.error('stats endpoint error', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

app.get('/api/me/skill-profile', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    const user = await ensureUser(auth0Id, email, name);
    const rewards = user.rewards || {};
    const skillsMap = getSkillsMap(rewards);

    const serializeBucket = (bucket) => {
      if (!bucket) return null;
      return {
        totalPrompts: bucket.totalPrompts || 0,
        correctPrompts: bucket.correctPrompts || 0,
        accuracy: bucket.accuracy || 0,
        avgResponseMs: bucket.avgResponseMs || 0,
        attempts: bucket.attempts || 0,
        ewmaAccuracy: bucket.ewmaAccuracy || 0,
        streak: bucket.streak || 0,
        bestStreak: bucket.bestStreak || 0,
        level: bucket.level || 1,
        trend: bucket.trend || 0,
        lastPlayedDate: bucket.lastPlayedDate || null,
      };
    };

    const payload = Object.values(SKILL_LOOKUP).map((skill) => {
      const bucket = skillsMap.get ? skillsMap.get(skill.id) : skillsMap[skill.id];
      return {
        id: skill.id,
        title: skill.title,
        description: skill.description,
        icon: skill.icon,
        tags: skill.tags,
        stats: serializeBucket(bucket),
      };
    });

    res.json({ skills: payload, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('skill-profile error', error);
    res.status(500).json({ error: 'Failed to load skill profile' });
  }
});

app.get('/api/me/insights', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    const email = req.auth0Email || '';
    const name = req.auth0Name || '';
    const range = typeof req.query?.range === 'string' ? req.query.range : '30d';
    const user = await ensureUser(auth0Id, email, name);
    const insights = await buildInsights({ userId: user._id, range, rewards: user.rewards });
    res.json(insights);
  } catch (error) {
    console.error('insights endpoint error', error);
    res.status(500).json({ error: 'Failed to load insights' });
  }
});

app.post('/api/games/record', requireAuth, async (req, res) => {
  const { pointsEarned = 10, coins = 0, xp = 10 } = req.body || {};
  const today = new Date();
  const todayYmd = today.toISOString().slice(0, 10);

  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  const rewards = user.rewards || {};

  if (rewards.lastPlayedDate) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yYmd = yesterday.toISOString().slice(0, 10);
    if (rewards.lastPlayedDate === todayYmd) {
      // same day, keep streak
    } else if (rewards.lastPlayedDate === yYmd) {
      rewards.streakDays = (rewards.streakDays || 0) + 1;
    } else {
      rewards.streakDays = 1;
    }
  } else {
    rewards.streakDays = 1;
  }

  rewards.lastPlayedDate = todayYmd;
  rewards.xp = (rewards.xp || 0) + Number(xp || pointsEarned || 0);
  rewards.coins = (rewards.coins || 0) + Number(coins || 0);
  rewards.hearts = Math.max(0, Math.min(5, rewards.hearts ?? 5));
  // Track best streak
  const currentStreak = rewards.streakDays || 0;
  const best = rewards.bestStreak || 0;
  if (currentStreak > best) {
    rewards.bestStreak = currentStreak;
  }
  user.rewards = rewards;
  await user.save();
  res.json({
    xp: rewards.xp,
    coins: rewards.coins,
    hearts: rewards.hearts,
    streakDays: rewards.streakDays,
    lastPlayedDate: rewards.lastPlayedDate,
  });
});

// Favorites
app.get('/api/me/favorites', requireAuth, async (req, res) => {
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  res.json({ favorites: user.favorites || [] });
});

app.post('/api/me/favorites/toggle', requireAuth, async (req, res) => {
  const { tileId } = req.body || {};
  if (!tileId) return res.status(400).json({ error: 'tileId required' });
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  const set = new Set(user.favorites || []);
  let isFavorite;
  if (set.has(tileId)) {
    set.delete(tileId);
    isFavorite = false;
  } else {
    set.add(tileId);
    isFavorite = true;
  }
  user.favorites = Array.from(set);
  await user.save();
  res.json({ ok: true, isFavorite, favorites: user.favorites });
});

// Custom tiles
app.get('/api/me/custom-tiles', requireAuth, async (req, res) => {
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  res.json({ tiles: user.customTiles || [] });
});

app.post('/api/me/custom-tiles', requireAuth, async (req, res) => {
  const { id, label, emoji, imageUrl } = req.body || {};
  if (!id || !label) return res.status(400).json({ error: 'id and label required' });
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  // prevent duplicates by id
  const exists = (user.customTiles || []).some(t => t.id === id);
  if (exists) return res.status(409).json({ error: 'id already exists' });
  user.customTiles.push({ id, label, emoji, imageUrl });
  await user.save();
  res.json({ ok: true, tile: { id, label, emoji, imageUrl } });
});

app.put('/api/me/custom-tiles/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { label, emoji, imageUrl } = req.body || {};
  if (!label) return res.status(400).json({ error: 'label required' });
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  const tileIndex = (user.customTiles || []).findIndex(t => t.id === id);
  if (tileIndex === -1) return res.status(404).json({ error: 'tile not found' });

  // Update the tile
  user.customTiles[tileIndex] = {
    ...user.customTiles[tileIndex],
    label,
    emoji,
    imageUrl
  };
  await user.save();
  res.json({ ok: true, tile: user.customTiles[tileIndex] });
});

app.delete('/api/me/custom-tiles/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const user = await ensureUser(req.auth0Id, req.auth0Email || '', req.auth0Name || '');
  user.customTiles = (user.customTiles || []).filter(t => t.id !== id);
  await user.save();
  res.json({ ok: true });
});

// Contact messages
app.post('/api/me/contact', requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth0Id;
    if (!auth0Id) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const { subject, message } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'message required' });
    }
    const doc = await Message.create({
      userAuth0Id: auth0Id,
      email: req.auth0Email || '',
      name: req.auth0Name || '',
      subject: subject || '',
      message: message.trim(),
    });
    res.json({ ok: true, id: doc._id });
  } catch (e) {
    console.error('contact error', e);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Global error handler - ensures CORS headers are set on error responses
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR HANDLER] Error caught:', err);
  console.error('[GLOBAL ERROR HANDLER] Request:', req.method, req.originalUrl || req.path);
  console.error('[GLOBAL ERROR HANDLER] Error stack:', err.stack);
  
  // Set CORS headers on error response
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  const errMsg = err.message || 'Internal server error';
  res.status(err.status || 500).json({
    ok: false,
    error: errMsg,
    message: errMsg,
  });
});

// 404 handler - ensures CORS headers on 404 responses
app.use((req, res) => {
  // Set CORS headers on 404 response
  const origin = req.headers.origin;
  if (corsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  const reqPath = req.originalUrl || req.path || '';
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    message: `No route for ${req.method} ${reqPath}. If you expect letter recognition, deploy or restart the latest backend (POST /api/validate-letter or /api/recognize-letter).`,
    path: reqPath,
    method: req.method,
  });
});

const port = process.env.PORT || 4000;

// Handle unhandled promise rejections to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION] Unhandled Rejection at:', promise);
  console.error('[UNHANDLED REJECTION] Reason:', reason);
  // Don't exit - log and continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION] Uncaught Exception:', error);
  console.error('[UNCAUGHT EXCEPTION] Stack:', error.stack);
  // Exit on uncaught exception to prevent undefined behavior
  process.exit(1);
});

async function startServer() {
  try {
    console.log('[SERVER] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[SERVER] ✅ Connected to MongoDB');
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[SERVER] ✅ API listening on 0.0.0.0:${port}`);
      console.log(`[SERVER] Health check: http://localhost:${port}/api/health`);
      console.log(`[SERVER] Letter validation: POST http://localhost:${port}/api/validate-letter`);
      console.log(`[SERVER] Subscription status: http://localhost:${port}/api/subscription/status`);
      if (!process.env.OPENAI_API_KEY?.trim()) {
        console.warn(
          '\n[SERVER] ⚠️  OPENAI_API_KEY is missing — copy-letter games respond with "Letter check is not set up yet".',
        );
        console.warn(
          '[SERVER]    Fix: create backend/.env with OPENAI_API_KEY=sk-... (see backend/env.example), then restart.\n',
        );
      } else {
        console.log('[SERVER] OpenAI letter check: enabled');
      }
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${port} is already in use!`);
        console.error('Please either:');
        console.error(`  1. Stop the process using port ${port}`);
        console.error(`  2. Or set a different port: PORT=4001 npm start\n`);
        process.exit(1);
      } else {
        console.error('[SERVER] Server error:', error);
        process.exit(1);
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[SERVER] SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('[SERVER] Server closed');
        mongoose.connection.close(false, () => {
          console.log('[SERVER] MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('[SERVER] ❌ MongoDB connection error:', error);
    console.error('[SERVER] Error stack:', error.stack);
    process.exit(1);
  }
}

startServer();