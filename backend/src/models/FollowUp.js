const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    followUpId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      default: '11:00 AM',
    },
    purpose: {
      type: String,
      enum: [
        'Relationship Review',
        'Vehicle Loan Discussion',
        'Home Loan Consultation',
        'Wealth & Investment Advisory',
        'KYC Documentation Follow-up',
        'Credit Card Upgrade',
        'Deposit Renewal',
        'General Check-in',
      ],
      default: 'Relationship Review',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    assignedRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
    },
    completedDate: {
      type: Date,
    },
    outcome: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

followUpSchema.index({ customerId: 1, scheduledDate: 1 });
followUpSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('FollowUp', followUpSchema);
