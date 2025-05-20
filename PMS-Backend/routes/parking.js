const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { authenticate, authorize } = require('../middleware/auth');

// Admin routes
router.post('/create', authenticate, authorize(['admin']), parkingController.createParking);
router.post('/entry', authenticate, authorize(['admin']), parkingController.recordEntry);
router.post('/exit', authenticate, authorize(['admin']), parkingController.recordExit);

// Client routes
router.get('/available', authenticate, parkingController.getAllParking);
router.get('/entries', authenticate, parkingController.getParkingEntries);

module.exports = router; 