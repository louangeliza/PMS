// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
// router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
// Add to your authRoutes.js temporarily
router.post('/verify-password', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const match = await bcrypt.compare(password.trim(), user.password);
      res.json({
        match,
        storedHash: user.password,
        testHash: await bcrypt.hash(password.trim(), 10)
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
