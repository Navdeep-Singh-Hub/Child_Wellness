import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getOverview,
  getTimeTracking,
  getGamePerformance,
  getTherapyProgress,
  getReports,
  getAIInsights,
  getUserFullJourney,
  listUsers,
  updateUserProfile,
  clearCachePrefix,
} from '../controllers/adminAnalyticsController.js';

const router = Router();

router.use(requireAdmin);

// Check admin status (used by frontend to show Admin link)
router.get('/check', (req, res) => {
  res.json({ ok: true, isAdmin: true });
});

// User overview & list
router.get('/overview', async (req, res) => {
  try {
    const data = await getOverview();
    res.json(data);
  } catch (e) {
    console.error('admin overview', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const data = await listUsers(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin users list', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.get('/users/:userId/journey', async (req, res) => {
  try {
    const data = await getUserFullJourney(req.params.userId);
    if (!data) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json(data);
  } catch (e) {
    console.error('admin user journey', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

router.patch('/users/:userId/profile', async (req, res) => {
  try {
    const updated = await updateUserProfile(req.params.userId, req.body || {});
    if (!updated) return res.status(404).json({ ok: false, error: 'User not found' });
    res.json({ ok: true, user: updated });
  } catch (e) {
    console.error('admin update user profile', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Time tracking
router.get('/time', async (req, res) => {
  try {
    const data = await getTimeTracking(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin time', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Game performance
router.get('/games', async (req, res) => {
  try {
    const data = await getGamePerformance(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin games', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Therapy progress
router.get('/therapy-progress', async (req, res) => {
  try {
    const data = await getTherapyProgress(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin therapy progress', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Reports (filters, top users, need attention, drop-offs)
router.get('/reports', async (req, res) => {
  try {
    const data = await getReports(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin reports', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// AI insights
router.get('/insights', async (req, res) => {
  try {
    const data = await getAIInsights(req.query);
    res.json(data);
  } catch (e) {
    console.error('admin insights', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Cache invalidation (optional)
router.post('/cache/clear', (req, res) => {
  try {
    clearCachePrefix('admin:');
    res.json({ ok: true, message: 'Cache cleared' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export const adminAnalyticsRouter = router;
