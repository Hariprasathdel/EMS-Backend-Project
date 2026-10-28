const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Mark check-in
exports.checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ employee: employee._id, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    if (!record) {
      record = await Attendance.create({
        employee: employee._id,
        date: today,
        checkIn: new Date(),
        status: 'present',
      });
    } else {
      record.checkIn = new Date();
      await record.save();
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark check-out
exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employee: employee._id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, message: 'Please check in first' });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }

    record.checkOut = new Date();
    const diffMs = record.checkOut - record.checkIn;
    record.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    await record.save();

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    const { month, year } = req.query;
    const query = { employee: employee._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query).sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance (admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, employee, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const records = await Attendance.find(query)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);
    res.json({ success: true, data: records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update attendance (admin)
exports.updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Attendance summary
exports.getSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const present = await Attendance.countDocuments({ employee: employeeId, status: 'present' });
    const absent = await Attendance.countDocuments({ employee: employeeId, status: 'absent' });
    const late = await Attendance.countDocuments({ employee: employeeId, status: 'late' });
    res.json({ success: true, data: { present, absent, late } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};