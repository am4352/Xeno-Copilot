const express = require('express');
const { segmentAudience, generateMessage } = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/segment', auth, segmentAudience);
router.post('/message', auth, generateMessage);

module.exports = router;
