const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log');
const { jwt: jwtConfig } = require('../config/jwt');

// Helper function to clean and validate email
const validateEmail = (email) => {
  const cleanEmail = email.toString().toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Invalid email format');
  }
  return cleanEmail;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'All fields are required',
        code: 'MISSING_FIELDS' 
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Additional validation
    if (cleanPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Check for existing user
    if (await User.findOne({ email: cleanEmail })) {
      return res.status(400).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(cleanPassword, salt);

    // Create user with explicit password hashing
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hash, // Use the pre-hashed value
      role: 'user'
    });

    // Return response without sensitive data
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_FIELDS'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Find user with case-insensitive email
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') }
    });

    if (!user) {
      console.log(`Login failed: User not found for ${cleanEmail}`);
      return res.status(400).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Debug output
    console.log('Stored hash:', user.password);
    console.log('Input password:', cleanPassword);
    
    // Compare passwords
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      // Create a test hash to verify bcrypt is working
      const testHash = await bcrypt.hash('test123', 10);
      const testMatch = await bcrypt.compare('test123', testHash);
      console.log('Test hash comparison:', testMatch);

      return res.status(400).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        debug: process.env.NODE_ENV === 'development' ? {
          storedHash: user.password,
          testComparison: testMatch
        } : undefined
      });
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
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email role createdAt updatedAt');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      code: 'PROFILE_FETCH_ERROR'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    
    if (email) {
      const cleanEmail = validateEmail(email);
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ 
          error: 'Email already in use',
          code: 'EMAIL_IN_USE'
        });
      }
      updates.email = cleanEmail;
    }
    
    if (password) {
      if (password.trim().length < 6) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters',
          code: 'PASSWORD_TOO_SHORT'
        });
      }
      updates.password = await bcrypt.hash(password.trim(), 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        error: 'No updates provided',
        code: 'NO_UPDATES'
      });
    }

    updates.updatedAt = new Date();
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'name email role createdAt updatedAt' }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    await Log.create({
      user: req.user.id,
      action: 'profile_update',
      details: 'User updated profile'
    });

    res.json(updatedUser);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ 
      error: 'Failed to update profile',
      code: 'PROFILE_UPDATE_ERROR'
    });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile 
};