const cron = require('node-cron');
const Order = require('../models/orderModel'); // Adjusted path to go up one directory

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    await Order.updateMany(
      {
        'deliveryDetails.estimatedDelivery': { $lt: now },
        'deliveryDetails.status': { $ne: 'delivered' },
        status: 'completed',
      },
      {
        $set: { 'deliveryDetails.status': 'delivered' },
      }
    );
    console.log('Updated delivered orders');
  } catch (error) {
    console.error('Error updating delivered orders:', error);
  }
});

module.exports = cron;
