const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/jwt');
const { logAction } = require('../services/logService');
const User = require('../models/User');

// Register user
const register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await logAction(newUser._id, 'user_registration', `User ${email} registered`);

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user);
    console.log('Password input:', password);
    console.log('Stored hashed password:', user.password);

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password match:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    await logAction(user._id, 'user_login', `User ${email} logged in`);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('id name email role created_at');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.updated_at = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, select: 'id name email role created_at' }
    );

    await logAction(req.user.id, 'profile_update', 'User updated profile');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };

