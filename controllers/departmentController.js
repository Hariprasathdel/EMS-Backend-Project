const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'firstName lastName')
      .sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single department
exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create department
exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const employees = await Employee.countDocuments({ department: req.params.id });
    if (employees > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${employees} employee(s) assigned to this department`,
      });
    }
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};