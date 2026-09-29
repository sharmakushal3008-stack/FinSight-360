const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    opportunityId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Vehicle Financing',
        'Home Financing',
        'Investment Advisory',
        'Premium Banking Upgrade',
        'Credit Card Suite',
        'Term Deposit Allocation',
        'Family Health Protection',
        'Business Current Account',
      ],
      required: true,
    },
    estimatedValue: {
      type: Number,
      default: 500000,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    stage: {
      type: String,
      enum: ['Detected', 'Discussion Scheduled', 'Proposal Shared', 'In Progress', 'Closed Won', 'Closed Lost'],
      default: 'Detected',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Won', 'Lost', 'Archived'],
      default: 'Open',
    },
    detectedReason: {
      type: String,
      required: true,
    },
    suggestedAction: {
      type: String,
      required: true,
    },
    validUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

opportunitySchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
