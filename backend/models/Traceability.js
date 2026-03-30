const mongoose = require('mongoose');

const traceabilitySchema = new mongoose.Schema({
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', required: true },
  validationStatus: { type: String, enum: ['Validated', 'Pending', 'Missing'], default: 'Pending' },
  notes: { type: String },
  linkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

traceabilitySchema.index({ requirementId: 1, testCaseId: 1 }, { unique: true });

module.exports = mongoose.model('Traceability', traceabilitySchema);
