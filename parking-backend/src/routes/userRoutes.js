const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (requires authentication)
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;

