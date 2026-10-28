const mongoose = require('mongoose');

const rulesPolicySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['attendance', 'leave', 'salary', 'conduct'], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RulesPolicy', rulesPolicySchema);