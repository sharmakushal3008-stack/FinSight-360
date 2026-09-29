const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const FollowUp = require('../models/FollowUp');
const RelationshipSignal = require('../models/RelationshipSignal');
const Opportunity = require('../models/Opportunity');
const Recommendation = require('../models/Recommendation');
const KYCRecord = require('../models/KYCRecord');
const {
  calculateRelationshipHealth,
  detectSignals,
  detectOpportunities,
  calculatePriority,
  analyzeRelationshipChanges,
} = require('../services/intelligenceEngine');

// Helper to recalculate & update customer intelligence fields
async function refreshCustomerIntelligence(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) return null;

  const [interactions, followups, opportunities] = await Promise.all([
    Interaction.find({ customerId: customer._id }).sort({ date: -1 }),
    FollowUp.find({ customerId: customer._id }).sort({ scheduledDate: -1 }),
    Opportunity.find({ customerId: customer._id }),
  ]);

  const health = calculateRelationshipHealth({ customer, interactions, followups });
  const signals = detectSignals({ customer, interactions, followups, opportunities });
  const priority = calculatePriority({ customer, health, signals, followups, opportunities });

  customer.relationshipHealthScore = health.score;
  customer.relationshipStatus = health.status;
  customer.healthBreakdown = health.breakdown;
  customer.priorityScore = priority.priorityScore;
  customer.priorityClassification = priority.classification;
  customer.priorityReasons = priority.reasons;
  customer.recommendedAction = priority.recommendedAction;

  await customer.save();
  return { customer, health, signals, priority };
}

