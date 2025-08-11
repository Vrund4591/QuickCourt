const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: {
        facility: {
          select: { name: true, address: true }
        },
        court: {
          select: { name: true, sportType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: true, message: 'Failed to get bookings' });
  }
});

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { facilityId, courtId, timeSlotId, bookingDate, startTime, endTime, totalAmount } = req.body;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        facilityId,
        courtId,
        timeSlotId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        totalAmount,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: true, message: 'Failed to create booking' });
  }
});

module.exports = router;
