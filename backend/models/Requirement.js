const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const requirementSchema = new mongoose.Schema({
  requirementId: { type: String, default: () => `REQ-${uuidv4().slice(0, 8).toUpperCase()}`, unique: true },
  text: { type: String, required: [true, 'Requirement text is required'], trim: true },
  classification: { type: String, enum: ['FR', 'NFR', 'Unknown'], default: 'Unknown' },
  confidenceScore: { type: Number, min: 0, max: 1, default: 0 },
  ambiguityFlag: { type: Boolean, default: false },
  ambiguityScore: { type: Number, min: 0, max: 1, default: 0 },
  ambiguousTerms: [{ type: String }],
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Active', 'Deprecated', 'Draft'], default: 'Active' },
  sourceFile: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

requirementSchema.index({ text: 'text' });
requirementSchema.index({ classification: 1, createdBy: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);
