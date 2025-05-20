const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  parkingName: { type: String, required: true, unique: true },
  totalSpaces: { type: Number, required: true },
  availableSpaces: { type: Number, required: true },
  location: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  status: { type: String, enum: ['available', 'unavailable'], default: 'available' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Parking', parkingSchema);

