const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testCaseSchema = new mongoose.Schema({
  testCaseId: { type: String, default: () => `TC-${uuidv4().slice(0, 8).toUpperCase()}`, unique: true },
  description: { type: String, required: [true, 'Test case description is required'], trim: true },
  linkedRequirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' },
  validationStatus: { type: String, enum: ['Validated', 'Pending', 'Missing', 'Failed'], default: 'Pending' },
  steps: [{ step: String, expected: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestCase', testCaseSchema);
