const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);