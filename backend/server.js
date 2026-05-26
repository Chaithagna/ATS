const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Set trust proxy to enable correct IP tracking for rate limiting (especially behind reverse proxies like Vercel or Render)
app.set('trust proxy', 1);

// Establish database connection
connectDB();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow all client domain calls for deployment flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Rate Limiter to prevent brute force API scans
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per window
  message: {
    success: false,
    error: 'Too many API requests from this source. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Mount Modular Express Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resumes', require('./routes/resumeRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/recruiter', require('./routes/recruiterRoutes'));

// Welcome and status health checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'AI ATS Resume Analyzer SaaS Engine',
    version: '1.0.0',
    mode: process.env.GEMINI_API_KEY ? 'Production (Live AI)' : 'Sandbox/Fallback (Heuristics-Based Vectors)',
    status: 'ONLINE'
  });
});

// Capture non-existent routes
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Requested endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Intercept]', err);

  const statusCode = err.name === 'ValidationError' ? 400 : (res.statusCode === 200 ? 500 : res.statusCode);
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`[ATS Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Graceful shut down
process.on('unhandledRejection', (err) => {
  console.error(`[Fatal Shutdown Check] Unhandled Rejection: ${err.message}`);
  // Safe exit
  server.close(() => process.exit(1));
});
