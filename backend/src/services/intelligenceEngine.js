const { differenceInDays } = require('date-fns');

/**
 * Deterministic Relationship Intelligence Engine
 * Provides transparent, explainable scoring, signal detection,
 * opportunity matching, and priority ranking.
 */

// Calculate days since last interaction
function getDaysSinceLastInteraction(lastInteractionDate) {
  if (!lastInteractionDate) return 999;
  return Math.max(0, differenceInDays(new Date(), new Date(lastInteractionDate)));
}

// Calculate Recency Score (0 - 100)
function calculateRecencyScore(daysSince) {
  if (daysSince <= 7) return 98;
  if (daysSince <= 15) return 90;
  if (daysSince <= 30) return 80;
  if (daysSince <= 45) return 68;
  if (daysSince <= 60) return 50;
  if (daysSince <= 90) return 30;
  return 15;
}

// Calculate Interaction Frequency Score (0 - 100)
function calculateFrequencyScore(interactions = []) {
  const now = new Date();
  const recentInteractions = interactions.filter((i) => {
    const d = new Date(i.date || i.createdAt);
    return differenceInDays(now, d) <= 90;
  });

  const count = recentInteractions.length;
  if (count >= 5) return 95;
  if (count === 4) return 85;
  if (count === 3) return 75;
  if (count === 2) return 60;
  if (count === 1) return 40;
  return 20;
}

// Calculate Follow-up Reliability Score (0 - 100)
function calculateFollowupScore(followups = []) {
  if (!followups.length) return 75; // neutral baseline

  const now = new Date();
  const overdueCount = followups.filter(
    (f) => f.status === 'Pending' && new Date(f.scheduledDate) < now
  ).length;

  const completedCount = followups.filter((f) => f.status === 'Completed').length;
  const pendingCount = followups.filter((f) => f.status === 'Pending').length;

  if (overdueCount > 0) {
    return Math.max(20, 70 - overdueCount * 25);
  }

  if (completedCount > 0 && pendingCount === 0) return 95;
  if (completedCount > 0) return 88;
  return 80;
}

// Calculate Relationship Depth Score (0 - 100)
function calculateDepthScore(products = [], totalValue = 0) {
  const activeProducts = products.filter((p) => p.status !== 'Closed');
  const count = activeProducts.length;

  let base = 40;
  if (count >= 4) base = 95;
  else if (count === 3) base = 85;
  else if (count === 2) base = 70;
  else if (count === 1) base = 50;

  // Add value bonus
  if (totalValue > 5000000) base = Math.min(100, base + 10);
  else if (totalValue > 2000000) base = Math.min(100, base + 5);

  return base;
}

// Calculate KYC Compliance Score
function calculateKycScore(kycStatus) {
  if (kycStatus === 'Verified') return 100;
  if (kycStatus === 'Submitted') return 70;
  if (kycStatus === 'Additional Information Required') return 40;
  return 30; // Pending
}

/**
 * Main Relationship Health Calculator
 */
function calculateRelationshipHealth({
  customer,
  interactions = [],
  followups = [],
}) {
  const daysSince = getDaysSinceLastInteraction(customer.lastInteraction);
  const recency = calculateRecencyScore(daysSince);
  const frequency = calculateFrequencyScore(interactions);
  const followupReliability = calculateFollowupScore(followups);
  const depth = calculateDepthScore(customer.existingProducts, customer.totalRelationshipValue);
  const kycCompliance = calculateKycScore(customer.kycStatus);
  const engagement = customer.engagementScore || 70;

  // Weighted formula:
  // Engagement: 25%, Recency: 25%, Frequency: 15%, Follow-up: 15%, Depth: 10%, KYC: 10%
  const totalScore = Math.round(
    engagement * 0.25 +
      recency * 0.25 +
      frequency * 0.15 +
      followupReliability * 0.15 +
      depth * 0.1 +
      kycCompliance * 0.1
  );

  const boundedScore = Math.max(10, Math.min(100, totalScore));

  let relationshipStatus = 'Active';
  if (daysSince > 60 || boundedScore < 50) {
    relationshipStatus = 'Dormant';
  } else if (boundedScore < 65 || followupReliability < 50 || kycCompliance < 60) {
    relationshipStatus = 'Needs Attention';
  } else if (boundedScore >= 80 && depth >= 75) {
    relationshipStatus = 'High Opportunity';
  }

  const breakdown = {
    engagement,
    recency,
    interactionFrequency: frequency,
    followupReliability,
    relationshipDepth: depth,
    kycCompliance,
    rationale: `Derived from ${daysSince} days since last contact, ${interactions.length} recorded interactions, ${customer.existingProducts?.length || 0} active products, and ${customer.kycStatus} KYC status.`,
  };

  return {
    score: boundedScore,
    status: relationshipStatus,
    breakdown,
  };
}

