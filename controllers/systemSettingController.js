const SystemSetting = require('../models/SystemSetting');

// @desc    Get system settings (single document pattern)
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create(req.body);
    } else {
      settings = await SystemSetting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset to defaults
exports.resetSettings = async (req, res) => {
  try {
    await SystemSetting.deleteMany({});
    const settings = await SystemSetting.create({});
    res.json({ success: true, data: settings, message: 'Settings reset to defaults' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};