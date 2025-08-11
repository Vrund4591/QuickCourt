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

// Get owner dashboard analytics
router.get('/dashboard', auth, ownerAuth, async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // Get basic counts
    const [totalFacilities, totalCourts, totalBookings, totalEarnings] = await Promise.all([
      prisma.facility.count({ where: { ownerId } }),
      prisma.court.count({ 
        where: { 
          facility: { ownerId },
          isActive: true 
        } 
      }),
      prisma.booking.count({ 
        where: { 
          facility: { ownerId },
          status: 'CONFIRMED'
        } 
      }),
      prisma.booking.aggregate({
        where: { 
          facility: { ownerId },
          status: 'CONFIRMED'
        },
        _sum: { totalAmount: true }
      })
    ]);

    // Get booking trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookingTrends = await prisma.booking.findMany({
      where: {
        facility: { ownerId },
        createdAt: { gte: thirtyDaysAgo },
        status: 'CONFIRMED'
      },
      select: {
        createdAt: true,
        totalAmount: true
      }
    });

    // Get peak booking hours
    const peakHours = await prisma.booking.groupBy({
      by: ['startTime'],
      where: {
        facility: { ownerId },
        status: 'CONFIRMED'
      },
      _count: true,
      orderBy: { _count: { startTime: 'desc' } },
      take: 10
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: {
        facility: { ownerId }
      },
      include: {
        user: {
          select: { fullName: true, email: true }
        },
        court: {
          select: { name: true, sportType: true }
        },
        facility: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      dashboard: {
        totalFacilities,
        totalCourts,
        totalBookings,
        totalEarnings: totalEarnings._sum.totalAmount || 0,
        bookingTrends,
        peakHours,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    res.status(500).json({ error: true, message: 'Failed to get dashboard data' });
  }
});

// Get owner facilities
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
