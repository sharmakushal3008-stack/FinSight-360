const express = require('express');
const router = express.Router();
const { getPriorityCenter } = require('../controllers/priorityController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPriorityCenter);

module.exports = router;
