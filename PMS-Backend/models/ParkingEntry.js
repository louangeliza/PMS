const mongoose = require('mongoose');

const parkingEntrySchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  entryDateTime: { type: Date, required: true },
  exitDateTime: { type: Date, default: null },
  chargedAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  ticketNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('ParkingEntry', parkingEntrySchema); 