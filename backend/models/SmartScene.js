import mongoose, { Schema } from 'mongoose';

const SceneMetaSchema = new Schema(
  {
    ageMin: { type: Number, default: null },
    ageMax: { type: Number, default: null },
    theme: { type: String, default: null },
    langTags: [{ type: String }],
  },
  { _id: false },
);

const SmartSceneSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    meta: { type: SceneMetaSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const SmartScene =
  mongoose.models.SmartScene || mongoose.model('SmartScene', SmartSceneSchema);

