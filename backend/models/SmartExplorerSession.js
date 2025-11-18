import mongoose, { Schema } from 'mongoose';

const SmartExplorerSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['learn', 'play', 'therapy'], required: true },
    sceneId: { type: Schema.Types.ObjectId, ref: 'SmartScene', required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    difficultyStart: {
      type: String,
      enum: ['tierA', 'tierB', 'tierC', 'tierD'],
      default: 'tierA',
    },
    difficultyEnd: {
      type: String,
      enum: ['tierA', 'tierB', 'tierC', 'tierD'],
    },
    accuracy: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    totalPrompts: { type: Number, default: 0 },
    correctPrompts: { type: Number, default: 0 },
    streakAchieved: { type: Number, default: 0 },
    meta: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  { timestamps: true },
);

SmartExplorerSessionSchema.index({ userId: 1, createdAt: -1 });

export const SmartExplorerSession =
  mongoose.models.SmartExplorerSession ||
  mongoose.model('SmartExplorerSession', SmartExplorerSessionSchema);

