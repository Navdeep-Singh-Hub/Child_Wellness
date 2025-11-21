import mongoose, { Schema } from 'mongoose';

const CustomTileSchema = new Schema({
  id: String,          // machine id you'll speak with (e.g., 'apple' or 'my_dog')
  label: String,       // shown on tile
  emoji: String,       // optional fallback if no image
  imageUrl: String,    // optional https URL
  // Optionally: category, language, createdAt etc.
}, { _id: false });

const SmartExplorerSceneStatsSchema = new Schema(
  {
    ewmaAccuracy: { type: Number, default: 0 },
    promptsSeen: { type: Number, default: 0 },
    tierUnlocked: {
      type: String,
      enum: ['tierA', 'tierB', 'tierC', 'tierD'],
      default: 'tierA',
    },
    badges: [{ type: String }],
  },
  { _id: false },
);

const SmartExplorerStatsSchema = new Schema(
  {
    totalPrompts: { type: Number, default: 0 },
    correctPrompts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    lastPlayedDate: { type: String },
    sceneMastery: {
      type: Map,
      of: SmartExplorerSceneStatsSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const SkillStatSchema = new Schema(
  {
    totalPrompts: { type: Number, default: 0 },
    correctPrompts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    avgResponseMs: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    ewmaAccuracy: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    trend: { type: Number, default: 0 },
    lastPlayedDate: { type: String },
  },
  { _id: false },
);

const QuizCategoryStatsSchema = new Schema(
  {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // 0..100
    lastPlayedDate: { type: String },
  },
  { _id: false },
);

const QuizStatsSchema = new Schema(
  {
    totalGamesPlayed: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    overallAccuracy: { type: Number, default: 0 }, // 0..100
    bestLevel: { type: Number, default: 0 }, // Highest level reached
    currentLevel: { type: Number, default: 1 }, // Current level (starts at 1)
    totalXP: { type: Number, default: 0 },
    lastPlayedDate: { type: String },
    categoryPerformance: {
      type: Map,
      of: QuizCategoryStatsSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const RewardsSchema = new Schema({
  xp:           { type: Number, default: 0 },
  coins:        { type: Number, default: 0 },
  hearts:       { type: Number, default: 5 },
  streakDays:   { type: Number, default: 0 },
  bestStreak:   { type: Number, default: 0 },
  lastPlayedDate: String, // 'YYYY-MM-DD' in Asia/Kolkata
  totalGamesPlayed: { type: Number, default: 0 },
  accuracy:     { type: Number, default: 0 }, // displayed accuracy (0..100)
  globalLevel:  { type: Number, default: 1 },
  levelLabel:   { type: String, default: 'Level 1 Explorer' },
  
  // NEW: running counters + EMA to avoid O(n) scans and to weight recency
  correctSum: { type: Number, default: 0 },
  totalSum:   { type: Number, default: 0 },
  accEMA:     { type: Number, default: 0 }, // 0..100 exponential moving average of per-game accuracy

  smartExplorer: { type: SmartExplorerStatsSchema, default: () => ({}) },
  quiz: { type: QuizStatsSchema, default: () => ({}) },
  skills: {
    type: Map,
    of: SkillStatSchema,
    default: () => ({}),
  },
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


