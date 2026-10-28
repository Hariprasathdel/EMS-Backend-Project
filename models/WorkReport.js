const mongoose = require('mongoose');

const workReportSchema = new mongoose.Schema({
  empCode: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  description: { type: String, required: true },
  hoursWorked: { type: Number },
  status: { type: String, enum: ['submitted', 'pending', 'approved'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('WorkReport', workReportSchema);