const WorkReport = require('../models/WorkReport');
const Employee = require('../models/Employee');

// @desc    Create work report
exports.createReport = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const report = await WorkReport.create({ ...req.body, employee: employee._id });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my reports
exports.getMyReports = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const reports = await WorkReport.find({ employee: employee._id })
      .populate('project', 'name')
      .sort({ date: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reports (admin)
exports.getAllReports = async (req, res) => {
  try {
    const { employee, project, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (project) query.project = project;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const reports = await WorkReport.find(query)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 });

    const total = await WorkReport.countDocuments(query);
    res.json({ success: true, data: reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single report
exports.getReport = async (req, res) => {
  try {
    const report = await WorkReport.findById(req.params.id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update report
exports.updateReport = async (req, res) => {
  try {
    const report = await WorkReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await WorkReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};