require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const app = express();

/* ===================== DATABASE (VERCEL SAFE) ===================== */
let isConnected = false;

const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

(async () => {
  await connectOnce();
})();

/* ===================== MIDDLEWARES ===================== */
app.use(express.json());

/* ===================== CORS CONFIG (FIXED) ===================== */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://breast-cancer-treatment-prediction-ten.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// IMPORTANT for Vercel preflight
app.options('*', cors());

/* ===================== ROUTES ===================== */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend running on Vercel 🚀',
  });
});

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/predict', require('../routes/predictionRoutes'));
app.use('/api/user', require('../routes/userRoutes'));
app.use('/api/treatment', require('../routes/treatmentRoutes'));
app.use('/api/treatment', require('../routes/treatmentAltRoute'));
app.use('/api/chatbot', require('../routes/chatbotRoutes'));

/* ===================== EXPORT (REQUIRED) ===================== */
module.exports = app;
