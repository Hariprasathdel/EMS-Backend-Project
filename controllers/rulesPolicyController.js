const RulesPolicy = require('../models/RulesPolicy');

// @desc    Get all rules & policies
exports.getAllPolicies = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const policies = await RulesPolicy.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single policy
exports.getPolicy = async (req, res) => {
  try {
    const policy = await RulesPolicy.findById(req.params.id).populate('createdBy', 'name');
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create policy
exports.createPolicy = async (req, res) => {
  try {
    const policy = await RulesPolicy.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update policy
exports.updatePolicy = async (req, res) => {
  try {
    const policy = await RulesPolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, data: policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await RulesPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
    res.json({ success: true, message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};