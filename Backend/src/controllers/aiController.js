const prisma = require('../services/prisma');
const aiService = require('../services/aiService');

/**
 * POST /ai/segment
 * Convert natural language into audience filters and return matching audience.
 */
const segmentAudience = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Parse intent with AI
    const filters = await aiService.parseAudienceIntent(prompt);

    // Build Prisma query from structured filters
    const where = {};
    const havingConditions = [];

    if (filters.city) {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    // Build aggregation query
    const now = new Date();
    let customers;

    if (filters.minSpent || filters.maxSpent || filters.inactiveDays || filters.minOrders || filters.maxOrders) {
      // Need aggregation on orders
      const rawCustomers = await prisma.customer.findMany({
        where,
        include: {
          orders: true,
        },
      });

      customers = rawCustomers.filter((customer) => {
        const totalSpent = customer.orders.reduce((sum, o) => sum + o.amount, 0);
        const lastOrderDate = customer.orders.length > 0
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

      // Attach computed fields
      customers = customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        totalSpent: c.orders.reduce((sum, o) => sum + o.amount, 0),
        orderCount: c.orders.length,
        lastOrderDate: c.orders.length > 0
          ? new Date(Math.max(...c.orders.map((o) => new Date(o.order_date).getTime())))
          : null,
      }));
    } else {
      // Simple filter without aggregation
      const rawCustomers = await prisma.customer.findMany({
        where,
        include: {
          orders: {
            select: { amount: true, order_date: true },
          },
        },
      });

      customers = rawCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        totalSpent: c.orders.reduce((sum, o) => sum + o.amount, 0),
        orderCount: c.orders.length,
        lastOrderDate: c.orders.length > 0
          ? new Date(Math.max(...c.orders.map((o) => new Date(o.order_date).getTime())))
          : null,
      }));
    }

    // Compute stats
    const audienceSize = customers.length;
    const avgSpend = audienceSize > 0
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / audienceSize
      : 0;

    res.json({
      filters,
      audienceSize,
      avgSpend: Math.round(avgSpend * 100) / 100,
      preview: customers.slice(0, 20),
    });
  } catch (error) {
    console.error('Segment audience error:', error);
    res.status(500).json({ error: 'Failed to segment audience.' });
  }
};

/**
 * POST /ai/message
 * Generate AI marketing message.
 */
const generateMessage = async (req, res) => {
  try {
    const { description, channel } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Campaign description is required.' });
    }

    const message = await aiService.generateMessage({ description, channel });

    res.json({ message });
  } catch (error) {
    console.error('Generate message error:', error);
    res.status(500).json({ error: 'Failed to generate message.' });
  }
};

module.exports = { segmentAudience, generateMessage };
