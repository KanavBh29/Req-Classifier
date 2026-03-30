const Traceability = require('../models/Traceability');
const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');

exports.linkRequirement = async (req, res, next) => {
  try {
    const { requirementId, testCaseId, validationStatus, notes } = req.body;
    const existing = await Traceability.findOne({ requirementId, testCaseId });
    if (existing) {
      existing.validationStatus = validationStatus || existing.validationStatus;
      existing.notes = notes || existing.notes;
      await existing.save();
      if (req.io) req.io.emit('traceability:updated', { requirementId, testCaseId });
      return res.json({ success: true, data: existing });
    }
    const link = await Traceability.create({ requirementId, testCaseId, validationStatus: validationStatus || 'Pending', notes, linkedBy: req.user._id });
    if (req.io) { req.io.emit('traceability:linked', { requirementId, testCaseId }); req.io.emit('kpi:refresh'); }
    res.status(201).json({ success: true, data: link });
  } catch (err) { next(err); }
};

exports.getTraceability = async (req, res, next) => {
  try {
    const requirements = await Requirement.find({ createdBy: req.user._id }).lean();
    const reqIds = requirements.map(r => r._id);
    const links = await Traceability.find({ requirementId: { $in: reqIds } })
      .populate('requirementId', 'requirementId text classification')
      .populate('testCaseId', 'testCaseId description validationStatus')
      .populate('linkedBy', 'name')
      .lean();
    res.json({ success: true, data: links, requirements, total: links.length });
  } catch (err) { next(err); }
};

exports.updateLink = async (req, res, next) => {
  try {
    const link = await Traceability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    if (req.io) req.io.emit('traceability:updated', { id: req.params.id });
    res.json({ success: true, data: link });
  } catch (err) { next(err); }
};

exports.deleteLink = async (req, res, next) => {
  try {
    await Traceability.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Link removed' });
  } catch (err) { next(err); }
};
