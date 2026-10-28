const SalarySlip = require('../models/SalarySlip');
const Employee = require('../models/Employee');

// @desc    Generate salary slip
exports.generateSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const existing = await SalarySlip.findOne({ employee: employeeId, month, year });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Salary slip already exists for this month' });
    }

    const totalAllowances = allowances || 0;
    const totalDeductions = deductions || 0;
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    const slip = await SalarySlip.create({
      employee: employeeId,
      month,
      year,
      basicSalary,
      allowances: totalAllowances,
      deductions: totalDeductions,
      netSalary,
      generatedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: slip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my salary slips
exports.getMySalarySlips = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const slips = await SalarySlip.find({ employee: employee._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, data: slips });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all salary slips (admin)
exports.getAllSalarySlips = async (req, res) => {
  try {
    const { month, year, employee, page = 1, limit = 20 } = req.query;
    const query = {};
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (employee) query.employee = employee;

    const slips = await SalarySlip.find(query)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ year: -1, month: -1 });

    const total = await SalarySlip.countDocuments(query);
    res.json({ success: true, data: slips, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single salary slip
exports.getSalarySlip = async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } });
    if (!slip) return res.status(404).json({ success: false, message: 'Salary slip not found' });
    res.json({ success: true, data: slip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update salary slip
exports.updateSalarySlip = async (req, res) => {
  try {
    const { basicSalary, allowances, deductions } = req.body;
    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);
    const slip = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      { ...req.body, netSalary },
      { new: true, runValidators: true }
    );
    if (!slip) return res.status(404).json({ success: false, message: 'Salary slip not found' });
    res.json({ success: true, data: slip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete salary slip
exports.deleteSalarySlip = async (req, res) => {
  try {
    const slip = await SalarySlip.findByIdAndDelete(req.params.id);
    if (!slip) return res.status(404).json({ success: false, message: 'Salary slip not found' });
    res.json({ success: true, message: 'Salary slip deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};