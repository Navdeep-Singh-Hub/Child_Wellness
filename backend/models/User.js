import mongoose, { Schema } from 'mongoose';

const RewardsSchema = new Schema({
  xp:           { type: Number, default: 0 },
  coins:        { type: Number, default: 0 },
  hearts:       { type: Number, default: 5 },
  streakDays:   { type: Number, default: 0 },
  lastPlayedDate: String, // 'YYYY-MM-DD' in Asia/Kolkata
  totalGamesPlayed: { type: Number, default: 0 },
});

const UserSchema = new Schema({
  clerkId: { type: String, index: true, unique: true },
  name: String,
  rewards: { type: RewardsSchema, default: () => ({}) },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);


