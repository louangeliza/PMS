const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { addSlots, updateSlot, deleteSlot, getSlots, getAvailableSlotsForVehicle } = require('../controllers/slotController');

router.use(authenticate);

// Admin-only routes
router.post('/bulk', authorizeRoles('admin'), addSlots);
router.put('/:id', authorizeRoles('admin'), updateSlot);
router.delete('/:id', authorizeRoles('admin'), deleteSlot);

// Available to all authenticated users
router.get('/', getSlots);
router.get('/available-for-vehicle/:vehicleId', getAvailableSlotsForVehicle);

module.exports = router;
