const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireUser = require('../middleware/requireUser');

router.post('/registerPatient', auth.registerPatient);
router.post('/loginPatient', auth.loginPatient);
// Note: registerHospitalAdmin requires adminId in body (system admin or existing hospital admin)
router.post('/registerHospitalAdmin', auth.registerHospitalAdmin);
// Note: registerInsuranceAdmin requires adminId in body (system admin or existing insurance admin)
router.post('/registerInsuranceAdmin', auth.registerInsuranceAdmin);
// Note: registerDoctor requires adminId in body (hospital admin)
router.post('/registerDoctor', requireUser, auth.registerDoctor);
// Note: registerInsuranceAgent requires adminId in body (insurance admin)
router.post('/registerInsuranceAgent', requireUser, auth.registerInsuranceAgent);

module.exports = router;
