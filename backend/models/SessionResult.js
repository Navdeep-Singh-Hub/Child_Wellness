// MongoDB schema for session results
import mongoose from 'mongoose';

const SessionResultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  gamesCompleted: {
    type: Number,
    default: 0,
  },
  // Session 1 fields
  catWordDetected: {
    type: Boolean,
    default: false,
  },
  circleDetected: {
    type: Boolean,
    default: false,
  },
  catDrawingDetected: {
    type: Boolean,
    default: false,
  },
  // Session 2 fields
  batWordDetected: {
    type: Boolean,
    default: false,
  },
  squareDetected: {
    type: Boolean,
    default: false,
  },
  batDrawingDetected: {
    type: Boolean,
    default: false,
  },
  // Session 3 fields
  dogWordDetected: {
    type: Boolean,
    default: false,
  },
  triangleDetected: {
    type: Boolean,
    default: false,
  },
  triangleEdgesDetected: {
    type: Boolean,
    default: false,
  },
  dogDrawingDetected: {
    type: Boolean,
    default: false,
  },
  // Session 4 fields
  hatWordDetected: {
    type: Boolean,
    default: false,
  },
  rectangleDetected: {
    type: Boolean,
    default: false,
  },
  rectangleProportionValid: {
    type: Boolean,
    default: false,
  },
  hatDrawingDetected: {
    type: Boolean,
    default: false,
  },
  // Session 5 fields
  sunWordDetected: {
    type: Boolean,
    default: false,
  },
  ovalDetected: {
    type: Boolean,
    default: false,
  },
  ovalCurveDetected: {
    type: Boolean,
    default: false,
  },
  sunDrawingDetected: {
    type: Boolean,
    default: false,
  },
  // Session 6 fields
  penWordDetected: {
    type: Boolean,
    default: false,
  },
  centerLineDetected: {
    type: Boolean,
    default: false,
  },
  symmetricalShapesDetected: {
    type: Boolean,
    default: false,
  },
  // Session 7 fields
  cupWordDetected: {
    type: Boolean,
    default: false,
  },
  heartShapeDetected: {
    type: Boolean,
    default: false,
  },
  mirrorSymmetryDetected: {
    type: Boolean,
    default: false,
  },
  // Session 8 fields
  catDetected: {
    type: Boolean,
    default: false,
  },
  dogDetected: {
    type: Boolean,
    default: false,
  },
  batDetected: {
    type: Boolean,
    default: false,
  },
  circleDetected: {
    type: Boolean,
    default: false,
  },
  triangleDetected: {
    type: Boolean,
    default: false,
  },
  // Session 9 fields
  catSpellingCorrect: {
    type: Boolean,
    default: false,
  },
  dogSpellingCorrect: {
    type: Boolean,
    default: false,
  },
  batSpellingCorrect: {
    type: Boolean,
    default: false,
  },
  butterflyDetected: {
    type: Boolean,
    default: false,
  },
  symmetryDetected: {
    type: Boolean,
    default: false,
  },
  // Session 10 fields
  catCorrect: {
    type: Boolean,
    default: false,
  },
  dogCorrect: {
    type: Boolean,
    default: false,
  },
  sunCorrect: {
    type: Boolean,
    default: false,
  },
  circleDetected: {
    type: Boolean,
    default: false,
  },
  squareDetected: {
    type: Boolean,
    default: false,
  },
  triangleDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 1 fields
  wordADetected: {
    type: Boolean,
    default: false,
  },
  additionCorrect: {
    type: Boolean,
    default: false,
  },
  twoApplesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 2 fields
  theWordDetected: {
    type: Boolean,
    default: false,
  },
  threeStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 3 fields
  isWordDetected: {
    type: Boolean,
    default: false,
  },
  fourCirclesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 4 fields
  toWordDetected: {
    type: Boolean,
    default: false,
  },
  fourStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 5 fields
  goWordDetected: {
    type: Boolean,
    default: false,
  },
  fiveApplesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 6 fields
  weWordDetected: {
    type: Boolean,
    default: false,
  },
  fiveCirclesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 7 fields
  seeWordDetected: {
    type: Boolean,
    default: false,
  },
  sixStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 9 fields
  sevenApplesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 5 Session 10 fields (Final Challenge)
  additionAnswersCorrect: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 1 fields (The Reader)
  sentenceDetected: {
    type: Boolean,
    default: false,
  },
  subtractionCorrect: {
    type: Boolean,
    default: false,
  },
  twoApplesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 3 fields (The Reader)
  threeStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 4 fields (The Reader)
  fourStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 5 fields (The Reader)
  fourApplesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 6 fields (The Reader)
  threeCirclesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 7 fields (The Reader)
  fiveStarsDetected: {
    type: Boolean,
    default: false,
  },
  // Level 7 Session 8 fields (The Reader)
  // Note: fiveApplesDetected is already defined for Level 5 Session 5, reused here
  // Level 7 Session 9 fields (The Reader)
  // Note: fiveStarsDetected is already defined for Level 7 Session 7, reused here
  // Level 7 Session 10 fields (The Reader - Final Challenge)
  sentence1Detected: {
    type: Boolean,
    default: false,
  },
  sentence2Detected: {
    type: Boolean,
    default: false,
  },
  fourCirclesDetected: {
    type: Boolean,
    default: false,
  },
  // Level 9 Session 1 fields (The Clockwise)
  clockDetected: {
    type: Boolean,
    default: false,
  },
  clockTimeCorrect: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const SessionResult = mongoose.models.SessionResult || mongoose.model('SessionResult', SessionResultSchema);
