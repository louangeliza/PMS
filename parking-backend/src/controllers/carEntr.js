const { CarEntry, ParkingLot } = require('../models/User'); // Import necessary models
const mongoose = require('mongoose');

const addCarEntry = async (req, res) => {
  try {
    const { plateNo, parkingCode, entryTime } = req.body;

    // Validate required fields
    if (!plateNo || !parkingCode || !entryTime) {
      return res.status(400).json({ error: 'Plate number, parking code, and entry time are required' });
    }

    // Find the parking lot by code
    const parkingLot = await ParkingLot.findOne({ code: parkingCode });
    if (!parkingLot) {
      return res.status(404).json({ error: `Parking lot with code ${parkingCode} not found` });
    }

    // Check for available spaces
    if (parkingLot.spaces <= 0) {
      return res.status(400).json({ error: `Parking lot ${parkingCode} is full` });
    }

    // Check if a car with the same plate number is already parked in this lot (optional, depending on system rules)
    const existingEntry = await CarEntry.findOne({
      plateNo: plateNo,
      parkingLotId: parkingLot._id,
      exitTime: null, // Check for entries that haven't exited yet
    });
    if (existingEntry) {
        return res.status(400).json({ error: `Car with plate number ${plateNo} is already parked in lot ${parkingCode}` });
    }

    // Create a new car entry instance
    const newCarEntry = new CarEntry({
      plateNo,
      parkingLotId: parkingLot._id, // Use the ObjectId of the found parking lot
      userId: req.user.id, // Assuming user is authenticated and req.user contains user info
      entryTime: new Date(entryTime), // Ensure entryTime is a Date object
      exitTime: null, // Initially null
      charge: 0, // Initially 0
    });

    // Use a Mongoose session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save the new car entry
      await newCarEntry.save({ session });

      // Decrement the available spaces in the parking lot
      parkingLot.spaces -= 1;
      await parkingLot.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Return the new car entry (ticket details)
      res.status(201).json({
        id: newCarEntry._id,
        plateNo: newCarEntry.plateNo,
        parkingLot: parkingLot.code,
        entryTime: newCarEntry.entryTime,
        message: 'Car entry registered successfully. Use this ID for exit bill generation.'
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Re-throw to be caught by the outer catch block
    }

  } catch (error) {
    console.error('Error adding car entry:', error);
    res.status(500).json({ error: 'Server error: Could not add car entry' });
  }
};

const generateExitBill = async (req, res) => {
  try {
    const { id } = req.params; // Get car entry ID from URL parameters
    const exitTime = new Date(); // Use current server time as exit time

    // Find the car entry by ID and populate parking lot details
    const carEntry = await CarEntry.findById(id).populate('parkingLotId');

    // Check if the car entry exists
    if (!carEntry) {
      return res.status(404).json({ error: 'Car entry not found' });
    }

    // Check if the car has already exited
    if (carEntry.exitTime !== null) {
      return res.status(400).json({ error: 'Car has already exited' });
    }

    // Ensure entryTime is a valid Date object
    if (!carEntry.entryTime || isNaN(carEntry.entryTime.getTime())) {
        return res.status(500).json({ error: 'Invalid entry time recorded for this entry' });
    }

    // Calculate duration in hours
    const entryTimestamp = carEntry.entryTime.getTime();
    const exitTimestamp = exitTime.getTime();
    const durationMilliseconds = exitTimestamp - entryTimestamp;
    const durationHours = durationMilliseconds / (1000 * 60 * 60);

    // Calculate charge (rounding up to the nearest hour)
    const billableHours = Math.ceil(durationHours); // Round up duration
    const charge = billableHours * carEntry.parkingLotId.feePerHour;

    // Use a Mongoose session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the car entry with exit time and charge
      carEntry.exitTime = exitTime;
      carEntry.charge = charge;
      await carEntry.save({ session });

      // Find the associated parking lot by ID
      const parkingLot = await ParkingLot.findById(carEntry.parkingLotId._id);

      // Increment the available spaces in the parking lot
      if (parkingLot) { // Ensure parking lot was found
        parkingLot.spaces += 1;
        await parkingLot.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      // Return the updated car entry (exit bill details)
      res.status(200).json(carEntry);
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError; // Re-throw to be caught by the outer catch block
    }

  } catch (error) {
    console.error('Error generating exit bill:', error);
    res.status(500).json({ error: 'Server error: Could not generate exit bill' });
  }
};

const getOutgoingCarEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use a valid date string.' });
    }

    // Add one day to the end date to include the entire end day
    end.setDate(end.getDate() + 1);

    // Find car entries with exitTime within the specified range (and exitTime is not null)
    const outgoingEntries = await CarEntry.find({
      exitTime: {
        $gte: start,
        $lt: end, // Use less than the start of the next day
      },
    }).populate('parkingLotId userId'); // Optionally populate related data

    res.status(200).json(outgoingEntries);
  } catch (error) {
    console.error('Error fetching outgoing car entries:', error);
    res.status(500).json({ error: 'Server error: Could not fetch outgoing car entries' });
  }
};

const getIncomingCarEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use a valid date string.' });
    }

     // Add one day to the end date to include the entire end day
     end.setDate(end.getDate() + 1);

    // Find car entries with entryTime within the specified range
    const incomingEntries = await CarEntry.find({
      entryTime: {
        $gte: start,
        $lt: end, // Use less than the start of the next day
      },
    }).populate('parkingLotId userId'); // Optionally populate related data

    res.status(200).json(incomingEntries);
  } catch (error) {
    console.error('Error fetching incoming car entries:', error);
    res.status(500).json({ error: 'Server error: Could not fetch incoming car entries' });
  }
};

const getChargesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use a valid date string.' });
    }

     // Add one day to the end date to include the entire end day
     end.setDate(end.getDate() + 1);

    // Use Mongoose aggregation to filter by exitTime range and sum the charges
    const result = await CarEntry.aggregate([
      {
        $match: {
          exitTime: { $gte: start, $lt: end },
          charge: { $gt: 0 } // Only include entries with a charge
        }
      },
      {
        $group: {
          _id: null, // Group all matching documents together
          totalCharge: { $sum: '$charge' } // Sum the charge field
        }
      }
    ]);

    // The result will be an array, e.g., [{ _id: null, totalCharge: 123.45 }] or [] if no matches
    const totalCharge = result.length > 0 ? result[0].totalCharge : 0;

    res.status(200).json({ totalCharge });
  } catch (error) {
    console.error('Error fetching charges report:', error);
    res.status(500).json({ error: 'Server error: Could not fetch charges report' });
  }
};

const getAllCarEntriesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Please use a valid date string.' });
    }

     // Add one day to the end date to include the entire end day
     end.setDate(end.getDate() + 1);

    // Find car entries where entryTime OR exitTime is within the specified range
    const allEntries = await CarEntry.find({
      $or: [
        { entryTime: { $gte: start, $lt: end } },
        { exitTime: { $gte: start, $lt: end } },
      ],
    }).populate('parkingLotId userId'); // Optionally populate related data

    res.status(200).json(allEntries);
  } catch (error) {
    console.error('Error fetching all car entries by date range:', error);
    res.status(500).json({ error: 'Server error: Could not fetch all car entries by date range' });
  }
};

const getClientCarEntries = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Find all car entries for the authenticated user
    const clientEntries = await CarEntry.find({ userId: userId }).populate('parkingLotId'); // Optionally populate parking lot details

    res.status(200).json(clientEntries);
  } catch (error) {
    console.error('Error fetching client car entries:', error);
    res.status(500).json({ error: 'Server error: Could not fetch client car entries' });
  }
};

module.exports = {
  addCarEntry,
  generateExitBill,
  getOutgoingCarEntries,
  getIncomingCarEntries,
  getChargesReport,
  getAllCarEntriesByDateRange,
  getClientCarEntries,
};