/**
 * Deterministic Signal Detection Engine
 */
function detectSignals({ customer, interactions = [], followups = [], opportunities = [] }) {
  const signals = [];
  const now = new Date();
  const daysSince = getDaysSinceLastInteraction(customer.lastInteraction);

  // 1. Dormant Relationship
  if (daysSince >= 60) {
    signals.push({
      type: 'Dormant Relationship',
      severity: daysSince >= 90 ? 'High' : 'Medium',
      title: 'Customer Inactivity Detected',
      reason: `No customer interaction recorded for ${daysSince} days. High risk of relationship disengagement.`,
      category: 'Risk',
      scoreImpact: -25,
    });
  }

  // 2. Overdue Follow-up
  const overdue = followups.filter(
    (f) => f.status === 'Pending' && new Date(f.scheduledDate) < now
  );
  if (overdue.length > 0) {
    const mostOverdue = overdue[0];
    const daysOverdue = differenceInDays(now, new Date(mostOverdue.scheduledDate));
    signals.push({
      type: 'Follow-up Overdue',
      severity: 'High',
      title: 'Overdue Follow-up Task',
      reason: `Follow-up "${mostOverdue.title}" is overdue by ${Math.max(1, daysOverdue)} day(s).`,
      category: 'Operational',
      scoreImpact: -20,
    });
  }

  // 3. High Engagement
  const recent30Days = interactions.filter(
    (i) => differenceInDays(now, new Date(i.date || i.createdAt)) <= 30
  );
  if (recent30Days.length >= 2 || customer.engagementScore >= 85) {
    signals.push({
      type: 'High Engagement',
      severity: 'Info',
      title: 'Active Relationship Momentum',
      reason: `Frequent interactions recorded (${recent30Days.length} in last 30 days) with positive responsiveness.`,
      category: 'Engagement',
      scoreImpact: +15,
    });
  }

  // 4. Low Product Depth / Cross-sell opportunity
  const activeProducts = (customer.existingProducts || []).filter((p) => p.status !== 'Closed');
  if (activeProducts.length <= 1 && customer.segment !== 'Dormant') {
    signals.push({
      type: 'Low Product Depth',
      severity: 'Medium',
      title: 'Single Product Relationship',
      reason: `Customer holds only ${activeProducts.length} active product (${activeProducts[0]?.productName || 'Savings Account'}). Eligible for cross-sell discovery.`,
      category: 'Opportunity',
      scoreImpact: 0,
    });
  }

  // 5. Stated Financial Needs (Vehicle, Home, Wealth, Retirement)
  const goalsText = JSON.stringify(customer.financialGoals || []).toLowerCase();
  const interestsText = (customer.interests || []).join(' ').toLowerCase();
  const interactionsText = interactions
    .map((i) => `${i.summary} ${(i.keyTopics || []).join(' ')}`)
    .join(' ')
    .toLowerCase();

  const combinedText = `${goalsText} ${interestsText} ${interactionsText}`;

  if (combinedText.includes('vehicle') || combinedText.includes('car') || combinedText.includes('auto')) {
    signals.push({
      type: 'Potential Vehicle Need',
      severity: 'Medium',
      title: 'Vehicle Purchase Intent Detected',
      reason: 'Customer has explicitly mentioned auto financing interest or vehicle acquisition goal.',
      category: 'Opportunity',
      scoreImpact: +10,
    });
  }

  if (combinedText.includes('home') || combinedText.includes('property') || combinedText.includes('flat') || combinedText.includes('house')) {
    signals.push({
      type: 'Potential Home Need',
      severity: 'High',
      title: 'Real Estate / Home Financing Need',
      reason: 'Home acquisition or property investment requirement identified in relationship history.',
      category: 'Opportunity',
      scoreImpact: +15,
    });
  }

  if (combinedText.includes('investment') || combinedText.includes('wealth') || combinedText.includes('sip') || combinedText.includes('mutual fund') || combinedText.includes('portfolio')) {
    signals.push({
      type: 'Financial Planning Interest',
      severity: 'Medium',
      title: 'Wealth & Investment Planning Need',
      reason: 'Customer indicated desire for portfolio advisory, tax planning, or capital growth solutions.',
      category: 'Opportunity',
      scoreImpact: +10,
    });
  }

  // 6. KYC Pending
  if (customer.kycStatus !== 'Verified') {
    signals.push({
      type: 'KYC Pending',
      severity: customer.kycStatus === 'Additional Information Required' ? 'High' : 'Medium',
      title: 'KYC Compliance Action Required',
      reason: `Customer KYC status is "${customer.kycStatus}". Regulatory documentation checklist incomplete.`,
      category: 'Compliance',
      scoreImpact: -15,
    });
  }

  // 7. Open Opportunity
  const openOpps = opportunities.filter((o) => o.status === 'Open' || o.status === 'In Progress');
  if (openOpps.length > 0) {
    signals.push({
      type: 'Open Opportunity',
      severity: 'Info',
      title: 'Active Deal Pipeline',
      reason: `${openOpps.length} active solution opportunity underway: ${openOpps[0].title}.`,
      category: 'Opportunity',
      scoreImpact: +10,
    });
  }

  // 8. New Customer
  if (customer.customerSince && differenceInDays(now, new Date(customer.customerSince)) <= 60) {
    signals.push({
      type: 'New Customer',
      severity: 'Info',
      title: 'New Customer Onboarding Window',
      reason: 'Customer joined within the last 60 days. Critical 90-day onboarding engagement phase.',
      category: 'Engagement',
      scoreImpact: +5,
    });
  }

  return signals;
}

