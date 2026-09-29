const Recommendation = require('../models/Recommendation');
const Customer = require('../models/Customer');
const { refreshCustomerIntelligence } = require('./customerController');

// @desc    Get recommendations for a specific customer
// @route   GET /api/recommendations/:customerId
// @access  Private
const getCustomerRecommendations = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    let customer = null;
    if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: customerId, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const recommendations = await Recommendation.find({ customerId: customer._id })
      .sort({ generatedDate: -1 });

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger fresh analysis for customer
// @route   POST /api/recommendations/analyze/:customerId
// @access  Private
const triggerCustomerAnalysis = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    let customer = null;
    if (customerId.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: customerId, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const intelligence = await refreshCustomerIntelligence(customer._id);

    res.json({
      success: true,
      data: intelligence,
      message: 'Customer relationship intelligence re-evaluated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerRecommendations,
  triggerCustomerAnalysis,
};
