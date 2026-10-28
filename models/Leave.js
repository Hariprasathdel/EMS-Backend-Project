const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  empCode: { type: String, required: true },
  name: { type: String, required: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'annual', 'maternity'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);