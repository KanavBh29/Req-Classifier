require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Requirement = require('../models/Requirement');
const TestCase = require('../models/TestCase');
const Traceability = require('../models/Traceability');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reqtrace';

const sampleRequirements = [
  { text: 'The system shall allow users to register with email and password', classification: 'FR', confidenceScore: 0.94 },
  { text: 'The system shall authenticate users using JWT tokens', classification: 'FR', confidenceScore: 0.91 },
  { text: 'The system shall process 1000 concurrent users', classification: 'NFR', confidenceScore: 0.88 },
  { text: 'The system shall respond to requests within 200ms', classification: 'NFR', confidenceScore: 0.92 },
  { text: 'The system shall provide fast and efficient search', classification: 'NFR', confidenceScore: 0.76, ambiguityFlag: true, ambiguousTerms: ['fast', 'efficient'] },
  { text: 'The system shall allow users to upload requirement documents', classification: 'FR', confidenceScore: 0.95 },
  { text: 'The system shall classify requirements as FR or NFR automatically', classification: 'FR', confidenceScore: 0.89 },
  { text: 'The system shall maintain 99.9% uptime', classification: 'NFR', confidenceScore: 0.93 },
  { text: 'The system should be scalable and robust under heavy load', classification: 'NFR', confidenceScore: 0.85, ambiguityFlag: true, ambiguousTerms: ['scalable', 'robust'] },
  { text: 'The system shall generate PDF reports for all analytics', classification: 'FR', confidenceScore: 0.87 },
  { text: 'The user interface shall be intuitive and user-friendly', classification: 'NFR', confidenceScore: 0.82, ambiguityFlag: true, ambiguousTerms: ['intuitive', 'user-friendly'] },
  { text: 'The system shall encrypt all user passwords using bcrypt', classification: 'NFR', confidenceScore: 0.96 },
];

const sampleTestCases = [
  { description: 'Verify user registration with valid email and password', validationStatus: 'Validated' },
  { description: 'Verify JWT token generation on successful login', validationStatus: 'Validated' },
  { description: 'Verify system handles 1000 concurrent connections', validationStatus: 'Pending' },
  { description: 'Verify response time under 200ms for API endpoints', validationStatus: 'Pending' },
  { description: 'Verify requirement upload and parsing from PDF', validationStatus: 'Validated' },
  { description: 'Verify ML classification accuracy above 85%', validationStatus: 'Pending' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Promise.all([User.deleteMany({}), Requirement.deleteMany({}), TestCase.deleteMany({}), Traceability.deleteMany({})]);
    console.log('Cleared existing data');

    // Create demo user
    const user = await User.create({ name: 'Demo Analyst', email: 'demo@reqtrace.com', password: 'demo1234', role: 'admin' });
    console.log(`Created user: ${user.email}`);

    // Create requirements
    const reqs = await Promise.all(sampleRequirements.map(r => Requirement.create({ ...r, createdBy: user._id, ambiguityScore: r.ambiguityFlag ? 0.6 : 0 })));
    console.log(`Created ${reqs.length} requirements`);

    // Create test cases
    const tcs = await Promise.all(sampleTestCases.map(t => TestCase.create({ ...t, createdBy: user._id })));
    console.log(`Created ${tcs.length} test cases`);

    // Create traceability links
    await Traceability.create({ requirementId: reqs[0]._id, testCaseId: tcs[0]._id, validationStatus: 'Validated', linkedBy: user._id });
    await Traceability.create({ requirementId: reqs[1]._id, testCaseId: tcs[1]._id, validationStatus: 'Validated', linkedBy: user._id });
    await Traceability.create({ requirementId: reqs[2]._id, testCaseId: tcs[2]._id, validationStatus: 'Pending', linkedBy: user._id });
    await Traceability.create({ requirementId: reqs[5]._id, testCaseId: tcs[4]._id, validationStatus: 'Validated', linkedBy: user._id });
    console.log('Created traceability links');

    console.log('\n✅ Seed complete!');
    console.log('📧 Login: demo@reqtrace.com | 🔑 Password: demo1234');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
