const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);