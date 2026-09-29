const mongoose = require('mongoose');

const kycRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['Verified', 'Pending', 'Submitted', 'Additional Information Required'],
      default: 'Verified',
    },
    identityProof: {
      docType: { type: String, default: 'Passport / Aadhaar' },
      docNumber: { type: String, default: 'XXXX-XXXX-9842' },
      status: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Missing'], default: 'Verified' },
      uploadedAt: { type: Date, default: Date.now },
    },
    addressProof: {
      docType: { type: String, default: 'Utility Bill / Rent Agreement' },
      status: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Missing'], default: 'Verified' },
      uploadedAt: { type: Date, default: Date.now },
    },
    panCard: {
      panNumber: { type: String, default: 'ABCDE1234F' },
      status: { type: String, enum: ['Verified', 'Pending', 'Rejected', 'Missing'], default: 'Verified' },
      verifiedAt: { type: Date, default: Date.now },
    },
    additionalDoc: {
      docType: { type: String, default: 'Income Statement / Form 16' },
      status: { type: String, enum: ['Verified', 'Pending', 'Not Required', 'Missing'], default: 'Not Required' },
    },
    submittedDate: {
      type: Date,
      default: Date.now,
    },
    verifiedDate: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      default: 'Documents verified in simulated KYC workflow.',
    },
    complianceChecklist: [
      {
        item: String,
        passed: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

kycRecordSchema.index({ customerId: 1 });
kycRecordSchema.index({ status: 1 });

module.exports = mongoose.model('KYCRecord', kycRecordSchema);
