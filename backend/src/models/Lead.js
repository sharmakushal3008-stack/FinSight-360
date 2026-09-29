const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: ['Jaipur', 'Delhi', 'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Chandigarh'],
    },
    source: {
      type: String,
      enum: ['Branch Walk-in', 'Digital Campaign', 'Customer Referral', 'Website Enquiry', 'Relationship Cross-sell', 'Partner Channel', 'Tele-outreach'],
      default: 'Website Enquiry',
    },
    segment: {
      type: String,
      enum: [
        'New Customer',
        'Young Professional',
        'Salaried',
        'Self-Employed',
        'High Value',
        'Family Banking',
        'Dormant',
      ],
      default: 'Salaried',
    },
    requirement: {
      type: String,
      required: [true, 'Requirement is required'],
    },
    productCategory: {
      type: String,
      enum: ['Savings & Deposits', 'Vehicle Financing', 'Home Financing', 'Credit Cards', 'Wealth & Investments', 'Insurance & Protection', 'SME Business Loan'],
      default: 'Savings & Deposits',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    estimatedValue: {
      type: Number,
      default: 500000,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'DOCUMENTATION', 'CONVERTED', 'LOST'],
      default: 'NEW',
    },
    assignedRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    lastContact: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    lostReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });

module.exports = mongoose.model('Lead', leadSchema);
