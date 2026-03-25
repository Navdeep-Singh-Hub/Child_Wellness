// Express Server for The Builder API
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { upload, handler: checkDrawingHandler } = require('./check-drawing');
const { upload: uploadSession2, handler: checkSession2Handler } = require('./check-session-2');
const { upload: uploadSession3, handler: checkSession3Handler } = require('./check-session-3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/childwellness';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/check-drawing', upload, checkDrawingHandler);
app.post('/api/check-session-2', uploadSession2, checkSession2Handler);
app.post('/api/check-session-3', uploadSession3, checkSession3Handler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
