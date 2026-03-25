// MongoDB Schema for Session Results
const mongoose = require('mongoose');

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
SessionResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SessionResult = mongoose.model('SessionResult', SessionResultSchema);

module.exports = SessionResult;
