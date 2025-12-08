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

const TherapyProgressSchema = new Schema(
  {
    therapy: {
      type: String,
      enum: [
        'speech',
        'occupational',
        'behavioral',
        'special-education',
        'daily-activities',
        'therapy-avatar',
      ],
      required: true,
    },
    levels: { type: [LevelProgressSchema], default: [] },
    currentLevel: { type: Number, default: 1 },
    currentSession: { type: Number, default: 1 },
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







