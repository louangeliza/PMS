const Parking = require('../models/Parking');
const ParkingEntry = require('../models/ParkingEntry');
const Vehicle = require('../models/Vehicle');
const { generateTicketNumber } = require('../utils/helpers');


const updateParking = async (req, res) => {
  const { id } = req.params;
  const { parkingName, availableSpaces, location, pricePerHour,status } = req.body;

  try {
    const parking = await Parking.findById(id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    // Optional: ownership check
    // if (parking.user.toString() !== req.user.id) {
    //   return res.status(403).json({ error: 'Access denied' });
    // }

    parking.parkingName = parkingName || parking.parkingName;
    parking.availableSpaces = availableSpaces ?? parking.availableSpaces;
    parking.location = location || parking.location;
    parking.pricePerHour = pricePerHour ?? parking.pricePerHour;
    parking.status=status || parking.status;
    parking.updatedAt = new Date();

    const updatedParking = await parking.save();

    res.json(updatedParking);
 } catch (err) {
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${duplicatedField} must be unique` });
  }
  res.status(500).json({ error: err.message });
}
}


const deleteParking = async (req, res) => {
  const { id } = req.params;
  
  try {
    const parking = await Parking.findByIdAndDelete(id);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found or access denied' });
    }


    res.json({ message: 'Parking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Admin: Create new parking
const createParking = async (req, res) => {
  try {
    const { code, parkingName, totalSpaces, location, pricePerHour, adminId } = req.body;
    
    const parking = new Parking({
      code,
      parkingName,
      totalSpaces,
      availableSpaces: totalSpaces,
      location,
      pricePerHour,
      adminId
    });

    await parking.save();
    res.status(201).json({ message: 'Parking created successfully', parking });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: 'Error creating parking', error: error.message });
  }
};

// Get all parking spaces
const getAllParking = async (req, res) => {
  try {
    const parking = await Parking.find({ status: 'available' });
    res.json(parking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking spaces', error: error.message });
  }
};

// Record vehicle entry
const recordEntry = async (req, res) => {
  try {
    const { vehicleId, parkingId } = req.body;

    // Check if parking exists and has available spaces
    const parking = await Parking.findById(parkingId);
    if (!parking || parking.availableSpaces <= 0) {
      return res.status(400).json({ message: 'Parking is full' });
    }

    // Create parking entry
    const parkingEntry = new ParkingEntry({
      vehicleId,
      parkingId,
      entryDateTime: new Date(),
      ticketNumber: generateTicketNumber()
    });

    await parkingEntry.save();

    // Update available spaces
    parking.availableSpaces -= 1;
    await parking.save();

    res.status(201).json({
      message: 'Entry recorded successfully',
      ticket: parkingEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording entry', error: error.message });
  }
};

// Record vehicle exit
const recordExit = async (req, res) => {
  try {
    const { ticketNumber } = req.body;

    const parkingEntry = await ParkingEntry.findOne({ ticketNumber, status: 'active' });
    if (!parkingEntry) {
      return res.status(404).json({ message: 'Invalid ticket number' });
    }

    const exitTime = new Date();
    const entryTime = parkingEntry.entryDateTime;
    const hoursParked = (exitTime - entryTime) / (1000 * 60 * 60);

    const parking = await Parking.findById(parkingEntry.parkingId);
    const chargedAmount = Math.ceil(hoursParked) * parking.pricePerHour;

    // Update parking entry
    parkingEntry.exitDateTime = exitTime;
    parkingEntry.chargedAmount = chargedAmount;
    parkingEntry.status = 'completed';
    await parkingEntry.save();

    // Update available spaces
    parking.availableSpaces += 1;
    await parking.save();

    res.json({
      message: 'Exit recorded successfully',
      bill: {
        ticketNumber: parkingEntry.ticketNumber,
        entryTime: parkingEntry.entryDateTime,
        exitTime: parkingEntry.exitDateTime,
        hoursParked: Math.ceil(hoursParked),
        chargedAmount: parkingEntry.chargedAmount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording exit', error: error.message });
  }
};

// Get parking entries between dates
const getParkingEntries = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.entryDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type === 'active') {
      query.status = 'active';
    } else if (type === 'completed') {
      query.status = 'completed';
    }

    const entries = await ParkingEntry.find(query)
      .populate('vehicleId')
      .populate('parkingId');

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parking entries', error: error.message });
  }
};

module.exports = { updateParking, deleteParking, createParking, getAllParking, recordEntry, recordExit, getParkingEntries };