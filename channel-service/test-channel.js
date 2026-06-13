const axios = require('axios');
axios.post('http://localhost:3001/send', {
  communicationId: 1,
  customerId: 1,
  channel: 'whatsapp',
  message: 'test'
}).then(res => console.log(res.data)).catch(err => console.log(err.message));
