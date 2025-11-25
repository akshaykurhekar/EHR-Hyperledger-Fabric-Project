const express = require('express');
const router = express.Router();
const ins = require('../controllers/insuranceController');
const requireUser = require('../middleware/requireUser');

router.post('/claim/review', requireUser, ins.reviewClaim);
router.post('/claim/approve', requireUser, ins.approveClaim);
router.post('/claim/reject', requireUser, ins.rejectClaim);
router.get('/claim/:claimId', requireUser, ins.getClaim);
router.get('/claim/:claimId/records', requireUser, ins.getClaimRecords);
router.get('/agent/:agentId/profile', requireUser, ins.getAgentProfile);

module.exports = router;
