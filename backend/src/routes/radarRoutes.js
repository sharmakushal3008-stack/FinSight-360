const express = require('express');
const router = express.Router();
const { getRelationshipRadar } = require('../controllers/radarController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRelationshipRadar);

module.exports = router;
