import mongoose, { Schema } from 'mongoose';

const TapRoundSchema = new Schema({
  userAuth0Id: { type: String, index: true, required: true },
  targetMs:    { type: Number, required: true }, // e.g., 10000, 13000, 34000
  startedAt:   { type: Date, required: true },   // server timestamp
  finishedAt:  { type: Date },                   // when /finish received
  deltaMs:     { type: Number },                 // |(startedAt+target) - finishedAt|
  points:      { type: Number },
  status:      { type: String, enum: ['active', 'finished', 'expired'], default: 'active' },
}, { timestamps: true });

export const TapRound = mongoose.models.TapRound || mongoose.model('TapRound', TapRoundSchema);
