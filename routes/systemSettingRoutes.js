const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require('../controllers/systemSettingController');

router.use(protect);

// @route   GET /api/system-settings
// @desc    Get system settings
// @access  Admin, HR
router.get('/', authorize('admin', 'hr'), getSettings);

// @route   PUT /api/system-settings
// @desc    Update system settings
// @access  Admin only
router.put('/', authorize('admin'), updateSettings);

// @route   POST /api/system-settings/reset
// @desc    Reset settings to defaults
// @access  Admin only
router.post('/reset', authorize('admin'), resetSettings);

module.exports = router;
