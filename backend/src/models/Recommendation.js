const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    recommendationId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    objective: {
      type: String,
      required: true,
    },
    talkingPoints: [
      {
        type: String,
      },
    ],
    suggestedProducts: [
      {
        type: String,
      },
    ],
    rationale: {
      type: String,
      required: true,
    },
    priorityScore: {
      type: Number,
      default: 70,
    },
    source: {
      type: String,
      enum: ['AI Generated', 'Rule-Based Engine'],
      default: 'Rule-Based Engine',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Dismissed'],
      default: 'Active',
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ customerId: 1, status: 1 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
