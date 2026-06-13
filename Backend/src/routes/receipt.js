const express = require('express');
const { handleReceipt } = require('../controllers/receiptController');

const router = express.Router();

// Receipt endpoint is NOT protected by auth — Channel Service calls it directly
router.post('/', handleReceipt);

module.exports = router;
