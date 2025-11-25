const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const requireUser = require('../middleware/requireUser');

router.post('/hospital/doctor/add', requireUser, admin.addDoctor);
router.post('/hospital/doctor/assign', requireUser, admin.assignDoctor);
router.post('/insurance/agent/add', requireUser, admin.addInsuranceAgent);
router.post('/insurance/agent/assign', requireUser, admin.assignInsuranceAgent);
router.get('/hospitals', requireUser, admin.listHospitals);
router.get('/doctors', requireUser, admin.listDoctors);
router.get('/users', requireUser, admin.listUsers);
router.delete('/user/:userId', requireUser, admin.deleteUser);

module.exports = router;
