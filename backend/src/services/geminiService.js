const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Deterministic Rule-Based Fallback Generator
 * Used when Gemini API key is not configured, quota is exceeded, or network is unavailable.
 */
function generateRuleBasedBrief(customerData) {
  const { customer, interactions = [], signals = [], opportunities = [], followups = [] } = customerData;
  const daysSince = customer.lastInteraction
    ? Math.floor((new Date() - new Date(customer.lastInteraction)) / (1000 * 60 * 60 * 24))
    : 90;

  const productNames = (customer.existingProducts || [])
    .map((p) => p.productName || p.category)
    .filter(Boolean)
    .join(', ') || 'Savings Account';

  const activeOpp = opportunities.find((o) => o.status === 'Open' || o.status === 'In Progress');
  const activeSignal = signals.find((s) => s.category === 'Opportunity' || s.category === 'Risk');
  const pendingFollowup = followups.find((f) => f.status === 'Pending');

  // Determine Objective
  let objective = 'Conduct regular relationship review and understand evolving financial needs.';
  if (pendingFollowup && new Date(pendingFollowup.scheduledDate) < new Date()) {
    objective = `Complete overdue follow-up regarding "${pendingFollowup.title}" and update customer requirements.`;
  } else if (activeOpp) {
    objective = `Explore customer interest in ${activeOpp.title} based on recent relationship signals.`;
  } else if (daysSince > 60) {
    objective = `Re-engage customer after ${daysSince} days of dormancy and evaluate any changes in life stage or banking needs.`;
  } else if (customer.kycStatus !== 'Verified') {
    objective = `Assist customer in completing pending KYC verification (${customer.kycStatus}) to ensure seamless services.`;
  }

  // Determine Talking Points
  const talkingPoints = [];

  // Point 1: Relationship warmth & recency
  if (daysSince > 45) {
    talkingPoints.push(`Acknowledge past relationship and check in on recent developments since last contact (${daysSince} days ago).`);
  } else {
    talkingPoints.push(`Thank customer for their continued relationship as a valued ${customer.segment} partner.`);
  }

  // Point 2: Specific opportunity / goal touchpoint
  if (activeOpp) {
    talkingPoints.push(`Discuss potential requirements regarding ${activeOpp.category} (${activeOpp.detectedReason || 'based on stated goals'}).`);
  } else if (customer.financialGoals && customer.financialGoals.length > 0) {
    const goal = customer.financialGoals[0];
    talkingPoints.push(`Review progress towards stated financial goal: "${goal.goal}" targeted for ${goal.targetYear || 'upcoming years'}.`);
  } else {
    talkingPoints.push(`Inquire if there are upcoming plans for personal, property, or investment milestones.`);
  }

  // Point 3: Product suitability
  talkingPoints.push(`Review current holdings (${productNames}) and offer to explain potential features or fee waivers available.`);

  // Point 4: Next step agreement
  talkingPoints.push(`Agree on a specific next step or schedule a dedicated advisory follow-up session.`);

  // Recommended Products
  const suggestedProducts = [];
  if (activeOpp) suggestedProducts.push(activeOpp.category);
  if (!productNames.toLowerCase().includes('card')) suggestedProducts.push('Credit Card Suite');
  if (!productNames.toLowerCase().includes('investment') && !productNames.toLowerCase().includes('wealth')) suggestedProducts.push('Wealth & Investment Advisory');
  if (suggestedProducts.length === 0) suggestedProducts.push('Premium Banking Upgrade');

  return {
    source: 'Rule-Based Engine',
    model: 'FinSight Deterministic Rule Engine',
    customerSummary: `${customer.firstName} ${customer.lastName} is a ${customer.age}-year-old ${customer.occupation} based in ${customer.city}, categorized in the ${customer.segment} segment. Holds ${customer.existingProducts?.length || 0} active product(s) with a relationship health score of ${customer.relationshipHealthScore || 75}/100.`,
    relationshipHistory: `Customer since ${new Date(customer.customerSince || Date.now()).getFullYear()}. Last interaction was ${daysSince} days ago with ${interactions.length} recorded interactions in the log.`,
    recommendedObjective: objective,
    suggestedTalkingPoints: talkingPoints,
    suggestedProducts,
    rationale: `Derived using deterministic relationship logic based on segment (${customer.segment}), dormancy indicator (${daysSince} days), active signals (${signals.length}), and KYC status (${customer.kycStatus}).`,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate AI Customer Brief using Gemini API (or fallback)
 */
async function generateCustomerBrief(customerData) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('Gemini API key not configured. Using deterministic Rule-Based Brief Engine.');
    return generateRuleBasedBrief(customerData);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an AI Relationship Intelligence assistant for a modern banking platform (FinSight 360).
Generate a concise, professional, actionable Customer Brief for a Relationship Manager (RM) before an upcoming customer call.

IMPORTANT INSTRUCTIONS:
- You must strictly use ONLY the provided customer facts below. Do NOT hallucinate or invent new bank history.
- Do NOT provide credit approvals, guaranteed investment returns, or regulated advice.
- Return ONLY valid JSON in the exact structure shown below, with no surrounding markdown formatting or text.

CUSTOMER DATA:
- Name: ${customerData.customer.firstName} ${customerData.customer.lastName}
- Age: ${customerData.customer.age}, Occupation: ${customerData.customer.occupation}, City: ${customerData.customer.city}
- Segment: ${customerData.customer.segment}
- Income Range: ${customerData.customer.incomeRange}
- Relationship Health Score: ${customerData.customer.relationshipHealthScore}/100
- Engagement Score: ${customerData.customer.engagementScore}/100
- Current Products: ${JSON.stringify(customerData.customer.existingProducts?.map(p => p.productName || p.category) || [])}
- Stated Financial Goals: ${JSON.stringify(customerData.customer.financialGoals || [])}
- Active Signals: ${JSON.stringify(customerData.signals?.map(s => ({ title: s.title, reason: s.reason })) || [])}
- Open Opportunities: ${JSON.stringify(customerData.opportunities?.map(o => ({ title: o.title, reason: o.detectedReason })) || [])}
- Recent Interactions: ${JSON.stringify(customerData.interactions?.slice(0, 3).map(i => ({ date: i.date, type: i.type, summary: i.summary })) || [])}
- KYC Status: ${customerData.customer.kycStatus}

EXPECTED JSON SCHEMA:
{
  "customerSummary": "2 sentence executive summary of the customer's profile and current relationship state.",
  "relationshipHistory": "Summary of tenure and recent interaction pattern.",
  "recommendedObjective": "1 clear primary objective for the RM for this specific call.",
  "suggestedTalkingPoints": [
    "Talking point 1",
    "Talking point 2",
    "Talking point 3",
    "Talking point 4"
  ],
  "suggestedProducts": ["Product 1", "Product 2"],
  "rationale": "Why this approach is recommended based on facts provided."
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean markdown code fence if returned
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(text);

    return {
      source: 'AI Generated',
      model: 'Google Gemini 2.5 Flash',
      customerSummary: parsed.customerSummary,
      relationshipHistory: parsed.relationshipHistory,
      recommendedObjective: parsed.recommendedObjective,
      suggestedTalkingPoints: parsed.suggestedTalkingPoints || [],
      suggestedProducts: parsed.suggestedProducts || [],
      rationale: parsed.rationale,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`Gemini AI Brief generation failed (${err.message}). Falling back to rule-based engine.`);
    return generateRuleBasedBrief(customerData);
  }
}

module.exports = {
  generateCustomerBrief,
  generateRuleBasedBrief,
};
