const { sendCampaign } = require('./src/controllers/campaignController');
const req = { params: { id: 1 } };
const res = { json: console.log, status: (s) => ({ json: console.log }) };
sendCampaign(req, res);
