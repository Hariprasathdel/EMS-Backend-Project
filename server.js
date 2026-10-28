/**
 * Employee Management System — Backend Server
 * Entry point: initializes Express, middleware, routes, DB, and error handling.
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// ------------------------------------------------------------------
// 1. Environment validation (fail fast if critical vars missing)
// ------------------------------------------------------------------
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------------------------------------
// 2. Initialize Express app
// ------------------------------------------------------------------
const app = express();

// Trust proxy (needed for rate limit + secure cookies behind reverse proxy)
app.set('trust proxy', 1);

// ------------------------------------------------------------------
// 3. Security middleware
// ------------------------------------------------------------------
app.use(helmet());

// CORS — allow React dev server & production client
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / server-to-server (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter (100 requests / 15 min per IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
  },
});
app.use('/api', globalLimiter);

// Stricter limiter for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts — try again in 15 minutes.',
  },
});

// ------------------------------------------------------------------
// 4. Body parsers & data sanitization
// ------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Prevent NoSQL injection ($gt, $ne, etc. in req.body/query/params)
app.use(mongoSanitize());

// Prevent HTTP parameter pollution (?role=admin&role=employee)
app.use(hpp());

// ------------------------------------------------------------------
// 5. Performance middleware
// ------------------------------------------------------------------
app.use(compression());

// ------------------------------------------------------------------
// 6. Logging
// ------------------------------------------------------------------
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ------------------------------------------------------------------
// 7. Health check (before auth-protected routes)
// ------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment: NODE_ENV,
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Employee Management System API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ------------------------------------------------------------------
// 8. API routes
// ------------------------------------------------------------------
// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter);
app.use('/api', routes);

// ------------------------------------------------------------------
// 9. 404 + global error handler (MUST be last)
// ------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ------------------------------------------------------------------
// 10. Start server (after DB connection)
// ------------------------------------------------------------------
let server;

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    server = app.listen(PORT, () => {
      console.log('──────────────────────────────────────────────');
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
      console.log('──────────────────────────────────────────────');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ------------------------------------------------------------------
// 11. Graceful shutdown
// ------------------------------------------------------------------
const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received — shutting down gracefully...`);

  // Stop accepting new connections
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('🛑 HTTP server closed');
  }

  // Close DB connection
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB:', err.message);
  }

  console.log('👋 Shutdown complete');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Log unhandled rejections / exceptions
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  shutdown('uncaughtException');
});

// ------------------------------------------------------------------
// 12. Boot
// ------------------------------------------------------------------
startServer();

module.exports = app; // exported for supertest