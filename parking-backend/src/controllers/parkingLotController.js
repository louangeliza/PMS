// src/controllers/parkingLotController.js
const { ParkingLot } = require('../models/User'); // Import ParkingLot model

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

const getParkingLots = async (req, res) => {
  try {
    // Fetch all parking lots from the database
    const parkingLots = await ParkingLot.find();

    res.status(200).json(parkingLots);
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    res.status(500).json({ error: 'Server error: Could not fetch parking lots' });
  }
};

module.exports = {
  addParkingLot,
  getParkingLots,
};