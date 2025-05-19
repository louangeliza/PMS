const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addVehicle, updateVehicle, deleteVehicle, getUserVehicles } = require('../controllers/vehicleController');

router.use(authenticate);

router.post('/', addVehicle);
router.get('/', getUserVehicles);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
