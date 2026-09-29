const KYCRecord = require('../models/KYCRecord');
const Customer = require('../models/Customer');
const { refreshCustomerIntelligence } = require('./customerController');

// @desc    Get all KYC compliance records with status filter
// @route   GET /api/customers/kyc/all
// @access  Private
const getAllKYCRecords = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const userCustomers = await Customer.find({ assignedRM: req.user._id }).select('_id');
    const userCustomerIds = userCustomers.map((c) => c._id);

    const query = {
      customerId: { $in: userCustomerIds },
    };

    if (status && status !== 'All') {
      query.status = status;
    }

    let records = await KYCRecord.find(query)
      .sort({ updatedAt: -1 })
      .populate('customerId', 'customerId firstName lastName email phone city segment kycStatus');

    if (search) {
      records = records.filter((r) => {
        const cust = r.customerId;
        if (!cust) return false;
        const s = search.toLowerCase();
        return (
          cust.firstName?.toLowerCase().includes(s) ||
          cust.lastName?.toLowerCase().includes(s) ||
          cust.customerId?.toLowerCase().includes(s) ||
          cust.city?.toLowerCase().includes(s)
        );
      });
    }

    const [verifiedCount, pendingCount, submittedCount, actionRequiredCount] = await Promise.all([
      KYCRecord.countDocuments({ customerId: { $in: userCustomerIds }, status: 'Verified' }),
      KYCRecord.countDocuments({ customerId: { $in: userCustomerIds }, status: 'Pending' }),
      KYCRecord.countDocuments({ customerId: { $in: userCustomerIds }, status: 'Submitted' }),
      KYCRecord.countDocuments({ customerId: { $in: userCustomerIds }, status: 'Additional Information Required' }),
    ]);

    res.json({
      success: true,
      data: {
        records,
        stats: {
          verifiedCount,
          pendingCount,
          submittedCount,
          actionRequiredCount,
          total: verifiedCount + pendingCount + submittedCount + actionRequiredCount,
        },
        disclaimer: 'Demo compliance workflow for educational and portfolio demonstration purposes.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get KYC record for single customer
// @route   GET /api/customers/:id/kyc
// @access  Private
const getCustomerKYC = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    let kycRecord = await KYCRecord.findOne({ customerId: customer._id });

    if (!kycRecord) {
      kycRecord = await KYCRecord.create({
        recordId: `KYC-${customer.customerId}`,
        customerId: customer._id,
        status: customer.kycStatus || 'Verified',
        complianceChecklist: [
          { item: 'Identity Document Verified', passed: true },
          { item: 'Address Proof Validated', passed: true },
          { item: 'PAN Verified with Database', passed: true },
          { item: 'Anti-Money Laundering (AML) Screen Passed', passed: true },
        ],
      });
    }

    res.json({ success: true, data: kycRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Update KYC verification status and document checklist
// @route   PUT /api/customers/:id/kyc
// @access  Private
const updateCustomerKYC = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findOne({ _id: id, assignedRM: req.user._id });
    } else {
      customer = await Customer.findOne({ customerId: id, assignedRM: req.user._id });
    }

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found in your portfolio' });
    }

    const { status, remarks, checklist, identityProofStatus, addressProofStatus, panStatus } = req.body;

    let kycRecord = await KYCRecord.findOne({ customerId: customer._id });
    if (!kycRecord) {
      kycRecord = new KYCRecord({
        recordId: `KYC-${customer.customerId}`,
        customerId: customer._id,
      });
    }

    if (status) kycRecord.status = status;
    if (remarks) kycRecord.remarks = remarks;
    if (checklist) kycRecord.complianceChecklist = checklist;

    if (identityProofStatus) kycRecord.identityProof.status = identityProofStatus;
    if (addressProofStatus) kycRecord.addressProof.status = addressProofStatus;
    if (panStatus) kycRecord.panCard.status = panStatus;

    if (status === 'Verified') {
      kycRecord.verifiedDate = new Date();
      kycRecord.verifiedBy = req.user?._id;
    }

    await kycRecord.save();

    // Sync status with Customer record
    customer.kycStatus = kycRecord.status;
    await customer.save();

    await refreshCustomerIntelligence(customer._id);

    res.json({
      success: true,
      data: kycRecord,
      message: 'KYC record and relationship compliance status updated',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllKYCRecords,
  getCustomerKYC,
  updateCustomerKYC,
};
