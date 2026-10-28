const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/employees', require('./employeeRoutes'));
router.use('/departments', require('./departmentRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/leaves', require('./leaveRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/rules-policies', require('./rulesPolicyRoutes'));
router.use('/salary-slips', require('./salarySlipRoutes'));
router.use('/system-settings', require('./systemSettingRoutes'));
router.use('/work-reports', require('./workReportRoutes'));

module.exports = router;
