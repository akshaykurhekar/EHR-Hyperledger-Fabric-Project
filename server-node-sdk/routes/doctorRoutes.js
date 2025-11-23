const express = require('express');
const router = express.Router();
const d = require('../controllers/doctorController');
const requireUser = require('../middleware/requireUser');

router.post('/addRecord', requireUser, d.addRecord);
router.post('/claim/verify', requireUser, d.verifyClaim);
router.get('/:doctorId/patients', requireUser, d.listPatients);

module.exports = router;
