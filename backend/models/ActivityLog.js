import mongoose, { Schema } from 'mongoose';

/**
 * Event-based time tracking for admin analytics.
 * Client sends: session_start, session_end, game_start, game_end, game_complete.
 * We compute durationMs on end events or from game logs.
 */
const ActivityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventType: {
      type: String,
      enum: ['session_start', 'session_end', 'game_start', 'game_end', 'game_complete', 'therapy_view'],
      required: true,
      index: true,
    },
    therapy: { type: String, index: true }, // speech | occupational | special-education | daily-activities | therapy-avatar
    gameKey: { type: String, index: true },
    level: { type: Number, index: true },
    session: { type: Number, index: true },
    durationMs: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  {
    timestamps: true,
    timeseries: false,
  }
);

// Compound indexes for analytics queries
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ therapy: 1, createdAt: -1 });
ActivityLogSchema.index({ eventType: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1, therapy: 1, createdAt: -1 });

export const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
