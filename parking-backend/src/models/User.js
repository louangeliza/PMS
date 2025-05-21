const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
}, { timestamps: true });

const parkingLotSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  spaces: { type: Number, required: true },
  location: { type: String, required: true },
  feePerHour: { type: Number, required: true },
}, { timestamps: true });

const carEntrySchema = new mongoose.Schema({
  plateNo: { type: String, required: true },
  parkingLotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date },
  charge: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);
const CarEntry = mongoose.model('CarEntry', carEntrySchema);

module.exports = {
  User,
  ParkingLot,
  CarEntry
};

