require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');

const app = express();

/* ---------------- DB CONNECTION (VERCEL SAFE) ---------------- */
let isConnected = false;
const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};
connectOnce();

/* ---------------- MIDDLEWARES ---------------- */
app.use(express.json());

app.use(
  cors({
    origin: [
      'https://breast-cancer-treatment-prediction-psi.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://breast-cancer-treatment-prediction-ten.vercel.app'
    ],
    credentials: true,
  })
);

/* ---------------- ROUTES ----------------️---------------- */
app.get('/', (req, res) => {
  res.json({ message: 'Backend running on Vercel 🚀' });
});

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/predict', require('../routes/predictionRoutes'));
app.use('/api/user', require('../routes/userRoutes'));
app.use('/api/treatment', require('../routes/treatmentRoutes'));
app.use('/api/treatment', require('../routes/treatmentAltRoute'));
app.use('/api/chatbot', require('../routes/chatbotRoutes'));

/* ---------------- EXPORT (IMPORTANT) ---------------- */
module.exports = app;
