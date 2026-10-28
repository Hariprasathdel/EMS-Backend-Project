const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getStats,
} = require('../controllers/employeeController');

router.use(protect); // all routes below require auth

// @route   GET /api/employees
// @desc    List all employees (search, filter, pagination)
// @access  Admin, HR, Manager
router.get('/', authorize('admin', 'hr', 'manager'), getEmployees);

// @route   GET /api/employees/stats
// @desc    Employee count stats
// @access  Admin, HR
// NOTE: must be before '/:id' to avoid conflict
router.get('/stats', authorize('admin', 'hr'), getStats);

// @route   GET /api/employees/:id
// @desc    Get one employee
// @access  Admin, HR, Manager, Self (controller should check)
router.get('/:id', authorize('admin', 'hr', 'manager', 'employee'), getEmployee);

// @route   POST /api/employees
// @desc    Create employee + user account
// @access  Admin, HR
router.post('/', authorize('admin', 'hr'), createEmployee);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Admin, HR
router.put('/:id', authorize('admin', 'hr'), updateEmployee);

// @route   DELETE /api/employees/:id
// @desc    Delete employee + linked user
// @access  Admin only
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
