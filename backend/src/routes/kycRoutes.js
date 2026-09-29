const express = require('express');
const router = express.Router();
const { getAllKYCRecords } = require('../controllers/kycController');
const { protect } = require('../middleware/authMiddleware');

router.get('/all', protect, getAllKYCRecords);

module.exports = router;
