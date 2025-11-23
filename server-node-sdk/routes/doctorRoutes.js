const express = require('express');
const router = express.Router();
const d = require('../controllers/doctorController');
const requireUser = require('../middleware/requireUser');

router.post('/addRecord', requireUser, d.addRecord);
router.post('/claim/verify', requireUser, d.verifyClaim);
router.get('/records/:patientId', requireUser, d.getRecordsByPatient);
router.get('/:doctorId/patients', requireUser, d.listPatients);
router.get('/:doctorId/profile', requireUser, d.getProfile);

module.exports = router;
