const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
      console.warn("WARNING: Razorpay keys not configured. Using placeholder mode.");
      return null;
    }
    try {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } catch (err) {
      console.error("Failed to initialize Razorpay:", err);
    }
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
