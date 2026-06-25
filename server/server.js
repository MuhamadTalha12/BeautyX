import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { stripeWebhook } from './controllers/orderController.js';
import { globalLimiter } from './middleware/security.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Trust proxy for reverse proxies (Render, Railway, etc.)
app.set('trust proxy', 1);

// Set security HTTP headers
app.use(helmet());

// Cookie parser
app.use(cookieParser());

// Sanitize data (prevent NoSQL query injection)
app.use(mongoSanitize());

// Apply global rate limiter
app.use('/api', globalLimiter);

// Stripe Webhook Endpoint (needs raw body for signature verification)
// Define this BEFORE express.json() to prevent body-parser parsing it as json first
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - configured for credential support and local dev port flexibility
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

const isVercelSubdomain = (origin) => {
  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.vercel.app');
  } catch (e) {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !isVercelSubdomain(origin)) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Fallback rewrite for missing /api prefix in client requests (handles misconfigured frontend VITE_API_URL settings)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && (req.url.startsWith('/auth') || req.url.startsWith('/products') || req.url.startsWith('/orders'))) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Test/Status Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BeautyX API Server is active and healthy.' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
