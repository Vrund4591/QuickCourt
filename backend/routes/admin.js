const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../generated/prisma');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle specific database connection errors
    if (error.code === 'P1001' || error.message.includes("Can't reach database")) {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (Admin only)
router.post('/users', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, role, status, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        phone,
        role: role || 'USER',
        isActive: status === 'ACTIVE' ? true : false,
        password: hashedPassword,
        isVerified: true
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin only)
router.put('/users/:id', auth, admin, async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    const userId = req.params.id;
    
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId
        }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already taken' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: name,
        email,
        phone,
        role,
        isActive: status === 'ACTIVE' ? true : false
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (Admin only)
router.patch('/users/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.params.id;
    
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: status === 'ACTIVE' ? true : false },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: `User ${status.toLowerCase()} successfully`,
      user 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (Admin only)
router.get('/users/:id', auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();
    
    // Get active users
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });

    // Get total facilities count
    const totalFacilities = await prisma.facility.count();

    // Get active facilities count
    const activeFacilities = await prisma.facility.count({
      where: { isActive: true }
    });

    // Get total bookings count
    const totalBookings = await prisma.booking.count();

    // Get pending bookings count
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' }
    });

    // Get confirmed bookings count
    const confirmedBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' }
    });

    // Get completed bookings count
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' }
    });

    // Get cancelled bookings count
    const cancelledBookings = await prisma.booking.count({
      where: { status: 'CANCELLED' }
    });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get user role counts
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    const ownerCount = await prisma.user.count({
      where: { role: 'FACILITY_OWNER' }
    });

    const userCount = await prisma.user.count({
      where: { role: 'USER' }
    });

    // Get monthly user registration data for chart
    const monthlyStats = [];
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i + 1);
      endDate.setDate(0);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      monthlyStats.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: count
      });
    }

    // Get top facilities by booking count
    const topFacilities = await prisma.facility.findMany({
      include: {
        _count: {
          select: {
            bookings: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Process top facilities data
    const topFacilitiesData = topFacilities.map(facility => ({
      name: facility.name,
      bookings: facility._count.bookings,
      rating: facility.reviews.length > 0 
        ? (facility.reviews.reduce((sum, review) => sum + review.rating, 0) / facility.reviews.length).toFixed(1)
        : '0.0'
    }));

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminCount,
      ownerCount,
      userCount,
      totalFacilities,
      activeFacilities,
      inactiveFacilities: totalFacilities - activeFacilities,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentRegistrations,
      monthlyStats,
      topFacilities: topFacilitiesData,
      recentUsers: recentUsers.map(user => ({
        name: user.fullName,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        joinDate: user.createdAt
      }))
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: true, message: 'Failed to get dashboard stats' });
  }
});

// Reset user password (Admin only)
router.patch('/users/:id/reset-password', auth, admin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ 
      message: 'Password reset successfully',
      user 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending facilities (Admin only)
router.get('/facilities/pending', auth, admin, async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      where: { status: 'PENDING' },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ facilities });
  } catch (error) {
    console.error('Error fetching pending facilities:', error);
    
    // Handle specific database connection errors
    if (error.code === 'P1001' || error.message.includes("Can't reach database")) {
      return res.status(503).json({ 
        message: 'Database temporarily unavailable. Please try again later.',
        error: 'DATABASE_CONNECTION_ERROR'
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all facilities (Admin only)
router.get('/facilities', auth, admin, async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({ facilities });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update facility status (Admin only)
router.put('/facilities/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const facilityId = req.params.id;
    
    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: { 
        status,
        ...(status === 'APPROVED' && { isActive: true }),
        ...(status === 'REJECTED' && { isActive: false }),
        ...(status === 'SUSPENDED' && { isActive: false })
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ 
      message: `Facility ${status.toLowerCase()} successfully`,
      facility 
    });
  } catch (error) {
    console.error('Error updating facility status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Facility not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Invalid facility data' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update facility details (Admin only)
router.put('/facilities/:id', auth, admin, async (req, res) => {
  try {
    const facilityId = req.params.id;
    const { name, description, location, price, status } = req.body;
    
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(location && { location }),
        ...(price && { price: parseFloat(price) }),
        ...(status && { status })
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ 
      message: 'Facility updated successfully',
      facility 
    });
  } catch (error) {
    console.error('Error updating facility:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get facility by ID (Admin only)
router.get('/facilities/:id', auth, admin, async (req, res) => {
  try {
    const facilityId = req.params.id;
    
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json({ facility });
  } catch (error) {
    console.error('Error fetching facility:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete facility (Admin only)
router.delete('/facilities/:id', auth, admin, async (req, res) => {
  try {
    const facilityId = req.params.id;
    
    await prisma.facility.delete({
      where: { id: facilityId }
    });

    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve facility (Admin only)
router.patch('/facilities/:id/approve', auth, admin, async (req, res) => {
  try {
    const facilityId = req.params.id;
    
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: { status: 'APPROVED' },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ 
      message: 'Facility approved successfully',
      facility 
    });
  } catch (error) {
    console.error('Error approving facility:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject facility (Admin only)
router.patch('/facilities/:id/reject', auth, admin, async (req, res) => {
  try {
    const facilityId = req.params.id;
    const { reason } = req.body;
    
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason || null
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ 
      message: 'Facility rejected successfully',
      facility 
    });
  } catch (error) {
    console.error('Error rejecting facility:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
