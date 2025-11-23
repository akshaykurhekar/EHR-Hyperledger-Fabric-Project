const express = require('express');
const router = express.Router();
const p = require('../controllers/patientController');
const requireUser = require('../middleware/requireUser');

router.post('/claim/submit', requireUser, p.submitClaim);
router.post('/grantAccess', requireUser, p.grantAccess);
router.post('/revokeAccess', requireUser, p.revokeAccess);
router.get('/:patientId/claims', requireUser, p.getClaims);
router.get('/:patientId/records', requireUser, p.getRecords);

module.exports = router;
