const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const leave = await Leave.create({ ...req.body, employee: employee._id, status: 'pending' });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leaves (admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employee, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;

    const leaves = await Leave.find(query)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);
    res.json({ success: true, data: leaves, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, adminComment, approvedBy: req.user.id, approvedAt: new Date() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel own leave
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending leaves can be cancelled' });
    }
    leave.status = 'cancelled';
    await leave.save();
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leave balance
exports.getBalance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const approved = await Leave.countDocuments({ employee: employee._id, status: 'approved' });
    res.json({ success: true, data: { totalAllowed: 24, used: approved, remaining: 24 - approved } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};