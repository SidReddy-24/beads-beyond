const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, couponCode, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    let totalAmount = 0;
    const orderItemIds = [];
    const processedItems = [];

    // Calculate totals, verify stock, and create OrderItems
    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, deleted: false });
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }

      const itemPrice = product.price * (1 - product.discount / 100);
      const subtotal = itemPrice * item.quantity;
      totalAmount += subtotal;

      const orderItem = await OrderItem.create({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images[0] || ''
      });

      orderItemIds.push(orderItem._id);
      processedItems.push({ product, quantity: item.quantity });
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        if (new Date(coupon.expiryDate) >= new Date() && coupon.usedCount < coupon.usageLimit) {
          if (coupon.discountType === 'Percentage') {
            discountAmount = totalAmount * (coupon.discountValue / 100);
          } else {
            discountAmount = coupon.discountValue;
          }
          // Increment coupon usage
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const payableAmount = Math.max(totalAmount - discountAmount, 0);

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItemIds,
      totalAmount,
      discountAmount,
      couponCode: couponCode || null,
      payableAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      status: 'Pending'
    });

    // Deduct stock
    for (const p of processedItems) {
      p.product.stock -= p.quantity;
      await p.product.save();
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow owner or admin to read
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('items')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
