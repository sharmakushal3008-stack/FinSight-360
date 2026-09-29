const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
} = require('../controllers/followupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getFollowUps)
  .post(createFollowUp);

router.route('/:id')
  .put(updateFollowUp)
  .delete(deleteFollowUp);

router.put('/:id/complete', completeFollowUp);

module.exports = router;
