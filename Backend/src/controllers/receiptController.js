const prisma = require('../services/prisma');

/**
 * POST /receipt
 * Receive delivery status callbacks from Channel Service.
 */
const handleReceipt = async (req, res) => {
  try {
    const { communicationId, event } = req.body;

    if (!communicationId || !event) {
      return res.status(400).json({ error: 'communicationId and event are required.' });
    }

    const id = parseInt(communicationId);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid communicationId.' });
    }

    const validEvents = ['delivered', 'opened', 'clicked', 'failed'];
    if (!validEvents.includes(event)) {
      return res.status(400).json({ error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` });
    }

    const communication = await prisma.communication.findUnique({
      where: { id },
    });

    if (!communication) {
      return res.status(404).json({ error: 'Communication not found.' });
    }

    await prisma.communicationEvent.create({
      data: {
        communication_id: id,
        event_type: event,
      },
    });

    await prisma.communication.update({
      where: { id },
      data: { status: event },
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id: communication.campaign_id },
      include: {
        communications: { select: { status: true } },
      },
    });

    if (campaign) {
      const allDone = campaign.communications.every(
        (c) => !['pending', 'sent'].includes(c.status)
      );
      if (allDone) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'completed' },
        });
      }
    }

    res.json({ message: 'Receipt processed successfully.' });
  } catch (error) {
    console.error('Receipt error:', error);
    res.status(500).json({ error: 'Failed to process receipt.' });
  }
};

module.exports = { handleReceipt };