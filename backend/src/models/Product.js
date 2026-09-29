const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Savings & Deposits',
        'Vehicle Financing',
        'Home Financing',
        'Credit Cards',
        'Wealth & Investments',
        'Insurance & Protection',
        'SME Business Loan',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    customerNeed: {
      type: String,
      required: true,
    },
    eligibilityCriteria: {
      type: String,
      default: '',
    },
    interestRateOrBenefit: {
      type: String,
      default: '',
    },
    minIncome: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Discontinued', 'Seasonal'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