/**
 * Deterministic Opportunity Engine
 */
function detectOpportunities({ customer, signals = [], existingOpportunities = [] }) {
  const opportunities = [];
  const signalTypes = signals.map((s) => s.type);
  const products = (customer.existingProducts || []).map((p) => p.category);

  // Vehicle Opportunity
  if (
    (signalTypes.includes('Potential Vehicle Need') ||
      customer.financialGoals?.some((g) => g.goal?.toLowerCase().includes('car') || g.goal?.toLowerCase().includes('vehicle'))) &&
    !products.includes('Vehicle Financing')
  ) {
    opportunities.push({
      title: 'Vehicle Financing Consultation',
      category: 'Vehicle Financing',
      estimatedValue: 850000,
      confidenceScore: 85,
      detectedReason: 'Customer explicitly stated upcoming vehicle purchase requirement with active savings relationship.',
      suggestedAction: 'Schedule customer consultation to review customized vehicle loan terms & pre-approved limits.',
      stage: 'Detected',
    });
  }

  // Home Loan Opportunity
  if (
    (signalTypes.includes('Potential Home Need') ||
      customer.financialGoals?.some((g) => g.goal?.toLowerCase().includes('home') || g.goal?.toLowerCase().includes('property'))) &&
    !products.includes('Home Financing')
  ) {
    opportunities.push({
      title: 'Home Financing & Property Advisory',
      category: 'Home Financing',
      estimatedValue: 4500000,
      confidenceScore: 80,
      detectedReason: 'Stated goal for real estate investment or residential purchase.',
      suggestedAction: 'Connect with mortgage specialist to share property loan eligibility and interest rate structuring.',
      stage: 'Detected',
    });
  }

  // Wealth & Investment Advisory
  if (
    (signalTypes.includes('Financial Planning Interest') ||
      customer.segment === 'High Value' ||
      customer.incomeRange === '25-50 LPA' ||
      customer.incomeRange === '50 LPA - 1 Cr' ||
      customer.incomeRange === '> 1 Cr') &&
    !products.includes('Wealth & Investments')
  ) {
    opportunities.push({
      title: 'Personalized Wealth & Portfolio Advisory',
      category: 'Investment Advisory',
      estimatedValue: 1200000,
      confidenceScore: 78,
      detectedReason: 'High disposable income bracket with long-term capital appreciation and tax optimization goals.',
      suggestedAction: 'Conduct comprehensive portfolio review and introduce wealth management solutions.',
      stage: 'Detected',
    });
  }

  // Premium Banking Upgrade
  if (
    (customer.segment === 'Salaried' || customer.segment === 'Young Professional') &&
    customer.relationshipHealthScore >= 70 &&
    !products.includes('Credit Cards')
  ) {
    opportunities.push({
      title: 'Premium Card & Banking Tier Upgrade',
      category: 'Premium Banking Upgrade',
      estimatedValue: 300000,
      confidenceScore: 72,
      detectedReason: 'Consistent engagement and healthy relationship metrics qualify customer for elite privileges.',
      suggestedAction: 'Present premium lifestyle card with airport lounge, reward multipliers, and zero forex markup.',
      stage: 'Detected',
    });
  }

  return opportunities;
}

/**
 * Deterministic Priority & "Why Today?" Engine
 */
