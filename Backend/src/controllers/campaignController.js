const prisma = require('../services/prisma');
const channelService = require('../services/channelService');

/**
 * POST /campaigns
 * Create a new campaign.
 */
const createCampaign = async (req, res) => {
  try {
    const { name, audience_description, audience_filters, message_template, channel } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Campaign name is required.' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        audience_description: audience_description || null,
        audience_filters: audience_filters || null,
        message_template: message_template || null,
        channel: channel || 'whatsapp',
        status: 'draft',
      },
    });

    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign.' });
  }
};

/**
 * GET /campaigns
 * List all campaigns with communication stats.
 */
const getCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        communications: {
          select: { status: true },
        },
      },
    });

    const result = campaigns.map((c) => {
      const stats = {
        total: c.communications.length,
        pending: c.communications.filter((comm) => comm.status === 'pending').length,
        sent: c.communications.filter((comm) => comm.status === 'sent').length,
        delivered: c.communications.filter((comm) => comm.status === 'delivered').length,
        opened: c.communications.filter((comm) => comm.status === 'opened').length,
        clicked: c.communications.filter((comm) => comm.status === 'clicked').length,
        failed: c.communications.filter((comm) => comm.status === 'failed').length,
      };

      return {
        id: c.id,
        name: c.name,
        audience_description: c.audience_description,
        channel: c.channel,
        status: c.status,
        created_at: c.created_at,
        stats,
      };
    });

    res.json({ campaigns: result });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
};

/**
 * GET /campaigns/:id
 * Get single campaign with full analytics.
 */
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        communications: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            events: { orderBy: { created_at: 'asc' } },
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    const stats = {
      total: campaign.communications.length,
      pending: campaign.communications.filter((c) => c.status === 'pending').length,
      sent: campaign.communications.filter((c) => c.status === 'sent').length,
      delivered: campaign.communications.filter((c) => c.status === 'delivered').length,
      opened: campaign.communications.filter((c) => c.status === 'opened').length,
      clicked: campaign.communications.filter((c) => c.status === 'clicked').length,
      failed: campaign.communications.filter((c) => c.status === 'failed').length,
    };

    res.json({
      campaign: {
        ...campaign,
        stats,
      },
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign.' });
  }
};

/**
 * POST /campaigns/:id/send
 * Send campaign to audience via Channel Service.
 */
const sendCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }

    if (campaign.status === 'sending' || campaign.status === 'completed') {
      return res.status(400).json({ error: `Campaign is already ${campaign.status}.` });
    }

    // Resolve audience from filters
    const filters = campaign.audience_filters || {};
    const now = new Date();
    let customers;

    const where = {};
    if (filters.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    const rawCustomers = await prisma.customer.findMany({
      where,
      include: { orders: true },
    });

    customers = rawCustomers.filter((customer) => {
      const totalSpent = customer.orders.reduce((sum, o) => sum + o.amount, 0);
      const lastOrderDate =
        customer.orders.length > 0
          ? new Date(Math.max(...customer.orders.map((o) => new Date(o.order_date).getTime())))
          : null;
      const daysSinceLastOrder = lastOrderDate
        ? Math.floor((now - lastOrderDate) / (1000 * 60 * 60 * 24))
        : Infinity;

      if (filters.minSpent && totalSpent < filters.minSpent) return false;
      if (filters.maxSpent && totalSpent > filters.maxSpent) return false;
      if (filters.inactiveDays && daysSinceLastOrder < filters.inactiveDays) return false;
      if (filters.minOrders && customer.orders.length < filters.minOrders) return false;
      if (filters.maxOrders && customer.orders.length > filters.maxOrders) return false;

      return true;
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers match the audience filters.' });
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id: parseInt(id) },
      data: { status: 'sending' },
    });

    // Return immediately to frontend
    res.json({
      message: 'Campaign is being sent in the background.',
      totalRecipients: customers.length,
      campaignId: campaign.id,
    });

    // Background processing
    setImmediate(async () => {
      try {
        const chunkSize = 50;

        for (let i = 0; i < customers.length; i += chunkSize) {
          const chunk = customers.slice(i, i + chunkSize);

          await Promise.all(
            chunk.map(async (customer) => {
              const rand = Math.random();

              let finalStatus;
              if (rand < 0.10) {
                finalStatus = 'failed';
              } else if (rand < 0.25) {
                finalStatus = 'clicked';
              } else if (rand < 0.55) {
                finalStatus = 'opened';
              } else {
                finalStatus = 'delivered';
              }

              const comm = await prisma.communication.create({
                data: {
                  campaign_id: campaign.id,
                  customer_id: customer.id,
                  status: finalStatus,
                },
              });

              // Sent Event
              await prisma.communicationEvent.create({
                data: {
                  communication_id: comm.id,
                  event_type: 'sent',
                },
              });

              // Delivered Event
              if (finalStatus !== 'failed') {
                await prisma.communicationEvent.create({
                  data: {
                    communication_id: comm.id,
                    event_type: 'delivered',
                  },
                });
              }

              // Opened Event
              if (finalStatus === 'opened' || finalStatus === 'clicked') {
                await prisma.communicationEvent.create({
                  data: {
                    communication_id: comm.id,
                    event_type: 'opened',
                  },
                });
              }

              // Clicked Event
              if (finalStatus === 'clicked') {
                await prisma.communicationEvent.create({
                  data: {
                    communication_id: comm.id,
                    event_type: 'clicked',
                  },
                });
              }

              // Failed Event
              if (finalStatus === 'failed') {
                await prisma.communicationEvent.create({
                  data: {
                    communication_id: comm.id,
                    event_type: 'failed',
                  },
                });
              }

              const personalizedMessage = (campaign.message_template || '').replace(
                /\{\{name\}\}/g,
                customer.name
              );

              channelService
                .sendMessage({
                  communicationId: comm.id,
                  customerId: customer.id,
                  channel: campaign.channel,
                  message: personalizedMessage,
                })
                .catch((err) => {
                  console.error(
                    `Failed to send to channel service for comm ${comm.id}:`,
                    err.message
                  );
                });
            })
          );

          // Tiny delay to prevent overwhelming the local Node process with sockets
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Mark campaign as completed
        await prisma.campaign.update({
          where: { id: parseInt(id) },
          data: { status: 'completed' },
        });
      } catch (bgError) {
        console.error('Background send error:', bgError);
      }
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign.' });
  }
};

/**
 * GET /dashboard/stats
 * Get dashboard summary stats.
 */
const getDashboardStats = async (req, res) => {
  try {
    const [totalCustomers, totalOrders, totalCampaigns, recentCampaigns] = await Promise.all([
      prisma.customer.count(),
      prisma.order.count(),
      prisma.campaign.count(),
      prisma.campaign.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        include: {
          communications: {
            select: { status: true },
          },
        },
      }),
    ]);

    const campaigns = recentCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      status: c.status,
      created_at: c.created_at,
      totalSent: c.communications.length,
      delivered: c.communications.filter((comm) => comm.status === 'delivered').length,
      failed: c.communications.filter((comm) => comm.status === 'failed').length,
    }));

    res.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      recentCampaigns: campaigns,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

module.exports = { createCampaign, getCampaigns, getCampaignById, sendCampaign, getDashboardStats };