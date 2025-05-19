const ParkingSlot = require('../models/ParkingSlot');
const Vehicle = require('../models/Vehicle');
const Log = require('../models/Log');

const addSlots = async (req, res) => {
  const { slots } = req.body;
  
  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: 'Slots must be provided as an array' });
  }

  try {
    const insertedSlots = await ParkingSlot.insertMany(slots);

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'slots_bulk_add',
      details: `Added ${slots.length} parking slots`
    });

    res.status(201).json(insertedSlots);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'One or more slot numbers already exist' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateSlot = async (req, res) => {
  const { id } = req.params;
  const { slotNumber, size, vehicleType, status, location } = req.body;
  
  try {
    const updatedSlot = await ParkingSlot.findByIdAndUpdate(
      id,
      {
        slotNumber,
        size,
        vehicleType,
        status,
        location,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'slot_update',
      details: `Updated slot ${slotNumber}`
    });

    res.json(updatedSlot);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Slot with this number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteSlot = async (req, res) => {
  const { id } = req.params;
  
  try {
    const slot = await ParkingSlot.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'slot_delete',
      details: `Deleted slot ${slot.slotNumber}`
    });

    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSlots = async (req, res) => {
  const { page = 1, limit = 10, search = '', status, vehicleType, size } = req.query;
  
  try {
    const query = {};
    
    if (req.user.role === 'user') {
      query.status = 'available';
    }

    if (search) {
      query.slotNumber = { $regex: search, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (vehicleType) {
      query.vehicleType = { $regex: vehicleType, $options: 'i' };
    }

    if (size) {
      query.size = size;
    }

    const [slots, total] = await Promise.all([
      ParkingSlot.find(query)
        .sort({ slotNumber: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ParkingSlot.countDocuments(query)
    ]);

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'slots_list_view',
      details: 'Viewed slots list'
    });

    res.json({
      data: slots,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAvailableSlotsForVehicle = async (req, res) => {
  const { vehicleId } = req.params;
  
  try {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const slots = await ParkingSlot.find({
      status: 'available',
      vehicleType: vehicle.vehicleType,
      size: vehicle.size
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { 
  addSlots, 
  updateSlot, 
  deleteSlot, 
  getSlots, 
  getAvailableSlotsForVehicle 
};