const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    interactionId: {
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
      enum: ['Meeting', 'Phone Call', 'Portfolio Review', 'Branch Visit', 'Email', 'Video Call', 'WhatsApp Note'],
      default: 'Phone Call',
    },
    channel: {
      type: String,
      enum: ['In-Person', 'Outbound Call', 'Inbound Call', 'Digital / Email', 'Video Conference'],
      default: 'Outbound Call',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
    },
    outcome: {
      type: String,
      enum: [
        'Positive - Opportunity Identified',
        'Positive - Follow-up Requested',
        'Neutral - Information Provided',
        'Requirement Gathered',
        'KYC Pending Clarified',
        'Customer Busy - Rescheduled',
        'Not Interested',
      ],
      default: 'Neutral - Information Provided',
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Hesitant', 'Concerned', 'Excited'],
      default: 'Neutral',
    },
    keyTopics: [
      {
        type: String,
      },
    ],
    nextActionNeeded: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

interactionSchema.index({ customerId: 1, date: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
