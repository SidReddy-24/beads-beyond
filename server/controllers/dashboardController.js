const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Total Revenue: Sum of payableAmount for orders that are Paid or Delivered
    const paidOrders = await Order.find({
      $or: [
        { paymentStatus: 'Paid' },
        { status: 'Delivered' }
      ]
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.payableAmount, 0);

    // 2. Total Orders count
    const totalOrders = await Order.countDocuments();

    // 3. Total Products count (published or all non-deleted)
    const totalProducts = await Product.countDocuments({ deleted: false });

    // 4. Total Customers count (role: 'user')
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // 5. Recent orders list
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Monthly sales overview (aggregation group by month)
    const monthlySales = await Order.aggregate([
      {
        $match: {
          $or: [
            { paymentStatus: 'Paid' },
            { status: 'Delivered' }
          ]
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$payableAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = months.map((m, idx) => {
      const match = monthlySales.find(s => s._id === idx + 1);
      return {
        month: m,
        revenue: match ? match.revenue : 0,
        orders: match ? match.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        recentOrders,
        monthlySales: formattedMonthlySales
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'user' });

    const customerData = [];

    for (const customer of customers) {
      const orders = await Order.find({ user: customer._id });
      const totalSpent = orders
        .filter(o => o.paymentStatus === 'Paid' || o.status === 'Delivered')
        .reduce((sum, o) => sum + o.payableAmount, 0);

      customerData.push({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        totalOrders: orders.length,
        totalSpent,
        createdAt: customer.createdAt
      });
    }

    res.status(200).json({
      success: true,
      data: customerData
    });
  } catch (error) {
    next(error);
  }
};
