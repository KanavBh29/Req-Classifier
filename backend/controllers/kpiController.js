const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');
const Traceability = require('../models/Traceability');

exports.getKPI = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [requirements, testCases] = await Promise.all([
      Requirement.find({ createdBy: userId }).lean(),
      TestCase.find({ createdBy: userId }).lean()
    ]);

    const reqIds = requirements.map(r => r._id);
    const traceLinks = await Traceability.find({ requirementId: { $in: reqIds } }).lean();

    const totalReqs = requirements.length;
    const frCount = requirements.filter(r => r.classification === 'FR').length;
    const nfrCount = requirements.filter(r => r.classification === 'NFR').length;
    const ambiguousCount = requirements.filter(r => r.ambiguityFlag).length;
    const ambiguityRate = totalReqs > 0 ? (ambiguousCount / totalReqs) : 0;

    const linkedReqIds = new Set(traceLinks.map(t => t.requirementId.toString()));
    const traceabilityCoverage = totalReqs > 0 ? (linkedReqIds.size / totalReqs) : 0;

    const validatedLinks = traceLinks.filter(t => t.validationStatus === 'Validated').length;
    const validationCoverage = traceLinks.length > 0 ? (validatedLinks / traceLinks.length) : 0;

    // Trend data (last 7 days)
    const now = new Date();
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayReqs = requirements.filter(r => new Date(r.createdAt) >= dayStart && new Date(r.createdAt) <= dayEnd);
      const ambig = dayReqs.filter(r => r.ambiguityFlag).length;
      trendData.push({
        date: dayStart.toISOString().slice(0, 10),
        total: dayReqs.length,
        ambiguous: ambig,
        rate: dayReqs.length > 0 ? (ambig / dayReqs.length) : 0
      });
    }

    // Category breakdown
    const categories = {};
    requirements.forEach(r => {
      const cat = r.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalRequirements: totalReqs,
        functionalRequirements: frCount,
        nonFunctionalRequirements: nfrCount,
        ambiguousRequirements: ambiguousCount,
        ambiguityRate: parseFloat((ambiguityRate * 100).toFixed(1)),
        traceabilityCoverage: parseFloat((traceabilityCoverage * 100).toFixed(1)),
        validationCoverage: parseFloat((validationCoverage * 100).toFixed(1)),
        totalTestCases: testCases.length,
        totalTraceLinks: traceLinks.length,
        validatedLinks,
        trendData,
        categories
      }
    });
  } catch (err) { next(err); }
};

exports.getReportSRS = async (req, res, next) => {
  try {
    const requirements = await Requirement.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email').lean();
    const fr = requirements.filter(r => r.classification === 'FR');
    const nfr = requirements.filter(r => r.classification === 'NFR');
    res.json({ success: true, data: { title: 'Software Requirements Specification', generatedAt: new Date(), author: req.user.name, functional: fr, nonFunctional: nfr, total: requirements.length } });
  } catch (err) { next(err); }
};

exports.getReportTraceability = async (req, res, next) => {
  try {
    const requirements = await Requirement.find({ createdBy: req.user._id }).lean();
    const reqIds = requirements.map(r => r._id);
    const links = await Traceability.find({ requirementId: { $in: reqIds } })
      .populate('requirementId', 'requirementId text classification')
      .populate('testCaseId', 'testCaseId description validationStatus').lean();
    res.json({ success: true, data: { title: 'Traceability Matrix Report', generatedAt: new Date(), links, total: links.length } });
  } catch (err) { next(err); }
};

exports.getReportKPI = async (req, res, next) => {
  try {
    const kpi = await exports.getKPI(req, { json: (data) => data }, next);
    res.json({ success: true, data: { title: 'KPI Analytics Report', generatedAt: new Date(), ...kpi } });
  } catch (err) { next(err); }
};
