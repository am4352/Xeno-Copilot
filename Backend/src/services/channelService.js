const axios = require('axios');

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:3001';

/**
 * Send a message to the Channel Service for delivery simulation.
 */
const sendMessage = async ({ communicationId, customerId, channel, message }) => {
  try {
    const response = await axios.post(`${CHANNEL_SERVICE_URL}/send`, {
      communicationId,
      customerId,
      channel,
      message,
    });
    return response.data;
  } catch (error) {
    console.error(`Channel service error for communication ${communicationId}:`, error.message);
    throw error;
  }
};

module.exports = { sendMessage };
