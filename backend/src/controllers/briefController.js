const Customer = require('../models/Customer');
const Interaction = require('../models/Interaction');
const FollowUp = require('../models/FollowUp');
const RelationshipSignal = require('../models/RelationshipSignal');
const Opportunity = require('../models/Opportunity');
const Recommendation = require('../models/Recommendation');
const { generateCustomerBrief } = require('../services/geminiService');

// @desc    Prepare AI Customer Brief for Relationship Manager call
// @route   POST /api/customers/:id/brief
// @access  Private
const prepareCustomerBrief = async (req, res, next) => {
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

    const [interactions, followups, signals, opportunities] = await Promise.all([
      Interaction.find({ customerId: customer._id }).sort({ date: -1 }).limit(10),
      FollowUp.find({ customerId: customer._id }).sort({ scheduledDate: -1 }).limit(5),
      RelationshipSignal.find({ customerId: customer._id }).sort({ detectedDate: -1 }),
      Opportunity.find({ customerId: customer._id }),
    ]);

    const customerData = {
      customer,
      interactions,
      followups,
      signals,
      opportunities,
    };

    const brief = await generateCustomerBrief(customerData);

    // Save as Recommendation record
    const count = await Recommendation.countDocuments();
    const recommendationId = `REC-${String(count + 101).padStart(4, '0')}`;

    const savedRecommendation = await Recommendation.create({
      recommendationId,
      customerId: customer._id,
      objective: brief.recommendedObjective,
      talkingPoints: brief.suggestedTalkingPoints,
      suggestedProducts: brief.suggestedProducts,
      rationale: brief.rationale,
      priorityScore: customer.priorityScore || 75,
      source: brief.source,
      status: 'Active',
      generatedDate: new Date(),
    });

    res.json({
      success: true,
      data: {
        ...brief,
        recommendationId: savedRecommendation.recommendationId,
        _id: savedRecommendation._id,
      },
      message: `Customer Brief prepared successfully (${brief.source})`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  prepareCustomerBrief,
};
