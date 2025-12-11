import express from 'express';
import GameEvent from '../models/GameEvent.js';

const router = express.Router();

router.post('/tap-red-circle/event', async (req, res) => {
  try {
    const { userId, round, isCorrect } = req.body;

    if (!userId || typeof round !== 'number' || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const event = await GameEvent.create({
      userId,
      round,
      isCorrect,
      gameKey: 'tap_red_circle',
    });

    return res.status(201).json({ success: true, eventId: event._id });
  } catch (err) {
    console.error('Error saving game event', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
