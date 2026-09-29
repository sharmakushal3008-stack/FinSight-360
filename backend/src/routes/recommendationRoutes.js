const express = require('express');
const router = express.Router();
const {
  getCustomerRecommendations,
  triggerCustomerAnalysis,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:customerId', getCustomerRecommendations);
router.post('/analyze/:customerId', triggerCustomerAnalysis);

module.exports = router;
