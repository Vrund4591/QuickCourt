const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: true, message: 'Admin access required' });
  }
  next();
};

// Get pending facilities for approval
router.get('/facilities/pending', auth, adminAuth, async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: { fullName: true, email: true }
        }
      }
    });

    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get pending facilities error:', error);
    res.status(500).json({ error: true, message: 'Failed to get pending facilities' });
  }
});

// Approve/Reject facility
router.put('/facilities/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: true, message: 'Invalid status' });
    }

    const facility = await prisma.facility.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ success: true, message: `Facility ${status.toLowerCase()} successfully`, facility });
  } catch (error) {
    console.error('Update facility status error:', error);
    res.status(500).json({ error: true, message: 'Failed to update facility status' });
  }
});

// Get all users with filtering
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (role) where.role = role;
    if (status) where.isActive = status === 'active';
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            facilities: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const totalCount = await prisma.user.count({ where });

    res.json({ 
      success: true, 
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: true, message: 'Failed to get users' });
  }
});

// Ban/unban user
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: Boolean(isActive) }
    });

    res.json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, 
      user 
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: true, message: 'Failed to update user status' });
  }
});

// Get dashboard analytics
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Get basic counts
    const [totalUsers, totalFacilities, totalBookings, totalCourts] = await Promise.all([
      prisma.user.count(),
      prisma.facility.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count(),
      prisma.court.count({ where: { isActive: true } })
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: true
    });

    // Get booking trends (last 30 days)
    const bookingTrends = await prisma.booking.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: true,
      _sum: { totalAmount: true }
    });

    // Get popular sports
    const popularSports = await prisma.court.groupBy({
      by: ['sportType'],
      _count: true,
      orderBy: { _count: { sportType: 'desc' } },
      take: 5
    });

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalFacilities,
        totalBookings,
        totalCourts,
        recentRegistrations,
        bookingTrends,
        popularSports
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: true, message: 'Failed to get analytics' });
  }
});

module.exports = router;
