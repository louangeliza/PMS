const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);

