const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generateSalarySlip,
  getMySalarySlips,
  getAllSalarySlips,
  getSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
} = require('../controllers/salarySlipController');

router.use(protect);

// @route   POST /api/salary-slips
// @desc    Generate salary slip
// @access  Admin, HR
router.post('/', authorize('admin', 'hr'), generateSalarySlip);

// @route   GET /api/salary-slips/my
// @desc    Get my salary slips
// @access  Employee (self)
router.get('/my', getMySalarySlips);

// @route   GET /api/salary-slips
// @desc    Get all salary slips (filter month/year/employee)
// @access  Admin, HR
router.get('/', authorize('admin', 'hr'), getAllSalarySlips);

// @route   GET /api/salary-slips/:id
// @desc    Get single salary slip
// @access  Admin, HR, Self
router.get('/:id', getSalarySlip);

// @route   PUT /api/salary-slips/:id
// @desc    Update salary slip
// @access  Admin, HR
router.put('/:id', authorize('admin', 'hr'), updateSalarySlip);

// @route   DELETE /api/salary-slips/:id
// @desc    Delete salary slip
// @access  Admin only
router.delete('/:id', authorize('admin'), deleteSalarySlip);

module.exports = router;
