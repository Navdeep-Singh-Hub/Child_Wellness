import mongoose, { Schema } from 'mongoose';

const CustomTileSchema = new Schema({
  id: String,          // machine id you'll speak with (e.g., 'apple' or 'my_dog')
  label: String,       // shown on tile
  emoji: String,       // optional fallback if no image
  imageUrl: String,    // optional https URL
  // Optionally: category, language, createdAt etc.
}, { _id: false });

const RewardsSchema = new Schema({
  xp:           { type: Number, default: 0 },
  coins:        { type: Number, default: 0 },
  hearts:       { type: Number, default: 5 },
  streakDays:   { type: Number, default: 0 },
  bestStreak:   { type: Number, default: 0 },
  lastPlayedDate: String, // 'YYYY-MM-DD' in Asia/Kolkata
  totalGamesPlayed: { type: Number, default: 0 },
});

const UserSchema = new Schema({
  auth0Id: { type: String, index: true, unique: true },
  email: { type: String, index: true },
  name: String,
  firstName: String,
  lastName: String,
  dob: Date, // ISO date; immutable once set via API
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: null },
  phoneCountryCode: { type: String, default: '+91' }, // Default India
  phoneNumber: { type: String, default: null }, // Phone number without country code formatting
  favorites: { type: [String], default: [] },           // store tile IDs, e.g., ['apple','go']
  customTiles: { type: [CustomTileSchema], default: [] }, // user-created tiles
  rewards: { type: RewardsSchema, default: () => ({}) },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);


