const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Owner middleware
const ownerAuth = (req, res, next) => {
  if (req.user.role !== 'FACILITY_OWNER') {
    return res.status(403).json({ error: true, message: 'Facility owner access required' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard', auth, ownerAuth, async (req, res) => {
  try {
    const [facilities, courts] = await Promise.all([
      prisma.facility.findMany({
        where: { ownerId: req.user.userId }
      }),
      prisma.court.findMany({
        where: {
          facility: {
            ownerId: req.user.userId
          },
          isActive: true
        }
      })
    ]);

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        facility: {
          ownerId: req.user.userId
        }
      },
      include: {
        user: {
          select: { fullName: true }
        },
        facility: {
          select: { name: true }
        },
        court: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate earnings for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        facility: {
          ownerId: req.user.userId
        },
        status: 'CONFIRMED',
        createdAt: {
          gte: currentMonth
        }
      }
    });

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    const stats = {
      totalFacilities: facilities.length,
      totalBookings: recentBookings.length,
      activeCourts: courts.length,
      monthlyEarnings
    };

    res.json({ 
      success: true, 
      stats,
      recentBookings
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    res.status(500).json({ error: true, message: 'Failed to get dashboard data' });
  }
});

// Get owner's facilities
router.get('/facilities', auth, ownerAuth, async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { ownerId: req.user.userId },
      include: {
        courts: {
          where: { isActive: true }
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get owner facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get facilities' });
  }
});

// Get owner courts
router.get('/courts', auth, ownerAuth, async (req, res) => {
  try {
    const courts = await prisma.court.findMany({
      where: {
        facility: { ownerId: req.user.userId },
        isActive: true
      },
      include: {
        facility: {
          select: { name: true }
        },
        _count: {
          select: {
            bookings: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, courts });
  } catch (error) {
    console.error('Get owner courts error:', error);
    res.status(500).json({ error: true, message: 'Failed to get courts' });
  }
});

// Update facility
router.put('/facilities/:id', auth, ownerAuth, async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.params.id }
    });

    if (!facility || facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    const updatedFacility = await prisma.facility.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ 
      success: true, 
      message: 'Facility updated successfully', 
      facility: updatedFacility 
    });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ error: true, message: 'Failed to update facility' });
  }
});

// Update court
router.put('/courts/:id', auth, ownerAuth, async (req, res) => {
  try {
    const court = await prisma.court.findUnique({
      where: { id: req.params.id },
      include: { facility: true }
    });

    if (!court || court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    const updatedCourt = await prisma.court.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({ 
      success: true, 
      message: 'Court updated successfully', 
      court: updatedCourt 
    });
  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({ error: true, message: 'Failed to update court' });
  }
});

// Delete court
router.delete('/courts/:id', auth, ownerAuth, async (req, res) => {
  try {
    const court = await prisma.court.findUnique({
      where: { id: req.params.id },
      include: { facility: true }
    });

    if (!court || court.facility.ownerId !== req.user.userId) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    await prisma.court.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'Court deleted successfully' });
  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({ error: true, message: 'Failed to delete court' });
  }
});

module.exports = router;