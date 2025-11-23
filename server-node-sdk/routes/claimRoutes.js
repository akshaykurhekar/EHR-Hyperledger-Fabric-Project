const express = require('express');
const router = express.Router();
const claim = require('../controllers/claimController');
const requireUser = require('../middleware/requireUser');

router.get('/byStatus', requireUser, claim.getClaimsByStatus);
router.get('/byPatient/:patientId', requireUser, claim.getClaimsByPatient);
router.get('/byDoctor/:doctorId', requireUser, claim.getClaimsByDoctor);
router.get('/byHospital/:hospitalId', requireUser, claim.getClaimsByHospital);

module.exports = router;
