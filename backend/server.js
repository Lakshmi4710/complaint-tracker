const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Robust CORS configuration (works for Vercel + localhost)
const allowedOrigins = [
'http://localhost:3000',
'https://complaint-tracker-gjf56ml8j-lakshmi4710s-projects.vercel.app'
];

app.use(cors({
origin: function (origin, callback) {
if (!origin) return callback(null, true);
if (allowedOrigins.indexOf(origin) === -1) {
const msg = 'CORS policy: This origin is not allowed';
return callback(new Error(msg), false);
}
return callback(null, true);
},
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
res.json({ status: 'Server is running' });
});

// Global error handler
app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).json({
success: false,
message: 'Something went wrong!',
error: process.env.NODE_ENV === 'development' ? err.message : undefined
});
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
console.error('❌ Unhandled Rejection:', err);
server.close(() => process.exit(1));
});
