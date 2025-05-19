const SlotRequest = require('../models/SlotRequest');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const Log = require('../models/Log');
const { sendApprovalEmail } = require('../services/emailService');

const createRequest = async (req, res) => {
  const { vehicleId } = req.body;
  
  try {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const existingRequest = await SlotRequest.findOne({
      vehicle: vehicleId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'A pending request already exists for this vehicle' });
    }

    const newRequest = await SlotRequest.create({
      user: req.user.id,
      vehicle: vehicleId,
      status: 'pending'
    });

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'request_create',
      details: `Created slot request for vehicle ${vehicle.plateNumber}`
    });

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRequest = async (req, res) => {
  const { id } = req.params;
  const { vehicleId } = req.body;
  
  try {
    const request = await SlotRequest.findOne({
      _id: id,
      user: req.user.id,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found, access denied, or not pending' });
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, user: req.user.id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or access denied' });
    }

    const updatedRequest = await SlotRequest.findByIdAndUpdate(
      id,
      {
        vehicle: vehicleId,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'request_update',
      details: `Updated slot request for vehicle ${vehicle.plateNumber}`
    });

    res.json(updatedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await SlotRequest.findOneAndDelete({
      _id: id,
      user: req.user.id,
      status: 'pending'
    });
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found, access denied, or not pending' });
    }

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'request_delete',
      details: 'Deleted slot request'
    });

    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRequests = async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  
  try {
    const query = {};
    
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }

    if (search) {
      query.$or = [
        { 'vehicle.plateNumber': { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'vehicle.vehicleType': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const [requests, total] = await Promise.all([
      SlotRequest.find(query)
        .populate('user', 'name email')
        .populate('vehicle', 'plateNumber vehicleType size')
        .populate('slot', 'slotNumber')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SlotRequest.countDocuments(query)
    ]);

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'requests_list_view',
      details: 'Viewed requests list'
    });

    res.json({
      data: requests,
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

const approveRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await SlotRequest.findById(id)
      .populate('user', 'email')
      .populate('vehicle', 'plateNumber vehicleType size');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    const slot = await ParkingSlot.findOne({
      status: 'available',
      vehicleType: request.vehicle.vehicleType,
      size: request.vehicle.size
    }).sort({ slotNumber: 1 });

    if (!slot) {
      return res.status(400).json({ error: 'No available slots matching vehicle requirements' });
    }

    // Update the slot to unavailable
    slot.status = 'unavailable';
    slot.updatedAt = new Date();
    await slot.save();

    // Update the request
    request.status = 'approved';
    request.slot = slot._id;
    request.updatedAt = new Date();
    await request.save();

    // Send approval email
    await sendApprovalEmail(
      request.user.email,
      slot.slotNumber,
      request.vehicle.plateNumber,
      request.vehicle.vehicleType
    );

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'request_approve',
      details: `Approved request for vehicle ${request.vehicle.plateNumber}`
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectRequest = async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await SlotRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    request.status = 'rejected';
    request.updatedAt = new Date();
    await request.save();

    // Log action
    await Log.create({
      user: req.user.id,
      action: 'request_reject',
      details: `Rejected request ${id}`
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRequest, updateRequest, deleteRequest, getRequests, approveRequest, rejectRequest };