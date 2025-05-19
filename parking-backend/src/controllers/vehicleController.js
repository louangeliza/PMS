const Vehicle = require('../models/Vehicle');
const Log = require('../models/Log');

const addVehicle = async (req, res) => {
  const { plateNumber, vehicleType, size, attributes } = req.body;
  
  try {
    const newVehicle = await Vehicle.create({
      user: req.user.id,
      plateNumber,
      vehicleType,
      size,
      attributes: attributes || {}
    });

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'vehicle_add',
      details: `Added vehicle ${plateNumber}`
    });

    res.status(201).json(newVehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Vehicle with this plate number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { plateNumber, vehicleType, size, attributes } = req.body;
  
  try {
    const vehicle = await Vehicle.findOne({ _id: id, user: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        plateNumber,
        vehicleType,
        size,
        attributes: attributes || {},
        updatedAt: new Date()
      },
      { new: true }
    );

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'vehicle_update',
      details: `Updated vehicle ${plateNumber}`
    });

    res.json(updatedVehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Vehicle with this plate number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: id, user: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'vehicle_delete',
      details: `Deleted vehicle ${vehicle.plateNumber}`
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserVehicles = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  
  try {
    const query = { user: req.user.id };
    if (search) {
      query.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } }
      ];
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Vehicle.countDocuments(query)
    ]);

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'vehicle_list_view',
      details: 'Viewed vehicle list'
    });

    res.json({
      data: vehicles,
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

module.exports = { addVehicle, updateVehicle, deleteVehicle, getUserVehicles };