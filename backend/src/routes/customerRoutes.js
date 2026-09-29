const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerIntelligence,
  getCustomerTimeline,
  addCustomerInteraction,
} = require('../controllers/customerController');
const { prepareCustomerBrief } = require('../controllers/briefController');
const { getCustomerKYC, updateCustomerKYC } = require('../controllers/kycController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.get('/:id/intelligence', getCustomerIntelligence);
router.get('/:id/timeline', getCustomerTimeline);
router.post('/:id/interactions', addCustomerInteraction);
router.post('/:id/brief', prepareCustomerBrief);
router.route('/:id/kyc')
  .get(getCustomerKYC)
  .put(updateCustomerKYC);

module.exports = router;
