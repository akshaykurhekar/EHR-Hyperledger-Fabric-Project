const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireUser = require('../middleware/requireUser');

router.post('/registerPatient', auth.registerPatient);
router.post('/loginPatient', auth.loginPatient);
router.post('/registerHospitalAdmin', requireUser, auth.registerHospitalAdmin);
router.post('/registerInsuranceAdmin', requireUser, auth.registerInsuranceAdmin);
router.post('/registerDoctor', requireUser, auth.registerDoctor);
router.post('/registerInsuranceAgent', requireUser, auth.registerInsuranceAgent);

module.exports = router;
