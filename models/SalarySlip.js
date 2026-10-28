const mongoose = require('mongoose');

const salarySlipSchema = new mongoose.Schema({
  empCode: { type: String, required: true },
  name: { type: String, required: true },
  month: { type: String, required: true }, // e.g., "October 2026"
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['generated', 'paid'], default: 'generated' }
}, { timestamps: true });

module.exports = mongoose.model('SalarySlip', salarySlipSchema);