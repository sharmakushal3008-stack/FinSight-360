const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const RelationshipSignal = require('../models/RelationshipSignal');
const { analyzeRelationshipChanges } = require('../services/intelligenceEngine');

// @desc    Get RM Command Center Dashboard Metrics
// @route   GET /api/dashboard
// @access  Private
const getDashboardOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const userId = req.user._id;

    // First find this user's customer IDs for relational queries
    const userCustomers = await Customer.find({ assignedRM: userId }).select('_id');
    const userCustomerIds = userCustomers.map((c) => c._id);

    // Parallel aggregate queries
    const [
      totalCustomers,
      activeRelationships,
      needingAttention,
      dormantCount,
      openOpportunities,
      totalOpportunitiesValue,
      pendingFollowUps,
      overdueFollowUps,
      todayFollowUps,
      newLeads,
      totalLeads,
      convertedLeads,
      avgHealthResult,
      topPriorities,
      recentSignals,
      recentFollowups,
      pipelineStages,
      segmentDistribution,
      healthDistribution,
    ] = await Promise.all([
      Customer.countDocuments({ assignedRM: userId }),
      Customer.countDocuments({ assignedRM: userId, relationshipStatus: { $in: ['Active', 'High Opportunity'] } }),
      Customer.countDocuments({ assignedRM: userId, relationshipStatus: 'Needs Attention' }),
      Customer.countDocuments({ assignedRM: userId, relationshipStatus: 'Dormant' }),
      Opportunity.countDocuments({ customerId: { $in: userCustomerIds }, status: { $in: ['Open', 'In Progress'] } }),
      Opportunity.aggregate([
        { $match: { customerId: { $in: userCustomerIds }, status: { $in: ['Open', 'In Progress'] } } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } },
      ]),
      FollowUp.countDocuments({ assignedRM: userId, status: 'Pending' }),
      FollowUp.countDocuments({ assignedRM: userId, status: 'Pending', scheduledDate: { $lt: new Date() } }),
      FollowUp.countDocuments({
        assignedRM: userId,
        status: 'Pending',
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Lead.countDocuments({ assignedRM: userId, status: 'NEW' }),
      Lead.countDocuments({ assignedRM: userId }),
      Lead.countDocuments({ assignedRM: userId, status: 'CONVERTED' }),
      Customer.aggregate([
        { $match: { assignedRM: userId } },
        {
          $group: {
            _id: null,
            avgHealth: { $avg: '$relationshipHealthScore' },
            avgEngagement: { $avg: '$engagementScore' },
          },
        },
      ]),
      // Top Priorities from Customers ranked by priorityScore
      Customer.find({ assignedRM: userId })
        .sort({ priorityScore: -1 })
        .limit(5)
        .select(
          'customerId firstName lastName segment priorityScore priorityClassification priorityReasons recommendedAction relationshipHealthScore lastInteraction city'
        ),
      // Recent active signals for user's customers
      RelationshipSignal.find({ customerId: { $in: userCustomerIds }, status: 'Active' })
        .sort({ detectedDate: -1 })
        .limit(6)
        .populate('customerId', 'customerId firstName lastName segment'),
      // Followup Queue
      FollowUp.find({ assignedRM: userId, status: 'Pending' })
        .sort({ scheduledDate: 1 })
        .limit(5)
        .populate('customerId', 'customerId firstName lastName phone segment')
        .populate('leadId', 'name phone requirement'),
      // Pipeline stage distribution
      Lead.aggregate([
        { $match: { assignedRM: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$estimatedValue' },
          },
        },
      ]),
      // Segment breakdown
      Customer.aggregate([
        { $match: { assignedRM: userId } },
        {
          $group: {
            _id: '$segment',
            count: { $sum: 1 },
            avgHealth: { $avg: '$relationshipHealthScore' },
            avgEngagement: { $avg: '$engagementScore' },
            totalValue: { $sum: '$totalRelationshipValue' },
          },
        },
      ]),
      // Health distribution
      Customer.aggregate([
        { $match: { assignedRM: userId } },
        {
          $bucket: {
            groupBy: '$relationshipHealthScore',
            boundaries: [0, 40, 60, 80, 101],
            default: 'Other',
            output: {
              count: { $sum: 1 },
            },
          },
        },
      ]),
    ]);

    const avgHealth = avgHealthResult[0]?.avgHealth ? Math.round(avgHealthResult[0].avgHealth) : 0;
    const avgEngagement = avgHealthResult[0]?.avgEngagement ? Math.round(avgHealthResult[0].avgEngagement) : 0;
    const oppValue = totalOpportunitiesValue[0]?.total || 0;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          activeRelationships,
          needingAttention,
          dormantCount,
          openOpportunities,
          totalOpportunityPipelineValue: oppValue,
          pendingFollowUps,
          overdueFollowUps,
          todayFollowUps,
          newLeads,
          totalLeads,
          conversionRate,
          averageRelationshipHealth: avgHealth,
          averageEngagement: avgEngagement,
        },
        topPriorities,
        recentSignals,
        followupQueue: recentFollowups,
        pipelineStages,
        segmentDistribution,
        healthDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};
