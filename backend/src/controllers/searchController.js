const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Opportunity = require('../models/Opportunity');

// @desc    Global instant search across Customers, Leads, Follow-ups, Opportunities
// @route   GET /api/search
// @access  Private
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          customers: [],
          leads: [],
          followups: [],
          opportunities: [],
          totalResults: 0,
        },
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const userCustomers = await Customer.find({ assignedRM: req.user._id }).select('_id');
    const userCustomerIds = userCustomers.map((c) => c._id);

    const [customers, leads, followups, opportunities] = await Promise.all([
      Customer.find({
        assignedRM: req.user._id,
        $or: [
          { firstName: regex },
          { lastName: regex },
          { customerId: regex },
          { email: regex },
          { phone: regex },
          { city: regex },
          { occupation: regex },
        ],
      })
        .limit(6)
        .select('customerId firstName lastName city segment relationshipHealthScore relationshipStatus priorityClassification'),

      Lead.find({
        assignedRM: req.user._id,
        $or: [
          { name: regex },
          { leadId: regex },
          { email: regex },
          { phone: regex },
          { requirement: regex },
        ],
      })
        .limit(6)
        .select('leadId name requirement status priority estimatedValue city'),

      FollowUp.find({
        assignedRM: req.user._id,
        $or: [{ title: regex }, { purpose: regex }, { notes: regex }],
      })
        .limit(6)
        .populate('customerId', 'customerId firstName lastName')
        .select('followUpId title scheduledDate purpose status priority'),

      Opportunity.find({
        customerId: { $in: userCustomerIds },
        $or: [{ title: regex }, { category: regex }, { detectedReason: regex }],
      })
        .limit(6)
        .populate('customerId', 'customerId firstName lastName')
        .select('opportunityId title category estimatedValue stage status'),
    ]);

    const totalResults =
      customers.length + leads.length + followups.length + opportunities.length;

    res.json({
      success: true,
      data: {
        customers,
        leads,
        followups,
        opportunities,
        totalResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch,
};
