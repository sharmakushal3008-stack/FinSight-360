const Customer = require('../models/Customer');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');
const RelationshipSignal = require('../models/RelationshipSignal');

// @desc    Get Ranked RM Priority Action List ("Why Today?")
// @route   GET /api/priority-center
// @access  Private
const getPriorityCenter = async (req, res, next) => {
  try {
    const {
      classification,
      segment,
      city,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      assignedRM: req.user._id,
    };

    if (classification && classification !== 'All') {
      query.priorityClassification = classification;
    }

    if (segment && segment !== 'All') {
      query.segment = segment;
    }

    if (city && city !== 'All') {
      query.city = city;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { priorityReasons: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Retrieve prioritized customers
    const [total, customers, stats] = await Promise.all([
      Customer.countDocuments(query),
      Customer.find(query)
        .sort({ priorityScore: -1, lastInteraction: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('assignedRM', 'name email'),
      Customer.aggregate([
        { $match: { assignedRM: req.user._id } },
        {
          $group: {
            _id: '$priorityClassification',
            count: { $sum: 1 },
            avgScore: { $avg: '$priorityScore' },
          },
        },
      ]),
    ]);

    // Format priority stats map
    const summaryStats = {
      highPriority: 0,
      mediumPriority: 0,
      monitor: 0,
      lowPriority: 0,
      totalCustomers: total,
    };

    stats.forEach((s) => {
      if (s._id === 'High Priority') summaryStats.highPriority = s.count;
      else if (s._id === 'Medium Priority') summaryStats.mediumPriority = s.count;
      else if (s._id === 'Monitor') summaryStats.monitor = s.count;
      else if (s._id === 'Low Priority') summaryStats.lowPriority = s.count;
    });

    res.json({
      success: true,
      data: {
        priorities: customers,
        stats: summaryStats,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum) || 1,
          limit: limitNum,
        },
        algorithm: 'Deterministic Multi-Factor Relationship Weighting Model',
        disclaimer: 'Demo RM Priority Indicator for relationship management prioritization.',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPriorityCenter,
};
