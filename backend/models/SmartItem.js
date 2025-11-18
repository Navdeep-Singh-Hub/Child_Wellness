import mongoose, { Schema } from 'mongoose';

const BoundingBoxSchema = new Schema(
  {
    x: { type: Number, required: true }, // 0 - 1 relative coordinates
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
  },
  { _id: false },
);

const TTSSchema = new Schema(
  {
    en: { type: String },
    hi: { type: String },
    pa: { type: String },
    ta: { type: String },
    te: { type: String },
  },
  { _id: false },
);

const SmartItemSchema = new Schema(
  {
    sceneId: { type: Schema.Types.ObjectId, ref: 'SmartScene', required: true, index: true },
    label: { type: String, required: true },
    altLabels: [{ type: String }],
    bbox: { type: BoundingBoxSchema, required: true },
    tags: [{ type: String }],
    tts: { type: TTSSchema, default: () => ({}) },
  },
  { timestamps: true },
);

SmartItemSchema.index({ sceneId: 1, label: 1 }, { unique: false });

export const SmartItem =
  mongoose.models.SmartItem || mongoose.model('SmartItem', SmartItemSchema);

