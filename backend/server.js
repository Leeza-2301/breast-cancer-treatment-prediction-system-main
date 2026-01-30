require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();
connectDB(); // MongoDB

// Middlewares
app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'SEC',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    }
  })
);

// Health Check Endpoint - Test deployment
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    mongoConnected: process.env.MONGO_URI ? 'Configured' : 'Not configured',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const predictionRoutes = require('./routes/predictionRoutes');
app.use('/api/predict', predictionRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const treatmentRoutes = require("./routes/treatmentRoutes");
app.use("/api/treatment", treatmentRoutes);

const alternativeTreatmentRoutes = require("./routes/treatmentAltRoute");
app.use("/api/treatment", alternativeTreatmentRoutes);

const chatbotRoutes = require('./routes/chatbotRoutes');
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
