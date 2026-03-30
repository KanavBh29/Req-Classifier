const Requirement = require('../models/Requirement');
const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Classify via ML service with fallback
const classifyText = async (text) => {
  try {
    const res = await axios.post(`${ML_URL}/classify`, { text }, { timeout: 5000 });
    return res.data;
  } catch {
    // Rule-based fallback
    const nfrKeywords = ['performance', 'security', 'scalab', 'reliab', 'availab', 'maintainab', 'usab', 'portab', 'latency', 'throughput', 'response time', 'uptime', 'fast', 'efficient', 'robust', 'backup', 'recovery', 'encrypt', 'authenticat', 'authoriz'];
    const lowerText = text.toLowerCase();
    const isNFR = nfrKeywords.some(k => lowerText.includes(k));
    return { type: isNFR ? 'NFR' : 'FR', confidence: 0.72 };
  }
};

// Detect ambiguity
const detectAmbiguity = (text) => {
  const ambiguousWords = ['fast', 'efficient', 'scalable', 'user-friendly', 'user friendly', 'robust', 'optimize', 'optimized', 'high performance', 'quickly', 'easily', 'simple', 'flexible', 'reliable', 'secure', 'modern', 'intuitive', 'seamless', 'smooth', 'lightweight', 'powerful', 'easy to use', 'as soon as possible', 'frequently', 'rarely', 'sometimes', 'usually', 'generally'];
  const lowerText = text.toLowerCase();
  const found = ambiguousWords.filter(w => lowerText.includes(w));
  const score = Math.min(found.length / 3, 1);
  return { ambiguityFlag: found.length > 0, ambiguityScore: score, ambiguousTerms: found };
};

exports.uploadRequirements = async (req, res, next) => {
  try {
    const { requirements, sourceFile } = req.body;
    if (!requirements || !Array.isArray(requirements) || requirements.length === 0)
      return res.status(400).json({ success: false, message: 'Requirements array is required' });

    const created = [];
    for (const text of requirements) {
      if (!text.trim()) continue;
      const [mlResult, ambiguity] = await Promise.all([classifyText(text), Promise.resolve(detectAmbiguity(text))]);
      const req_doc = await Requirement.create({
        text: text.trim(),
        classification: mlResult.type || 'Unknown',
        confidenceScore: mlResult.confidence || 0,
        ...ambiguity,
        sourceFile: sourceFile || 'Manual',
        createdBy: req.user._id
      });
      created.push(req_doc);
    }

    // Emit socket event
    if (req.io) {
      req.io.emit('requirements:uploaded', { count: created.length, userId: req.user._id });
      req.io.emit('kpi:refresh');
    }

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) { next(err); }
};

exports.getRequirements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, classification, ambiguity } = req.query;
    const query = { createdBy: req.user._id };
    if (search) query.$text = { $search: search };
    if (classification) query.classification = classification;
    if (ambiguity === 'true') query.ambiguityFlag = true;

    const total = await Requirement.countDocuments(query);
    const requirements = await Requirement.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / limit), data: requirements });
  } catch (err) { next(err); }
};

exports.deleteRequirement = async (req, res, next) => {
  try {
    const req_doc = await Requirement.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!req_doc) return res.status(404).json({ success: false, message: 'Requirement not found' });
    await req_doc.deleteOne();
    if (req.io) req.io.emit('kpi:refresh');
    res.json({ success: true, message: 'Requirement deleted' });
  } catch (err) { next(err); }
};

exports.classifyRequirement = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });
    const [mlResult, ambiguity] = await Promise.all([classifyText(text), Promise.resolve(detectAmbiguity(text))]);
    res.json({ success: true, data: { ...mlResult, ...ambiguity } });
  } catch (err) { next(err); }
};
