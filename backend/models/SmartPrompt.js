import mongoose, { Schema } from 'mongoose';

const TTSSchema = new Schema(
  {
    prompt: {
      en: { type: String },
      hi: { type: String },
      pa: { type: String },
      ta: { type: String },
      te: { type: String },
    },
    clue: {
      en: { type: String },
      hi: { type: String },
      pa: { type: String },
      ta: { type: String },
      te: { type: String },
    },
    correct: {
      en: { type: String },
      hi: { type: String },
      pa: { type: String },
      ta: { type: String },
      te: { type: String },
    },
    retry: {
      en: { type: String },
      hi: { type: String },
      pa: { type: String },
      ta: { type: String },
      te: { type: String },
    },
  },
  { _id: false },
);

const SmartPromptSchema = new Schema(
  {
    sceneId: { type: Schema.Types.ObjectId, ref: 'SmartScene', required: true, index: true },
    type: {
      type: String,
      enum: ['find', 'label', 'category', 'function'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['tierA', 'tierB', 'tierC', 'tierD'],
      required: true,
      default: 'tierA',
    },
    payload: { type: Schema.Types.Mixed, default: () => ({}) },
    tts: { type: TTSSchema, default: () => ({}) },
  },
  { timestamps: true },
);

SmartPromptSchema.index({ sceneId: 1, difficulty: 1 });

export const SmartPrompt =
  mongoose.models.SmartPrompt || mongoose.model('SmartPrompt', SmartPromptSchema);

