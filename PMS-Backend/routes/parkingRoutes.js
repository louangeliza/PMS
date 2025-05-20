const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addParking, updateParking, deleteParking, getParkings} = require('../controllers/parkingController');

router.use(authenticate);

router.post('/addParking', addParking);
router.get('/getParkings', getParkings);
router.put('/updateParking/:id', updateParking);
router.delete('/deleteParking/:id',deleteParking );

module.exports = router;
