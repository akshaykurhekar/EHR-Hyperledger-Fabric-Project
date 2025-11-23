const express = require('express');
const router = express.Router();
const claim = require('../controllers/claimController');
const requireUser = require('../middleware/requireUser');

router.get('/byStatus', requireUser, claim.getClaimsByStatus);

module.exports = router;
