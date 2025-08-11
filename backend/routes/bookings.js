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

// Create booking with multiple time slots
router.post('/', auth, async (req, res) => {
  try {
    const { facilityId, courtId, selectedDate, selectedSlots, totalAmount } = req.body;

    // Validate required fields
    if (!facilityId || !courtId || !selectedDate || !selectedSlots || selectedSlots.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'All booking details are required'
      });
    }

    // Convert selectedSlots to proper format if they're just hour strings
    const formattedSlots = selectedSlots.map(slot => {
      if (typeof slot === 'string') {
        // If slot is just an hour string like "09"
        const startTime = `${slot.padStart(2, '0')}:00`;
        const endTime = `${(parseInt(slot) + 1).toString().padStart(2, '0')}:00`;
        return { startTime, endTime };
      }
      return slot; // Already in correct format
    });

    // Validate that all slots are available
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(0, 0, 0, 0);

    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId,
        bookingDate,
        status: { in: ['CONFIRMED', 'PENDING'] },
        startTime: { in: formattedSlots.map(slot => slot.startTime) }
      }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Some time slots are already booked'
      });
    }

    // Create bookings for each selected slot
    const bookingPromises = formattedSlots.map(slot => 
      prisma.booking.create({
        data: {
          userId: req.user.userId,
          facilityId,
          courtId,
          bookingDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalAmount: totalAmount / formattedSlots.length,
          status: 'PENDING'
        }
      })
    );

    const bookings = await Promise.all(bookingPromises);

    res.status(201).json({ 
      success: true, 
      message: 'Bookings created successfully', 
      bookings,
      totalAmount
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: true, message: 'Failed to create booking' });
  }
});

// Confirm payment and update booking status
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { bookingIds, paymentId, paymentStatus } = req.body;

    if (paymentStatus === 'success') {
      await prisma.booking.updateMany({
        where: {
          id: { in: bookingIds },
          userId: req.user.userId
        },
        data: {
          status: 'CONFIRMED',
          paymentId
        }
      });

      res.json({ success: true, message: 'Payment confirmed and booking updated' });
    } else {
      // Delete failed bookings
      await prisma.booking.deleteMany({
        where: {
          id: { in: bookingIds },
          userId: req.user.userId
        }
      });

      res.status(400).json({ error: true, message: 'Payment failed, bookings cancelled' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: true, message: 'Failed to confirm payment' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });

    if (!booking) {
      return res.status(404).json({ error: true, message: 'Booking not found' });
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    // Check if booking can be cancelled (not within 2 hours of start time)
    const bookingDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}`);
    const now = new Date();
    const timeDiff = bookingDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 2) {
      return res.status(400).json({
        error: true,
        message: 'Cannot cancel booking less than 2 hours before start time'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: true, message: 'Failed to cancel booking' });
  }
});

// Get facility owner bookings
router.get('/owner/bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ error: true, message: 'Only facility owners can access this' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        facility: {
          ownerId: req.user.userId
        }
      },
      include: {
        user: {
          select: { fullName: true, email: true }
        },
        facility: {
          select: { name: true }
        },
        court: {
          select: { name: true, sportType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ error: true, message: 'Failed to get bookings' });
  }
});

module.exports = router;
