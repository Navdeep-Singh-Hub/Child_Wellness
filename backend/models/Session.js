import mongoose, { Schema } from 'mongoose';

const SessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  lessonId: String,
  startedAt: Date,
  endedAt: Date,
  score: Number,
  accuracy: Number,
  promptsUsed: Number,
  traceJson: Schema.Types.Mixed,
}, { timestamps: true });

export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);


