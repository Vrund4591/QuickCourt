const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', bookingIds } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        bookingIds: JSON.stringify(bookingIds),
        userId: req.user.userId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingIds 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
          userId: req.user.userId
        },
        data: {
          status: 'CONFIRMED',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id
        }
      });

      res.json({ 
        success: true, 
        message: 'Payment verified and booking confirmed',
        paymentId: razorpay_payment_id
      });
    } else {
      // Payment verification failed
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
          userId: req.user.userId
        },
        data: { status: 'CANCELLED' }
      });

      res.status(400).json({ 
        error: true, 
        message: 'Payment verification failed' 
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: true, message: 'Failed to verify payment' });
  }
});

// Get payment details
router.get('/payment/:paymentId', auth, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: true, message: 'Failed to get payment details' });
  }
});

// Cancel payment order
router.post('/cancel', auth, async (req, res) => {
  try {
    const { orderId, bookingIds } = req.body;

    // Update bookings to cancelled status
    if (bookingIds && bookingIds.length > 0) {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
          userId: req.user.userId
        },
        data: { status: 'CANCELLED' }
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment cancelled and bookings updated' 
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel payment' 
    });
  }
});

module.exports = router;
