const mongoose = require('mongoose');

const relationshipSignalSchema = new mongoose.Schema(
  {
    signalId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Dormant Relationship',
        'Follow-up Overdue',
        'High Engagement',
        'New Customer',
        'Low Product Depth',
        'Recent Need Mention',
        'Potential Vehicle Need',
        'Potential Home Need',
        'Financial Planning Interest',
        'Recent Interaction Increase',
        'Engagement Decline',
        'KYC Pending',
        'Open Opportunity',
        'Relationship Milestone',
        'Cross-sell Readiness',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Info'],
      default: 'Medium',
    },
    title: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    detectedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Dismissed'],
      default: 'Active',
    },
    category: {
      type: String,
      enum: ['Risk', 'Opportunity', 'Operational', 'Engagement', 'Compliance'],
      default: 'Engagement',
    },
    scoreImpact: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

relationshipSignalSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('RelationshipSignal', relationshipSignalSchema);