// @desc    Get all customers with filtering, sorting, pagination
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const {
      search,
      segment,
      city,
      status,
      priority,
      kycStatus,
      sortBy = 'priorityScore',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      assignedRM: req.user._id,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
      ];
    }

    if (segment && segment !== 'All') {
      query.segment = segment;
    }

    if (city && city !== 'All') {
      query.city = city;
    }

    if (status && status !== 'All') {
      query.relationshipStatus = status;
    }

    if (priority && priority !== 'All') {
      query.priorityClassification = priority;
    }

    if (kycStatus && kycStatus !== 'All') {
      query.kycStatus = kycStatus;
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, customers] = await Promise.all([
      Customer.countDocuments(query),
      Customer.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('assignedRM', 'name email'),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer by ID or customerId
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id }).populate('assignedRM', 'name email role');
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id }).populate('assignedRM', 'name email role');
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found in your portfolio',
      });
    }

    // Refresh health and intelligence metrics
    const [interactions, followups, signals, opportunities, recommendations, kycRecord] =
      await Promise.all([
        Interaction.find({ customerId: customer._id }).sort({ date: -1 }),
        FollowUp.find({ customerId: customer._id }).sort({ scheduledDate: -1 }),
        RelationshipSignal.find({ customerId: customer._id }).sort({ detectedDate: -1 }),
        Opportunity.find({ customerId: customer._id }).sort({ createdAt: -1 }),
        Recommendation.find({ customerId: customer._id }).sort({ generatedDate: -1 }),
        KYCRecord.findOne({ customerId: customer._id }),
      ]);

    const changes = analyzeRelationshipChanges({ customer, interactions });

    res.json({
      success: true,
      data: {
        customer,
        interactions,
        followups,
        signals,
        opportunities,
        recommendations,
        kycRecord,
        changes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const customerCount = await Customer.countDocuments();
    const customerId = `CUST-${String(customerCount + 101).padStart(4, '0')}`;

    const customerData = {
      ...req.body,
      customerId,
      assignedRM: req.user?._id || req.body.assignedRM,
    };

    const customer = await Customer.create(customerData);

    // Create initial KYC record
    await KYCRecord.create({
      recordId: `KYC-${customerId}`,
      customerId: customer._id,
      status: customer.kycStatus || 'Verified',
      complianceChecklist: [
        { item: 'Identity Document Verified', passed: true },
        { item: 'Address Proof Validated', passed: true },
        { item: 'PAN Verified with Income Tax Database', passed: true },
        { item: 'Anti-Money Laundering (AML) Screen Passed', passed: true },
      ],
    });

    // Run initial intelligence evaluation
    await refreshCustomerIntelligence(customer._id);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found in your portfolio',
      });
    }

    Object.assign(customer, req.body);
    customer.assignedRM = req.user._id;
    await customer.save();

    // Re-evaluate intelligence
    await refreshCustomerIntelligence(customer._id);

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOneAndDelete({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOneAndDelete({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found in your portfolio',
      });
    }

    // Clean up related records
    await Promise.all([
      Interaction.deleteMany({ customerId: customer._id }),
      FollowUp.deleteMany({ customerId: customer._id }),
      RelationshipSignal.deleteMany({ customerId: customer._id }),
      Opportunity.deleteMany({ customerId: customer._id }),
      Recommendation.deleteMany({ customerId: customer._id }),
      KYCRecord.deleteMany({ customerId: customer._id }),
    ]);

    res.json({
      success: true,
      message: 'Customer and associated relationship records deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer intelligence details (Explainable health breakdown)
// @route   GET /api/customers/:id/intelligence
// @access  Private
const getCustomerIntelligence = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const [interactions, followups, opportunities] = await Promise.all([
      Interaction.find({ customerId: customer._id }).sort({ date: -1 }),
      FollowUp.find({ customerId: customer._id }).sort({ scheduledDate: -1 }),
      Opportunity.find({ customerId: customer._id }),
    ]);

    const health = calculateRelationshipHealth({ customer, interactions, followups });
    const signals = detectSignals({ customer, interactions, followups, opportunities });
    const priority = calculatePriority({ customer, health, signals, followups, opportunities });
    const changes = analyzeRelationshipChanges({ customer, interactions });

    res.json({
      success: true,
      data: {
        customerId: customer.customerId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        relationshipHealthScore: health.score,
        relationshipStatus: health.status,
        healthBreakdown: health.breakdown,
        priority,
        signals,
        changes,
        modelType: 'Deterministic Explainable Banking Intelligence Model',
        disclaimer: 'Demo Relationship Health Indicator for educational purposes.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chronological unified timeline for customer
// @route   GET /api/customers/:id/timeline
// @access  Private
const getCustomerTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const [interactions, followups, signals] = await Promise.all([
      Interaction.find({ customerId: customer._id }),
      FollowUp.find({ customerId: customer._id }),
      RelationshipSignal.find({ customerId: customer._id }),
    ]);

    const timelineEvents = [];

    // Onboarding event
    timelineEvents.push({
      id: 'onboard-1',
      date: customer.customerSince || customer.createdAt,
      type: 'Onboarding',
      title: 'Customer Onboarded',
      description: `Relationship established in ${customer.city} branch as ${customer.segment}.`,
      icon: 'UserPlus',
      badgeColor: 'blue',
    });

    // Products events
    (customer.existingProducts || []).forEach((prod, index) => {
      timelineEvents.push({
        id: `prod-${index}`,
        date: prod.openedDate || customer.customerSince || new Date(),
        type: 'Product Established',
        title: `${prod.productName || prod.category} Opened`,
        description: `Account initialized with limit/balance of ₹${(prod.balanceOrLimit || 0).toLocaleString('en-IN')}.`,
        icon: 'CreditCard',
        badgeColor: 'teal',
      });
    });

    // Interaction events
    interactions.forEach((item) => {
      timelineEvents.push({
        id: item._id,
        date: item.date || item.createdAt,
        type: 'Interaction',
        title: `${item.type} (${item.channel})`,
        description: item.summary,
        outcome: item.outcome,
        sentiment: item.sentiment,
        icon: 'MessageSquare',
        badgeColor: 'indigo',
      });
    });

    // Followup events
    followups.forEach((f) => {
      timelineEvents.push({
        id: f._id,
        date: f.completedDate || f.scheduledDate,
        type: 'Follow-up',
        title: `Follow-up: ${f.title}`,
        description: `Status: ${f.status} | Purpose: ${f.purpose}`,
        icon: 'Calendar',
        badgeColor: f.status === 'Completed' ? 'green' : 'amber',
      });
    });

    // Signal events
    signals.forEach((s) => {
      timelineEvents.push({
        id: s._id,
        date: s.detectedDate,
        type: 'Signal Detected',
        title: s.title,
        description: s.reason,
        severity: s.severity,
        icon: 'Zap',
        badgeColor: s.severity === 'High' ? 'red' : 'purple',
      });
    });

    // Sort in reverse chronological order
    timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: timelineEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new interaction for customer
// @route   POST /api/customers/:id/interactions
// @access  Private
const addCustomerInteraction = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const interactionCount = await Interaction.countDocuments();
    const interactionId = `INT-${String(interactionCount + 101).padStart(4, '0')}`;

    const interaction = await Interaction.create({
      interactionId,
      customerId: customer._id,
      type: req.body.type || 'Phone Call',
      channel: req.body.channel || 'Outbound Call',
      date: req.body.date ? new Date(req.body.date) : new Date(),
      summary: req.body.summary,
      outcome: req.body.outcome || 'Neutral - Information Provided',
      sentiment: req.body.sentiment || 'Positive',
      keyTopics: req.body.keyTopics || [],
      nextActionNeeded: req.body.nextActionNeeded || '',
      recordedBy: req.user?._id,
    });

    // Update customer lastInteraction date & bump engagement
    customer.lastInteraction = interaction.date;
    customer.engagementScore = Math.min(100, (customer.engagementScore || 70) + 5);
    await customer.save();

    // Re-evaluate intelligence & priority
    await refreshCustomerIntelligence(customer._id);

    res.status(201).json({
      success: true,
      data: interaction,
      message: 'Interaction recorded and relationship metrics updated',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerIntelligence,
  getCustomerTimeline,
  addCustomerInteraction,
  refreshCustomerIntelligence,
};
