const FollowUp = require('../models/FollowUp');
const Customer = require('../models/Customer');
const { refreshCustomerIntelligence } = require('./customerController');

// @desc    Get followups with filtering (Today, Upcoming, Overdue, Completed)
// @route   GET /api/followups
// @access  Private
const getFollowUps = async (req, res, next) => {
  try {
    const {
      filter = 'all', // all, today, upcoming, overdue, completed
      priority,
      customerId,
      search,
    } = req.query;

    const query = {
      assignedRM: req.user._id,
    };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (filter === 'today') {
      query.status = { $ne: 'Completed' };
      query.scheduledDate = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'overdue') {
      query.status = 'Pending';
      query.scheduledDate = { $lt: todayStart };
    } else if (filter === 'upcoming') {
      query.status = 'Pending';
      query.scheduledDate = { $gt: todayEnd };
    } else if (filter === 'completed') {
      query.status = 'Completed';
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const followups = await FollowUp.find(query)
      .sort({ scheduledDate: 1 })
      .populate('customerId', 'customerId firstName lastName phone email segment city')
      .populate('leadId', 'name phone requirement');

    // Also gather count stats for tabs
    const [todayCount, upcomingCount, overdueCount, completedCount] = await Promise.all([
      FollowUp.countDocuments({
        assignedRM: req.user._id,
        status: { $ne: 'Completed' },
        scheduledDate: { $gte: todayStart, $lte: todayEnd },
      }),
      FollowUp.countDocuments({
        assignedRM: req.user._id,
        status: 'Pending',
        scheduledDate: { $gt: todayEnd },
      }),
      FollowUp.countDocuments({
        assignedRM: req.user._id,
        status: 'Pending',
        scheduledDate: { $lt: todayStart },
      }),
      FollowUp.countDocuments({
        assignedRM: req.user._id,
        status: 'Completed',
      }),
    ]);

    res.json({
      success: true,
      data: {
        followups,
        stats: {
          todayCount,
          upcomingCount,
          overdueCount,
          completedCount,
          total: followups.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new follow-up
// @route   POST /api/followups
// @access  Private
const createFollowUp = async (req, res, next) => {
  try {
    const count = await FollowUp.countDocuments();
    const followUpId = `FOL-${String(count + 101).padStart(4, '0')}`;

    const followUp = await FollowUp.create({
      ...req.body,
      followUpId,
      assignedRM: req.user._id,
    });

    if (req.body.customerId) {
      const cust = await Customer.findOne({ _id: req.body.customerId, assignedRM: req.user._id });
      if (cust) {
        cust.nextFollowUp = req.body.scheduledDate;
        await cust.save();
        await refreshCustomerIntelligence(cust._id);
      }
    }

    res.status(201).json({
      success: true,
      data: followUp,
      message: 'Follow-up scheduled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up
// @route   PUT /api/followups/:id
// @access  Private
const updateFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, assignedRM: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found in your portfolio' });
    }

    if (followUp.customerId) {
      await refreshCustomerIntelligence(followUp.customerId);
    }

    res.json({
      success: true,
      data: followUp,
      message: 'Follow-up updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark follow-up as completed
// @route   PUT /api/followups/:id/complete
// @access  Private
const completeFollowUp = async (req, res, next) => {
  try {
    const { outcome, notes } = req.body;

    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, assignedRM: req.user._id },
      {
        status: 'Completed',
        completedDate: new Date(),
        outcome: outcome || 'Follow-up completed successfully.',
        notes: notes || undefined,
      },
      { new: true }
    );

    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found in your portfolio' });
    }

    if (followUp.customerId) {
      const customer = await Customer.findOne({ _id: followUp.customerId, assignedRM: req.user._id });
      if (customer) {
        customer.lastInteraction = new Date();
        customer.engagementScore = Math.min(100, (customer.engagementScore || 70) + 4);
        await customer.save();
        await refreshCustomerIntelligence(customer._id);
      }
    }

    res.json({
      success: true,
      data: followUp,
      message: 'Follow-up marked as completed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete follow-up
// @route   DELETE /api/followups/:id
// @access  Private
const deleteFollowUp = async (req, res, next) => {
  try {
    const followUp = await FollowUp.findOneAndDelete({ _id: req.params.id, assignedRM: req.user._id });
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found in your portfolio' });
    }

    if (followUp.customerId) {
      await refreshCustomerIntelligence(followUp.customerId);
    }

    res.json({ success: true, message: 'Follow-up deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
};
