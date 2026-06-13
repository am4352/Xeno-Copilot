import axios from 'axios';

const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:3000/api/receipt';

/**
 * Simulate message delivery with random outcomes and delays.
 * Calls back to the CRM with delivery events.
 *
 * Flow:
 *   sent → delivered → opened → clicked
 *     or
 *   sent → failed
 */
export const simulateDelivery = async ({ communicationId, customerId, channel, message }) => {
  try {
    // Random delay: 1-3 seconds
    const deliveryDelay = 1000 + Math.random() * 2000;

    await delay(deliveryDelay);

    // 90% chance of delivery, 10% chance of failure
    if (Math.random() < 0.9) {
      // Delivered
      await sendCallback(communicationId, 'delivered');
      console.log(`✅ Communication ${communicationId}: delivered`);

      // 60% chance of being opened
      if (Math.random() < 0.6) {
        const openDelay = 2000 + Math.random() * 3000;
        await delay(openDelay);

        await sendCallback(communicationId, 'opened');
        console.log(`👀 Communication ${communicationId}: opened`);

        // 40% chance of being clicked
        if (Math.random() < 0.4) {
          const clickDelay = 3000 + Math.random() * 4000;
          await delay(clickDelay);

          await sendCallback(communicationId, 'clicked');
          console.log(`🖱️ Communication ${communicationId}: clicked`);
        }
      }
    } else {
      // Failed
      await sendCallback(communicationId, 'failed');
      console.log(`❌ Communication ${communicationId}: failed`);
    }
  } catch (error) {
    console.error(`Simulation error for communication ${communicationId}:`, error.message);
  }
};

/**
 * Send a delivery event callback to the CRM.
 */
async function sendCallback(communicationId, event) {
  try {
    await axios.post(CRM_CALLBACK_URL, {
      communicationId,
      event,
    });
  } catch (error) {
    console.error(`Callback failed for comm ${communicationId}, event ${event}:`, error.message);
  }
}

/**
 * Promise-based delay.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
