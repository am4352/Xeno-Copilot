import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import { simulateDelivery } from './services/simulator.js';

const app = express();

app.use(cors());
app.use(json());

/**
 * POST /send
 * Receive a message to simulate delivery.
 */
app.post('/send', (req, res) => {
  const { communicationId, customerId, channel, message } = req.body;

  if (!communicationId || !customerId || !channel || !message) {
    return res.status(400).json({
      error: 'communicationId, customerId, channel, and message are required.',
    });
  }

  console.log(`📨 Received message for communication ${communicationId} via ${channel}`);

  // Start simulation asynchronously
  simulateDelivery({ communicationId, customerId, channel, message });

  res.json({
    message: 'Message accepted for delivery simulation.',
    communicationId,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'xeno-channel-service' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Xeno Channel Service running on port ${PORT}`);
});

export default app;
