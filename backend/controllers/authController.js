const User = require('../models/User');
const bcrypt = require('bcryptjs');

/* ================= REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= LOGIN ================= */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ❌ No session, ❌ no JWT
    // ✅ Just return userId
    res.json({
      success: true,
      message: 'Login successful',
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= LOGOUT ================= */
const logoutUser = async (req, res) => {
  // Nothing to destroy
  res.json({ message: 'Logout successful' });
};

/* ================= GET USER ================= */
const getLoggedInUser = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getLoggedInUser,
};
