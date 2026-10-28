const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReport,
  getMyReports,
  getAllReports,
  getReport,
  updateReport,
  deleteReport,
} = require('../controllers/workReportController');

router.use(protect);

// @route   POST /api/work-reports
// @desc    Submit work report
// @access  Employee (self)
router.post('/', createReport);

// @route   GET /api/work-reports/my
// @desc    Get my reports
// @access  Employee (self)
router.get('/my', getMyReports);

// @route   GET /api/work-reports
// @desc    Get all reports (filter by employee, project, dates)
// @access  Admin, HR, Manager
router.get('/', authorize('admin', 'hr', 'manager'), getAllReports);

// @route   GET /api/work-reports/:id
// @desc    Get one report
// @access  Admin, HR, Manager, Self
router.get('/:id', getReport);

// @route   PUT /api/work-reports/:id
// @desc    Update report (author or admin/HR)
// @access  Employee (self), Admin, HR
router.put('/:id', updateReport);

// @route   DELETE /api/work-reports/:id
// @desc    Delete report
// @access  Admin, HR, Self
router.delete('/:id', deleteReport);

module.exports = router;
