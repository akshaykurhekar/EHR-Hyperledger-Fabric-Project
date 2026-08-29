const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const requireUser = require('../middleware/requireUser');

// New registration endpoints (with password)
router.post('/registerPatient', auth.registerPatient);
router.post('/registerDoctor', auth.registerDoctor);
router.post('/registerInsuranceAgent', auth.registerInsuranceAgent);

// Login endpoints (with email/password)
router.post('/loginPatient', auth.loginPatient);
router.post('/loginDoctor', auth.loginDoctor);
router.post('/loginInsuranceAgent', auth.loginInsuranceAgent);

// Admin endpoints to complete blockchain registration
router.post('/completePatientRegistration', auth.completePatientRegistration);
router.post('/completeDoctorRegistration', requireUser, auth.completeDoctorRegistration);
router.post('/completeInsuranceAgentRegistration', requireUser, auth.completeInsuranceAgentRegistration);

// Legacy admin registration endpoints
router.post('/registerHospitalAdmin', auth.registerHospitalAdmin);
router.post('/registerInsuranceAdmin', auth.registerInsuranceAdmin);

// Legacy endpoints for backward compatibility
router.post('/registerPatientLegacy', auth.registerPatientLegacy);
router.post('/registerDoctorLegacy', requireUser, auth.registerDoctorLegacy);
router.post('/registerInsuranceAgentLegacy', requireUser, auth.registerInsuranceAgentLegacy);

module.exports = router;
