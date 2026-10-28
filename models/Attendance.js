const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  empCode: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  punchIn: { type: String },    // e.g., "9:30AM"
  breakOut: { type: String },   // Start break
  breakIn: { type: String },    // Resume work
  punchOut: { type: String },   // e.g., "6:30PM"
  isLate: { type: Boolean, default: false },
  status: { type: String, enum: ['present', 'absent', 'half-day'], default: 'present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);