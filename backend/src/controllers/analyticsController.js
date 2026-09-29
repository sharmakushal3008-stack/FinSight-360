const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Interaction = require('../models/Interaction');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const { subDays, subMonths, subYears, format } = require('date-fns');

// @desc    Get comprehensive RM Analytics with Date Range Filter
// @route   GET /api/analytics/dashboard
// @access  Private
const getAnalyticsDashboard = async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query; // 7d, 30d, 90d, 6m, 1y

    const now = new Date();
    let startDate;

    switch (timeframe) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subYears(now, 1);
        break;
      case '30d':
      default:
        startDate = subDays(now, 30);
        break;
    }

    const userId = req.user._id;

    // Get user customer IDs
    const userCustomers = await Customer.find({ assignedRM: userId }).select('_id');
    const userCustomerIds = userCustomers.map((c) => c._id);

    // 1. Core Summary Metrics
    const [
      totalCustomers,
      newCustomersInPeriod,
      totalLeads,
      convertedLeads,
      lostLeads,
      totalInteractions,
      followupsCompleted,
      followupsOverdue,
      totalOppPipeline,
      avgHealthData,
    ] = await Promise.all([
      Customer.countDocuments({ assignedRM: userId }),
      Customer.countDocuments({ assignedRM: userId, customerSince: { $gte: startDate } }),
      Lead.countDocuments({ assignedRM: userId, createdAt: { $gte: startDate } }),
      Lead.countDocuments({ assignedRM: userId, status: 'CONVERTED', updatedAt: { $gte: startDate } }),
      Lead.countDocuments({ assignedRM: userId, status: 'LOST', updatedAt: { $gte: startDate } }),
      Interaction.countDocuments({ customerId: { $in: userCustomerIds }, date: { $gte: startDate } }),
      FollowUp.countDocuments({ assignedRM: userId, status: 'Completed', completedDate: { $gte: startDate } }),
      FollowUp.countDocuments({ assignedRM: userId, status: 'Pending', scheduledDate: { $lt: now } }),
      Opportunity.aggregate([
        { $match: { customerId: { $in: userCustomerIds }, status: { $in: ['Open', 'In Progress'] } } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' }, count: { $sum: 1 } } },
      ]),
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
    ]);

    const conversionRate =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const followUpSuccessRate =
      followupsCompleted + followupsOverdue > 0
        ? Math.round(
            (followupsCompleted / (followupsCompleted + followupsOverdue)) * 100
          )
        : 85;

    // 2. Acquisition Trends (grouped by month/date)
    const customerAcquisitionTimeline = await Customer.aggregate([
      { $match: { assignedRM: userId, customerSince: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$customerSince' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Lead Conversion Funnel
    const funnelStages = await Lead.aggregate([
      { $match: { assignedRM: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
    ]);

    // Format fixed stages for smooth funnel chart
    const stageOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'DOCUMENTATION', 'CONVERTED', 'LOST'];
    const funnel = stageOrder.map((stage) => {
      const match = funnelStages.find((s) => s._id === stage);
      return {
        stage,
        count: match ? match.count : 0,
        value: match ? match.totalValue : 0,
      };
    });

    // 4. Relationship Health Distribution
    const healthTiers = await Customer.aggregate([
      { $match: { assignedRM: userId } },
      {
        $bucket: {
          groupBy: '$relationshipHealthScore',
          boundaries: [0, 50, 70, 85, 101],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const formattedHealthTiers = [
      { name: 'Critical / Dormant (0-49)', count: 0, color: '#EF4444' },
      { name: 'Needs Attention (50-69)', count: 0, color: '#F59E0B' },
      { name: 'Good Standing (70-84)', count: 0, color: '#3B82F6' },
      { name: 'Champion / High Value (85-100)', count: 0, color: '#10B981' },
    ];

    healthTiers.forEach((tier) => {
      if (tier._id === 0) formattedHealthTiers[0].count = tier.count;
      else if (tier._id === 50) formattedHealthTiers[1].count = tier.count;
      else if (tier._id === 70) formattedHealthTiers[2].count = tier.count;
      else if (tier._id === 85) formattedHealthTiers[3].count = tier.count;
    });

    // 5. Product Adoption Distribution
    const productDistribution = await Customer.aggregate([
      { $match: { assignedRM: userId } },
      { $unwind: '$existingProducts' },
      {
        $group: {
          _id: '$existingProducts.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 6. Segment Analysis
    const segmentAnalysis = await Customer.aggregate([
      { $match: { assignedRM: userId } },
      {
        $group: {
          _id: '$segment',
          customerCount: { $sum: 1 },
          avgHealth: { $avg: '$relationshipHealthScore' },
          avgEngagement: { $avg: '$engagementScore' },
          totalValue: { $sum: '$totalRelationshipValue' },
        },
      },
      { $sort: { customerCount: -1 } },
    ]);

    // 7. Opportunity Category Breakdown
    const opportunityBreakdown = await Opportunity.aggregate([
      { $match: { customerId: { $in: userCustomerIds } } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        timeframe,
        metrics: {
          totalCustomers,
          newCustomersInPeriod,
          totalLeads,
          convertedLeads,
          lostLeads,
          conversionRate,
          totalInteractions,
          followupsCompleted,
          followupsOverdue,
          followUpSuccessRate,
          opportunityPipelineValue: totalOppPipeline[0]?.total || 0,
          opportunityCount: totalOppPipeline[0]?.count || 0,
          avgHealth: avgHealthData[0]?.avgHealth ? Math.round(avgHealthData[0].avgHealth) : 75,
          avgEngagement: avgHealthData[0]?.avgEngagement ? Math.round(avgHealthData[0].avgEngagement) : 70,
        },
        acquisitionTimeline: customerAcquisitionTimeline,
        funnel,
        healthTiers: formattedHealthTiers,
        productDistribution: productDistribution.map((p) => ({ category: p._id || 'General', count: p.count })),
        segmentAnalysis: segmentAnalysis.map((s) => ({
          segment: s._id,
          customerCount: s.customerCount,
          avgHealth: Math.round(s.avgHealth),
          avgEngagement: Math.round(s.avgEngagement),
          totalValue: s.totalValue,
        })),
        opportunityBreakdown: opportunityBreakdown.map((o) => ({
          category: o._id,
          count: o.count,
          value: o.totalValue,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsDashboard,
};
