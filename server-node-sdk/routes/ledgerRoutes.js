const express = require('express');
const router = express.Router();
const ledger = require('../controllers/ledgerController');
const requireUser = require('../middleware/requireUser');

router.post('/fetch', requireUser, ledger.fetchLedger);
router.get('/history/:assetId', requireUser, ledger.queryHistory);

module.exports = router;
