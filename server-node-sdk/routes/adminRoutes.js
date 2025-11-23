const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const requireUser = require('../middleware/requireUser');

router.post('/hospital/doctor/add', requireUser, admin.addDoctor);
router.post('/insurance/agent/add', requireUser, admin.addInsuranceAgent);
router.get('/hospitals', requireUser, admin.listHospitals);
router.get('/doctors', requireUser, admin.listDoctors);

module.exports = router;
