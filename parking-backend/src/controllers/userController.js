const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/jwt');
const { logAction } = require('../services/logService');
const { User } = require('../models/User');
const { ParkingLot } = require('../models/User');

// Register user
const register = async (req, res) => {
  const { firstname, lastname, email, password, role = 'client' } = req.body;

  try {
    // Validate required fields
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ error: 'All fields (firstname, lastname, email, password) are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
    });

    // Log the registration
    try {
      await logAction(newUser._id, 'user_registration', `User ${email} registered`);
    } catch (logError) {
      console.error('Failed to log registration:', logError);
      // Continue even if logging fails
    }

    res.status(201).json({
      id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.createdAt,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
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
      { 
        _id: user._id,
        id: user._id,  // Include both for compatibility
        email: user.email, 
        role: user.role 
      },
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
    const user = await User.findById(req.user.id).select('_id firstname lastname email role createdAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      created_at: user.createdAt
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
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

const addParkingLot = async (req, res) => {
  try {
    const { code, name, spaces, location, feePerHour } = req.body;

    // Validate required fields
    if (!code || !name || spaces === undefined || !location || feePerHour === undefined) {
      return res.status(400).json({ error: 'All parking lot details (code, name, spaces, location, feePerHour) are required' });
    }

    // Check if a parking lot with the same code already exists
    const existingParkingLot = await ParkingLot.findOne({ code });
    if (existingParkingLot) {
      return res.status(400).json({ error: `Parking lot with code ${code} already exists` });
    }

    // Create a new parking lot instance
    const newParkingLot = new ParkingLot({
      code,
      name,
      spaces,
      location,
      feePerHour,
    });

    // Save the new parking lot to the database
    await newParkingLot.save();

    // Log the action (assuming logAction is available)
    // You might want to log this action specifically for admin users
    // await logAction(req.user.id, 'add_parking_lot', `Added parking lot with code ${code}`);

    res.status(201).json(newParkingLot);
  } catch (error) {
    console.error('Error adding parking lot:', error);
    res.status(500).json({ error: 'Server error: Could not add parking lot' });
  }
};

module.exports = { register, login, getProfile, updateProfile, addParkingLot };

