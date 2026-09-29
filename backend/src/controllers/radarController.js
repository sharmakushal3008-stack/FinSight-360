const Customer = require('../models/Customer');
const Opportunity = require('../models/Opportunity');

// @desc    Get Relationship Radar Data & Quadrant Analysis
// @route   GET /api/relationship-radar
// @access  Private
const getRelationshipRadar = async (req, res, next) => {
  try {
    const { segment, city, status } = req.query;

    const query = {
      assignedRM: req.user._id,
    };
    if (segment && segment !== 'All') query.segment = segment;
    if (city && city !== 'All') query.city = city;
    if (status && status !== 'All') query.relationshipStatus = status;

    const customers = await Customer.find(query)
      .select(
        'customerId firstName lastName city segment relationshipStatus relationshipHealthScore engagementScore totalRelationshipValue existingProducts financialGoals priorityScore priorityClassification lastInteraction'
      )
      .sort({ relationshipHealthScore: -1 });

    // Group into Quadrants for visual intelligence
    const quadrants = {
      champions: [], // High Health (>=75), High Engagement (>=70)
      highOpportunity: [], // High Health (>=70), Low/Med Depth or High Value
      needsAttention: [], // Low Health (<65), High Potential / High Value
      dormant: [], // Low Health (<50), Low Engagement (<50)
    };

    customers.forEach((c) => {
      const health = c.relationshipHealthScore || 70;
      const engagement = c.engagementScore || 65;

      if (health >= 75 && engagement >= 70) {
        quadrants.champions.push(c);
      } else if (health < 50 && engagement < 55) {
        quadrants.dormant.push(c);
      } else if (health < 65) {
        quadrants.needsAttention.push(c);
      } else {
        quadrants.highOpportunity.push(c);
      }
    });

    // Segment summary
    const segmentBreakdown = await Customer.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          avgHealth: { $avg: '$relationshipHealthScore' },
          avgEngagement: { $avg: '$engagementScore' },
          totalValue: { $sum: '$totalRelationshipValue' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        customers,
        quadrants: {
          championsCount: quadrants.champions.length,
          highOpportunityCount: quadrants.highOpportunity.length,
          needsAttentionCount: quadrants.needsAttention.length,
          dormantCount: quadrants.dormant.length,
        },
        segmentBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRelationshipRadar,
};
