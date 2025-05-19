const mongoose = require('mongoose');

const ParkingSlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  size: { type: String, required: true },
  vehicleType: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingSlot', ParkingSlotSchema);