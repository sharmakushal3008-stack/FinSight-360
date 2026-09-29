const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
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
    address: {
      type: String,
      default: '',
    },
    occupation: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 100,
    },
    incomeRange: {
      type: String,
      enum: ['< 5 LPA', '5-10 LPA', '10-25 LPA', '25-50 LPA', '50 LPA - 1 Cr', '> 1 Cr'],
      default: '10-25 LPA',
    },
    customerSince: {
      type: Date,
      default: Date.now,
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
    relationshipStatus: {
      type: String,
      enum: ['Active', 'Needs Attention', 'Dormant', 'High Opportunity', 'At Risk'],
      default: 'Active',
    },
    engagementScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    relationshipHealthScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    healthBreakdown: {
      engagement: { type: Number, default: 75 },
      recency: { type: Number, default: 70 },
      interactionFrequency: { type: Number, default: 75 },
      followupReliability: { type: Number, default: 80 },
      relationshipDepth: { type: Number, default: 70 },
      kycCompliance: { type: Number, default: 100 },
      rationale: { type: String, default: 'Calculated using deterministic relationship metrics.' },
    },
    priorityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    priorityClassification: {
      type: String,
      enum: ['High Priority', 'Medium Priority', 'Monitor', 'Low Priority'],
      default: 'Medium Priority',
    },
    priorityReasons: [
      {
        type: String,
      },
    ],
    recommendedAction: {
      type: String,
      default: 'Review relationship profile',
    },
    existingProducts: [
      {
        productName: String,
        category: String,
        accountNumber: String,
        openedDate: Date,
        balanceOrLimit: Number,
        status: {
          type: String,
          enum: ['Active', 'Dormant', 'Matured', 'Closed'],
          default: 'Active',
        },
      },
    ],
    financialGoals: [
      {
        goal: String,
        targetAmount: Number,
        targetYear: Number,
        status: String,
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    lastInteraction: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    kycStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Submitted', 'Additional Information Required'],
      default: 'Verified',
    },
    assignedRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    totalRelationshipValue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ segment: 1 });
customerSchema.index({ city: 1 });
customerSchema.index({ relationshipStatus: 1 });
customerSchema.index({ priorityClassification: 1 });

module.exports = mongoose.model('Customer', customerSchema);
