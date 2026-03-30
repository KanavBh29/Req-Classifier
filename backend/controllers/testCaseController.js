const TestCase = require('../models/TestCase');
const Traceability = require('../models/Traceability');

exports.createTestCase = async (req, res, next) => {
  try {
    const { description, linkedRequirement, steps } = req.body;
    const tc = await TestCase.create({ description, linkedRequirement, steps, createdBy: req.user._id });
    res.status(201).json({ success: true, data: tc });
  } catch (err) { next(err); }
};

exports.getTestCases = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await TestCase.countDocuments({ createdBy: req.user._id });
    const testCases = await TestCase.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit))
      .populate('linkedRequirement', 'requirementId text');
    res.json({ success: true, total, data: testCases });
  } catch (err) { next(err); }
};

exports.updateTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.findOneAndUpdate({ _id: req.params.id, createdBy: req.user._id }, req.body, { new: true });
    if (!tc) return res.status(404).json({ success: false, message: 'Test case not found' });
    res.json({ success: true, data: tc });
  } catch (err) { next(err); }
};

exports.deleteTestCase = async (req, res, next) => {
  try {
    await TestCase.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    await Traceability.deleteMany({ testCaseId: req.params.id });
    res.json({ success: true, message: 'Test case deleted' });
  } catch (err) { next(err); }
};
