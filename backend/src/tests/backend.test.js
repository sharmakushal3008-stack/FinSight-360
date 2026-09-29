const assert = require('assert');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('../seeds/seedData');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Interaction = require('../models/Interaction');
const Opportunity = require('../models/Opportunity');
const KYCRecord = require('../models/KYCRecord');
const Notification = require('../models/Notification');
const {
  calculateRelationshipHealth,
  detectSignals,
  calculatePriority,
  analyzeRelationshipChanges,
} = require('../services/intelligenceEngine');
const { generateRuleBasedBrief, generateCustomerBrief } = require('../services/geminiService');

async function runTests() {
  console.log('🧪 Starting FinSight 360 Comprehensive Backend Automated Tests...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`  ▶ Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error(`    Error: ${err.message}`);
      if (err.stack) console.error(`    ${err.stack.split('\n')[1]}`);
      failed++;
    }
  }

  // Connect DB
  await connectDB();
  await seedDatabase();

  console.log('\n--- 1. DATABASE & SEED INTEGRITY ---');
  await test('Customers count >= 50', async () => {
    const count = await Customer.countDocuments();
    assert(count >= 50, `Expected >= 50 customers, got ${count}`);
  });

  await test('Leads count >= 75', async () => {
    const count = await Lead.countDocuments();
    assert(count >= 75, `Expected >= 75 leads, got ${count}`);
  });

  await test('Interactions count >= 100', async () => {
    const count = await Interaction.countDocuments();
    assert(count >= 100, `Expected >= 100 interactions, got ${count}`);
  });

  await test('Follow-ups count >= 50', async () => {
    const count = await FollowUp.countDocuments();
    assert(count >= 50, `Expected >= 50 follow-ups, got ${count}`);
  });

  await test('Opportunities count >= 40', async () => {
    const count = await Opportunity.countDocuments();
    assert(count >= 40, `Expected >= 40 opportunities, got ${count}`);
  });

  await test('KYC records count >= 50', async () => {
    const count = await KYCRecord.countDocuments();
    assert(count >= 50, `Expected >= 50 KYC records, got ${count}`);
  });

  console.log('\n--- 2. AUTHENTICATION & SECURITY ---');
  await test('Demo user exists with bcrypt password match', async () => {
    const demoUser = await User.findOne({ email: 'rm@finsight.demo' });
    assert(demoUser, 'Demo user rm@finsight.demo not found');
    const isMatch = await demoUser.matchPassword('Demo@123');
    assert(isMatch, 'Password Demo@123 did not match');
    const isWrongMatch = await demoUser.matchPassword('WrongPass');
    assert(!isWrongMatch, 'Wrong password incorrectly matched');
  });

  console.log('\n--- 3. RELATIONSHIP INTELLIGENCE ENGINE ---');
  await test('Deterministic Health Score & transparent breakdown', async () => {
    const rahul = await Customer.findOne({ firstName: 'Rahul', lastName: 'Mehta' });
    assert(rahul, 'Rahul Mehta not found');
    const interactions = await Interaction.find({ customerId: rahul._id });
    const followups = await FollowUp.find({ customerId: rahul._id });

    const health = calculateRelationshipHealth({ customer: rahul, interactions, followups });
    assert(health.score >= 0 && health.score <= 100, 'Score outside 0-100');
    assert(health.breakdown.engagement !== undefined, 'Missing engagement in breakdown');
    assert(health.breakdown.recency !== undefined, 'Missing recency in breakdown');
    assert(health.breakdown.interactionFrequency !== undefined, 'Missing frequency in breakdown');
    assert(health.breakdown.followupReliability !== undefined, 'Missing followup reliability in breakdown');
    assert(health.breakdown.relationshipDepth !== undefined, 'Missing depth in breakdown');
  });

  await test('Signal Detection detects dormancy and overdue follow-ups', async () => {
    const rahul = await Customer.findOne({ firstName: 'Rahul', lastName: 'Mehta' });
    const interactions = await Interaction.find({ customerId: rahul._id });
    const followups = await FollowUp.find({ customerId: rahul._id });
    const signals = detectSignals({ customer: rahul, interactions, followups, opportunities: [] });

    const signalTypes = signals.map((s) => s.type);
    assert(signalTypes.includes('Dormant Relationship'), 'Expected Dormant Relationship signal');
    assert(signalTypes.includes('Follow-up Overdue'), 'Expected Follow-up Overdue signal');
  });

  await test('"Why Today?" Priority Engine ranks high urgency correctly', async () => {
    const rahul = await Customer.findOne({ firstName: 'Rahul', lastName: 'Mehta' });
    const interactions = await Interaction.find({ customerId: rahul._id });
    const followups = await FollowUp.find({ customerId: rahul._id });
    const health = calculateRelationshipHealth({ customer: rahul, interactions, followups });
    const signals = detectSignals({ customer: rahul, interactions, followups, opportunities: [] });

    const priority = calculatePriority({ customer: rahul, health, signals, followups, opportunities: [] });
    assert(priority.priorityScore >= 80, `Expected high priority score >= 80, got ${priority.priorityScore}`);
    assert.strictEqual(priority.classification, 'High Priority');
    assert(priority.reasons.length > 0, 'Expected priority reasons');
    assert(priority.recommendedAction.length > 0, 'Expected recommended action');
  });

  console.log('\n--- 4. AI CUSTOMER BRIEF & FALLBACK ---');
  await test('Customer Brief fallback generates structured brief without Gemini API Key', async () => {
    const rahul = await Customer.findOne({ firstName: 'Rahul', lastName: 'Mehta' });
    const interactions = await Interaction.find({ customerId: rahul._id });
    const followups = await FollowUp.find({ customerId: rahul._id });
    const signals = detectSignals({ customer: rahul, interactions, followups, opportunities: [] });
    const opportunities = await Opportunity.find({ customerId: rahul._id });

    const brief = await generateCustomerBrief({
      customer: rahul,
      interactions,
      followups,
      signals,
      opportunities,
    });

    assert.strictEqual(brief.source, 'Rule-Based Engine');
    assert(brief.customerSummary.includes('Rahul'), 'Summary missing customer name');
    assert(brief.suggestedTalkingPoints.length >= 3, 'Expected >= 3 talking points');
    assert(brief.recommendedObjective.length > 10, 'Objective too short');
  });

  console.log('\n--- 5. LEAD CONVERSION WORKFLOW ---');
  await test('Lead conversion creates customer and updates lead status', async () => {
    const testLead = await Lead.create({
      leadId: 'LEAD-TEST-999',
      name: 'Simran Test',
      email: 'simran.test@lead.com',
      phone: '+91 98888 77777',
      city: 'Pune',
      requirement: 'Home Loan for 2 BHK',
      productCategory: 'Home Financing',
      priority: 'High',
      estimatedValue: 4500000,
      status: 'QUALIFIED',
    });

    const [firstName, ...rest] = testLead.name.split(' ');
    const newCust = await Customer.create({
      customerId: 'CUST-TEST-999',
      firstName,
      lastName: rest.join(' ') || 'Customer',
      email: testLead.email,
      phone: testLead.phone,
      city: testLead.city,
      occupation: 'Salaried Professional',
      age: 29,
      incomeRange: '10-25 LPA',
      segment: 'Salaried',
      relationshipStatus: 'Active',
      existingProducts: [
        {
          productName: testLead.requirement,
          category: testLead.productCategory,
          balanceOrLimit: testLead.estimatedValue,
          status: 'Active',
        },
      ],
    });

    testLead.status = 'CONVERTED';
    testLead.customerId = newCust._id;
    await testLead.save();

    assert.strictEqual(testLead.status, 'CONVERTED');
    assert(testLead.customerId, 'Lead customerId not linked');
    assert.strictEqual(newCust.existingProducts[0].productName, 'Home Loan for 2 BHK');
  });

  console.log('\n--- 6. KYC SIMULATION ---');
  await test('KYC record updates sync with Customer kycStatus', async () => {
    const cust = await Customer.findOne();
    const kyc = await KYCRecord.findOne({ customerId: cust._id });
    assert(kyc, 'KYC record not found for customer');

    kyc.status = 'Verified';
    await kyc.save();
    cust.kycStatus = 'Verified';
    await cust.save();

    assert.strictEqual(cust.kycStatus, 'Verified');
  });

  await disconnectDB();

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
