const { CarEntry, ParkingLot } = require('../models/User'); // Import necessary models
const mongoose = require('mongoose');

const addCarEntry = async (req, res) => {
  try {
    const { plateNo, parkingCode, entryTime } = req.body;

    // Validate required fields
    if (!plateNo || !parkingCode || !entryTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the parking lot and check available spaces
    const parkingLot = await ParkingLot.findOne({ code: parkingCode });
    if (!parkingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    if (parkingLot.available_spaces <= 0) {
      return res.status(400).json({ error: 'No available spaces in this parking lot' });
    }

    // Create new car entry
    const carEntry = new CarEntry({
      plateNo,
      parkingCode,
      entryTime,
      userId: req.user.id,
      parkingLotId: parkingLot._id
    });

    // Decrease available spaces
    parkingLot.available_spaces -= 1;
    await parkingLot.save();

    await carEntry.save();
    res.status(201).json(carEntry);
  } catch (error) {
    console.error('Error adding car entry:', error);
    res.status(500).json({ error: 'Failed to add car entry' });
  }
};

const completeCarEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitTime } = req.body;

    if (!exitTime) {
      return res.status(400).json({ error: 'Exit time is required' });
    }

    const carEntry = await CarEntry.findById(id);
    if (!carEntry) {
      return res.status(404).json({ error: 'Car entry not found' });
    }

    if (carEntry.exitTime) {
      return res.status(400).json({ error: 'Car entry already completed' });
    }

    // Calculate duration and fee
    const entryTime = new Date(carEntry.entryTime);
    const exitTimeDate = new Date(exitTime);
    const durationHours = (exitTimeDate - entryTime) / (1000 * 60 * 60);

    const parkingLot = await ParkingLot.findOne({ code: carEntry.parkingCode });
    if (!parkingLot) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const totalAmount = Math.ceil(durationHours) * parkingLot.feePerHour;

    // Update car entry
    carEntry.exitTime = exitTime;
    carEntry.duration_hours = durationHours;
    carEntry.total_amount = totalAmount;
    await carEntry.save();

    // Increase available spaces
    parkingLot.available_spaces += 1;
    await parkingLot.save();

    res.json(carEntry);
  } catch (error) {
    console.error('Error completing car entry:', error);
    res.status(500).json({ error: 'Failed to complete car entry' });
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

const getActiveEntries = async (req, res) => {
  try {
    // Find car entries where exitTime is null (meaning they are still active)
    const activeEntries = await CarEntry.find({
      exitTime: null
    }).populate('parkingLotId userId'); // Populate related data

    res.status(200).json(activeEntries);
  } catch (error) {
    console.error('Error fetching active car entries:', error);
    res.status(500).json({ error: 'Server error: Could not fetch active car entries' });
  }
};

module.exports = {
  addCarEntry,
  completeCarEntry,
  generateExitBill,
  getOutgoingCarEntries,
  getIncomingCarEntries,
  getChargesReport,
  getAllCarEntriesByDateRange,
  getClientCarEntries,
  getActiveEntries,
};
