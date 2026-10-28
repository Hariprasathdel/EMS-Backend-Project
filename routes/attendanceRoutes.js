const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  updateAttendance,
  getSummary,
} = require('../controllers/attendanceController');

router.use(protect);

// @route   POST /api/attendance/check-in
// @desc    Check-in for today
// @access  Employee (self)
router.post('/check-in', checkIn);

// @route   POST /api/attendance/check-out
// @desc    Check-out for today
// @access  Employee (self)
router.post('/check-out', checkOut);

// @route   GET /api/attendance/my
// @desc    Get my attendance (month/year filters)
// @access  Employee (self)
router.get('/my', getMyAttendance);

// @route   GET /api/attendance
// @desc    List all attendance (admin/HR)
// @access  Admin, HR
router.get('/', authorize('admin', 'hr'), getAllAttendance);

// @route   GET /api/attendance/summary/:employeeId
// @desc    Attendance summary for an employee
// @access  Admin, HR, Manager
router.get('/summary/:employeeId', authorize('admin', 'hr', 'manager'), getSummary);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record (correction)
// @access  Admin, HR
router.put('/:id', authorize('admin', 'hr'), updateAttendance);

module.exports = router;
