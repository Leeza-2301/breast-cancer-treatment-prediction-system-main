require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();
connectDB(); // MongoDB

// Middlewares
app.set('trust proxy', 1); // Required for Render
app.use(express.json());

app.use(cors({
  origin: [
    'https://breast-cancer-treatment-prediction-psi.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ],
  credentials: true
}));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "SEC",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on Render, false locally
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for Render, 'lax' locally
    },
  })
);

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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
