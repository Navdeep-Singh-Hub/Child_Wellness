import mongoose, { Schema } from 'mongoose';

const GameLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type:   { type: String, enum: ['tap', 'match', 'sort', 'emoji'], required: true },
    correct:   { type: Number, default: 0 },
    total:     { type: Number, default: 0 },
    accuracy:  { type: Number, default: 0 }, // 0..100
    xpAwarded: { type: Number, default: 0 },
    durationMs:{ type: Number, default: 0 },
    at:        { type: Date,   default: Date.now },
  },
  { _id: false }
);

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    // (keep any lesson fields if you still use them)
    lessonId: String,
    startedAt: Date,
    endedAt: Date,
    score: Number,
    accuracy: Number,
    promptsUsed: Number,
    traceJson: Schema.Types.Mixed,

    // NEW aggregated + per-game
    points: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    gameLogs: { type: [GameLogSchema], default: [] },
  },
  { timestamps: true }
);

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);
