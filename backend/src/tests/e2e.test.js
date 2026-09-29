const assert = require('assert');

const BASE_URL = 'http://localhost:5001/api';

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  return { status: response.status, ok: response.ok, data };
}

async function runE2ETests() {
  console.log('🚀 Running Live FinSight 360 End-to-End API Integration Suite...\n');
  let passed = 0;
  let failed = 0;
  let authToken = '';
  let testCustomerId = '';
  let testLeadId = '';
  let testFollowupId = '';

  async function test(name, fn) {
    try {
      process.stdout.write(`  ▶ ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error(`    Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Check
  await test('GET /api/health (Server online & responsive)', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
    assert(res.data.platform.includes('FinSight 360'));
  });

  // 2. Authentication
  await test('POST /api/auth/login (Demo RM credentials)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'rm@finsight.demo', password: 'Demo@123' }),
    });
    assert.strictEqual(res.status, 200);
    assert(res.data.success);
    assert(res.data.data.token, 'Token missing');
    authToken = res.data.data.token;
  });

  const authHeaders = () => ({ Authorization: `Bearer ${authToken}` });

  // 3. User Profile
  await test('GET /api/auth/me (Authenticated profile)', async () => {
    const res = await request('/auth/me', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.email, 'rm@finsight.demo');
    assert.strictEqual(res.data.data.role, 'Senior RM');
  });

  // 4. Dashboard Command Center
  await test('GET /api/dashboard (RM Command Center Live KPIs)', async () => {
    const res = await request('/dashboard', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const kpis = res.data.data.kpis;
    assert(kpis.totalCustomers >= 50, `Expected totalCustomers >= 50, got ${kpis.totalCustomers}`);
    assert(kpis.openOpportunities >= 30, 'Expected open opportunities');
    assert(kpis.averageRelationshipHealth > 0, 'Expected average relationship health');
    assert(res.data.data.topPriorities.length > 0, 'Expected top priorities list');
    testCustomerId = res.data.data.topPriorities[0]._id;
  });

  // 5. Priority Center ("Why Today?")
  await test('GET /api/priority-center ("Why Today?" Action Engine)', async () => {
    const res = await request('/priority-center', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const { priorities, stats } = res.data.data;
    assert(priorities.length > 0, 'Expected priorities');
    assert(priorities[0].priorityScore >= priorities[1].priorityScore, 'Not sorted by priority score');
    assert(priorities[0].priorityReasons?.length > 0, 'Expected priority reasons');
    assert(priorities[0].recommendedAction, 'Expected recommended action');
    assert(stats.highPriority > 0, 'Expected high priority count');
  });

  // 6. Customers Directory
  await test('GET /api/customers (Portfolio listing with search & filters)', async () => {
    const res = await request('/customers?limit=10', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.customers.length, 10);
    assert(res.data.data.pagination.total >= 50);
  });

  // 7. Customer 360 Profile
  await test(`GET /api/customers/:id (Customer 360 Full Profile)`, async () => {
    const res = await request(`/customers/${testCustomerId}`, { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const { customer, interactions, signals, opportunities, followups } = res.data.data;
    assert(customer, 'Customer missing');
    assert(interactions.length > 0, 'Expected interactions');
    assert(signals.length > 0, 'Expected signals');
    assert(opportunities.length > 0, 'Expected opportunities');
  });

  // 8. Intelligence Breakdown ("Why 78?")
  await test(`GET /api/customers/:id/intelligence (Transparent Health breakdown)`, async () => {
    const res = await request(`/customers/${testCustomerId}/intelligence`, { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const { healthBreakdown, relationshipHealthScore } = res.data.data;
    assert(healthBreakdown.engagement !== undefined);
    assert(healthBreakdown.recency !== undefined);
    assert(healthBreakdown.interactionFrequency !== undefined);
    assert(healthBreakdown.followupReliability !== undefined);
    assert(healthBreakdown.relationshipDepth !== undefined);
  });

  // 9. Customer Timeline
  await test(`GET /api/customers/:id/timeline (Chronological event timeline)`, async () => {
    const res = await request(`/customers/${testCustomerId}/timeline`, { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.length >= 3, 'Expected >= 3 timeline events');
  });

  // 10. Customer Brief Synthesis (AI / Deterministic Fallback)
  await test(`POST /api/customers/:id/brief (Customer Brief Generation)`, async () => {
    const res = await request(`/customers/${testCustomerId}/brief`, {
      method: 'POST',
      headers: authHeaders(),
    });
    assert.strictEqual(res.status, 200);
    const brief = res.data.data;
    assert(brief.customerSummary, 'Missing customer summary');
    assert(brief.recommendedObjective, 'Missing objective');
    assert(brief.suggestedTalkingPoints?.length >= 3, 'Expected >= 3 talking points');
    assert(brief.source, 'Missing source tag');
  });

  // 11. Log Interaction & Re-evaluate Health
  await test(`POST /api/customers/:id/interactions (Record touchpoint & recalculate)`, async () => {
    const res = await request(`/customers/${testCustomerId}/interactions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        type: 'Phone Call',
        channel: 'Outbound Call',
        summary: 'Consultation conducted regarding electric vehicle financing quotation and loan terms.',
        outcome: 'Positive - Opportunity Identified',
        sentiment: 'Positive',
        keyTopics: ['Vehicle Financing', 'Interest Rates'],
      }),
    });
    assert.strictEqual(res.status, 201);
    assert(res.data.data.interactionId, 'Missing interaction ID');
  });

  // 12. Schedule Follow-up
  await test('POST /api/followups (Schedule new follow-up)', async () => {
    const res = await request('/followups', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        customerId: testCustomerId,
        title: 'Share Pre-Approved Vehicle Loan Sanction Letter',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        scheduledTime: '02:00 PM',
        purpose: 'Vehicle Loan Discussion',
        priority: 'High',
        notes: 'Follow up after sharing loan sanction terms.',
      }),
    });
    assert.strictEqual(res.status, 201);
    testFollowupId = res.data.data._id;
  });

  // 13. Complete Follow-up
  await test(`PUT /api/followups/:id/complete (Mark follow-up completed)`, async () => {
    const res = await request(`/followups/${testFollowupId}/complete`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        outcome: 'Customer reviewed loan terms and confirmed interest.',
      }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.status, 'Completed');
  });

  // 14. Relationship Radar
  await test('GET /api/relationship-radar (Quadrant Matrix & Scatter Data)', async () => {
    const res = await request('/relationship-radar', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const { quadrants, customers } = res.data.data;
    assert(quadrants.championsCount >= 0);
    assert(quadrants.needsAttentionCount >= 0);
    assert(customers.length >= 50);
  });

  // 15. Leads & Pipeline
  await test('GET /api/leads (Lead listing)', async () => {
    const res = await request('/leads', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.leads.length > 0);
    testLeadId = res.data.data.leads[0]._id;
  });

  await test(`PUT /api/leads/:id/status (Kanban status transition)`, async () => {
    const res = await request(`/leads/${testLeadId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: 'QUALIFIED' }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.status, 'QUALIFIED');
  });

  // 16. Convert Lead to Customer
  await test(`POST /api/leads/:id/convert (Convert Lead into active Customer)`, async () => {
    const res = await request(`/leads/${testLeadId}/convert`, {
      method: 'POST',
      headers: authHeaders(),
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.data.lead.status, 'CONVERTED');
    assert(res.data.data.customer._id, 'New customer was not generated');
  });

  // 17. Executive Analytics
  await test('GET /api/analytics/dashboard (Timeframe analytics & funnels)', async () => {
    const res = await request('/analytics/dashboard?timeframe=30d', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    const { metrics, funnel, healthTiers, productDistribution } = res.data.data;
    assert(metrics.totalCustomers >= 50);
    assert(funnel.length > 0);
    assert(healthTiers.length > 0);
    assert(productDistribution.length > 0);
  });

  // 18. KYC & Compliance
  await test('GET /api/kyc/all (KYC records & simulated compliance status)', async () => {
    const res = await request('/kyc/all', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.records.length >= 50);
  });

  // 19. Global Multi-Entity Search
  await test('GET /api/search?q=Rahul (Instant multi-entity search)', async () => {
    const res = await request('/search?q=Rahul', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert(res.data.data.customers.length > 0, 'Expected Rahul in customers search result');
    assert(res.data.data.totalResults > 0);
  });

  // 20. Products Catalog
  await test('GET /api/products (Financial solutions catalog)', async () => {
    const res = await request('/products', { headers: authHeaders() });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.length, 10);
  });

  console.log('\n====================================================');
  console.log(`TOTAL E2E TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
