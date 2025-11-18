import mongoose, { Schema } from 'mongoose';

const SmartExplorerTurnSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'SmartExplorerSession',
      required: true,
      index: true,
    },
    promptId: { type: Schema.Types.ObjectId, ref: 'SmartPrompt', required: true },
    timestamp: { type: Date, default: Date.now },
    event: {
      type: String,
      enum: ['prompt_shown', 'tap', 'hint_used', 'prompt_resolved', 'scene_complete'],
      required: true,
    },
    data: { type: Schema.Types.Mixed, default: () => ({}) },
    correct: { type: Boolean, default: null },
  },
  { timestamps: true },
);

SmartExplorerTurnSchema.index({ sessionId: 1, timestamp: 1 });

export const SmartExplorerTurn =
  mongoose.models.SmartExplorerTurn ||
  mongoose.model('SmartExplorerTurn', SmartExplorerTurnSchema);

