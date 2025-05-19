const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plateNumber: { type: String, required: true, unique: true },
  vehicleType: { type: String, required: true },
  size: { type: String, required: true },
  attributes: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);