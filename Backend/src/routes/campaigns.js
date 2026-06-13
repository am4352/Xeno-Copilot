const express = require('express');
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  sendCampaign,
  getDashboardStats,
} = require('../controllers/campaignController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createCampaign);
router.get('/', auth, getCampaigns);
router.get('/:id', auth, getCampaignById);
router.post('/:id/send', auth, sendCampaign);

module.exports = router;
