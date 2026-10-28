const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empCode: { type: String, required: true, unique: true }, // e.g., EMP001
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  email: { type: String, required: true },
  phone: { type: String },
  designation: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);