const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  setDailyHours: { type: Number, default: 8 },
  monthTargetHours: { type: Number, default: 176 },
  monthWorkedHours: { type: Number, default: 0 },
  lateThresholdMinutes: { type: Number, default: 15 }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);