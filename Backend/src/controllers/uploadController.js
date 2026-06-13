const fs = require('fs');
const csv = require('csv-parser');
const prisma = require('../services/prisma');

const uploadCustomers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    const customers = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          if (row.name && row.email) {
            customers.push({
              name: row.name.trim(),
              email: row.email.trim().toLowerCase(),
              phone: row.phone ? row.phone.trim() : null,
              city: row.city ? row.city.trim() : null,
            });
          } else {
            errors.push({ row, reason: 'Missing name or email' });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Upsert customers in chunks to avoid blocking/timeouts
    let created = 0;
    const chunkSize = 50;

    for (let i = 0; i < customers.length; i += chunkSize) {
      const chunk = customers.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (customer) => {
          try {
            await prisma.customer.upsert({
              where: { email: customer.email },
              update: {
                name: customer.name,
                phone: customer.phone,
                city: customer.city,
              },
              create: customer,
            });
            created++;
          } catch (err) {
            errors.push({ row: customer, reason: err.message });
          }
        })
      );
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Customers uploaded successfully.',
      total: customers.length,
      processed: created,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Upload customers error:', error);
    res.status(500).json({ error: 'Failed to process CSV file.' });
  }
};

const uploadOrders = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    const orders = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          if (row.customerEmail && row.amount && row.date) {
            orders.push({
              customerEmail: row.customerEmail.trim().toLowerCase(),
              amount: parseFloat(row.amount),
              date: row.date.trim(),
            });
          } else {
            errors.push({ row, reason: 'Missing customerEmail, amount, or date' });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let created = 0;

    // Bulk lookup customers
    const uniqueEmails = [...new Set(orders.map(o => o.customerEmail))];
    const existingCustomers = await prisma.customer.findMany({
      where: { email: { in: uniqueEmails } },
      select: { id: true, email: true },
    });

    const emailToIdMap = {};
    existingCustomers.forEach(c => {
      emailToIdMap[c.email] = c.id;
    });

    const validOrders = [];

    for (const order of orders) {
      const customerId = emailToIdMap[order.customerEmail];
      if (!customerId) {
        errors.push({ row: order, reason: `Customer not found: ${order.customerEmail}` });
      } else {
        validOrders.push({
          customer_id: customerId,
          amount: order.amount,
          order_date: new Date(order.date),
        });
      }
    }

    // Bulk insert orders
    if (validOrders.length > 0) {
      try {
        // Chunk validOrders into chunks of 1000 for createMany to avoid parameter limits
        const chunkSize = 1000;
        for (let i = 0; i < validOrders.length; i += chunkSize) {
          const chunk = validOrders.slice(i, i + chunkSize);
          await prisma.order.createMany({
            data: chunk,
            skipDuplicates: true,
          });
          created += chunk.length;
        }
      } catch (err) {
        console.error('Order bulk insert error:', err);
        errors.push({ reason: 'Bulk insert failed', details: err.message });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Orders uploaded successfully.',
      total: orders.length,
      processed: created,
      errors: errors.length,
      errorDetails: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Upload orders error:', error);
    res.status(500).json({ error: 'Failed to process CSV file.' });
  }
};

module.exports = { uploadCustomers, uploadOrders };
