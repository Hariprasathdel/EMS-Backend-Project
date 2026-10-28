const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  cancelLeave,
  getBalance,
} = require('../controllers/leaveController');

router.use(protect);

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Employee (self)
router.post('/', applyLeave);

// @route   GET /api/leaves/my
// @desc    Get my leaves
// @access  Employee (self)
router.get('/my', getMyLeaves);

// @route   GET /api/leaves/balance
// @desc    Get my leave balance
// @access  Employee (self)
router.get('/balance', getBalance);

// @route   GET /api/leaves
// @desc    Get all leaves (filter by status/employee)
// @access  Admin, HR, Manager
router.get('/', authorize('admin', 'hr', 'manager'), getAllLeaves);

// @route   PUT /api/leaves/:id/status
// @desc    Approve/reject leave
// @access  Admin, HR, Manager
router.put('/:id/status', authorize('admin', 'hr', 'manager'), updateLeaveStatus);

// @route   PUT /api/leaves/:id/cancel
// @desc    Cancel own pending leave
// @access  Employee (self)
router.put('/:id/cancel', cancelLeave);

module.exports = router;
