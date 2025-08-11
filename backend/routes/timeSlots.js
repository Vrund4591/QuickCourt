const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get available time slots for a court on a specific date
router.get('/court/:courtId/date/:date', async (req, res) => {
  try {
    const { courtId, date } = req.params;
    
    // Get all possible time slots (6 AM to 10 PM)
    const allTimeSlots = [];
    for (let hour = 6; hour < 22; hour++) {
      allTimeSlots.push({
        id: hour,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isAvailable: true
      });
    }

    // Get existing bookings for this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    });

    // Get blocked time slots
    const blockedSlots = await prisma.blockedTimeSlot.findMany({
      where: {
        courtId,
        date: new Date(date)
      }
    });

    // Mark booked and blocked slots as unavailable
    const availableSlots = allTimeSlots.map(slot => {
      const isBooked = existingBookings.some(booking => 
        booking.startTime === slot.startTime
      );
      const isBlocked = blockedSlots.some(blocked => 
        blocked.startTime === slot.startTime
      );
      
      return {
        ...slot,
        isAvailable: !isBooked && !isBlocked,
        reason: isBooked ? 'Booked' : isBlocked ? 'Maintenance' : null
      };
    });

    res.json({ success: true, timeSlots: availableSlots });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ error: true, message: 'Failed to get time slots' });
  }
});

// Block/unblock time slots (for facility owners)
router.post('/block', auth, async (req, res) => {
  try {
    const { courtId, date, startTime, endTime, reason } = req.body;

    // Verify court ownership
    const court = await prisma.court.findUnique({
      where: { id: courtId },
      include: { facility: true }
    });

    if (!court || court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    // Create a blocked slot entry
    const blockedSlot = await prisma.blockedTimeSlot.create({
      data: {
        courtId,
        date: new Date(date),
        startTime,
        endTime,
        reason: reason || 'Maintenance'
      }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Time slot blocked successfully', 
      blockedSlot 
    });
  } catch (error) {
    console.error('Block time slot error:', error);
    res.status(500).json({ error: true, message: 'Failed to block time slot' });
  }
});

// Unblock time slot
router.delete('/unblock/:id', auth, async (req, res) => {
  try {
    const blockedSlot = await prisma.blockedTimeSlot.findUnique({
      where: { id: req.params.id },
      include: {
        court: {
          include: { facility: true }
        }
      }
    });

    if (!blockedSlot || blockedSlot.court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    await prisma.blockedTimeSlot.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Time slot unblocked successfully' });
  } catch (error) {
    console.error('Unblock time slot error:', error);
    res.status(500).json({ error: true, message: 'Failed to unblock time slot' });
  }
});

module.exports = router;