function calculatePriority({
  customer,
  health,
  signals = [],
  followups = [],
  opportunities = [],
}) {
  const reasons = [];
  let score = 30; // base score

  const now = new Date();
  const daysSince = getDaysSinceLastInteraction(customer.lastInteraction);

  // 1. Overdue Follow-ups (+35 pts, Urgent)
  const overdue = followups.filter(
    (f) => f.status === 'Pending' && new Date(f.scheduledDate) < now
  );
  if (overdue.length > 0) {
    score += 35;
    reasons.push(`Follow-up "${overdue[0].title}" is overdue`);
  }

  // 2. Dormancy / Inactivity (+25 pts)
  if (daysSince >= 60) {
    score += 25;
    reasons.push(`No interaction for ${daysSince} days`);
  } else if (daysSince >= 35) {
    score += 15;
    reasons.push(`No touchpoint in over a month (${daysSince} days)`);
  }

  // 3. Stated Need / Opportunity Signal (+20 pts)
  const needSignal = signals.find((s) => s.category === 'Opportunity');
  if (needSignal) {
    score += 20;
    reasons.push(`Active opportunity signal: ${needSignal.title}`);
  }

  // 4. Low Health / At Risk (+15 pts)
  if (health.score < 60) {
    score += 15;
    reasons.push(`Relationship health dropped to ${health.score}/100`);
  }

  // 5. KYC Pending (+15 pts)
  if (customer.kycStatus && customer.kycStatus !== 'Verified') {
    score += 15;
    reasons.push(`KYC status is ${customer.kycStatus}`);
  }

  // 6. High Value Segment Weight (+10 pts)
  if (customer.segment === 'High Value' || customer.totalRelationshipValue > 2500000) {
    score += 10;
    reasons.push('High-value relationship requiring proactive coverage');
  }

  const normalizedScore = Math.min(100, Math.max(15, score));

  let classification = 'Low Priority';
  let recommendedAction = 'Review relationship record periodically';

  if (normalizedScore >= 80) {
    classification = 'High Priority';
    if (overdue.length > 0) {
      recommendedAction = 'Complete overdue follow-up & update customer notes';
    } else if (daysSince >= 60) {
      recommendedAction = 'Schedule relationship check-in call to re-establish engagement';
    } else if (needSignal) {
      recommendedAction = `Schedule customer consultation regarding ${needSignal.title}`;
    } else {
      recommendedAction = 'Reach out for proactive quarterly relationship review';
    }
  } else if (normalizedScore >= 60) {
    classification = 'Medium Priority';
    if (needSignal) {
      recommendedAction = 'Send tailored solution brief & follow up via phone call';
    } else if (customer.kycStatus !== 'Verified') {
      recommendedAction = 'Request updated KYC documents for regulatory compliance';
    } else {
      recommendedAction = 'Review customer needs and schedule portfolio touchpoint';
    }
  } else if (normalizedScore >= 40) {
    classification = 'Monitor';
    recommendedAction = 'Monitor transaction activity and engagement signals';
  }

  if (reasons.length === 0) {
    reasons.push('Regular relationship maintenance schedule');
  }

  return {
    priorityScore: normalizedScore,
    classification,
    reasons,
    recommendedAction,
  };
}

/**
 * "What Changed?" Trend Analysis
 */
function analyzeRelationshipChanges({ customer, interactions = [] }) {
  const now = new Date();
  const last30Days = interactions.filter(
    (i) => differenceInDays(now, new Date(i.date || i.createdAt)) <= 30
  );
  const prev30to60Days = interactions.filter((i) => {
    const diff = differenceInDays(now, new Date(i.date || i.createdAt));
    return diff > 30 && diff <= 60;
  });

  const changes = [];

  if (last30Days.length === 0 && prev30to60Days.length >= 2) {
    changes.push({
      type: 'Decline',
      title: 'Engagement Velocity Dropped',
      description: `Customer had ${prev30to60Days.length} interactions last month, but 0 in the last 30 days.`,
      action: 'Initiate proactive check-in call',
    });
  } else if (last30Days.length >= 2 && prev30to60Days.length === 0) {
    changes.push({
      type: 'Increase',
      title: 'Engagement Surge Detected',
      description: `Recent spike in customer touchpoints (${last30Days.length} meetings/calls in past 30 days).`,
      action: 'Capitalize on active dialogue to advance open opportunities',
    });
  }

  if (customer.kycStatus === 'Pending' || customer.kycStatus === 'Additional Information Required') {
    changes.push({
      type: 'Compliance',
      title: 'Compliance Action Needed',
      description: `KYC verification status changed to ${customer.kycStatus}.`,
      action: 'Collect missing identity or address documents',
    });
  }

  if (changes.length === 0) {
    changes.push({
      type: 'Stable',
      title: 'Relationship Pattern Stable',
      description: 'Touchpoint frequency and account behavior align with historical baselines.',
      action: 'Maintain standard relationship schedule',
    });
  }

  return changes;
}

module.exports = {
  calculateRelationshipHealth,
  detectSignals,
  detectOpportunities,
  calculatePriority,
  analyzeRelationshipChanges,
  getDaysSinceLastInteraction,
};
