const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
const { jwt: jwtConfig } = require('../config/jwt');


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Enhanced validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are all required.' });
    }
    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Check for existing user
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create new user
    const user = await User.create({
      name,
      email: cleanEmail,
      password: await bcrypt.hash(cleanPassword, 10),
      role: 'user'
    });

    // Optional: Send verification email here (e.g., via a service like Nodemailer)

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Registration error:', err);  // Log full error for debugging
    res.status(500).json({ error: 'An internal server error occurred. Please try again later.', code: err.code });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.', code: 'MISSING_FIELDS' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    // Find user with case-insensitive email search
    const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });

    if (!user) {
      console.log(`Login attempt failed: No user found for email ${normalizedEmail}`);  // Server-side log
      return res.status(400).json({ error: 'Invalid credentials.', code: 'USER_NOT_FOUND' });
    }

    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!passwordMatch) {
      console.log(`Login attempt failed: Password mismatch for email ${normalizedEmail}`);  // Server-side log
      return res.status(400).json({ error: 'Invalid credentials.', code: 'PASSWORD_MISMATCH' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An internal server error occurred. Please try again later.', code: err.code });
  }
};

// The updateProfile function remains the same as before, as it wasn't directly implicated in your logs.

module.exports = { register, login, updateProfile };

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      // Check for existing email to prevent duplicates
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ error: 'Email already in use by another user.' });
      }
      updates.email = cleanEmail;
    }
    if (password && password.trim().length >= 6) {
      updates.password = await bcrypt.hash(password.trim(), 10);
    } else if (password) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided.' });
    }

    updates.updatedAt = new Date();
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'name email role createdAt updatedAt' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'profile_update',
      details: 'User updated profile'
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
  }
};

module.exports = { register, login, updateProfile };