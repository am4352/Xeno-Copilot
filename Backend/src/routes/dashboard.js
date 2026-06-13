const express = require('express');
const { getDashboardStats } = require('../controllers/campaignController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/stats', auth, getDashboardStats);

module.exports = router;
