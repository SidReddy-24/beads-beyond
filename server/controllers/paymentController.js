const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { getRazorpayInstance } = require('../services/razorpay');

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, orderId } = req.body;

    const rzp = getRazorpayInstance();
    if (!rzp) {
      // In placeholder/sandbox fallback mode when keys are not configured
      const mockRazorpayOrderId = 'order_mock_' + crypto.randomBytes(6).toString('hex');
      return res.status(200).json({
        success: true,
        isMock: true,
        order: {
          id: mockRazorpayOrderId,
          amount: amount * 100, // in paisa
          currency: 'INR'
        }
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paisa for INR)
      currency: 'INR',
      receipt: `receipt_order_${orderId}`,
    };

    const rzpOrder = await rzp.orders.create(options);

    res.status(200).json({
      success: true,
      order: rzpOrder
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify signature
    const rzp = getRazorpayInstance();
    if (!rzp || razorpayOrderId.startsWith('order_mock_')) {
      // Auto verify in mock mode for test sandbox
      order.paymentStatus = 'Paid';
      order.status = 'Confirmed';
      order.razorpayOrderId = razorpayOrderId;
      order.razorpayPaymentId = razorpayPaymentId || 'pay_mock_123456';
      await order.save();

      // Create a payment log
      await Payment.create({
        order: orderId,
        paymentId: razorpayPaymentId || 'pay_mock_123456',
        signature: razorpaySignature || 'mock_sig_123456',
        amount: order.payableAmount,
        status: 'Captured'
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully (Mock Mode)'
      });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      order.paymentStatus = 'Failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Transaction signature is not valid' });
    }

    // Update order
    order.paymentStatus = 'Paid';
    order.status = 'Confirmed';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    // Create payment transaction log
    await Payment.create({
      order: orderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      amount: order.payableAmount,
      status: 'Captured'
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    next(error);
  }
};
