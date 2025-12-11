import mongoose from 'mongoose';

const gameEventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    gameKey: { type: String, required: true, default: 'tap_red_circle' },
    round: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('GameEvent', gameEventSchema);
