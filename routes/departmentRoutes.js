const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

router.use(protect);

// @route   GET /api/departments
// @desc    Get all departments
// @access  All authenticated users
router.get('/', getDepartments);

// @route   GET /api/departments/:id
// @desc    Get one department
// @access  All authenticated users
router.get('/:id', getDepartment);

// @route   POST /api/departments
// @desc    Create department
// @access  Admin, HR
router.post('/', authorize('admin', 'hr'), createDepartment);

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Admin, HR
router.put('/:id', authorize('admin', 'hr'), updateDepartment);

// @route   DELETE /api/departments/:id
// @desc    Delete department (blocked if employees assigned)
// @access  Admin only
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
