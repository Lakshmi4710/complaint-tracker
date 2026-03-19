const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Allowed origins (Frontend URLs)
const allowedOrigins = [
  'http://localhost:3000',
  'https://complaint-tracker-gjf56ml8j-lakshmi4710s-projects.vercel.app'
];

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / mobile apps

    if (!allowedOrigins.includes(origin)) {
      return callback(new Error('CORS policy: This origin is not allowed'), false);
    }

    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ❌ REMOVED problematic line
// app.options('*', cors());  <-- THIS CAUSED YOUR ERROR

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // stop app if DB fails
  });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health Check Route (VERY useful for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running 🚀' });
});

// 404 Handler (better than using '*')
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});