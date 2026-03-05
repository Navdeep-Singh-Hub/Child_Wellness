import mongoose, { Schema } from 'mongoose';

const SessionProgressSchema = new Schema(
  {
    sessionNumber: { type: Number, required: true }, // 1..10 within a level
    completedGames: { type: [String], default: [] },  // ids of games completed (max 5)
    completed: { type: Boolean, default: false },
    lastPlayedAt: { type: Date },
  },
  { _id: false },
);

const LevelProgressSchema = new Schema(
  {
    levelNumber: { type: Number, required: true }, // 1..10 within a therapy
    sessions: { type: [SessionProgressSchema], default: [] },
  },
  { _id: false },
);

// Special Education: Game progress within a level
const GameProgressSchema = new Schema(
  {
    gameNumber: { type: Number, required: true }, // 1..5 within a level
    completed: { type: Boolean, default: false },
    accuracy: { type: Number, default: 0 }, // 0..100
    lastPlayedAt: { type: Date },
  },
  { _id: false },
);

// Special Education: Session progress within a section (10 sessions per section)
const SpecialEducationSessionSchema = new Schema(
  {
    sessionNumber: { type: Number, required: true }, // 1..10 within a section
    games: { type: [GameProgressSchema], default: [] }, // 5 games per session
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

// Special Education: Section progress (Explorer, Matcher, Builder, etc. — 10 sections)
const SectionProgressSchema = new Schema(
  {
    sectionNumber: { type: Number, required: true }, // 1..10
    sessions: { type: [SpecialEducationSessionSchema], default: [] }, // 10 sessions, each with 5 games
    completed: { type: Boolean, default: false },
    unlocked: { type: Boolean, default: false },
  },
  { _id: false },
);

const TherapyProgressSchema = new Schema(
  {
    therapy: {
      type: String,
      enum: [
        'speech',
        'occupational',
        'special-education',
        'daily-activities',
        'therapy-avatar',
      ],
      required: true,
    },
    // Standard structure (for speech, occupational, etc.)
    levels: { type: [LevelProgressSchema], default: [] },
    currentLevel: { type: Number, default: 1 },
    currentSession: { type: Number, default: 1 },
    // Special Education structure (section-based): 10 sections, 10 sessions each, 5 games per session
    sections: { type: [SectionProgressSchema], default: [] },
    currentSection: { type: Number, default: 1 },
    currentSessionSE: { type: Number, default: 1 }, // Session within section (1..10)
    currentGame: { type: Number, default: 1 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const UserTherapyProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, unique: true },
    therapies: { type: [TherapyProgressSchema], default: [] },
  },
  { timestamps: true },
);

export const UserTherapyProgress =
  mongoose.models.UserTherapyProgress ||
  mongoose.model('UserTherapyProgress', UserTherapyProgressSchema);







