const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const { refreshCustomerIntelligence } = require('./customerController');

// @desc    Get all leads with filtering, sorting, pagination
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      city,
      source,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      assignedRM: req.user._id,
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (city && city !== 'All') {
      query.city = city;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } },
        { requirement: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('assignedRM', 'name email')
        .populate('customerId', 'customerId firstName lastName'),
    ]);

    res.json({
      success: true,
      data: {
        leads,
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

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, assignedRM: req.user._id })
      .populate('assignedRM', 'name email')
      .populate('customerId', 'customerId firstName lastName email phone');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in your portfolio' });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const count = await Lead.countDocuments();
    const leadId = `LEAD-${String(count + 101).padStart(4, '0')}`;

    const lead = await Lead.create({
      ...req.body,
      leadId,
      assignedRM: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: lead,
      message: 'Lead created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, assignedRM: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in your portfolio' });
    }

    res.json({
      success: true,
      data: lead,
      message: 'Lead updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status (for Kanban drag & drop)
// @route   PUT /api/leads/:id/status
// @access  Private
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, assignedRM: req.user._id },
      { status, lastContact: new Date() },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in your portfolio' });
    }

    res.json({
      success: true,
      data: lead,
      message: `Lead moved to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert lead to full Customer
// @route   POST /api/leads/:id/convert
// @access  Private
const convertLeadToCustomer = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, assignedRM: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in your portfolio' });
    }

    const [firstName, ...rest] = lead.name.split(' ');
    const lastName = rest.join(' ') || 'Customer';

    const customerCount = await Customer.countDocuments();
    const customerId = `CUST-${String(customerCount + 101).padStart(4, '0')}`;

    const newCustomer = await Customer.create({
      customerId,
      firstName,
      lastName,
      email: lead.email,
      phone: lead.phone,
      city: lead.city,
      occupation: 'Salaried Professional',
      age: 32,
      incomeRange: '10-25 LPA',
      customerSince: new Date(),
      segment: lead.segment || 'Salaried',
      relationshipStatus: 'Active',
      engagementScore: 80,
      relationshipHealthScore: 75,
      existingProducts: [
        {
          productName: lead.requirement || 'Primary Savings Account',
          category: lead.productCategory || 'Savings & Deposits',
          accountNumber: `ACC-900${Math.floor(1000 + Math.random() * 9000)}`,
          openedDate: new Date(),
          balanceOrLimit: lead.estimatedValue || 250000,
          status: 'Active',
        },
      ],
      assignedRM: req.user._id,
      totalRelationshipValue: lead.estimatedValue || 250000,
    });

    // Update lead status to CONVERTED
    lead.status = 'CONVERTED';
    lead.customerId = newCustomer._id;
    await lead.save();

    await refreshCustomerIntelligence(newCustomer._id);

    res.status(201).json({
      success: true,
      data: {
        customer: newCustomer,
        lead,
      },
      message: 'Lead converted to active customer relationship successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, assignedRM: req.user._id });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found in your portfolio' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  convertLeadToCustomer,
  deleteLead,
};
