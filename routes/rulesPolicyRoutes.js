const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require('../controllers/rulesPolicyController');

router.use(protect);

// @route   GET /api/rules-policies
// @desc    Get all rules & policies
// @access  All authenticated users
router.get('/', getAllPolicies);

// @route   GET /api/rules-policies/:id
// @desc    Get one policy
// @access  All authenticated users
router.get('/:id', getPolicy);

// @route   POST /api/rules-policies
// @desc    Create policy
// @access  Admin, HR
router.post('/', authorize('admin', 'hr'), createPolicy);

// @route   PUT /api/rules-policies/:id
// @desc    Update policy
// @access  Admin, HR
router.put('/:id', authorize('admin', 'hr'), updatePolicy);

// @route   DELETE /api/rules-policies/:id
// @desc    Delete policy
// @access  Admin only
router.delete('/:id', authorize('admin'), deletePolicy);

module.exports = router;
